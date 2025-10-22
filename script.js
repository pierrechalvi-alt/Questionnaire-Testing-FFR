// ======================================================
// script.js – v7 full features (clinique avancée + Google Form)
// ======================================================

document.addEventListener("DOMContentLoaded", () => {
// ===== Sélecteurs globaux
const zonesCheckboxes = document.querySelectorAll("#zones input[type='checkbox']");
const zoneQuestionsContainer = document.getElementById("zoneQuestions");
const submitBtn = document.getElementById("submitBtn");
const resultMessage = document.getElementById("resultMessage");

// ===== Groupes de zones
const lowerBodyZones = ["Hanche", "Genou", "Cheville / Pied"];
const upperBodyZones = ["Épaule", "Coude", "Poignet / Main"];
const headNeckPair = ["Tête", "Rachis cervical"];
const headNeckTitle = "Tête / Rachis cervical";

// ===== Blocs globaux dynamiques – créés une fois
const globalJumps = document.createElement("div");
globalJumps.id = "global-jumps";
globalJumps.className = "subcard";
globalJumps.style.display = "none";
zoneQuestionsContainer.parentElement.appendChild(globalJumps);

const globalCourse = document.createElement("div");
globalCourse.id = "global-course";
globalCourse.className = "subcard";
globalCourse.style.display = "none";
zoneQuestionsContainer.parentElement.appendChild(globalCourse);

const globalUpperFunctional = document.createElement("div");
globalUpperFunctional.id = "global-upper-functional";
globalUpperFunctional.className = "subcard";
globalUpperFunctional.style.display = "none";
zoneQuestionsContainer.parentElement.appendChild(globalUpperFunctional);

const globalLowerFunctional = document.createElement("div");
globalLowerFunctional.id = "global-lower-functional";
globalLowerFunctional.className = "subcard";
globalLowerFunctional.style.display = "none";
zoneQuestionsContainer.parentElement.appendChild(globalLowerFunctional);

// ===== Listes génériques
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
"Cheville / Pied": ["Y-Balance Test", "Star Excursion", "Single Leg Balance Test"],
"Genou": ["Y-Balance Test", "Star Excursion", "FMS (Lower)"],
"Hanche": ["Y-Balance Test", "Star Excursion", "FMS (Lower)"],
"Épaule": ["Y-Balance Test (épaule)", "FMS (Upper)"],
[headNeckTitle]: ["Test proprio cervical (laser)"],
"Poignet / Main": [],
"Coude": [],
"Rachis lombaire": ["FMS (Core)"]
};

// ===== Questionnaires par zone (exhaustif courant en pratique)
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

// ===== Tests force par muscle / articulation
const testsByMuscle = {
// Genou
"Ischiojambiers": [
"McCall 90°",
"Isométrie 30°",
"Nordic",
"Nordic Hold",
"Razor Curl",
"Single Leg Bridge",
"Isocinétique 60°/s",
"Isocinétique 180°/s",
"Autre"
],
"Quadriceps": [
"Isométrie 60°",
"Leg Extension",
"Single Leg Squat",
"Isocinétique 60°/s",
"Isocinétique 180°/s",
"Autre"
],
// Hanche
"Fléchisseurs hanche": [
"Isométrique 45°",
"Straight Leg Raise (force)",
"Isocinétique 60°/s",
"Isocinétique 180°/s",
"Autre"
],
"Abducteurs hanche": [
"Side-lying isométrique",
"Standing belt test",
"Isocinétique 60°/s",
"Autre"
],
"Adducteurs hanche": [
"Squeeze test (5s)",
"Copenhagen",
"Isocinétique 60°/s",
"Autre"
],
// Cheville
"Gastrocnémien": [
"Heel Raise – genou tendu (1RM)",
"Heel Raise – max reps",
"Isométrie 90°",
"Isocinétique 60°/s",
"Autre"
],
"Soléaire": [
"Heel Raise – genou fléchi (1RM)",
"Max reps",
"Isométrie 90°",
"Isocinétique 60°/s",
"Autre"
],
"Inverseurs/Éverseurs": [
"Dynamométrie manuelle",
"Dynamométrie fixe",
"Isocinétique 30°/s",
"Autre"
],
"Intrinsèques du pied": [
"Toe Curl test",
"Short Foot test",
"Dynamométrie",
"Plateforme de pressions",
"Autre"
]
};

// ===== Helpers
const slug = s =>
s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");
const cssEscape = (id) => id.replace(/([ #;?%&,.+*~\':"!^$[\]()=>|/@])/g, "\\$1");

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
inputs.forEach(inp => {
const val = (inp.value || "").toLowerCase();
if (val === "autre" || val === "autres" || val.includes("autre")) {
inp.addEventListener("change", () =>
addOtherField(inp.closest(".checkbox-group") || root, inp, placeholder)
);
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
</div>
`;
group.insertAdjacentElement("afterend", sub);
const otherSpeed = sub.querySelector(".iso-speed input[value*='Autre']");
if (otherSpeed) {
otherSpeed.addEventListener("change", () => {
addOtherField(sub.querySelector(".iso-speed"), otherSpeed, "Vitesse (précisez)");
});
}
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
function hasUncheckedOther(scope) {
const others = scope.querySelectorAll(
"input[type='checkbox'][value='Autre']:checked, input[type='checkbox'][value='Autres']:checked"
);
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

// ===== Logique Tête + Rachis cervical fusion
function getZoneKey(zoneName) {
return headNeckPair.includes(zoneName) ? headNeckTitle : zoneName;
}
function anyHeadNeckChecked() {
return [...zonesCheckboxes].some(z => headNeckPair.includes(z.value) && z.checked);
}

// ===== Création / suppression section
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
});

// ===== Blocs globaux (sauts / course / fonctionnels)
function toggleGlobalSections() {
const selected = [...zonesCheckboxes].filter(z => z.checked).map(z => z.value);
const hasLower = selected.some(z => lowerBodyZones.includes(z));
const hasUpper = selected.some(z => upperBodyZones.includes(z));
const hasHead = selected.some(z => headNeckPair.includes(z));

// SAUTS : unique si MI cochée
if (hasLower) {
if (!globalJumps.dataset.ready) {
globalJumps.dataset.ready = "1";
}
globalJumps.style.display = "";
globalJumps.innerHTML = `
<h3>Tests de sauts</h3>
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
makeOtherReactive(globalJumps);
} else {
globalJumps.style.display = "none";
globalJumps.innerHTML = "";
delete globalJumps.dataset.ready;
}

// COURSE : unique si MI cochée OU tête/rachis coché
if (hasLower || hasHead) {
if (!globalCourse.dataset.ready) {
globalCourse.dataset.ready = "1";
}
globalCourse.style.display = "";
globalCourse.innerHTML = `
<h3>Tests de course</h3>
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
makeOtherReactive(globalCourse);
} else {
globalCourse.style.display = "none";
globalCourse.innerHTML = "";
delete globalCourse.dataset.ready;
}

// TESTS FONCTIONNELS GLOBAUX
toggleFunctionalBlocks(hasUpper, hasLower);
}

function toggleFunctionalBlocks(hasUpper, hasLower) {
// Membre supérieur
if (hasUpper) {
if (!globalUpperFunctional.dataset.ready) {
globalUpperFunctional.dataset.ready = "1";
}
globalUpperFunctional.style.display = "";
globalUpperFunctional.innerHTML = `
<h3>Tests fonctionnels globaux – Membre supérieur</h3>
<label>Quels tests réalisez-vous ?</label>
<div class="checkbox-group">
<label><input type="checkbox" value="Traction"> Traction</label>
<label><input type="checkbox" value="Développé couché"> Développé couché</label>
<label><input type="checkbox" value="Tirage"> Tirage</label>
<label><input type="checkbox" value="Force de grippe"> Force de grippe</label>
<label><input type="checkbox" value="Autre"> Autre</label>
</div>

<label>Outils utilisés</label>
<div class="checkbox-group">
<label><input type="checkbox" value="Aucun"> Aucun</label>
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
<label><input type="checkbox" value="Ratio/poids de corps"> Ratio / poids de corps</label>
<label><input type="checkbox" value="Valeur seuil"> Valeur seuil</label>
</div>
`;
makeOtherReactive(globalUpperFunctional);
} else {
globalUpperFunctional.style.display = "none";
globalUpperFunctional.innerHTML = "";
delete globalUpperFunctional.dataset.ready;
}

// Membre inférieur
if (hasLower) {
if (!globalLowerFunctional.dataset.ready) {
globalLowerFunctional.dataset.ready = "1";
}
globalLowerFunctional.style.display = "";
globalLowerFunctional.innerHTML = `
<h3>Tests fonctionnels globaux – Membre inférieur</h3>
<label>Quels tests réalisez-vous ?</label>
<div class="checkbox-group">
<label><input type="checkbox" value="Squat"> Squat</label>
<label><input type="checkbox" value="Montée de banc"> Montée de banc</label>
<label><input type="checkbox" value="Soulevé de terre"> Soulevé de terre</label>
<label><input type="checkbox" value="Autre"> Autre</label>
</div>

<label>Outils utilisés</label>
<div class="checkbox-group">
<label><input type="checkbox" value="Aucun"> Aucun</label>
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
<label><input type="checkbox" value="Ratio/poids de corps"> Ratio / poids de corps</label>
<label><input type="checkbox" value="Valeur seuil"> Valeur seuil</label>
</div>
`;
makeOtherReactive(globalLowerFunctional);
} else {
globalLowerFunctional.style.display = "none";
globalLowerFunctional.innerHTML = "";
delete globalLowerFunctional.dataset.ready;
}
}

// ===== Création section par zone
function createZoneSection(zoneName) {
const id = `section-${slug(zoneName)}`;
if (document.getElementById(id)) return;

const section = document.createElement("div");
section.classList.add("subcard", "fade-in");
section.id = id;
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

// “Autre fréquence” → champ texte
addFrequencyOther(section);

const typeCheckboxes = section.querySelectorAll(".types input[type='checkbox']");
const subQContainer = section.querySelector(".subquestions");

typeCheckboxes.forEach((cb, i) => {
cb.addEventListener("change", () => {
const subId = `sub-${slug(zoneName)}-${slug(cb.value)}`;
const existing = subQContainer.querySelector(`#${cssEscape(subId)}`);

if (cb.checked) {
let subSection = null;

if (zoneName === headNeckTitle) {
if (cb.value === "Test de cognition") {
subSection = document.createElement("div");
subSection.id = subId;
subSection.className = "slide stagger";
subSection.style.animationDelay = `${i * 0.1}s`;
subSection.innerHTML = `
<h4>Test de cognition</h4>
<div class="checkbox-group">
<label><input type="checkbox" value="Test oculaire"> Test oculaire</label>
<label><input type="checkbox" value="Test vestibulaire"> Test vestibulaire</label>
<label><input type="checkbox" value="Autre"> Autre</label>
</div>
`;
makeOtherReactive(subSection);
}
if (cb.value === "Proprioception / Équilibre") {
subSection = createProprioBlock(zoneName, subId, i);
}
if (cb.value === "Questionnaires") {
subSection = createQuestionnaireBlock(zoneName, subId, i);
}
if (cb.value === "Autres données") {
subSection = createOtherDataBlock(zoneName, subId, i);
}
} else {
if (cb.value === "Force") subSection = createForceBlock(zoneName, subId, i);
if (cb.value === "Mobilité") subSection = createMobilityBlock(zoneName, subId, i);
if (cb.value === "Proprioception / Équilibre") subSection = createProprioBlock(zoneName, subId, i);
if (cb.value === "Questionnaires") subSection = createQuestionnaireBlock(zoneName, subId, i);
if (cb.value === "Autres données") subSection = createOtherDataBlock(zoneName, subId, i);
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

// ===== Blocs spécifiques
function createOtherDataBlock(zoneName, id, delayIndex) {
const div = document.createElement("div");
div.id = id;
div.className = "slide stagger";
div.style.animationDelay = `${delayIndex * 0.1}s`;
div.innerHTML = `
<h4>Autres données – ${zoneName}</h4>
<input type="text" class="other-input" placeholder="Précisez la donnée collectée" required style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;">
`;
return div;
}

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
</div>
`;
makeOtherReactive(div.querySelector(".q-list"), "Nom du questionnaire");
return div;
}

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
<label><input type="checkbox" value="Autre"> Autre</label>
</div>
<label>Critères d’évaluation</label>
<div class="checkbox-group">
<label><input type="checkbox" value="Moyenne du groupe"> Moyenne du groupe</label>
<label><input type="checkbox" value="Valeur seuil"> Valeur seuil</label>
</div>
`;
makeOtherReactive(div.querySelector(".proprio-tests"), "Nom du test");
return div;
}

// ===== FORCE (hiérarchie complète)
function createForceBlock(zoneName, id, delayIndex) {
const div = document.createElement("div");
div.id = id;
div.className = "slide stagger";
div.style.animationDelay = `${delayIndex * 0.1}s`;

const moves = [];
moves.push("Flexion/Extension");
if (!["Genou", "Cheville / Pied", "Coude", "Poignet / Main"].includes(zoneName)) moves.push("Rotations");
if (["Épaule", "Hanche"].includes(zoneName)) moves.push("Adduction/Abduction");
if (zoneName === "Cheville / Pied") {
moves.push("Éversion/Inversion");
moves.push("Intrinsèques du pied");
}
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

// GENOU : Flex/Ext -> Ischios / Quads
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

// HANCHE : Flex/Abd/Add avec groupes
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

// CHEVILLE : Flex/Ext -> Gastro/Soléaire ; Inversion/Éversion ; Intrinsèques
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

// ÉPAULE : ASH Test
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
${toolsForceGeneric.map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
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

// Autres articulations / mouvements simples
} else {
block.innerHTML = `
<h5>${mb.value}</h5>

<label>Outils utilisés</label>
<div class="checkbox-group tools-group">
${toolsForceGeneric.map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
${zoneName === "Rachis lombaire" && mb.value.includes("Flexion/Extension") ? `
<label><input type="checkbox" value="Test de Shirado"> Test de Shirado</label>
<label><input type="checkbox" value="Test de Sorensen"> Test de Sorensen</label>
` : ""}
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

// Détail par groupe musculaire (outils → tests → paramètres → critères)
function createMuscleDetailBlock(zoneName, muscleLabel, gid, delay) {
const wrap = document.createElement("div");
wrap.id = gid;
wrap.className = "slide stagger show";
wrap.style.animationDelay = `${delay * 0.05}s`;

const testList = testsByMuscle[muscleLabel] || ["Autre"];

wrap.innerHTML = `
<h5 style="margin-top:10px">${muscleLabel}</h5>

<label>Outils utilisés</label>
<div class="checkbox-group tools-group">
${toolsForceGeneric.map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
<label><input type="checkbox" value="Autre"> Autre</label>
</div>

<label>Tests spécifiques</label>
<div class="checkbox-group muscle-tests">
${testList.map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
</div>

<label>Paramètres étudiés</label>
<div class="checkbox-group">
${["Force max","Force moyenne","Force relative (N/kg)","RFD","Angle du pic de force","Endurance"].map(p => `<label><input type="checkbox" value="${p}"> ${p}</label>`).join("")}
</div>

<label>Critères d’évaluation</label>
<div class="checkbox-group">
${["Ratio agoniste/antagoniste","Ratio droite/gauche","Valeur seuil"].map(c => `<label><input type="checkbox" value="${c}"> ${c}</label>`).join("")}
</div>
`;

wrap.querySelectorAll(".checkbox-group").forEach(g => makeOtherReactive(g));
attachIsokineticHandlers(wrap);

return wrap;
}

// ===== MOBILITÉ (mouvement -> outils -> critères)
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

div.innerHTML = `
<h4>Mobilité – ${zoneName}</h4>
<label>Quels mouvements évaluez-vous en mobilité ?</label>
<div class="checkbox-group mob-moves">
${moves.map(m => `<label><input type="checkbox" value="${m}"> ${m}</label>`).join("")}
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

let tools = [...toolsMobilityGeneric];
if ((zoneName === "Genou" && mb.value === "Flexion/Extension") || zoneName === "Rachis lombaire") {
tools = [...tools, "Sit-and-reach"];
}
if (zoneName === "Cheville / Pied" && mb.value.toLowerCase().includes("flexion")) {
tools = [...tools, "Knee-to-wall (KTW)"];
}
const crits = zoneName === "Rachis lombaire" ? criteriaMobilityLumbar : criteriaMobilityGeneric;

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

// ===== VALIDATION stricte & envoi
function validateAll() {
resultMessage.textContent = "";
resultMessage.style.color = "red";

const role = document.querySelector("input[name='role']:checked");
const structure = document.querySelector("input[name='structure']:checked");
if (!role || !structure) {
resultMessage.textContent = "⚠️ Merci de compléter les informations générales.";
return false;
}

const selectedZonesRaw = [...zonesCheckboxes].filter(z => z.checked);
if (selectedZonesRaw.length === 0) {
resultMessage.textContent = "⚠️ Merci de sélectionner au moins une zone anatomique.";
return false;
}

// Construire l’ensemble des zones “logiques”
const selectedZoneKeys = [];
const headOrNeck = selectedZonesRaw.some(z => headNeckPair.includes(z.value));
if (headOrNeck) selectedZoneKeys.push(headNeckTitle);
selectedZonesRaw.forEach(z => {
if (!headNeckPair.includes(z.value)) selectedZoneKeys.push(z.value);
});

// Validation par zone
const zonesIncomplete = selectedZoneKeys.some(zName => {
const sec = document.getElementById(`section-${slug(zName)}`);
if (!sec) return true;

// Au moins moment ou types
const hasFreq = !!sec.querySelector(".moment input:checked");
const hasType = !!sec.querySelector(".types input:checked");
if (!hasFreq && !hasType) return true;

// Autre fréquence → préciser
const of = sec.querySelector(".moment input[value='Autre fréquence']:checked");
if (of) {
const txt = sec.querySelector(".moment .other-input");
if (!txt || !txt.value.trim()) return true;
}

// Force → au moins 1 mouvement + ses sous-éléments
const forceChecked = sec.querySelector(".types input[value='Force']:checked");
if (forceChecked) {
const mArea = sec.querySelector(".force-moves");
if (!mArea || !mArea.querySelector("input:checked")) return true;
if (hasUncheckedOther(sec)) return true;
const isoOther = sec.querySelector(".isokinetic-sub .iso-speed input[value*='Autre']:checked");
if (isoOther) {
const txt = sec.querySelector(".isokinetic-sub .iso-speed .other-input");
if (!txt || !txt.value.trim()) return true;
}
}

// Mobilité → au moins 1 mouvement + outils + critères
const mobChecked = sec.querySelector(".types input[value='Mobilité']:checked");
if (mobChecked) {
const mArea = sec.querySelector(".mob-moves");
if (!mArea || !mArea.querySelector("input:checked")) return true;
if (hasUncheckedOther(sec)) return true;
}

// Questionnaires / Autres données → “Autre” doit être précisé
if (hasUncheckedOther(sec)) return true;

const otherData = sec.querySelector(".types input[value='Autres données']:checked");
if (otherData) {
const txt = sec.querySelector(".other-input");
if (!txt || !txt.value.trim()) return true;
}

return false;
});

if (zonesIncomplete) {
resultMessage.textContent =
"⚠️ Merci de compléter toutes les sous-sections (mouvements, outils, tests, paramètres, critères, précisions…).";
return false;
}

// Globaux (Sauts / Course / Fonctionnels) → “Autre” précisé si coché
for (const g of [globalJumps, globalCourse, globalUpperFunctional, globalLowerFunctional]) {
if (!g || !g.dataset.ready) continue;
if (hasUncheckedOther(g)) {
resultMessage.textContent = "⚠️ Merci de préciser les champs 'Autre' dans les sections globales.";
return false;
}
}

return true;
}

// ===== Collecte pour Google Form
function collectFormData() {
const data = {};
const form = document.getElementById("questionnaireForm");

data.role = form.querySelector("input[name='role']:checked")?.value || "";
data.equipe = form.querySelector("input[name='structure']:checked")?.value || "";
data.zones = [...document.querySelectorAll("#zones input:checked")].map(z => z.value);

data.details = {};
document.querySelectorAll("#zoneQuestions .subcard").forEach(sec => {
const zone = sec.querySelector("h3")?.textContent?.trim();
if (!zone) return;
const answers = [];
sec.querySelectorAll("input:checked").forEach(chk => {
answers.push(chk.parentElement.textContent.trim());
});
sec.querySelectorAll(".other-input").forEach(inp => {
if (inp.value.trim()) answers.push("Autre : " + inp.value.trim());
});
if (answers.length) data.details[zone] = answers;
});

// Globaux
["global-jumps", "global-course", "global-upper-functional", "global-lower-functional"].forEach(id => {
const sec = document.getElementById(id);
if (!sec || !sec.dataset.ready) return;
const title = sec.querySelector("h3")?.textContent?.trim();
if (!title) return;
const answers = [];
sec.querySelectorAll("input:checked").forEach(chk => {
answers.push(chk.parentElement.textContent.trim());
});
sec.querySelectorAll(".other-input").forEach(inp => {
if (inp.value.trim()) answers.push("Autre : " + inp.value.trim());
});
if (answers.length) data.details[title] = answers;
});

// Questions communes (si présentes dans ton HTML)
const commons = {};
["barrieres", "raisons"].forEach(name => {
commons[name] = [...form.querySelectorAll(`input[name='${name}']:checked`)].map(c => c.value);
});
data.questions_communes = commons;

data.timestamp_local = new Date().toLocaleString("fr-FR");
return data;
}

// ===== Envoi vers Google Form
function submitToGoogleForm(data) {
const googleFormURL =
"https://docs.google.com/forms/u/0/d/e/1FAIpQLSeNok3wNrafUFIM2VnAo4NKQpdZDaDyFDeVS8dZbXFyt_ySyA/formResponse";
const entryID = "entry.1237244370";

const payload = {};
payload[entryID] = JSON.stringify(data);

fetch(googleFormURL, {
method: "POST",
mode: "no-cors",
headers: { "Content-Type": "application/x-www-form-urlencoded" },
body: new URLSearchParams(payload).toString()
})
.then(() => {
resultMessage.style.color = "#0074d9";
resultMessage.textContent = "✅ Réponses transmises à Google Form avec succès. Merci !";
window.scrollTo({ top: 0, behavior: "smooth" });
})
.catch(err => {
resultMessage.style.color = "red";
resultMessage.textContent = "⚠️ Échec de l’envoi au Google Form.";
console.error("Erreur d’envoi :", err);
});
}

// ===== Bouton Envoyer
submitBtn.addEventListener("click", (e) => {
e.preventDefault();
if (!validateAll()) return;
const formData = collectFormData();
submitToGoogleForm(formData);
});
});
