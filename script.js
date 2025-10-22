// ------------------------------
// script.js – v10 (finale complète)
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
// ====== Sélecteurs globaux
const form = document.getElementById("questionnaireForm");
const zonesCheckboxes = document.querySelectorAll("#zones input[type='checkbox']");
const zoneQuestionsContainer = document.getElementById("zoneQuestions");
const submitBtn = document.getElementById("submitBtn");
const resultMessage = document.getElementById("resultMessage");

// Barre de progression
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");
const formSections = document.querySelectorAll(".card");

function updateProgress() {
const filled = [...formSections].filter(sec =>
sec.querySelector("input:checked") ||
sec.querySelector("input[type='text'].other-input")?.value?.trim()
).length;
const total = formSections.length;
const percent = Math.min(100, Math.round((filled / total) * 100));
if (progressBar) progressBar.style.width = percent + "%";
if (progressText) progressText.textContent = `Progression : ${percent}%`;
}
document.addEventListener("change", updateProgress);

// ====== Groupes de zones
const lowerBodyZones = ["Hanche", "Genou", "Cheville / Pied"];
const upperBodyZones = ["Épaule", "Coude", "Poignet / Main"];
const headNeckPair = ["Tête", "Rachis cervical"];
const headNeckTitle = "Tête / Rachis cervical";

// ====== Blocs globaux uniques (créés à la volée)
const globalJumps = document.createElement("div"); // Sauts (unique si MI cochée)
globalJumps.id = "global-jumps";
globalJumps.className = "subcard";
globalJumps.style.display = "none";
zoneQuestionsContainer.parentElement.appendChild(globalJumps);

const globalCourse = document.createElement("div"); // Course (unique si MI cochée OU tête/rachis)
globalCourse.id = "global-course";
globalCourse.className = "subcard";
globalCourse.style.display = "none";
zoneQuestionsContainer.parentElement.appendChild(globalCourse);

// ====== Données (listes)
const toolsForceGeneric = [
"Dynamomètre manuel",
"Dynamomètre fixe",
"Isocinétisme",
"Plateforme de force",
"Sans outil",
"Autre"
];
const toolsMobilityGeneric = [
"Goniomètre",
"Inclinomètre",
"Test spécifique",
"Autre"
];
const paramsForce = [
"Force max",
"Force moyenne",
"Force relative (N/kg)",
"RFD",
"Angle du pic de force",
"Endurance"
];
const criteriaForce = [
"Ratio agoniste/antagoniste",
"Ratio droite/gauche",
"Valeur seuil"
];
const criteriaMobilityGeneric = [
"Comparaison droite/gauche",
"Valeur seuil"
];
const criteriaMobilityLumbar = [
"Moyenne du groupe",
"Valeur seuil"
];
const isokineticSpeeds = ["30°/s", "60°/s", "120°/s", "180°/s", "Autre (précisez)"];
const isokineticModes = ["Concentrique", "Excentrique", "Isométrique", "Combiné"];

// ===== Proprio par zone
const proprioByZone = {
"Cheville / Pied": ["Y-Balance Test", "Star Excursion", "Single Leg Balance Test", "Autre"],
"Genou": ["Y-Balance Test", "Star Excursion", "FMS (Lower)", "Autre"],
"Hanche": ["Y-Balance Test", "Star Excursion", "FMS (Lower)", "Autre"],
"Épaule": ["Y-Balance Test (épaule)", "FMS (Upper)", "Autre"],
[headNeckTitle]: ["Test proprio cervical (laser)", "Autre"],
"Poignet / Main": ["Autre"],
"Coude": ["Autre"],
"Rachis lombaire": ["FMS (Core)", "Autre"]
};

// ===== Questionnaires par zone
const questionnairesByZone = {
"Genou": ["KOOS", "IKDC", "Lysholm", "Tegner", "ACL-RSI", "KOS-ADLS", "LEFS", "Autre"],
"Hanche": ["HAGOS", "iHOT-12", "HOOS", "HOS", "Autre"],
"Épaule": ["QuickDASH", "DASH", "SIRSI", "ASES", "SPADI", "Oxford Shoulder Score", "Autre"],
"Coude": ["Oxford Elbow Score", "MEPS", "DASH", "QuickDASH", "Autre"],
"Poignet / Main": ["PRWE", "DASH", "QuickDASH", "Boston Carpal Tunnel", "Autre"],
"Cheville / Pied": ["CAIT", "FAAM-ADL", "FAAM-Sport", "FAOS", "FFI", "Autre"],
"Rachis lombaire": ["ODI (Oswestry)", "Roland-Morris", "Quebec Back Pain", "FABQ", "Autre"],
[headNeckTitle]: ["SCAT6", "Neck Disability Index (NDI)", "Copenhagen Neck Functional Scale", "Autre"]
};

// ===== Tests force par muscle
const testsByMuscle = {
"Ischiojambiers": ["McCall 90°", "Isométrie 30°", "Nordic", "Nordic Hold", "Razor Curl", "Single Leg Bridge", "Isocinétique 60°/s", "Isocinétique 180°/s", "Autre"],
"Quadriceps": ["Isométrie 60°", "Leg Extension", "Single Leg Squat", "Isocinétique 60°/s", "Isocinétique 180°/s", "Autre"],
"Fléchisseurs hanche": ["Isométrique 45°", "Straight Leg Raise (force)", "Isocinétique 60°/s", "Isocinétique 180°/s", "Autre"],
"Abducteurs hanche": ["Side-lying isométrique", "Standing belt test", "Isocinétique 60°/s", "Autre"],
"Adducteurs hanche": ["Squeeze test (5s)", "Copenhagen", "Isocinétique 60°/s", "Autre"],
"Gastrocnémien": ["Heel Raise – genou tendu (1RM)", "Heel Raise – max reps", "Isométrie 90°", "Isocinétique 60°/s", "Autre"],
"Soléaire": ["Heel Raise – genou fléchi (1RM)", "Max reps", "Isométrie 90°", "Isocinétique 60°/s", "Autre"],
"Inverseurs/Éverseurs": ["Dynamométrie manuelle", "Dynamométrie fixe", "Isocinétique 30°/s", "Autre"],
"Intrinsèques du pied": ["Toe Curl test", "Short Foot test", "Dynamométrie", "Plateforme de pressions", "Autre"]
};

// ===== Helpers
const slug = s => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-");
const cssEscape = id => id.replace(/([ #;?%&,.+*~\':"!^$[\]()=>|/@])/g,'\\$1');

function ensureOtherFieldOnce(container, checkbox, placeholder = "Précisez") {
if (!container) return;
const key = checkbox?.value ? slug(checkbox.value) : "autre";
let wrap = container.querySelector(`.other-wrap[data-key="${key}"]`);

if (checkbox && checkbox.checked) {
if (!wrap) {
wrap = document.createElement("div");
wrap.className = "slide show other-wrap";
wrap.dataset.key = key;
wrap.innerHTML = `
<input type="text" class="other-input" placeholder="${placeholder}" required
style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;">
`;
container.appendChild(wrap);
}
} else if (wrap) {
wrap.classList.remove("show");
setTimeout(() => wrap.remove(), 250);
}
}

function makeOtherReactive(root, placeholder = "Précisez") {
if (!root) return;
const inputs = root.querySelectorAll("input[type='checkbox'],input[type='radio']");
inputs.forEach(inp => {
const val = (inp.value || "").toLowerCase();
if (val === "autre" || val === "autres" || val.includes("autre")) {
const container = inp.closest(".checkbox-group") || root;
inp.addEventListener("change", () => ensureOtherFieldOnce(container, inp, placeholder));
}
});
}

function attachIsokineticHandlers(scope) {
const groups = scope.querySelectorAll(".tools-group");
groups.forEach(group => {
const iso = group.querySelector("input[type='checkbox'][value='Isocinétisme']");
if (!iso) return;
const ensure = () => {
let sub = group.parentElement.querySelector(".isokinetic-sub");
if (iso.checked) {
if (!sub) {
sub = document.createElement("div");
sub.className = "slide show isokinetic-sub";
sub.innerHTML = `
<label>Vitesse (isocinétisme)</label>
<div class="checkbox-group iso-speed">
${isokineticSpeeds.map(v => `<label><input type="checkbox" value="${v}"> ${v}</label>`).join("")}
</div>
<label>Mode de contraction (isocinétisme)</label>
<div class="checkbox-group iso-mode">
${isokineticModes.map(m => `<label><input type="checkbox" value="${m}"> ${m}</label>`).join("")}
</div>`;
group.insertAdjacentElement("afterend", sub);
const otherSpeed = sub.querySelector(".iso-speed input[value*='Autre']");
if (otherSpeed) {
otherSpeed.addEventListener("change", () => ensureOtherFieldOnce(sub.querySelector(".iso-speed"), otherSpeed, "Vitesse (précisez)"));
}
makeOtherReactive(sub);
}
} else if (sub) {
sub.classList.remove("show");
setTimeout(() => sub.remove(), 250);
}
};
iso.addEventListener("change", ensure);
ensure();
});
}// ===== Validation des champs “Autre”
function hasUncheckedOther(scope) {
const others = scope.querySelectorAll("input[type='checkbox'][value='Autre']:checked, input[type='checkbox'][value='Autres']:checked");
for (const oc of others) {
const group = oc.closest(".checkbox-group") || scope;
const wrap = group.querySelector(`.other-wrap[data-key="${slug(oc.value)}"]`);
const txt = wrap && wrap.querySelector(".other-input");
if (txt && !txt.value.trim()) return true;
}
const otherRadios = scope.querySelectorAll("input[type='radio'][value='Autre']:checked");
for (const orad of otherRadios) {
const group = orad.closest(".checkbox-group") || scope;
const wrap = group.querySelector(`.other-wrap[data-key="${slug(orad.value)}"]`);
const txt = wrap && wrap.querySelector(".other-input");
if (txt && !txt.value.trim()) return true;
}
return false;
}

// ===== Groupes Tête/Rachis fusion
function getZoneKey(zoneName) {
return headNeckPair.includes(zoneName) ? headNeckTitle : zoneName;
}
function anyHeadNeckChecked() {
return [...zonesCheckboxes].some(z => headNeckPair.includes(z.value) && z.checked);
}

// ===== Blocs globaux (tests de sauts / course) avec condition Oui/Non
function toggleGlobalSections() {
const selected = [...zonesCheckboxes].filter(z => z.checked).map(z => z.value);
const hasLower = selected.some(z => lowerBodyZones.includes(z));
const hasHead = selected.some(z => headNeckPair.includes(z));

// ---- SAUTS (si MI cochée)
if (hasLower) {
if (!globalJumps.dataset.ready) {
globalJumps.dataset.ready = "1";
globalJumps.style.display = "";
globalJumps.classList.add("fade-in","active");

globalJumps.innerHTML = `
<h3>Tests de sauts</h3>
<label>Effectuez-vous des tests de sauts&nbsp;?</label>
<div class="checkbox-group jump-question">
<label><input type="radio" name="doJumpTests" value="Oui"> Oui</label>
<label><input type="radio" name="doJumpTests" value="Non"> Non</label>
</div>
<div class="jump-sub slide"></div>
`;

const sub = globalJumps.querySelector(".jump-sub");
const radios = globalJumps.querySelectorAll("input[name='doJumpTests']");
radios.forEach(r => {
r.addEventListener("change", () => {
if (r.value === "Oui") {
sub.innerHTML = `
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
<div class="checkbox-group jump-tools">
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
`;
sub.classList.add("show");
makeOtherReactive(sub);
} else {
sub.classList.remove("show");
setTimeout(() => sub.innerHTML = "", 250);
}
});
});
}
} else {
globalJumps.style.display = "none";
globalJumps.innerHTML = "";
delete globalJumps.dataset.ready;
}

// ---- COURSE (si MI cochée OU tête/rachis)
if (hasLower || hasHead) {
if (!globalCourse.dataset.ready) {
globalCourse.dataset.ready = "1";
globalCourse.style.display = "";
globalCourse.classList.add("fade-in","active");

globalCourse.innerHTML = `
<h3>Tests de course</h3>
<label>Effectuez-vous des tests de course&nbsp;?</label>
<div class="checkbox-group course-question">
<label><input type="radio" name="doCourseTests" value="Oui"> Oui</label>
<label><input type="radio" name="doCourseTests" value="Non"> Non</label>
</div>
<div class="course-sub slide"></div>
`;

const sub = globalCourse.querySelector(".course-sub");
const radios = globalCourse.querySelectorAll("input[name='doCourseTests']");
radios.forEach(r => {
r.addEventListener("change", () => {
if (r.value === "Oui") {
sub.innerHTML = `
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
<div class="checkbox-group course-tools">
<label><input type="checkbox" value="Chronomètre"> Chronomètre</label>
<label><input type="checkbox" value="Cellules"> Cellules</label>
<label><input type="checkbox" value="GPS"> GPS</label>
<label><input type="checkbox" value="1080 Sprint"> 1080 Sprint</label>
<label><input type="checkbox" value="Autre"> Autre</label>
</div>

<label>Critères d’évaluation</label>
<div class="checkbox-group">
<label><input type="checkbox" value="Moyenne par poste"> Moyenne par poste</label>
<label><input type="checkbox" value="Valeur seuil"> Valeur seuil</label>
</div>
`;
sub.classList.add("show");
makeOtherReactive(sub);
} else {
sub.classList.remove("show");
setTimeout(() => sub.innerHTML = "", 250);
}
});
});
}
} else {
globalCourse.style.display = "none";
globalCourse.innerHTML = "";
delete globalCourse.dataset.ready;
}
}

// ====== Gestion des sections par zone (inchangé)
zonesCheckboxes.forEach(zone => {
zone.addEventListener("change", () => {
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
});
});// ====== Création et suppression des sections
function createZoneSection(zoneName) {
if (document.getElementById(`section-${slug(zoneName)}`)) return;

const section = document.createElement("div");
section.classList.add("subcard", "fade-in");
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

const typeCheckboxes = section.querySelectorAll(".types input[type='checkbox']");
const subQContainer = section.querySelector(".subquestions");

typeCheckboxes.forEach((cb, i) => {
cb.addEventListener("change", () => {
const id = `sub-${slug(zoneName)}-${slug(cb.value)}`;
const existing = subQContainer.querySelector(`#${cssEscape(id)}`);
if (cb.checked) {
let subSection = null;

if (zoneName === headNeckTitle) {
if (cb.value === "Test de cognition") {
subSection = document.createElement("div");
subSection.id = id;
subSection.className = "slide stagger show";
subSection.innerHTML = `
<h4>Test de cognition</h4>
<div class="checkbox-group">
<label><input type="checkbox" value="Test oculaire"> Test oculaire</label>
<label><input type="checkbox" value="Test vestibulaire"> Test vestibulaire</label>
<label><input type="checkbox" value="Autre"> Autre</label>
</div>`;
makeOtherReactive(subSection);
}
if (cb.value === "Proprioception / Équilibre") subSection = createProprioBlock(zoneName, id, i);
if (cb.value === "Questionnaires") subSection = createQuestionnaireBlock(zoneName, id, i);
if (cb.value === "Autres données") subSection = createOtherDataBlock(zoneName, id, i);
} else {
if (cb.value === "Force") subSection = createForceBlock(zoneName, id, i);
if (cb.value === "Mobilité") subSection = createMobilityBlock(zoneName, id, i);
if (cb.value === "Proprioception / Équilibre") subSection = createProprioBlock(zoneName, id, i);
if (cb.value === "Questionnaires") subSection = createQuestionnaireBlock(zoneName, id, i);
if (cb.value === "Autres données") subSection = createOtherDataBlock(zoneName, id, i);
}

if (subSection) {
subQContainer.appendChild(subSection);
makeOtherReactive(subSection);
attachIsokineticHandlers(subSection);
}
} else if (existing) {
existing.classList.remove("show");
setTimeout(() => existing.remove(), 250);
}
});
});
}

function removeZoneSection(zoneName) {
const section = document.getElementById(`section-${slug(zoneName)}`);
if (section) section.remove();
}

// ====== Bloc de données libres
function createOtherDataBlock(zoneName, id, delayIndex) {
const div = document.createElement("div");
div.id = id;
div.className = "slide stagger";
div.style.animationDelay = `${delayIndex * 0.1}s`;
div.innerHTML = `
<h4>Autres données – ${zoneName}</h4>
<input type="text" class="other-input" placeholder="Précisez la donnée collectée" required
style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;">
`;
return div;
}

// ====== Questionnaires
function createQuestionnaireBlock(zoneName, id, delayIndex) {
const div = document.createElement("div");
div.id = id;
div.className = "slide stagger";
div.style.animationDelay = `${delayIndex * 0.1}s`;
const list = questionnairesByZone[zoneName] || ["Autre"];
div.innerHTML = `
<h4>Questionnaires – ${zoneName}</h4>
<div class="checkbox-group q-list">
${list.map(q => `<label><input type="checkbox" value="${q}"> ${q}</label>`).join("")}
</div>`;
makeOtherReactive(div.querySelector(".q-list"), "Nom du questionnaire");
return div;
}

// ====== Proprioception
function createProprioBlock(zoneName, id, delayIndex) {
const div = document.createElement("div");
div.id = id;
div.className = "slide stagger";
div.style.animationDelay = `${delayIndex * 0.1}s`;
const list = proprioByZone[zoneName] || [];
div.innerHTML = `
<h4>Proprioception / Équilibre – ${zoneName}</h4>
<label>Quels tests utilisez-vous ?</label>
<div class="checkbox-group proprio-tests">
${list.map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
</div>
<label>Critères d’évaluation</label>
<div class="checkbox-group">
<label><input type="checkbox" value="Moyenne du groupe"> Moyenne du groupe</label>
<label><input type="checkbox" value="Valeur seuil"> Valeur seuil</label>
</div>`;
makeOtherReactive(div.querySelector(".proprio-tests"));
return div;
}

// ====== Force – avec tests globaux MI et MS conditionnels
function createForceBlock(zoneName, id, delayIndex) {
const div = document.createElement("div");
div.id = id;
div.className = "slide stagger";
div.style.animationDelay = `${delayIndex * 0.1}s`;

// Mouvements généraux
const moves = ["Flexion/Extension"];
if (!["Genou","Cheville / Pied","Coude","Poignet / Main"].includes(zoneName)) moves.push("Rotations");
if (["Épaule","Hanche"].includes(zoneName)) moves.push("Adduction/Abduction");
if (zoneName === "Cheville / Pied") moves.push("Éversion/Inversion", "Intrinsèques du pied");
if (zoneName === "Épaule") moves.push("ASH Test");

div.innerHTML = `
<h4>Force – ${zoneName}</h4>
<label>Quels mouvements évaluez-vous en force ?</label>
<div class="checkbox-group force-moves">
${moves.map(m => `<label><input type="checkbox" value="${m}"> ${m}</label>`).join("")}
</div>
<div class="force-moves-details"></div>
`;
const details = div.querySelector(".force-moves-details");

// Bloc test fonctionnels globaux selon zone
if (lowerBodyZones.includes(zoneName)) {
const funcMI = document.createElement("div");
funcMI.className = "slide show";
funcMI.innerHTML = `
<h5>Tests fonctionnels globaux – Membre inférieur</h5>
<label>Effectuez-vous des tests fonctionnels globaux du membre inférieur ?</label>
<div class="checkbox-group func-mi-question">
<label><input type="radio" name="funcMI-${slug(zoneName)}" value="Oui"> Oui</label>
<label><input type="radio" name="funcMI-${slug(zoneName)}" value="Non"> Non</label>
</div>
<div class="func-mi-sub slide"></div>
`;
const sub = funcMI.querySelector(".func-mi-sub");
funcMI.querySelectorAll("input[name^='funcMI-']").forEach(r => {
r.addEventListener("change", () => {
if (r.value === "Oui") {
sub.innerHTML = `
<div class="checkbox-group">
<label><input type="checkbox" value="Squat"> Squat</label>
<label><input type="checkbox" value="Montée de banc"> Montée de banc</label>
<label><input type="checkbox" value="Soulevé de terre"> Soulevé de terre</label>
</div>
<label>Outils</label>
<div class="checkbox-group">
<label><input type="checkbox" value="Sans outil particulier"> Sans outil particulier</label>
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
<label><input type="checkbox" value="Ratio/poids du corps"> Ratio/poids du corps</label>
<label><input type="checkbox" value="Valeur seuil"> Valeur seuil</label>
</div>
`;
sub.classList.add("show");
makeOtherReactive(sub);
} else {
sub.classList.remove("show");
setTimeout(() => sub.innerHTML = "", 250);
}
});
});
details.appendChild(funcMI);
}

if (upperBodyZones.includes(zoneName)) {
const funcMS = document.createElement("div");
funcMS.className = "slide show";
funcMS.innerHTML = `
<h5>Tests fonctionnels globaux – Membre supérieur</h5>
<label>Effectuez-vous des tests fonctionnels globaux du membre supérieur ?</label>
<div class="checkbox-group func-ms-question">
<label><input type="radio" name="funcMS-${slug(zoneName)}" value="Oui"> Oui</label>
<label><input type="radio" name="funcMS-${slug(zoneName)}" value="Non"> Non</label>
</div>
<div class="func-ms-sub slide"></div>
`;
const sub = funcMS.querySelector(".func-ms-sub");
funcMS.querySelectorAll("input[name^='funcMS-']").forEach(r => {
r.addEventListener("change", () => {
if (r.value === "Oui") {
sub.innerHTML = `
<div class="checkbox-group">
<label><input type="checkbox" value="Traction"> Traction</label>
<label><input type="checkbox" value="Développé couché"> Développé couché</label>
<label><input type="checkbox" value="Tirage"> Tirage</label>
<label><input type="checkbox" value="Force gripp"> Force gripp</label>
</div>
<label>Outils</label>
<div class="checkbox-group">
<label><input type="checkbox" value="Sans outil particulier"> Sans outil particulier</label>
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
<label><input type="checkbox" value="Ratio/poids du corps"> Ratio/poids du corps</label>
<label><input type="checkbox" value="Valeur seuil"> Valeur seuil</label>
</div>
`;
sub.classList.add("show");
makeOtherReactive(sub);
} else {
sub.classList.remove("show");
setTimeout(() => sub.innerHTML = "", 250);
}
});
});
details.appendChild(funcMS);
}

makeOtherReactive(div);
attachIsokineticHandlers(div);
return div;
}

// ====== Validation finale + envoi Google Form
submitBtn.addEventListener("click", (e) => {
e.preventDefault();
resultMessage.textContent = "";

if (hasUncheckedOther(document)) {
resultMessage.textContent = "⚠️ Merci de préciser tous les champs 'Autre'.";
return;
}

resultMessage.style.color = "#0074d9";
resultMessage.textContent = "✅ Envoi en cours…";

const formData = new FormData(form);
fetch("https://docs.google.com/forms/u/0/d/e/1FAIpQLSeNok3wNrafUFIM2VnAo4NKQpdZDaDyFDeVS8dZbXFyt_ySyA/formResponse", {
method: "POST",
mode: "no-cors",
body: formData
}).then(() => {
resultMessage.style.color = "green";
resultMessage.textContent = "✅ Réponses envoyées avec succès !";
form.reset();
window.scrollTo({ top: 0, behavior: "smooth" });
}).catch(() => {
resultMessage.style.color = "red";
resultMessage.textContent = "⚠️ Erreur lors de l'envoi du formulaire.";
});
});
});
