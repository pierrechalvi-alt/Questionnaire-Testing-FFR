// ------------------------------
// script.js – v5 (logique clinique avancée)
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
// ===== Sélecteurs globaux
const zonesCheckboxes = document.querySelectorAll("#zones input[type='checkbox']");
const zoneQuestionsContainer = document.getElementById("zoneQuestions");
const submitBtn = document.getElementById("submitBtn");
const resultMessage = document.getElementById("resultMessage");

// Barre de progression
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");
const formSections = document.querySelectorAll(".card");

function updateProgress() {
const filled = [...formSections].filter(sec => sec.querySelector("input:checked") || sec.querySelector("input[type='text']:not(.other-input)[value]")).length;
const total = formSections.length;
const percent = Math.min(100, Math.round((filled / total) * 100));
progressBar.style.width = percent + "%";
progressText.textContent = `Progression : ${percent}%`;
}
document.addEventListener("change", updateProgress);

// ===== Groupes de zones
const lowerBodyZones = ["Hanche", "Genou", "Cheville / Pied"];
const upperBodyZones = ["Épaule", "Coude", "Poignet / Main"];
const headNeckPair = ["Tête", "Rachis cervical"];
const headNeckTitle = "Tête / Rachis cervical";

// ===== Blocs globaux uniques (créés à la volée)
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

// ===== Données (listes)
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

// Questionnaires par zone (élargis)
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

// Tests force par muscle / articulation
const testsByMuscle = {
// Genou
"Ischiojambiers": ["McCall 90°", "Isométrie 30°", "Nordic", "Nordic Hold", "Razor Curl", "Single Leg Bridge", "Isocinétique 60°/s", "Isocinétique 180°/s", "Autre"],
"Quadriceps": ["Isométrie 60°", "Leg Extension", "Single Leg Squat", "Isocinétique 60°/s", "Isocinétique 180°/s", "Autre"],

// Hanche
"Fléchisseurs hanche": ["Isométrique 45°", "Straight Leg Raise (force)", "Isocinétique 60°/s", "Isocinétique 180°/s", "Autre"],
"Abducteurs hanche": ["Side-lying isométrique", "Standing belt test", "Isocinétique 60°/s", "Autre"],
"Adducteurs hanche": ["Squeeze test (5s)", "Copenhagen", "Isocinétique 60°/s", "Autre"],

// Cheville
"Gastrocnémien": ["Heel Raise – genou tendu (1RM)", "Heel Raise – max reps", "Isométrie 90°", "Isocinétique 60°/s", "Autre"],
"Soléaire": ["Heel Raise – genou fléchi (1RM)", "Max reps", "Isométrie 90°", "Isocinétique 60°/s", "Autre"],
"Inverseurs/Éverseurs": ["Dynamométrie manuelle", "Dynamométrie fixe", "Isocinétique 30°/s", "Autre"],
"Intrinsèques du pied": ["Toe Curl test", "Short Foot test", "Dynamométrie", "Plateforme de pressions", "Autre"]
};

// ===== Helpers
const slug = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-");
const cssEscape = id => id.replace(/([ #;?%&,.+*~\':"!^$[\]()=>|/@])/g,'\\$1');

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
inp.addEventListener("change", () => addOtherField(inp.closest(".checkbox-group") || root, inp, placeholder));
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
otherSpeed.addEventListener("change", () => {
addOtherField(sub.querySelector(".iso-speed"), otherSpeed, "Vitesse (précisez)");
});
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

// ===== Logique “fusion” Tête + Rachis cervical
function getZoneKey(zoneName) {
return headNeckPair.includes(zoneName) ? headNeckTitle : zoneName;
}
function anyHeadNeckChecked() {
return [...zonesCheckboxes].some(z => headNeckPair.includes(z.value) && z.checked);
}

// ===== Gestion cohérente des sections par zone
zonesCheckboxes.forEach(zone => {
zone.addEventListener("change", () => {
const zKey = getZoneKey(zone.value);
if (headNeckPair.includes(zone.value)) {
// Fusion : créer section si c'est le 1er des deux coché ; détruire quand les deux sont décochés
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

// ===== Blocs globaux (Sauts / Course)
function toggleGlobalSections() {
const selected = [...zonesCheckboxes].filter(z => z.checked).map(z => z.value);
const hasLower = selected.some(z => lowerBodyZones.includes(z));
const hasHead = selected.some(z => headNeckPair.includes(z));
// SAUTS : unique si MI cochée
if (hasLower) {
if (!globalJumps.dataset.ready) {
globalJumps.dataset.ready = "1";
globalJumps.style.display = "";
globalJumps.classList.add("fade-in","active");
globalJumps.innerHTML = `
<h3>Tests de sauts</h3>
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
makeOtherReactive(globalJumps);
}
} else {
globalJumps.style.display = "none";
globalJumps.innerHTML = "";
delete globalJumps.dataset.ready;
}

// COURSE : unique si MI cochée OU tête/rachis coché
if (hasLower || hasHead) {
if (!globalCourse.dataset.ready) {
globalCourse.dataset.ready = "1";
globalCourse.style.display = "";
globalCourse.classList.add("fade-in","active");
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
<div class="checkbox-group course-tools">
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
`;
makeOtherReactive(globalCourse);
}
} else {
globalCourse.style.display = "none";
globalCourse.innerHTML = "";
delete globalCourse.dataset.ready;
}
}

// ===== Création / suppression section
function createZoneSection(zoneName) {
// ne pas dupliquer si déjà créé
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
// Cognition
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
// Proprio
if (cb.value === "Proprioception / Équilibre") {
subSection = createProprioBlock(zoneName, id, i);
}
// Questionnaires
if (cb.value === "Questionnaires") {
subSection = createQuestionnaireBlock(zoneName, id, i);
}
// Autres données
if (cb.value === "Autres données") {
subSection = createOtherDataBlock(zoneName, id, i);
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
// “Autre” partout
makeOtherReactive(subSection);
// Isocinétisme sur chaque groupe d’outils
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
div.innerHTML = `
<h4>Questionnaires – ${zoneName}</h4>
<div class="checkbox-group q-list">
${list.map(q => `<label><input type="checkbox" value="${q}"> ${q}</label>`).join("")}
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
</div>`;
makeOtherReactive(div.querySelector(".proprio-tests"), "Nom du test");
return div;
}

// ===== FORCE (hiérarchie complète)
function createForceBlock(zoneName, id, delayIndex) {
const div = document.createElement("div");
div.id = id;
div.className = "slide stagger";
div.style.animationDelay = `${delayIndex * 0.1}s`;

// Mouvements de base
const moves = [];
// par défaut
moves.push("Flexion/Extension");
if (!["Genou", "Cheville / Pied", "Coude", "Poignet / Main"].includes(zoneName)) moves.push("Rotations");
if (["Épaule", "Hanche"].includes(zoneName)) moves.push("Adduction/Abduction");
if (zoneName === "Cheville / Pied") {
moves.push("Éversion/Inversion");
moves.push("Intrinsèques du pied"); // bloc force spécifique
}
if (zoneName === "Rachis lombaire") { /* Inclinaisons non pertinentes en force */ }
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

// 1) GENOU : Flex/Ext -> Ischios / Quads
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
dWrap.appendChild(
createMuscleDetailBlock(zoneName, mcb.value, gid, i+j)
);
} else if (!mcb.checked && ex) {
ex.classList.remove("show");
setTimeout(() => ex.remove(), 250);
}
});
});

// 2) HANCHE : Flex / Abd / Add avec groupes
} else if (zoneName === "Hanche" && ["Adduction/Abduction", "Flexion/Extension"].includes(mb.value)) {
// On propose 3 groupes : Fléchisseurs / Abducteurs / Adducteurs
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
dWrap.appendChild(
createMuscleDetailBlock(zoneName, mcb.value, gid, i+j)
);
} else if (!mcb.checked && ex) {
ex.classList.remove("show");
setTimeout(() => ex.remove(), 250);
}
});
});

// 3) CHEVILLE : Flexion plantaire (Gastro/Soléaire), Inversion/Éversion, Intrinsèques
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
dWrap.appendChild(
createMuscleDetailBlock(zoneName, mcb.value, gid, i+j)
);
} else if (!mcb.checked && ex) {
ex.classList.remove("show");
setTimeout(() => ex.remove(), 250);
}
});
});
} else if (mb.value.includes("Éversion/Inversion")) {
// on traite comme un "groupe" unique inverseurs/éverseurs
const gid = `${mid}-inv-ev`;
block.innerHTML = `
<h5>${mb.value}</h5>
<div class="inv-ev-details"></div>
`;
const dWrap = block.querySelector(".inv-ev-details");
dWrap.appendChild(createMuscleDetailBlock(zoneName, "Inverseurs/Éverseurs", gid, i));
} else if (mb.value.includes("Intrinsèques")) {
const gid = `${mid}-intrinseques`;
block.innerHTML = `<h5>Intrinsèques du pied</h5><div class="foot-intr-details"></div>`;
const dWrap = block.querySelector(".foot-intr-details");
dWrap.appendChild(createMuscleDetailBlock(zoneName, "Intrinsèques du pied", gid, i));
}

// 4) ÉPAULE : ASH test (positions)
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

// 5) Autres articulations (mouvement “simple”)
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

// “Autre” -> précisez
wrap.querySelectorAll(".checkbox-group").forEach(g => makeOtherReactive(g));
// Isocinétisme : vitesses & modes
attachIsokineticHandlers(wrap);

return wrap;
}

// ===== MOBILITÉ (hiérarchie : mouvement -> outils -> critères)
function createMobilityBlock(zoneName, id, delayIndex) {
const div = document.createElement("div");
div.id = id;
div.className = "slide stagger";
div.style.animationDelay = `${delayIndex * 0.1}s`;

const moves = [];
moves.push("Flexion/Extension");
if (!["Genou","Cheville / Pied","Coude","Poignet / Main"].includes(zoneName)) moves.push("Rotations");
if (["Épaule","Hanche"].includes(zoneName)) moves.push("Adduction/Abduction");
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

const crits = (zoneName === "Rachis lombaire") ? criteriaMobilityLumbar : criteriaMobilityGeneric;

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

// ===== VALIDATION stricte
submitBtn.addEventListener("click", (e) => {
e.preventDefault();
resultMessage.textContent = "";
resultMessage.style.color = "red";

const role = document.querySelector("input[name='role']:checked");
const structure = document.querySelector("input[name='structure']:checked");
if (!role || !structure) {
resultMessage.textContent = "⚠️ Merci de compléter les informations générales.";
return;
}

const selectedZonesRaw = [...zonesCheckboxes].filter(z => z.checked);
if (selectedZonesRaw.length === 0) {
resultMessage.textContent = "⚠️ Merci de sélectionner au moins une zone anatomique.";
return;
}

// Construire l’ensemble des zones “logiques” (fusion tête/rachis)
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

// Fréquences ou types au minimum
const hasFreq = !!sec.querySelector(".moment input:checked");
const hasType = !!sec.querySelector(".types input:checked");
if (!hasFreq && !hasType) return true;

// Autre fréquence → préciser
const of = sec.querySelector(".moment input[value='Autre fréquence']:checked");
if (of) {
const txt = sec.querySelector(".moment .other-input");
if (!txt || !txt.value.trim()) return true;
}

// Si Force cochée → au moins un mouvement, et si mouvement → au moins un outil, params, critères
const forceChecked = sec.querySelector(".types input[value='Force']:checked");
if (forceChecked) {
const mArea = sec.querySelector(".force-moves");
if (!mArea || !mArea.querySelector("input:checked")) return true;

// vérifier “Autre” partout + isokinétisme autre vitesse précisée
if (hasUncheckedOther(sec)) return true;

const isoOther = sec.querySelector(".isokinetic-sub .iso-speed input[value*='Autre']:checked");
if (isoOther) {
const txt = sec.querySelector(".isokinetic-sub .iso-speed .other-input");
if (!txt || !txt.value.trim()) return true;
}
}

// Si Mobilité cochée → au moins un mouvement + outils + critères
const mobChecked = sec.querySelector(".types input[value='Mobilité']:checked");
if (mobChecked) {
const mArea = sec.querySelector(".mob-moves");
if (!mArea || !mArea.querySelector("input:checked")) return true;
if (hasUncheckedOther(sec)) return true;
}

// Questionnaires → si “Autre” coché → préciser
if (hasUncheckedOther(sec)) return true;

// Autres données → champ obligatoire
const otherData = sec.querySelector(".types input[value='Autres données']:checked");
if (otherData) {
const txt = sec.querySelector(".other-input");
if (!txt || !txt.value.trim()) return true;
}

return false;
});

if (zonesIncomplete) {
resultMessage.textContent = "⚠️ Merci de compléter toutes les sous-sections (mouvements, outils, tests, paramètres, critères, précisions…).";
return;
}

// Globaux (Sauts / Course) : “Autre” doit être précisé si coché
for (const g of [globalJumps, globalCourse]) {
if (!g || !g.dataset.ready) continue;
if (hasUncheckedOther(g)) {
resultMessage.textContent = "⚠️ Merci de préciser les champs 'Autre' dans les sections globales.";
return;
}
}

resultMessage.style.color = "#0074d9";
resultMessage.textContent = "✅ Merci ! Vos réponses sont prêtes à être envoyées (liaison Google Form possible).";
window.scrollTo({ top: 0, behavior: "smooth" });
});

});
