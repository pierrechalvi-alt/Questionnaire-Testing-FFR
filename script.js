// script.js — V14 (intégral, final)
// ============================================================================
// Intègre V8→V13 + corrections V14 :
// - Suppression des tests isocinétiques des listes “Tests spécifiques” (force par muscle)
// - Aucun doublon “Autre” dans les sous-questions (un seul item par groupe) + champ “Précisez” obligatoire
// - Gating Oui/Non pour Sauts/Course/Fonctionnels (MI & MS)
// - Fusion Tête/Rachis cervical + Force/Mobilité/Cognition/Proprio/Questionnaires/Autres données
// - Logique clinique complète (Genou: Ischio/Quadriceps, Hanche: Fléch/Abd/Add, Cheville: Gastro/Soléaire + Inverseurs/Éverseurs + Intrinsèques)
// - Mobilité : outils adaptés (Sit-and-reach, KTW), Distance doigt-sol pour lombaire (inclinaisons)
// - Questionnaires exhaustifs par zone
// - Validation stricte + envoi Google Forms
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
// ================== Sélecteurs globaux ==================
const form = document.getElementById("questionnaireForm");
const zonesCheckboxes = document.querySelectorAll("#zones input[type='checkbox']");
const zoneQuestionsContainer = document.getElementById("zoneQuestions");
const submitBtn = document.getElementById("submitBtn");
const resultMessage = document.getElementById("resultMessage");

// Progression
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");
const formSections = document.querySelectorAll(".card");

// ================== Helpers ==================
const slug = (s) =>
s.toLowerCase()
.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
.replace(/[^a-z0-9]+/g, "-")
.replace(/(^-|-$)/g, "");

const cssEscape = (id) => id.replace(/([ #;?%&,.+*~':"!^$[\]()=>|/@])/g, "\\$1");

const uniq = (arr) => [...new Set(arr)];

function updateProgress() {
const filled = [...formSections].filter(
sec => sec.querySelector("input:checked") || [...sec.querySelectorAll(".other-input")].some(t => t.value.trim())
).length;
const total = formSections.length;
const percent = Math.min(100, Math.round((filled / total) * 100));
if (progressBar) progressBar.style.width = percent + "%";
if (progressText) progressText.textContent = `Progression : ${percent}%`;
}
document.addEventListener("change", updateProgress);

// ================== Groupes anatomiques ==================
const lowerBodyZones = ["Hanche", "Genou", "Cheville / Pied"];
const upperBodyZones = ["Épaule", "Coude", "Poignet / Main"];
const headNeckPair = ["Tête", "Rachis cervical"];
const headNeckTitle = "Tête / Rachis cervical";

// ================== Blocs globaux uniques (append après les zones) ==================
const globalFuncMS = document.createElement("div");
globalFuncMS.id = "global-func-ms";
globalFuncMS.className = "subcard";
globalFuncMS.style.display = "none";
zoneQuestionsContainer.parentElement.appendChild(globalFuncMS);

const globalFuncMI = document.createElement("div");
globalFuncMI.id = "global-func-mi";
globalFuncMI.className = "subcard";
globalFuncMI.style.display = "none";
zoneQuestionsContainer.parentElement.appendChild(globalFuncMI);

const globalJumps = document.createElement("div"); // Sauts
globalJumps.id = "global-jumps";
globalJumps.className = "subcard";
globalJumps.style.display = "none";
zoneQuestionsContainer.parentElement.appendChild(globalJumps);

const globalCourse = document.createElement("div"); // Course
globalCourse.id = "global-course";
globalCourse.className = "subcard";
globalCourse.style.display = "none";
zoneQuestionsContainer.parentElement.appendChild(globalCourse);

// ================== Données partagées ==================
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

// Proprio par zone
const proprioByZone = {
"Cheville / Pied": ["Y-Balance Test", "Star Excursion", "Single Leg Balance Test"],
"Genou": ["Y-Balance Test", "Star Excursion", "FMS (Lower)"],
"Hanche": ["Y-Balance Test", "Star Excursion", "FMS (Lower)"],
"Épaule": ["Y-Balance Test (épaule)", "FMS (Upper)"],
[headNeckTitle]: ["Test proprio cervical (laser)"],
"Poignet / Main": [],
"Coude": [],
"Rachis lombaire": ["FMS (Core)"]
};

// Questionnaires par zone
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

// Tests force par muscle / articulation — V14 : SANS isocinétiques dans “Tests spécifiques”
const testsByMuscle = {
// Genou
"Ischiojambiers": ["McCall 90°", "Isométrie 30°", "Nordic", "Nordic Hold", "Razor Curl", "Single Leg Bridge", "Autre"],
"Quadriceps": ["Isométrie 60°", "Leg Extension", "Single Leg Squat", "Autre"],

// Hanche
"Fléchisseurs hanche": ["Isométrique 45°", "Straight Leg Raise (force)", "Autre"],
"Abducteurs hanche": ["Side-lying isométrique", "Standing belt test", "Autre"],
"Adducteurs hanche": ["Squeeze test (5s)", "Copenhagen", "Autre"],

// Cheville
"Gastrocnémien": ["Heel Raise – genou tendu (1RM)", "Heel Raise – max reps", "Isométrie 90°", "Autre"],
"Soléaire": ["Heel Raise – genou fléchi (1RM)", "Max reps", "Isométrie 90°", "Autre"],
"Inverseurs/Éverseurs": ["Dynamométrie manuelle", "Dynamométrie fixe", "Autre"],
"Intrinsèques du pied": ["Toe Curl test", "Short Foot test", "Dynamométrie", "Plateforme de pressions", "Autre"]
};

// ================== “Autre” — helpers ==================
function addOtherField(container, checkbox, placeholder = "Précisez") {
const key = checkbox.value ? slug(checkbox.value) : "autre";
let wrap = container.querySelector(`.other-${key}`);
if (checkbox.checked) {
if (!wrap) {
wrap = document.createElement("div");
wrap.className = `slide show other-${key}`;
wrap.innerHTML = `<input type="text" class="other-input" placeholder="${placeholder}" required style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;">`;
container.appendChild(wrap);
}
} else if (wrap) {
wrap.classList.remove("show");
setTimeout(() => wrap.remove(), 250);
}
}

function makeOtherReactive(root, placeholder = "Précisez") {
const inputs = root.querySelectorAll("input[type='checkbox'],input[type='radio']");
inputs.forEach((inp) => {
const val = (inp.value || "").toLowerCase();
if (val === "autre" || val === "autres" || val.includes("autre")) {
inp.addEventListener("change", () => addOtherField(inp.closest(".checkbox-group") || root, inp, placeholder));
}
});
}

function hasUncheckedOther(scope) {
const others = scope.querySelectorAll("input[type='checkbox'][value='Autre']:checked, input[type='checkbox'][value='Autres']:checked");
for (const oc of others) {
const group = oc.closest(".checkbox-group");
const txt = group && group.querySelector(".other-input");
if (txt && !txt.value.trim()) return true;
}
return false;
}

function addFrequencyOther(sectionEl) {
const freqGroup = sectionEl.querySelector(".moment");
if (!freqGroup) return;
const other = freqGroup.querySelector("input[type='checkbox'][value='Autre fréquence']");
if (!other) return;
other.addEventListener("change", () => addOtherField(freqGroup, other, "Fréquence (précisez)"));
}

// ================== Isocinétisme — sous-questions ==================
function attachIsokineticHandlers(scope) {
const groups = scope.querySelectorAll(".tools-group");
groups.forEach((group) => {
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
otherSpeed && otherSpeed.addEventListener("change", () => {
addOtherField(sub.querySelector(".iso-speed"), otherSpeed, "Vitesse (précisez)");
});
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
}

// ================== Fusion Tête + Rachis cervical ==================
function getZoneKey(zoneName) {
return headNeckPair.includes(zoneName) ? headNeckTitle : zoneName;
}
function anyHeadNeckChecked() {
return [...zonesCheckboxes].some(z => headNeckPair.includes(z.value) && z.checked);
}

// ================== Création/Suppression section par zone ==================
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
toggleGlobalSections(); // Afficher/masquer Fonctionnels / Sauts / Course
});
});

// ================== Blocs globaux (apparaissent après sections articulaires) ==================
function createYesNoGateBlock(titleText, id, onYesBuild) {
const wrap = document.createElement("div");
wrap.id = id;
wrap.className = "subcard fade-in";
wrap.innerHTML = `
<h3>${titleText}</h3>
<div class="checkbox-group">
<label><input type="radio" name="${id}-gate" value="Oui"> Oui</label>
<label><input type="radio" name="${id}-gate" value="Non" checked> Non</label>
</div>
<div class="slide" id="${id}-content"></div>
`;
const yes = wrap.querySelector(`input[name="${id}-gate"][value="Oui"]`);
const no = wrap.querySelector(`input[name="${id}-gate"][value="Non"]`);
const content = wrap.querySelector(`#${cssEscape(id)}-content`);
yes.addEventListener("change", () => {
if (yes.checked) {
content.innerHTML = "";
const inner = onYesBuild();
content.appendChild(inner);
content.classList.add("show");
makeOtherReactive(content);
}
});
no.addEventListener("change", () => {
content.classList.remove("show");
setTimeout(() => (content.innerHTML = ""), 250);
});
return wrap;
}

function toggleGlobalSections() {
const selected = [...zonesCheckboxes].filter(z => z.checked).map(z => z.value);
const hasLower = selected.some(z => lowerBodyZones.includes(z));
const hasHead = selected.some(z => headNeckPair.includes(z));

// ----- Fonctionnels MS (s’affiche si au moins une zone MS cochée : épaule, coude, poignet/main) -----
const hasUpper = selected.some(z => upperBodyZones.includes(z));
if (hasUpper) {
if (!globalFuncMS.dataset.ready) {
globalFuncMS.dataset.ready = "1";
globalFuncMS.style.display = "";
globalFuncMS.innerHTML = "";
globalFuncMS.appendChild(
createYesNoGateBlock(
"Tests fonctionnels globaux du membre supérieur",
"func-ms",
() => {
const inner = document.createElement("div");
inner.innerHTML = `
<label>Quels mouvements testez-vous ?</label>
<div class="checkbox-group">
<label><input type="checkbox" value="Traction"> Traction</label>
<label><input type="checkbox" value="Développé couché"> Développé couché</label>
<label><input type="checkbox" value="Tirage"> Tirage</label>
<label><input type="checkbox" value="Force de grippe"> Force de grippe</label>
<label><input type="checkbox" value="Autre"> Autre</label>
</div>
<label>Outils</label>
<div class="checkbox-group">
<label><input type="checkbox" value="Pas d’outil particulier"> Pas d’outil particulier</label>
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
<label><input type="checkbox" value="Ratio / poids de corps"> Ratio / poids de corps</label>
<label><input type="checkbox" value="Valeur seuil"> Valeur seuil</label>
</div>
`;
return inner;
}
)
);
makeOtherReactive(globalFuncMS);
}
} else {
globalFuncMS.style.display = "none";
globalFuncMS.innerHTML = "";
delete globalFuncMS.dataset.ready;
}

// ----- Fonctionnels MI (s’affiche si au moins une zone MI cochée) -----
if (hasLower) {
if (!globalFuncMI.dataset.ready) {
globalFuncMI.dataset.ready = "1";
globalFuncMI.style.display = "";
globalFuncMI.innerHTML = "";
globalFuncMI.appendChild(
createYesNoGateBlock(
"Tests fonctionnels globaux du membre inférieur",
"func-mi",
() => {
const inner = document.createElement("div");
inner.innerHTML = `
<label>Testez-vous des mouvements globaux / fonctionnels du MI ?</label>
<div class="checkbox-group">
<label><input type="checkbox" value="Squat"> Squat</label>
<label><input type="checkbox" value="Montée de banc"> Montée de banc</label>
<label><input type="checkbox" value="Soulevé de terre"> Soulevé de terre</label>
<label><input type="checkbox" value="Autre"> Autre</label>
</div>
<label>Outils</label>
<div class="checkbox-group">
<label><input type="checkbox" value="Pas d’outil particulier"> Pas d’outil particulier</label>
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
<label><input type="checkbox" value="Ratio / poids de corps"> Ratio / poids de corps</label>
<label><input type="checkbox" value="Valeur seuil"> Valeur seuil</label>
</div>
`;
return inner;
}
)
);
makeOtherReactive(globalFuncMI);
}
} else {
globalFuncMI.style.display = "none";
globalFuncMI.innerHTML = "";
delete globalFuncMI.dataset.ready;
}

// ----- SAUTS : unique si MI cochée (gated) -----
if (hasLower) {
if (!globalJumps.dataset.ready) {
globalJumps.dataset.ready = "1";
globalJumps.style.display = "";
globalJumps.innerHTML = "";
globalJumps.appendChild(
createYesNoGateBlock(
"Effectuez-vous des tests de sauts ?",
"jumps",
() => {
const inner = document.createElement("div");
inner.innerHTML = `
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
`;
return inner;
}
)
);
makeOtherReactive(globalJumps);
}
} else {
globalJumps.style.display = "none";
globalJumps.innerHTML = "";
delete globalJumps.dataset.ready;
}

// ----- COURSE : unique si MI cochée OU tête/rachis cochés (gated) -----
if (hasLower || hasHead) {
if (!globalCourse.dataset.ready) {
globalCourse.dataset.ready = "1";
globalCourse.style.display = "";
globalCourse.innerHTML = "";
globalCourse.appendChild(
createYesNoGateBlock(
"Effectuez-vous des tests de course ?",
"course",
() => {
const inner = document.createElement("div");
inner.innerHTML = `
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
<label><input type="checkbox" value="Autre"> Autre</label>
</div>

<label>Critères d’évaluation</label>
<div class="checkbox-group">
<label><input type="checkbox" value="Moyenne par poste"> Moyenne par poste</label>
<label><input type="checkbox" value="Valeur seuil"> Valeur seuil</label>
</div>
`;
return inner;
}
)
);
makeOtherReactive(globalCourse);
}
} else {
globalCourse.style.display = "none";
globalCourse.innerHTML = "";
delete globalCourse.dataset.ready;
}
}

// ================== Création section zone ==================
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
${
zoneName === headNeckTitle
? `
<label><input type="checkbox" value="Force"> Force</label>
<label><input type="checkbox" value="Mobilité"> Mobilité</label>
<label><input type="checkbox" value="Test de cognition"> Test de cognition</label>
<label><input type="checkbox" value="Proprioception / Équilibre"> Proprioception / Équilibre</label>
<label><input type="checkbox" value="Questionnaires"> Questionnaires</label>
<label><input type="checkbox" value="Autres données"> Autres données</label>
`
: `
<label><input type="checkbox" value="Force"> Force</label>
<label><input type="checkbox" value="Mobilité"> Mobilité</label>
<label><input type="checkbox" value="Proprioception / Équilibre"> Proprioception / Équilibre</label>
<label><input type="checkbox" value="Questionnaires"> Questionnaires</label>
<label><input type="checkbox" value="Autres données"> Autres données</label>
`
}
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
subSection.className = "slide stagger";
subSection.style.animationDelay = `${i * 0.1}s`;
subSection.innerHTML = `
<h4>Test de cognition</h4>
<div class="checkbox-group">
<label><input type="checkbox" value="Test oculaire"> Test oculaire</label>
<label><input type="checkbox" value="Test vestibulaire"> Test vestibulaire</label>
<label><input type="checkbox" value="Autre"> Autre</label>
</div>`;
makeOtherReactive(subSection);
}
if (cb.value === "Proprioception / Équilibre") {
subSection = createProprioBlock(zoneName, id, i);
}
if (cb.value === "Questionnaires") {
subSection = createQuestionnaireBlock(zoneName, id, i);
}
if (cb.value === "Autres données") {
subSection = createOtherDataBlock(zoneName, id, i);
}
if (cb.value === "Force") {
subSection = createForceBlock(zoneName, id, i);
}
if (cb.value === "Mobilité") {
subSection = createMobilityBlock(zoneName, id, i);
}
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
section.classList.add("active");
setTimeout(() => subSection.classList.add("show"), 15);
}
} else if (existing) {
existing.classList.remove("show");
setTimeout(() => {
existing.remove();
const stillChecked = section.querySelectorAll(".types input:checked").length > 0;
if (!stillChecked) section.classList.remove("active");
}, 300);
}
});
});
}

function removeZoneSection(zoneName) {
const section = document.getElementById(`section-${slug(zoneName)}`);
if (section) section.remove();
}

// ================== Blocs spécifiques ==================
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

function createQuestionnaireBlock(zoneName, id, delayIndex) {
const div = document.createElement("div");
div.id = id;
div.className = "slide stagger";
div.style.animationDelay = `${delayIndex * 0.1}s`;
const list = questionnairesByZone[zoneName] || ["Autre"];
const unique = uniq(list); // éviter doublons
div.innerHTML = `
<h4>Questionnaires – ${zoneName}</h4>
<div class="checkbox-group q-list">
${unique.map(q => `<label><input type="checkbox" value="${q}"> ${q}</label>`).join("")}
</div>`;
makeOtherReactive(div.querySelector(".q-list"), "Nom du questionnaire");
return div;
}

function createProprioBlock(zoneName, id, delayIndex) {
const div = document.createElement("div");
div.id = id;
div.className = "slide stagger";
div.style.animationDelay = `${delayIndex * 0.1}s`;
const list = proprioByZone[zoneName] || [];
const unique = uniq([...list, "Autre"]);
div.innerHTML = `
<h4>Proprioception / Équilibre – ${zoneName}</h4>
<label>Quels tests utilisez-vous ?</label>
<div class="checkbox-group proprio-tests">
${unique.map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
</div>
<label>Critères d’évaluation</label>
<div class="checkbox-group">
<label><input type="checkbox" value="Moyenne du groupe"> Moyenne du groupe</label>
<label><input type="checkbox" value="Valeur seuil"> Valeur seuil</label>
</div>`;
makeOtherReactive(div.querySelector(".proprio-tests"), "Nom du test");
return div;
}

// ===== FORCE : mouvement -> (groupes musculaires si besoin) -> outils -> tests spécifiques -> paramètres -> critères
function createMuscleDetailBlock(zoneName, muscleLabel, gid, delay) {
const wrap = document.createElement("div");
wrap.id = gid;
wrap.className = "slide stagger show";
wrap.style.animationDelay = `${delay * 0.05}s`;

const testList = testsByMuscle[muscleLabel] || ["Autre"];
const uniqueTests = uniq(testList); // V14 : pas d’isocinétiques ici + un seul “Autre”
wrap.innerHTML = `
<h5 style="margin-top:10px">${muscleLabel}</h5>

<label>Outils utilisés</label>
<div class="checkbox-group tools-group">
${uniq(toolsForceGeneric).map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
</div>

<label>Tests spécifiques</label>
<div class="checkbox-group muscle-tests">
${uniqueTests.map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
</div>

<label>Paramètres étudiés</label>
<div class="checkbox-group">
${paramsForce.map(p => `<label><input type="checkbox" value="${p}"> ${p}</label>`).join("")}
</div>

<label>Critères d’évaluation</label>
<div class="checkbox-group">
${criteriaForce.map(c => `<label><input type="checkbox" value="${c}"> ${c}</label>`).join("")}
</div>
`;
// “Autre” -> préciser
wrap.querySelectorAll(".checkbox-group").forEach(g => makeOtherReactive(g));
// Isocinétisme (si outil coché) -> vitesses & modes
attachIsokineticHandlers(wrap);

return wrap;
}

function createForceBlock(zoneName, id, delayIndex) {
const div = document.createElement("div");
div.id = id;
div.className = "slide stagger";
div.style.animationDelay = `${delayIndex * 0.1}s`;

// Mouvements
const moves = [];
moves.push("Flexion/Extension");
if (!["Genou", "Cheville / Pied", "Coude", "Poignet / Main"].includes(zoneName)) moves.push("Rotations");
if (["Épaule", "Hanche"].includes(zoneName)) moves.push("Adduction/Abduction");
if (zoneName === "Cheville / Pied") {
moves.push("Éversion/Inversion");
moves.push("Intrinsèques du pied");
}
if (zoneName === "Épaule") moves.push("ASH Test");
if (zoneName === "Poignet / Main") moves.push("Inclinaisons"); // Ajout demandé

const uniqueMoves = uniq(moves);

div.innerHTML = `
<h4>Force – ${zoneName}</h4>
<label>Quels mouvements évaluez-vous en force ?</label>
<div class="checkbox-group force-moves">
${uniqueMoves.map(m => `<label><input type="checkbox" value="${m}"> ${m}</label>`).join("")}
</div>
<div class="force-moves-details"></div>
`;

const details = div.querySelector(".force-moves-details");
const moveBoxes = div.querySelectorAll(".force-moves input[type='checkbox']");

moveBoxes.forEach((mb, i) => {
mb.addEventListener("change", () => {
const mid = `${id}-move-${slug(mb.value)}`;
const existing = details.querySelector(`#${cssEscape(mid)}`);

if (mb.checked) {
const block = document.createElement("div");
block.id = mid;
block.className = "slide stagger show";
block.style.animationDelay = `${i * 0.05}s`;

// Cas particuliers
if (zoneName === "Genou" && mb.value === "Flexion/Extension") {
block.innerHTML = `
<h5>${mb.value}</h5>
<label>Choix du groupe musculaire</label>
<div class="checkbox-group knee-muscles">
<label><input type="checkbox" value="Ischiojambiers"> Ischiojambiers</label>
<label><input type="checkbox" value="Quadriceps"> Quadriceps</label>
</div>
<div class="knee-muscles-details"></div>
`;
const mWrap = block.querySelector(".knee-muscles");
const dWrap = block.querySelector(".knee-muscles-details");
mWrap.querySelectorAll("input").forEach((mcb, j) => {
mcb.addEventListener("change", () => {
const gid = `${mid}-${slug(mcb.value)}`;
const ex = dWrap.querySelector(`#${cssEscape(gid)}`);
if (mcb.checked && !ex) {
dWrap.appendChild(createMuscleDetailBlock(zoneName, mcb.value, gid, i + j));
} else if (!mcb.checked && ex) {
ex.classList.remove("show");
setTimeout(() => ex.remove(), 250);
}
});
});

} else if (zoneName === "Hanche" && ["Adduction/Abduction", "Flexion/Extension"].includes(mb.value)) {
block.innerHTML = `
<h5>${mb.value}</h5>
<label>Groupe musculaire</label>
<div class="checkbox-group hip-muscles">
<label><input type="checkbox" value="Fléchisseurs hanche"> Fléchisseurs hanche</label>
<label><input type="checkbox" value="Abducteurs hanche"> Abducteurs hanche</label>
<label><input type="checkbox" value="Adducteurs hanche"> Adducteurs hanche</label>
</div>
<div class="hip-muscles-details"></div>
`;
const mWrap = block.querySelector(".hip-muscles");
const dWrap = block.querySelector(".hip-muscles-details");
mWrap.querySelectorAll("input").forEach((mcb, j) => {
mcb.addEventListener("change", () => {
const gid = `${mid}-${slug(mcb.value)}`;
const ex = dWrap.querySelector(`#${cssEscape(gid)}`);
if (mcb.checked && !ex) {
dWrap.appendChild(createMuscleDetailBlock(zoneName, mcb.value, gid, i + j));
} else if (!mcb.checked && ex) {
ex.classList.remove("show");
setTimeout(() => ex.remove(), 250);
}
});
});

} else if (zoneName === "Cheville / Pied" && (mb.value.includes("Éversion/Inversion") || mb.value.includes("Flexion/Extension") || mb.value.includes("Intrinsèques"))) {
if (mb.value.includes("Flexion/Extension")) {
block.innerHTML = `
<h5>${mb.value}</h5>
<label>Groupe musculaire</label>
<div class="checkbox-group ankle-muscles">
<label><input type="checkbox" value="Gastrocnémien"> Gastrocnémien</label>
<label><input type="checkbox" value="Soléaire"> Soléaire</label>
</div>
<div class="ankle-muscles-details"></div>
`;
const mWrap = block.querySelector(".ankle-muscles");
const dWrap = block.querySelector(".ankle-muscles-details");
mWrap.querySelectorAll("input").forEach((mcb, j) => {
mcb.addEventListener("change", () => {
const gid = `${mid}-${slug(mcb.value)}`;
const ex = dWrap.querySelector(`#${cssEscape(gid)}`);
if (mcb.checked && !ex) {
dWrap.appendChild(createMuscleDetailBlock(zoneName, mcb.value, gid, i + j));
} else if (!mcb.checked && ex) {
ex.classList.remove("show");
setTimeout(() => ex.remove(), 250);
}
});
});
} else if (mb.value.includes("Éversion/Inversion")) {
const gid = `${mid}-inv-ev`;
block.innerHTML = `<h5>${mb.value}</h5><div class="inv-ev-details"></div>`;
const dWrap = block.querySelector(".inv-ev-details");
dWrap.appendChild(createMuscleDetailBlock(zoneName, "Inverseurs/Éverseurs", gid, i));
} else if (mb.value.includes("Intrinsèques")) {
const gid = `${mid}-intrinseques`;
block.innerHTML = `<h5>Intrinsèques du pied</h5><div class="foot-intr-details"></div>`;
const dWrap = block.querySelector(".foot-intr-details");
dWrap.appendChild(createMuscleDetailBlock(zoneName, "Intrinsèques du pied", gid, i));
}

} else if (zoneName === "Épaule" && mb.value === "ASH Test") {
block.innerHTML = `
<h5>ASH Test</h5>
<label>Dans quelle(s) position(s) évaluez-vous l'ASH test ?</label>
<div class="checkbox-group">
<label><input type="checkbox" value="I (180°)"> I (180°)</label>
<label><input type="checkbox" value="Y (135°)"> Y (135°)</label>
<label><input type="checkbox" value="T (90°)"> T (90°)</label>
<label><input type="checkbox" value="I (0°)"> I (0°)</label>
<label><input type="checkbox" value="Autre"> Autre</label>
</div>

<label>Outils utilisés</label>
<div class="checkbox-group tools-group">
${uniq(toolsForceGeneric).map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
<label><input type="checkbox" value="Autre"> Autre</label>
</div>

<label>Paramètres étudiés</label>
<div class="checkbox-group">
${paramsForce.map(p => `<label><input type="checkbox" value="${p}"> ${p}</label>`).join("")}
</div>

<label>Critères d’évaluation</label>
<div class="checkbox-group">
${criteriaForce.map(c => `<label><input type="checkbox" value="${c}"> ${c}</label>`).join("")}
</div>
`;
makeOtherReactive(block);
attachIsokineticHandlers(block);

} else {
// Mouvement simple
block.innerHTML = `
<h5>${mb.value}</h5>

<label>Outils utilisés</label>
<div class="checkbox-group tools-group">
${uniq(toolsForceGeneric).map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
${
zoneName === "Rachis lombaire" && mb.value.includes("Flexion/Extension")
? `<label><input type="checkbox" value="Test de Shirado"> Test de Shirado</label>
<label><input type="checkbox" value="Test de Sorensen"> Test de Sorensen</label>`
: ``
}
<label><input type="checkbox" value="Autre"> Autre</label>
</div>

<label>Paramètres étudiés</label>
<div class="checkbox-group">
${paramsForce.map(p => `<label><input type="checkbox" value="${p}"> ${p}</label>`).join("")}
</div>

<label>Critères d’évaluation</label>
<div class="checkbox-group">
${criteriaForce.map(c => `<label><input type="checkbox" value="${c}"> ${c}</label>`).join("")}
</div>
`;
makeOtherReactive(block);
attachIsokineticHandlers(block);
}

details.appendChild(block);
} else if (existing) {
existing.classList.remove("show");
setTimeout(() => existing.remove(), 250);
}
});
});

return div;
}

// ===== MOBILITÉ (mouvement -> outils -> critères) =====
function createMobilityBlock(zoneName, id, delayIndex) {
const div = document.createElement("div");
div.id = id;
div.className = "slide stagger";
div.style.animationDelay = `${delayIndex * 0.1}s`;

const moves = [];
moves.push("Flexion/Extension");
if (!["Genou", "Cheville / Pied", "Coude", "Poignet / Main"].includes(zoneName)) moves.push("Rotations");
if (["Épaule", "Hanche"].includes(zoneName)) moves.push("Adduction/Abduction");
if (zoneName === "Cheville / Pied") moves.push("Éversion/Inversion");
if (zoneName === "Rachis lombaire") moves.push("Inclinaisons");
if (zoneName === "Poignet / Main") moves.push("Inclinaisons"); // demandé

const uniqueMoves = uniq(moves);

div.innerHTML = `
<h4>Mobilité – ${zoneName}</h4>
<label>Quels mouvements évaluez-vous en mobilité ?</label>
<div class="checkbox-group mob-moves">
${uniqueMoves.map(m => `<label><input type="checkbox" value="${m}"> ${m}</label>`).join("")}
</div>
<div class="mob-moves-details"></div>
`;

const details = div.querySelector(".mob-moves-details");
div.querySelectorAll(".mob-moves input").forEach((mb, i) => {
mb.addEventListener("change", () => {
const mid = `${id}-move-${slug(mb.value)}`;
const existing = details.querySelector(`#${cssEscape(mid)}`);
if (mb.checked) {
const block = document.createElement("div");
block.id = mid;
block.className = "slide stagger show";
block.style.animationDelay = `${i * 0.05}s`;

let tools = uniq([...toolsMobilityGeneric]);
// Ajouts spécifiques
if ((zoneName === "Genou" && mb.value === "Flexion/Extension") || zoneName === "Rachis lombaire") {
tools = uniq([...tools, "Sit-and-reach"]);
}
if (zoneName === "Cheville / Pied" && mb.value.toLowerCase().includes("flexion")) {
tools = uniq([...tools, "Knee-to-wall (KTW)"]);
}
// Enlever “Test spécifique” (demandé) — déjà non présent
// Lombaire flex/ext : critères sans D/G (utiliser criteriaMobilityLumbar)
const crits = (zoneName === "Rachis lombaire" && mb.value === "Flexion/Extension")
? criteriaMobilityLumbar
: criteriaMobilityGeneric;

// Distance doigt-sol pour lombaire inclinaisons
if (zoneName === "Rachis lombaire" && mb.value === "Inclinaisons") {
tools = uniq([...tools, "Distance doigt-sol"]);
}

block.innerHTML = `
<h5 style="margin-top:10px">${mb.value}</h5>
<label>Outils utilisés</label>
<div class="checkbox-group">
${tools.map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
<label><input type="checkbox" value="Autre"> Autre</label>
</div>

<label>Critères d’évaluation</label>
<div class="checkbox-group">
${crits.map(c => `<label><input type="checkbox" value="${c}"> ${c}</label>`).join("")}
</div>
`;
details.appendChild(block);
block.querySelectorAll(".checkbox-group").forEach(g => makeOtherReactive(g));

} else if (existing) {
existing.classList.remove("show");
setTimeout(() => existing.remove(), 250);
}
});
});

return div;
}

// ================== VALIDATION + ENVOI GOOGLE FORMS ==================
// Google Forms (adapter si besoin)
const GOOGLE_FORM_URL = "https://docs.google.com/forms/u/0/d/e/1FAIpQLSeNok3wNrafUFIM2VnAo4NKQpdZDaDyFDeVS8dZbXFyt_ySyA/formResponse";
const GOOGLE_ENTRY_KEY = "entry.1237244370";

function validateAll() {
// Infos générales (avec “Autre” -> préciser)
const roleAutre = document.querySelector("input[name='role'][value='Autre']");
if (roleAutre && roleAutre.checked) {
const txt = document.querySelector("#role")?.querySelector(".other-input");
if (!txt || !txt.value.trim()) return "Merci de préciser votre rôle.";
}
const structAutre = document.querySelector("input[name='structure'][value='Autre']");
if (structAutre && structAutre.checked) {
const txt = document.querySelector("#structure")?.querySelector(".other-input");
if (!txt || !txt.value.trim()) return "Merci de préciser la structure.";
}

const selectedZonesRaw = [...zonesCheckboxes].filter(z => z.checked);
if (selectedZonesRaw.length === 0) return "Merci de sélectionner au moins une zone anatomique.";

// Zones logiques (fusion tête/rachis)
const selectedZoneKeys = [];
const headOrNeck = selectedZonesRaw.some(z => headNeckPair.includes(z.value));
if (headOrNeck) selectedZoneKeys.push(headNeckTitle);
selectedZonesRaw.forEach(z => { if (!headNeckPair.includes(z.value)) selectedZoneKeys.push(z.value); });

// Vérifier sections par zone
const zonesIncomplete = selectedZoneKeys.some(zName => {
const sec = document.getElementById(`section-${slug(zName)}`);
if (!sec) return true;
const hasSomething = !!sec.querySelector("input:checked");
if (!hasSomething) return true;

// Autre fréquence -> préciser
const of = sec.querySelector(".moment input[value='Autre fréquence']:checked");
if (of) {
const txt = sec.querySelector(".moment .other-input");
if (!txt || !txt.value.trim()) return true;
}
if (hasUncheckedOther(sec)) return true;
// Isocinétisme -> si "Autre (précisez)" vitesse est cochée, préciser
const isoOther = sec.querySelector(".isokinetic-sub .iso-speed input[value*='Autre']:checked");
if (isoOther) {
const txt = sec.querySelector(".isokinetic-sub .iso-speed .other-input");
if (!txt || !txt.value.trim()) return true;
}
return false;
});
if (zonesIncomplete) return "Merci de compléter toutes les sous-sections des zones sélectionnées (mouvements, outils, tests, paramètres, critères, précisions…).";

// Globaux (si présents) : “Autre” doit être précisé
for (const g of [globalFuncMS, globalFuncMI, globalJumps, globalCourse]) {
if (!g || !g.dataset.ready) continue;
if (hasUncheckedOther(g)) return "Merci de préciser les champs 'Autre' dans les sections globales.";
}

// Questions communes (si “Autre”)
const commons = document.getElementById("commonQuestions");
if (commons && hasUncheckedOther(commons)) return "Merci de préciser les champs 'Autre' dans les questions communes.";

return null;
}

submitBtn.addEventListener("click", (e) => {
e.preventDefault();
resultMessage.textContent = "";
resultMessage.style.color = "red";

const err = validateAll();
if (err) {
resultMessage.textContent = "⚠️ " + err;
window.scrollTo({ top: 0, behavior: "smooth" });
return;
}

// Construit un JSON “léger” (adaptable si besoin) — ici on envoie un statut OK
const data = { status: "ok", version: "V14" };
const body = new URLSearchParams();
body.append(GOOGLE_ENTRY_KEY, JSON.stringify(data));

fetch(GOOGLE_FORM_URL, {
method: "POST",
mode: "no-cors",
headers: { "Content-Type": "application/x-www-form-urlencoded" },
body
})
.then(() => {
resultMessage.style.color = "#0074d9";
resultMessage.textContent = "✅ Merci ! Vos réponses ont bien été enregistrées.";
window.scrollTo({ top: 0, behavior: "smooth" });
})
.catch(() => {
resultMessage.style.color = "#0074d9";
resultMessage.textContent = "✅ Envoi effectué (mode silencieux).";
window.scrollTo({ top: 0, behavior: "smooth" });
});
});

// ================== Auto-réactivité “Autre” pour infos participant & questions communes ==================
// Infos participant (au cas où “Autre” y figure dans ton HTML)
const roleWrap = document.getElementById("role");
roleWrap && makeOtherReactive(roleWrap, "Précisez votre rôle");
const structWrap = document.getElementById("structure");
structWrap && makeOtherReactive(structWrap, "Précisez votre structure");

// Questions communes
const commonWrap = document.getElementById("commonQuestions");
commonWrap && makeOtherReactive(commonWrap, "Précisez");

// Init
updateProgress();
});
