// ============================================================================
// script.js — Version V15 FINALE COMPLÈTE (copier/coller dans votre hub)
// ============================================================================
// Points couverts (V8 → V15 + corrections finales) :
// - Rôle + équipe (champ "Autre" avec zone texte conditionnelle)
// - Zones anatomiques (fusion Tête/Rachis cervical en une section logique)
// - Types de tests (Force, Mobilité, Proprio, Questionnaires, Cognition tête/rachis)
// - Mouvements adaptés par articulation (incluant Inclinaisons en Force : cervical/lombaire)
// - Détails Force par mouvement → outils (Isocinétisme => vitesses & modes), paramètres, critères
// - Détails Force par MUSCLE là où pertinent : Genou (Ischio/Quad), Hanche (Fléch/Abd/Add),
// Cheville (Gastro/Soléaire, Inverseurs/Éverseurs, Intrinsèques du pied)
// - Mobilité par mouvement → outils (KTW cheville en flexion, Sit-and-reach lombaire), critères
// - Proprio & Questionnaires par zone (listes de référence + "Autre" avec 'Précisez')
// - Blocs GLOBAUX : Tests globaux MI & MS, Sauts, Course → affichage conditionnel + OUI/NON
// - "Autre" apparait une seule fois par sous-question + champ "Précisez" obligatoire
// - Validation stricte (zones cochées → sous-questions remplies si type choisi, etc.)
// - Pré-câblage Google Form (URL + ENTRY_MAP à adapter).
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
// === Sélecteurs de base (issus de votre index.html existant) ===
const zonesCheckboxes = document.querySelectorAll('#zones input[type="checkbox"]');
const zoneQuestionsContainer = document.getElementById('zoneQuestions');
const submitBtn = document.getElementById('submitBtn');
const resultMessage = document.getElementById('resultMessage');

// Progression (si présent dans la page)
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const formSections = document.querySelectorAll('.card');
function updateProgress() {
if (!progressBar || !progressText) return;
const filled = [...formSections].filter(sec => sec.querySelector('input:checked') || sec.querySelector('input[type="text"].other-input')?.value?.trim()).length;
const total = formSections.length;
const percent = Math.min(100, Math.round((filled / total) * 100));
progressBar.style.width = percent + '%';
progressText.textContent = `Progression : ${percent}%`;
}
document.addEventListener('change', updateProgress);

// === Groupes de zones ===
const lowerBodyZones = ['Hanche', 'Genou', 'Cheville / Pied'];
const upperBodyZones = ['Épaule', 'Coude', 'Poignet / Main'];
const headNeckPair = ['Tête', 'Rachis cervical'];
const headNeckTitle = 'Tête / Rachis cervical';

// === Blocs globaux uniques (instanciés sous la section dynamique) ===
const globalInsertRef = zoneQuestionsContainer.parentElement; // section .card "Détails des tests"
const globalMS = document.createElement('div'); // Globaux Membre Supérieur
globalMS.id = 'global-ms';
globalMS.className = 'subcard';
globalMS.style.display = 'none';
globalInsertRef.appendChild(globalMS);

const globalMI = document.createElement('div'); // Globaux Membre Inférieur
globalMI.id = 'global-mi';
globalMI.className = 'subcard';
globalMI.style.display = 'none';
globalInsertRef.appendChild(globalMI);

const globalJumps = document.createElement('div'); // Sauts (unique si MI cochée)
globalJumps.id = 'global-jumps';
globalJumps.className = 'subcard';
globalJumps.style.display = 'none';
globalInsertRef.appendChild(globalJumps);

const globalCourse = document.createElement('div'); // Course (unique si MI cochée OU tête/rachis)
globalCourse.id = 'global-course';
globalCourse.className = 'subcard';
globalCourse.style.display = 'none';
globalInsertRef.appendChild(globalCourse);

// === Données / listes ===
const toolsForceGeneric = ['Dynamomètre manuel', 'Dynamomètre fixe', 'Isocinétisme', 'Plateforme de force', 'Sans outil']; // 'Autre' ajouté dynamiquement
const toolsMobilityGeneric = ['Goniomètre', 'Inclinomètre']; // + cas particuliers, 'Autre' ajouté dynamiquement
const paramsForce = ['Force max','Force moyenne','Force relative (N/kg)','RFD','Angle du pic de force','Endurance'];
const criteriaForce = ['Ratio agoniste/antagoniste','Ratio droite/gauche','Valeur seuil'];
const criteriaMobilityGeneric = ['Comparaison droite/gauche','Valeur seuil'];
const criteriaMobilityLumbar = ['Moyenne du groupe','Valeur seuil'];
const isokineticSpeeds = ['30°/s','60°/s','120°/s','180°/s','Autre (précisez)'];
const isokineticModes = ['Concentrique','Excentrique','Isométrique','Combiné'];

// Proprio par zone
const proprioByZone = {
'Cheville / Pied': ['Y-Balance Test','Star Excursion','Single Leg Balance Test'],
'Genou': ['Y-Balance Test','Star Excursion','FMS (Lower)'],
'Hanche': ['Y-Balance Test','Star Excursion','FMS (Lower)'],
'Épaule': ['Y-Balance Test (épaule)','FMS (Upper)'],
[headNeckTitle]: ['Test proprio cervical (laser)'],
'Poignet / Main': [],
'Coude': [],
'Rachis lombaire': ['FMS (Core)']
};

// Questionnaires par zone
const questionnairesByZone = {
'Genou': ['KOOS','IKDC','Lysholm','Tegner','ACL-RSI','KOS-ADLS','LEFS','Autre'],
'Hanche': ['HAGOS','iHOT-12','HOOS','HOS','Autre'],
'Épaule': ['QuickDASH','DASH','SIRSI','ASES','SPADI','Oxford Shoulder Score','Autre'],
'Coude': ['Oxford Elbow Score','MEPS','DASH','QuickDASH','Autre'],
'Poignet / Main': ['PRWE','DASH','QuickDASH','Boston Carpal Tunnel','Autre'],
'Cheville / Pied': ['CAIT','FAAM-ADL','FAAM-Sport','FAOS','FFI','Autre'],
'Rachis lombaire': ['ODI (Oswestry)','Roland-Morris','Quebec Back Pain','FABQ','Autre'],
[headNeckTitle]: ['SCAT6','Neck Disability Index (NDI)','Copenhagen Neck Functional Scale','Autre']
};

// Tests force par muscle / articulation (sans tests isocinétiques ici → gérés via Outils)
const testsByMuscle = {
// Genou
'Ischiojambiers': ['McCall 90°','Isométrie 30°','Nordic','Nordic Hold','Razor Curl','Single Leg Bridge','Autre'],
'Quadriceps': ['Isométrie 60°','Leg Extension','Single Leg Squat','Autre'],

// Hanche
'Fléchisseurs hanche': ['Isométrique 45°','Straight Leg Raise (force)','Autre'],
'Abducteurs hanche': ['Side-lying isométrique','Standing belt test','Autre'],
'Adducteurs hanche': ['Squeeze test (5s)','Copenhagen','Autre'],

// Cheville
'Gastrocnémien': ['Heel Raise – genou tendu (1RM)','Heel Raise – max reps','Isométrie 90°','Autre'],
'Soléaire': ['Heel Raise – genou fléchi (1RM)','Max reps','Isométrie 90°','Autre'],
'Inverseurs/Éverseurs': ['Dynamométrie manuelle','Dynamométrie fixe','Autre'],
'Intrinsèques du pied': ['Toe Curl test','Short Foot test','Dynamométrie','Plateforme de pressions','Autre']
};

// === Helpers ===
const slug = s => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-');
const cssEscape = id => id.replace(/([ #;?%&,.+*~':"!^$[\]()=>|/@])/g,'\\$1');

function ensureSingleAutre(container) {
const labels = [...container.querySelectorAll('label')];
const autres = labels.filter(l => (l.textContent || '').trim().toLowerCase() === 'autre');
if (autres.length > 1) {
autres.slice(1).forEach(a => a.remove());
}
}

function addOtherField(container, checkbox, placeholder = 'Précisez') {
const key = checkbox.value ? slug(checkbox.value) : 'autre';
let wrap = container.querySelector(`.other-${key}`);
if (checkbox.checked) {
if (!wrap) {
wrap = document.createElement('div');
wrap.className = `slide show other-${key}`;
wrap.innerHTML = `<input type="text" class="other-input" placeholder="${placeholder}" required style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;">`;
container.appendChild(wrap);
}
} else if (wrap) {
wrap.classList.remove('show');
setTimeout(() => wrap.remove(), 250);
}
}

function makeOtherReactive(root, placeholder = 'Précisez') {
const inputs = root.querySelectorAll('input[type="checkbox"],input[type="radio"]');
inputs.forEach(inp => {
const val = (inp.value || '').toLowerCase();
if (val === 'autre' || val === 'autres' || val.includes('autre')) {
inp.addEventListener('change', () => addOtherField(inp.closest('.checkbox-group') || root, inp, placeholder));
}
});
// Nettoie doublons "Autre"
root.querySelectorAll('.checkbox-group').forEach(gr => ensureSingleAutre(gr));
}

function attachIsokineticHandlers(scope) {
const groups = scope.querySelectorAll('.tools-group');
groups.forEach(group => {
const iso = group.querySelector('input[type="checkbox"][value="Isocinétisme"]');
if (!iso) return;
const ensure = () => {
let sub = group.parentElement.querySelector('.isokinetic-sub');
if (iso.checked) {
if (!sub) {
sub = document.createElement('div');
sub.className = 'slide show isokinetic-sub';
sub.innerHTML = `
<label>Vitesse (isocinétisme)</label>
<div class="checkbox-group iso-speed">
${isokineticSpeeds.map(v => `<label><input type="checkbox" value="${v}"> ${v}</label>`).join('')}
</div>
<label>Mode de contraction (isocinétisme)</label>
<div class="checkbox-group iso-mode">
${isokineticModes.map(m => `<label><input type="checkbox" value="${m}"> ${m}</label>`).join('')}
</div>`;
group.insertAdjacentElement('afterend', sub);
const otherSpeed = sub.querySelector('.iso-speed input[value*="Autre"]');
if (otherSpeed) otherSpeed.addEventListener('change', () => {
addOtherField(sub.querySelector('.iso-speed'), otherSpeed, 'Vitesse (précisez)');
});
makeOtherReactive(sub);
}
} else if (sub) {
sub.classList.remove('show');
setTimeout(() => sub.remove(), 250);
}
};
iso.addEventListener('change', ensure);
ensure();
});
}

function hasUncheckedOther(scope) {
const others = scope.querySelectorAll('input[type="checkbox"][value="Autre"]:checked, input[type="checkbox"][value="Autres"]:checked');
for (const oc of others) {
const group = oc.closest('.checkbox-group');
const txt = group && group.querySelector('.other-input');
if (txt && !txt.value.trim()) return true;
}
return false;
}

function addFrequencyOther(sectionEl) {
const freqGroup = sectionEl.querySelector('.moment');
if (!freqGroup) return;
const other = freqGroup.querySelector('input[type="checkbox"][value="Autre fréquence"]');
if (!other) return;
other.addEventListener('change', () => addOtherField(freqGroup, other, 'Fréquence (précisez)'));
}

// Fusion Tête + Rachis cervical
function getZoneKey(zoneName) {
return headNeckPair.includes(zoneName) ? headNeckTitle : zoneName;
}
function anyHeadNeckChecked() {
return [...zonesCheckboxes].some(z => headNeckPair.includes(z.value) && z.checked);
}

// === Gestion des zones cochées/décochées ===
zonesCheckboxes.forEach(zone => {
zone.addEventListener('change', () => {
const zKey = getZoneKey(zone.value);
if (headNeckPair.includes(zone.value)) {
if (anyHeadNeckChecked()) {
if (!document.getElementById(`section-${slug(headNeckTitle)}`)) {
createZoneSection(headNeckTitle);
}
} else {
removeZoneSection(headNeckTitle);
}
} else {
if (zone.checked) createZoneSection(zKey);
else removeZoneSection(zKey);
}
toggleGlobalSections();
updateProgress();
});
});

// === Blocs globaux (MS, MI, Sauts, Course) ===
function toggleGlobalSections() {
const selected = [...zonesCheckboxes].filter(z => z.checked).map(z => z.value);
const hasLower = selected.some(z => lowerBodyZones.includes(z));
const hasUpper = selected.some(z => upperBodyZones.includes(z));
const hasHead = selected.some(z => headNeckPair.includes(z));

// GLOBAUX MS (si au moins une zone MS cochée)
if (hasUpper) {
if (!globalMS.dataset.ready) {
globalMS.dataset.ready = '1';
globalMS.style.display = '';
globalMS.classList.add('fade-in','active');
globalMS.innerHTML = `
<h3>Tests fonctionnels globaux — Membre Supérieur</h3>
<div class="checkbox-group">
<label><input type="radio" name="do-global-ms" value="Oui"> Oui</label>
<label><input type="radio" name="do-global-ms" value="Non" checked> Non</label>
</div>
<div class="slide" id="global-ms-body">
<label>Quels tests effectuez-vous ?</label>
<div class="checkbox-group ms-tests">
<label><input type="checkbox" value="Traction"> Traction</label>
<label><input type="checkbox" value="Développé couché"> Développé couché</label>
<label><input type="checkbox" value="Tirage"> Tirage</label>
<label><input type="checkbox" value="Force grip"> Force grip</label>
<label><input type="checkbox" value="Autre"> Autre</label>
</div>
<label>Outils</label>
<div class="checkbox-group">
<label><input type="checkbox" value="Pas d'outil particulier"> Pas d'outil particulier</label>
<label><input type="checkbox" value="Encodeur linéaire"> Encodeur linéaire</label>
<label><input type="checkbox" value="Autre"> Autre</label>
</div>
<label>Paramètres étudiés</label>
<div class="checkbox-group">
<label><input type="checkbox" value="1RM"> 1RM</label>
<label><input type="checkbox" value="3RM"> 3RM</label>
<label><input type="checkbox" value="Isométrie"> Isométrie</label>
</div>
<label>Critères d’évaluation</label>
<div class="checkbox-group">
<label><input type="checkbox" value="Moyenne du groupe"> Moyenne du groupe</label>
<label><input type="checkbox" value="Ratio / poids du corps"> Ratio / poids du corps</label>
<label><input type="checkbox" value="Valeur seuil"> Valeur seuil</label>
</div>
</div>`;
// Oui/Non
const radios = globalMS.querySelectorAll('input[name="do-global-ms"]');
const body = globalMS.querySelector('#global-ms-body');
radios.forEach(r => r.addEventListener('change', () => {
if (r.checked && r.value === 'Oui') {
body.classList.add('show');
} else if (r.checked && r.value === 'Non') {
body.classList.remove('show');
}
}));
makeOtherReactive(globalMS);
}
} else {
globalMS.style.display = 'none';
globalMS.innerHTML = '';
delete globalMS.dataset.ready;
}

// GLOBAUX MI (si au moins une zone MI cochée)
if (hasLower) {
if (!globalMI.dataset.ready) {
globalMI.dataset.ready = '1';
globalMI.style.display = '';
globalMI.classList.add('fade-in','active');
globalMI.innerHTML = `
<h3>Tests fonctionnels globaux — Membre Inférieur</h3>
<div class="checkbox-group">
<label><input type="radio" name="do-global-mi" value="Oui"> Oui</label>
<label><input type="radio" name="do-global-mi" value="Non" checked> Non</label>
</div>
<div class="slide" id="global-mi-body">
<label>Quels tests effectuez-vous ?</label>
<div class="checkbox-group mi-tests">
<label><input type="checkbox" value="Squat"> Squat</label>
<label><input type="checkbox" value="Montée sur banc"> Montée sur banc</label>
<label><input type="checkbox" value="Soulevé de terre"> Soulevé de terre</label>
<label><input type="checkbox" value="Autre"> Autre</label>
</div>
<label>Outils</label>
<div class="checkbox-group">
<label><input type="checkbox" value="Pas d'outil particulier"> Pas d'outil particulier</label>
<label><input type="checkbox" value="Encodeur linéaire"> Encodeur linéaire</label>
<label><input type="checkbox" value="Autre"> Autre</label>
</div>
<label>Paramètres étudiés</label>
<div class="checkbox-group">
<label><input type="checkbox" value="1RM"> 1RM</label>
<label><input type="checkbox" value="3RM"> 3RM</label>
<label><input type="checkbox" value="Isométrie"> Isométrie</label>
</div>
<label>Critères d’évaluation</label>
<div class="checkbox-group">
<label><input type="checkbox" value="Moyenne du groupe"> Moyenne du groupe</label>
<label><input type="checkbox" value="Ratio / poids du corps"> Ratio / poids du corps</label>
<label><input type="checkbox" value="Valeur seuil"> Valeur seuil</label>
</div>
</div>`;
const radios = globalMI.querySelectorAll('input[name="do-global-mi"]');
const body = globalMI.querySelector('#global-mi-body');
radios.forEach(r => r.addEventListener('change', () => {
if (r.checked && r.value === 'Oui') body.classList.add('show');
else if (r.checked && r.value === 'Non') body.classList.remove('show');
}));
makeOtherReactive(globalMI);
}
} else {
globalMI.style.display = 'none';
globalMI.innerHTML = '';
delete globalMI.dataset.ready;
}

// SAUTS : unique si MI cochée
if (hasLower) {
if (!globalJumps.dataset.ready) {
globalJumps.dataset.ready = '1';
globalJumps.style.display = '';
globalJumps.classList.add('fade-in','active');
globalJumps.innerHTML = `
<h3>Tests de sauts</h3>
<div class="checkbox-group">
<label><input type="radio" name="do-jumps" value="Oui"> Oui</label>
<label><input type="radio" name="do-jumps" value="Non" checked> Non</label>
</div>
<div class="slide" id="global-jumps-body">
<label>Quels tests de sauts utilisez-vous ?</label>
<div class="checkbox-group">
<label><input type="checkbox" value="CMJ"> CMJ</label>
<label><input type="checkbox" value="Squat Jump"> Squat Jump</label>
<label><input type="checkbox" value="Drop Jump"> Drop Jump</label>
<label><input type="checkbox" value="Broad Jump"> Broad Jump</label>
<label><input type="checkbox" value="Single Hop"> Single Hop</label>
<label><input type="checkbox" value="Triple Hop"> Triple Hop</label>
<label><input type="checkbox" value="Side Hop"> Side Hop</label>
<label><input type="checkbox" value="Autre"> Autre</label>
</div>
<label>Paramètres étudiés</label>
<div class="checkbox-group">
<label><input type="checkbox" value="Force max"> Force max</label>
<label><input type="checkbox" value="Hauteur"> Hauteur</label>
<label><input type="checkbox" value="Temps de vol"> Temps de vol</label>
<label><input type="checkbox" value="Pic de puissance"> Pic de puissance</label>
<label><input type="checkbox" value="Puissance relative"> Puissance relative</label>
<label><input type="checkbox" value="RFD"> RFD</label>
<label><input type="checkbox" value="RSI"> RSI</label>
<label><input type="checkbox" value="Distance"> Distance</label>
</div>
<label>Outils</label>
<div class="checkbox-group">
<label><input type="checkbox" value="Plateforme de force"> Plateforme de force</label>
<label><input type="checkbox" value="Centimétrie"> Centimétrie</label>
<label><input type="checkbox" value="Sans outil"> Sans outil</label>
<label><input type="checkbox" value="Autre"> Autre</label>
</div>
<label>Critères d’évaluation</label>
<div class="checkbox-group">
<label><input type="checkbox" value="Comparaison droite/gauche"> Comparaison droite/gauche</label>
<label><input type="checkbox" value="Valeur seuil"> Valeur seuil</label>
</div>
</div>`;
const radios = globalJumps.querySelectorAll('input[name="do-jumps"]');
const body = globalJumps.querySelector('#global-jumps-body');
radios.forEach(r => r.addEventListener('change', () => {
if (r.checked && r.value === 'Oui') body.classList.add('show');
else if (r.checked && r.value === 'Non') body.classList.remove('show');
}));
makeOtherReactive(globalJumps);
}
} else {
globalJumps.style.display = 'none';
globalJumps.innerHTML = '';
delete globalJumps.dataset.ready;
}

// COURSE : unique si MI cochée OU tête/rachis coché
if (hasLower || hasHead) {
if (!globalCourse.dataset.ready) {
globalCourse.dataset.ready = '1';
globalCourse.style.display = '';
globalCourse.classList.add('fade-in','active');
globalCourse.innerHTML = `
<h3>Tests de course</h3>
<div class="checkbox-group">
<label><input type="radio" name="do-course" value="Oui"> Oui</label>
<label><input type="radio" name="do-course" value="Non" checked> Non</label>
</div>
<div class="slide" id="global-course-body">
<label>Quels tests de course utilisez-vous ?</label>
<div class="checkbox-group">
<label><input type="checkbox" value="Sprint 10m"> Sprint 10m</label>
<label><input type="checkbox" value="Sprint 20m"> Sprint 20m</label>
<label><input type="checkbox" value="Sprint 30m"> Sprint 30m</label>
<label><input type="checkbox" value="Vmax"> Vmax</label>
<label><input type="checkbox" value="Yoyo"> Yoyo</label>
<label><input type="checkbox" value="IR test"> IR test</label>
<label><input type="checkbox" value="30-15 IFT"> 30-15 IFT</label>
<label><input type="checkbox" value="MAS test"> MAS test</label>
<label><input type="checkbox" value="RSA"> RSA</label>
<label><input type="checkbox" value="Bronco"> Bronco</label>
<label><input type="checkbox" value="Shuttle test"> Shuttle test</label>
<label><input type="checkbox" value="505"> 505</label>
<label><input type="checkbox" value="T-Test"> T-Test</label>
<label><input type="checkbox" value="Illinois"> Illinois</label>
<label><input type="checkbox" value="Autre"> Autre</label>
</div>
<label>Outils</label>
<div class="checkbox-group">
<label><input type="checkbox" value="Chronomètre"> Chronomètre</label>
<label><input type="checkbox" value="Cellules"> Cellules</label>
<label><input type="checkbox" value="GPS"> GPS</label>
<label><input type="checkbox" value="1080 Sprint"> 1080 Sprint</label>
<label><input type="checkbox" value="Autres"> Autres</label>
</div>
<label>Critères d’évaluation</label>
<div class="checkbox-group">
<label><input type="checkbox" value="Moyenne par poste"> Moyenne par poste</label>
<label><input type="checkbox" value="Valeur seuil"> Valeur seuil</label>
</div>
</div>`;
const radios = globalCourse.querySelectorAll('input[name="do-course"]');
const body = globalCourse.querySelector('#global-course-body');
radios.forEach(r => r.addEventListener('change', () => {
if (r.checked && r.value === 'Oui') body.classList.add('show');
else if (r.checked && r.value === 'Non') body.classList.remove('show');
}));
makeOtherReactive(globalCourse);
}
} else {
globalCourse.style.display = 'none';
globalCourse.innerHTML = '';
delete globalCourse.dataset.ready;
}
}

// === Création / suppression d'une section par zone ===
function createZoneSection(zoneName) {
if (document.getElementById(`section-${slug(zoneName)}`)) return;

const section = document.createElement('div');
section.classList.add('subcard','fade-in');
section.id = `section-${slug(zoneName)}`;
section.innerHTML = `
<h3>${zoneName}</h3>

<label>À quel moment testez-vous cette zone ?</label>
<div class="checkbox-group moment">
<label><input type="checkbox" value="Pré-saison"> Pré-saison</label>
<label><input type="checkbox" value="Retour au jeu"> Retour au jeu</label>
<label><input type="checkbox" value="Autre fréquence"> Autre fréquence</label>
</div>

<label>Quels types de tests sont réalisés ?</label>
<div class="checkbox-group types">
${zoneName === headNeckTitle ? `
<label><input type="checkbox" value="Force"> Force</label>
<label><input type="checkbox" value="Mobilité"> Mobilité</label>
<label><input type="checkbox" value="Test de cognition"> Test de cognition</label>
<label><input type="checkbox" value="Proprioception / Équilibre"> Proprioception / Équilibre</label>
<label><input type="checkbox" value="Questionnaires"> Questionnaires</label>
<label><input type="checkbox" value="Autres données"> Autres données</label>
` : `
<label><input type="checkbox" value="Force"> Force</label>
<label><input type="checkbox" value="Mobilité"> Mobilité</label>
<label><input type="checkbox" value="Proprioception / Équilibre"> Proprioception / Équilibre</label>
<label><input type="checkbox" value="Questionnaires"> Questionnaires</label>
<label><input type="checkbox" value="Autres données"> Autres données</label>
`}
</div>

<div class="subquestions"></div>
`;
zoneQuestionsContainer.appendChild(section);

addFrequencyOther(section);

const typeCheckboxes = section.querySelectorAll('.types input[type="checkbox"]');
const subQContainer = section.querySelector('.subquestions');

typeCheckboxes.forEach((cb, i) => {
cb.addEventListener('change', () => {
const id = `sub-${slug(zoneName)}-${slug(cb.value)}`;
const existing = subQContainer.querySelector(`#${cssEscape(id)}`);

if (cb.checked) {
let subSection = null;

if (zoneName === headNeckTitle) {
if (cb.value === 'Test de cognition') {
subSection = document.createElement('div');
subSection.id = id;
subSection.className = 'slide stagger';
subSection.style.animationDelay = `${i*0.1}s`;
subSection.innerHTML = `
<h4>Test de cognition</h4>
<div class="checkbox-group">
<label><input type="checkbox" value="Test oculaire"> Test oculaire</label>
<label><input type="checkbox" value="Test vestibulaire"> Test vestibulaire</label>
<label><input type="checkbox" value="Autre"> Autre</label>
</div>`;
makeOtherReactive(subSection);
}
if (cb.value === 'Proprioception / Équilibre') subSection = createProprioBlock(zoneName, id, i);
if (cb.value === 'Questionnaires') subSection = createQuestionnaireBlock(zoneName, id, i);
if (cb.value === 'Autres données') subSection = createOtherDataBlock(zoneName, id, i);
if (cb.value === 'Force') subSection = createForceBlock(zoneName, id, i);
if (cb.value === 'Mobilité') subSection = createMobilityBlock(zoneName, id, i);
} else {
if (cb.value === 'Force') subSection = createForceBlock(zoneName, id, i);
if (cb.value === 'Mobilité') subSection = createMobilityBlock(zoneName, id, i);
if (cb.value === 'Proprioception / Équilibre') subSection = createProprioBlock(zoneName, id, i);
if (cb.value === 'Questionnaires') subSection = createQuestionnaireBlock(zoneName, id, i);
if (cb.value === 'Autres données') subSection = createOtherDataBlock(zoneName, id, i);
}

if (subSection) {
subQContainer.appendChild(subSection);
makeOtherReactive(subSection);
attachIsokineticHandlers(subSection);
section.classList.add('active');
setTimeout(() => subSection.classList.add('show'), 10);
}
} else if (existing) {
existing.classList.remove('show');
setTimeout(() => {
existing.remove();
const stillChecked = section.querySelectorAll('.types input:checked').length > 0;
if (!stillChecked) section.classList.remove('active');
}, 250);
}
});
});
}

function removeZoneSection(zoneName) {
const section = document.getElementById(`section-${slug(zoneName)}`);
if (section) section.remove();
}

// === Blocs spécifiques ===
function createOtherDataBlock(zoneName, id, delayIndex) {
const div = document.createElement('div');
div.id = id;
div.className = 'slide stagger';
div.style.animationDelay = `${delayIndex*0.1}s`;
div.innerHTML = `
<h4>Autres données — ${zoneName}</h4>
<input type="text" class="other-input" placeholder="Précisez la donnée collectée" required
style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;">`;
return div;
}

function createQuestionnaireBlock(zoneName, id, delayIndex) {
const div = document.createElement('div');
div.id = id;
div.className = 'slide stagger';
div.style.animationDelay = `${delayIndex*0.1}s`;
const list = questionnairesByZone[zoneName] || ['Autre'];
div.innerHTML = `
<h4>Questionnaires — ${zoneName}</h4>
<div class="checkbox-group q-list">
${list.map(q => `<label><input type="checkbox" value="${q}"> ${q}</label>`).join('')}
</div>`;
makeOtherReactive(div.querySelector('.q-list'), 'Nom du questionnaire');
return div;
}

function createProprioBlock(zoneName, id, delayIndex) {
const div = document.createElement('div');
div.id = id;
div.className = 'slide stagger';
div.style.animationDelay = `${delayIndex*0.1}s`;
const list = proprioByZone[zoneName] || [];
div.innerHTML = `
<h4>Proprioception / Équilibre — ${zoneName}</h4>
<label>Quels tests utilisez-vous ?</label>
<div class="checkbox-group proprio-tests">
${list.map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join('')}
<label><input type="checkbox" value="Autre"> Autre</label>
</div>
<label>Critères d’évaluation</label>
<div class="checkbox-group">
<label><input type="checkbox" value="Moyenne du groupe"> Moyenne du groupe</label>
<label><input type="checkbox" value="Valeur seuil"> Valeur seuil</label>
</div>`;
makeOtherReactive(div.querySelector('.proprio-tests'), 'Nom du test');
return div;
}

// === FORCE ===
function createForceBlock(zoneName, id, delayIndex) {
const div = document.createElement('div');
div.id = id;
div.className = 'slide stagger';
div.style.animationDelay = `${delayIndex*0.1}s`;

const moves = [];
// Mouvements généraux
moves.push('Flexion/Extension');
if (!['Genou','Cheville / Pied','Coude','Poignet / Main'].includes(zoneName)) moves.push('Rotations');
if (['Épaule','Hanche'].includes(zoneName)) moves.push('Adduction/Abduction');
if (zoneName === 'Cheville / Pied') {
moves.push('Éversion/Inversion');
moves.push('Intrinsèques du pied');
}
// Ajouts spécifiques demandés : inclinaisons en FORCE pour cervical & lombaire
if (zoneName === headNeckTitle) moves.push('Inclinaisons');
if (zoneName === 'Rachis lombaire') moves.push('Inclinaisons');
// Épaule : ASH
if (zoneName === 'Épaule') moves.push('ASH Test');

div.innerHTML = `
<h4>Force — ${zoneName}</h4>
<label>Quels mouvements évaluez-vous en force ?</label>
<div class="checkbox-group force-moves">
${moves.map(m => `<label><input type="checkbox" value="${m}"> ${m}</label>`).join('')}
</div>
<div class="force-moves-details"></div>`;

const details = div.querySelector('.force-moves-details');
const moveBoxes = div.querySelectorAll('.force-moves input[type="checkbox"]');

moveBoxes.forEach((mb, i) => {
mb.addEventListener('change', () => {
const mid = `${id}-move-${slug(mb.value)}`;
const existing = details.querySelector(`#${cssEscape(mid)}`);
if (mb.checked) {
const block = document.createElement('div');
block.id = mid;
block.className = 'slide stagger show';
block.style.animationDelay = `${i*0.05}s`;

// GENOU : Flex/Ext → Ischios / Quads
if (zoneName === 'Genou' && mb.value === 'Flexion/Extension') {
block.innerHTML = `
<h5>${mb.value}</h5>
<label>Choix du groupe musculaire</label>
<div class="checkbox-group knee-muscles">
<label><input type="checkbox" value="Ischiojambiers"> Ischiojambiers</label>
<label><input type="checkbox" value="Quadriceps"> Quadriceps</label>
</div>
<div class="knee-muscles-details"></div>`;
const mWrap = block.querySelector('.knee-muscles');
const dWrap = block.querySelector('.knee-muscles-details');
mWrap.querySelectorAll('input').forEach((mcb, j) => {
mcb.addEventListener('change', () => {
const gid = `${mid}-${slug(mcb.value)}`;
const ex = dWrap.querySelector(`#${cssEscape(gid)}`);
if (mcb.checked && !ex) {
dWrap.appendChild(createMuscleDetailBlock(zoneName, mcb.value, gid, i+j));
} else if (!mcb.checked && ex) {
ex.classList.remove('show');
setTimeout(() => ex.remove(), 250);
}
});
});

// HANCHE : groupes
} else if (zoneName === 'Hanche' && ['Adduction/Abduction','Flexion/Extension'].includes(mb.value)) {
block.innerHTML = `
<h5>${mb.value}</h5>
<label>Groupe musculaire</label>
<div class="checkbox-group hip-muscles">
<label><input type="checkbox" value="Fléchisseurs hanche"> Fléchisseurs hanche</label>
<label><input type="checkbox" value="Abducteurs hanche"> Abducteurs hanche</label>
<label><input type="checkbox" value="Adducteurs hanche"> Adducteurs hanche</label>
</div>
<div class="hip-muscles-details"></div>`;
const mWrap = block.querySelector('.hip-muscles');
const dWrap = block.querySelector('.hip-muscles-details');
mWrap.querySelectorAll('input').forEach((mcb, j) => {
mcb.addEventListener('change', () => {
const gid = `${mid}-${slug(mcb.value)}`;
const ex = dWrap.querySelector(`#${cssEscape(gid)}`);
if (mcb.checked && !ex) {
dWrap.appendChild(createMuscleDetailBlock(zoneName, mcb.value, gid, i+j));
} else if (!mcb.checked && ex) {
ex.classList.remove('show');
setTimeout(() => ex.remove(), 250);
}
});
});

// CHEVILLE : Flex/Ext (Gastro/Soléaire), Inversion/Éversion, Intrinsèques
} else if (zoneName === 'Cheville / Pied' && (mb.value.includes('Éversion/Inversion') || mb.value.includes('Flexion/Extension') || mb.value.includes('Intrinsèques'))) {
if (mb.value.includes('Flexion/Extension')) {
block.innerHTML = `
<h5>${mb.value}</h5>
<label>Groupe musculaire</label>
<div class="checkbox-group ankle-muscles">
<label><input type="checkbox" value="Gastrocnémien"> Gastrocnémien</label>
<label><input type="checkbox" value="Soléaire"> Soléaire</label>
</div>
<div class="ankle-muscles-details"></div>`;
const mWrap = block.querySelector('.ankle-muscles');
const dWrap = block.querySelector('.ankle-muscles-details');
mWrap.querySelectorAll('input').forEach((mcb, j) => {
mcb.addEventListener('change', () => {
const gid = `${mid}-${slug(mcb.value)}`;
const ex = dWrap.querySelector(`#${cssEscape(gid)}`);
if (mcb.checked && !ex) {
dWrap.appendChild(createMuscleDetailBlock(zoneName, mcb.value, gid, i+j));
} else if (!mcb.checked && ex) {
ex.classList.remove('show');
setTimeout(() => ex.remove(), 250);
}
});
});
} else if (mb.value.includes('Éversion/Inversion')) {
const gid = `${mid}-inv-ev`;
block.innerHTML = `<h5>${mb.value}</h5><div class="inv-ev-details"></div>`;
const dWrap = block.querySelector('.inv-ev-details');
dWrap.appendChild(createMuscleDetailBlock(zoneName, 'Inverseurs/Éverseurs', gid, i));
} else if (mb.value.includes('Intrinsèques')) {
const gid = `${mid}-intrinseques`;
block.innerHTML = `<h5>Intrinsèques du pied</h5><div class="foot-intr-details"></div>`;
const dWrap = block.querySelector('.foot-intr-details');
dWrap.appendChild(createMuscleDetailBlock(zoneName, 'Intrinsèques du pied', gid, i));
}

// ÉPAULE : ASH Test
} else if (zoneName === 'Épaule' && mb.value === 'ASH Test') {
block.innerHTML = `
<h5>ASH Test</h5>
<label>Position(s) testée(s)</label>
<div class="checkbox-group">
<label><input type="checkbox" value="I (180°)"> I (180°)</label>
<label><input type="checkbox" value="Y (135°)"> Y (135°)</label>
<label><input type="checkbox" value="T (90°)"> T (90°)</label>
<label><input type="checkbox" value="I (0°)"> I (0°)</label>
<label><input type="checkbox" value="Autre"> Autre</label>
</div>
<label>Outils utilisés</label>
<div class="checkbox-group tools-group">
${toolsForceGeneric.map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join('')}
<label><input type="checkbox" value="Autre"> Autre</label>
</div>
<label>Paramètres étudiés</label>
<div class="checkbox-group">
${paramsForce.map(p => `<label><input type="checkbox" value="${p}"> ${p}</label>`).join('')}
</div>
<label>Critères d’évaluation</label>
<div class="checkbox-group">
${criteriaForce.map(c => `<label><input type="checkbox" value="${c}"> ${c}</label>`).join('')}
</div>`;
makeOtherReactive(block);
attachIsokineticHandlers(block);

// Tête / Rachis cervical — Inclinaisons en force (et autres mouvements simples)
} else if ((zoneName === headNeckTitle || zoneName === 'Rachis lombaire') && (mb.value === 'Inclinaisons' || mb.value === 'Flexion/Extension' || mb.value === 'Rotations')) {
block.innerHTML = `
<h5>${mb.value}</h5>
<label>Outils utilisés</label>
<div class="checkbox-group tools-group">
${toolsForceGeneric.map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join('')}
${zoneName === 'Rachis lombaire' && mb.value.includes('Flexion/Extension') ? `
<label><input type="checkbox" value="Test de Shirado"> Test de Shirado</label>
<label><input type="checkbox" value="Test de Sorensen"> Test de Sorensen</label>` : ''}
<label><input type="checkbox" value="Autre"> Autre</label>
</div>
<label>Paramètres étudiés</label>
<div class="checkbox-group">
${paramsForce.map(p => `<label><input type="checkbox" value="${p}"> ${p}</label>`).join('')}
</div>
<label>Critères d’évaluation</label>
<div class="checkbox-group">
${criteriaForce.map(c => `<label><input type="checkbox" value="${c}"> ${c}</label>`).join('')}
</div>`;
makeOtherReactive(block);
attachIsokineticHandlers(block);

// Autres articulations / mouvements simples
} else {
block.innerHTML = `
<h5>${mb.value}</h5>
<label>Outils utilisés</label>
<div class="checkbox-group tools-group">
${toolsForceGeneric.map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join('')}
<label><input type="checkbox" value="Autre"> Autre</label>
</div>
<label>Paramètres étudiés</label>
<div class="checkbox-group">
${paramsForce.map(p => `<label><input type="checkbox" value="${p}"> ${p}</label>`).join('')}
</div>
<label>Critères d’évaluation</label>
<div class="checkbox-group">
${criteriaForce.map(c => `<label><input type="checkbox" value="${c}"> ${c}</label>`).join('')}
</div>`;
makeOtherReactive(block);
attachIsokineticHandlers(block);
}

details.appendChild(block);
// Supprimer doublons "Autre" éventuels dans Outils/Tests spécifiques
block.querySelectorAll('.checkbox-group').forEach(gr => ensureSingleAutre(gr));

} else if (existing) {
existing.classList.remove('show');
setTimeout(() => existing.remove(), 250);
}
});
});

return div;
}

// Détail FORCE par groupe musculaire
function createMuscleDetailBlock(zoneName, muscleLabel, gid, delay) {
const wrap = document.createElement('div');
wrap.id = gid;
wrap.className = 'slide stagger show';
wrap.style.animationDelay = `${delay*0.05}s`;

const testList = testsByMuscle[muscleLabel] || ['Autre'];

wrap.innerHTML = `
<h5 style="margin-top:10px">${muscleLabel}</h5>
<label>Outils utilisés</label>
<div class="checkbox-group tools-group">
${['Dynamomètre manuel','Dynamomètre fixe','Isocinétisme','Plateforme de force','Sans outil'].map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join('')}
<label><input type="checkbox" value="Autre"> Autre</label>
</div>

<label>Tests spécifiques</label>
<div class="checkbox-group muscle-tests">
${testList.map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join('')}
<label><input type="checkbox" value="Autre"> Autre</label>
</div>

<label>Paramètres étudiés</label>
<div class="checkbox-group">
${['Force max','Force moyenne','Force relative (N/kg)','RFD','Angle du pic de force','Endurance'].map(p => `<label><input type="checkbox" value="${p}"> ${p}</label>`).join('')}
</div>

<label>Critères d’évaluation</label>
<div class="checkbox-group">
${['Ratio agoniste/antagoniste','Ratio droite/gauche','Valeur seuil'].map(c => `<label><input type="checkbox" value="${c}"> ${c}</label>`).join('')}
</div>`;

// Champs "Autre" réactifs & isocinétisme
wrap.querySelectorAll('.checkbox-group').forEach(g => {
ensureSingleAutre(g);
makeOtherReactive(g);
});
attachIsokineticHandlers(wrap);

return wrap;
}

// === MOBILITÉ ===
function createMobilityBlock(zoneName, id, delayIndex) {
const div = document.createElement('div');
div.id = id;
div.className = 'slide stagger';
div.style.animationDelay = `${delayIndex*0.1}s`;

const moves = [];
moves.push('Flexion/Extension');
if (!['Genou','Cheville / Pied','Coude','Poignet / Main'].includes(zoneName)) moves.push('Rotations');
if (['Épaule','Hanche'].includes(zoneName)) moves.push('Adduction/Abduction');
if (zoneName === 'Cheville / Pied') moves.push('Éversion/Inversion');
if (zoneName === 'Rachis lombaire' || zoneName === headNeckTitle || zoneName === 'Poignet / Main') moves.push('Inclinaisons');

div.innerHTML = `
<h4>Mobilité — ${zoneName}</h4>
<label>Quels mouvements évaluez-vous en mobilité ?</label>
<div class="checkbox-group mob-moves">
${moves.map(m => `<label><input type="checkbox" value="${m}"> ${m}</label>`).join('')}
</div>
<div class="mob-moves-details"></div>`;

const details = div.querySelector('.mob-moves-details');
div.querySelectorAll('.mob-moves input').forEach((mb, i) => {
mb.addEventListener('change', () => {
const mid = `${id}-move-${slug(mb.value)}`;
const existing = details.querySelector(`#${cssEscape(mid)}`);
if (mb.checked) {
const block = document.createElement('div');
block.id = mid;
block.className = 'slide stagger show';
block.style.animationDelay = `${i*0.05}s`;

let tools = [...toolsMobilityGeneric];
// Lombaire : Sit-and-reach sur Flex/Ext et Inclinaisons : on ne garde que "Distance doigt-sol" pour Inclinaisons (selon specs V12+)
if (zoneName === 'Rachis lombaire' && mb.value === 'Flexion/Extension') tools.push('Sit-and-reach');
if (zoneName === 'Rachis lombaire' && mb.value === 'Inclinaisons') tools = ['Distance doigt-sol'];
// Cheville : KTW pour flex dorsale → simplif : si Flex/Ext choisi, proposer KTW
if (zoneName === 'Cheville / Pied' && mb.value === 'Flexion/Extension') tools.push('Knee-to-wall (KTW)');

block.innerHTML = `
<h5 style="margin-top:10px">${mb.value}</h5>
<label>Outils utilisés</label>
<div class="checkbox-group">
${tools.map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join('')}
<label><input type="checkbox" value="Autre"> Autre</label>
</div>
<label>Critères d’évaluation</label>
<div class="checkbox-group">
${ (zoneName === 'Rachis lombaire' && mb.value === 'Inclinaisons') ?
['Moyenne du groupe','Valeur seuil'] :
['Comparaison droite/gauche','Valeur seuil']
.map(c => `<label><input type="checkbox" value="${c}"> ${c}</label>`).join('')}
</div>`;

details.appendChild(block);
block.querySelectorAll('.checkbox-group').forEach(g => { ensureSingleAutre(g); makeOtherReactive(g); });

} else if (existing) {
existing.classList.remove('show');
setTimeout(() => existing.remove(), 250);
}
});
});

return div;
}

// === VALIDATION stricte avant envoi ===
submitBtn.addEventListener('click', (e) => {
e.preventDefault();
resultMessage.textContent = '';
resultMessage.style.color = 'red';

// Infos générales : role + structure/equipe (et "Autre" => préciser)
const role = document.querySelector('input[name="role"]:checked');
const roleOther = document.querySelector('#role .other-input');
const struct = document.querySelector('input[name="structure"]:checked') || document.querySelector('input[name="equipe"]:checked');
const structOther = (document.querySelector('#structure .other-input') || document.querySelector('#equipe .other-input'));

if (!role || !struct) {
resultMessage.textContent = '⚠️ Merci de compléter les informations générales.';
return;
}
// Si "Autre" coché dans ces groupes, vérifier le champ texte
const roleAutre = document.querySelector('#role input[value="Autre"]:checked');
if (roleAutre && (!roleOther || !roleOther.value.trim())) {
resultMessage.textContent = '⚠️ Merci de préciser votre rôle.';
return;
}
const structAutre = (document.querySelector('#structure input[value="Autre"]:checked') || document.querySelector('#equipe input[value="Autre"]:checked'));
if (structAutre && (!structOther || !structOther.value.trim())) {
resultMessage.textContent = '⚠️ Merci de préciser votre équipe/structure.';
return;
}

// Zones sélectionnées
const selectedZonesRaw = [...zonesCheckboxes].filter(z => z.checked);
if (selectedZonesRaw.length === 0) {
resultMessage.textContent = '⚠️ Merci de sélectionner au moins une zone anatomique.';
return;
}

// Zones logiques (fusion tête/rachis)
const selectedZoneKeys = [];
const headOrNeck = selectedZonesRaw.some(z => headNeckPair.includes(z.value));
if (headOrNeck) selectedZoneKeys.push(headNeckTitle);
selectedZonesRaw.forEach(z => { if (!headNeckPair.includes(z.value)) selectedZoneKeys.push(z.value); });

// Validation par zone
const zonesIncomplete = selectedZoneKeys.some(zName => {
const sec = document.getElementById(`section-${slug(zName)}`);
if (!sec) return true;

// Fréquences / Types : au moins un des deux
const hasFreq = !!sec.querySelector('.moment input:checked');
const hasType = !!sec.querySelector('.types input:checked');
if (!hasFreq && !hasType) return true;

// Autre fréquence précisée ?
const of = sec.querySelector('.moment input[value="Autre fréquence"]:checked');
if (of) {
const txt = sec.querySelector('.moment .other-input');
if (!txt || !txt.value.trim()) return true;
}

// Force cochée → au moins un mouvement, et si mouvement → au moins un outil, paramètres, critères
const forceChecked = sec.querySelector('.types input[value="Force"]:checked');
if (forceChecked) {
const mArea = sec.querySelector('.force-moves');
if (!mArea || !mArea.querySelector('input:checked')) return true;
if (hasUncheckedOther(sec)) return true;
const isoOther = sec.querySelector('.isokinetic-sub .iso-speed input[value*="Autre"]:checked');
if (isoOther) {
const txt = sec.querySelector('.isokinetic-sub .iso-speed .other-input');
if (!txt || !txt.value.trim()) return true;
}
}

// Mobilité cochée → au moins un mouvement + outils + critères
const mobChecked = sec.querySelector('.types input[value="Mobilité"]:checked');
if (mobChecked) {
const mArea = sec.querySelector('.mob-moves');
if (!mArea || !mArea.querySelector('input:checked')) return true;
if (hasUncheckedOther(sec)) return true;
}

// Questionnaires / Proprio / Autres données → "Autre" précisé ?
if (hasUncheckedOther(sec)) return true;
const otherData = sec.querySelector('.types input[value="Autres données"]:checked');
if (otherData) {
const txt = sec.querySelector('.other-input');
if (!txt || !txt.value.trim()) return true;
}

return false;
});

if (zonesIncomplete) {
resultMessage.textContent = '⚠️ Merci de compléter toutes les sous-sections (mouvements, outils, tests, paramètres, critères, précisions…).';
return;
}

// Globaux : si affichés et "Autre" cochés → préciser
for (const g of [globalMS, globalMI, globalJumps, globalCourse]) {
if (!g || !g.dataset.ready) continue;
if (hasUncheckedOther(g)) {
resultMessage.textContent = '⚠️ Merci de préciser les champs "Autre" dans les sections globales.';
return;
}
}

// Tout est OK
resultMessage.style.color = '#0074d9';
resultMessage.textContent = '✅ Merci ! Vos réponses sont prêtes à être envoyées (liaison Google Form possible).';
window.scrollTo({ top: 0, behavior: 'smooth' });

// ---------------- Google Form (facultatif) ----------------
// Renseignez votre URL + mapping des champs si vous souhaitez envoyer directement.
/*
const GOOGLE_FORM_URL = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSeNok3wNrafUFIM2VnAo4NKQpdZDaDyFDeVS8dZbXFyt_ySyA/formResponse';
const ENTRY_MAP = {
// Exemple :
// role: 'entry.XXXXXX',
// equipe: 'entry.YYYYYY',
// ... puis champs sérialisés pour chaque zone.
};

// Exemple d’envoi minimal :
const payload = new URLSearchParams();
// payload.append(ENTRY_MAP.role, role.value);
// payload.append(ENTRY_MAP.equipe, (struct.value || ''));

fetch(GOOGLE_FORM_URL, { method: 'POST', mode: 'no-cors', body: payload })
.then(() => console.log('Google Form : envoi OK'))
.catch(() => console.log('Google Form : envoi non confirmé (no-cors)'));
*/
});

// === Ajustements UX : "Autre" rôle / structure → champ texte conditionnel ===
function setupGeneralOtherFields() {
const roleGroup = document.getElementById('role');
const structGroup = document.getElementById('structure') || document.getElementById('equipe');

if (roleGroup) {
const other = roleGroup.querySelector('input[value="Autre"]');
if (other) {
other.addEventListener('change', () => addOtherField(roleGroup, other, 'Précisez votre rôle'));
// masquer le champ si "Autre" décoché
roleGroup.querySelectorAll('input[type="radio"]').forEach(r => {
r.addEventListener('change', () => {
if (r.value !== 'Autre') {
const wrap = roleGroup.querySelector('.other-autre');
if (wrap) { wrap.remove(); }
}
});
});
}
ensureSingleAutre(roleGroup);
makeOtherReactive(roleGroup, 'Précisez votre rôle');
}

if (structGroup) {
const other = structGroup.querySelector('input[value="Autre"]');
if (other) {
other.addEventListener('change', () => addOtherField(structGroup, other, 'Précisez'));
structGroup.querySelectorAll('input[type="radio"]').forEach(r => {
r.addEventListener('change', () => {
if (r.value !== 'Autre') {
const wrap = structGroup.querySelector('.other-autre');
if (wrap) { wrap.remove(); }
}
});
});
}
ensureSingleAutre(structGroup);
makeOtherReactive(structGroup, 'Précisez');
}
}

setupGeneralOtherFields();
});
