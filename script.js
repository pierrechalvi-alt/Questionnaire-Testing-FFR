// ------------------------------
// script.js – Version avancée (v3)
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {

// --- Sélecteurs principaux
const zonesCheckboxes = document.querySelectorAll("#zones input[type='checkbox']");
const zoneQuestionsContainer = document.getElementById("zoneQuestions");
const submitBtn = document.getElementById("submitBtn");
const resultMessage = document.getElementById("resultMessage");

// --- Groupes de zones
const lowerBodyZones = ["Hanche", "Genou", "Cheville / Pied"];
const upperBodyZones = ["Épaule", "Coude", "Poignet / Main"];
const specialZones = ["Tête / Rachis cervical", "Rachis lombaire"];

// --- Sections globales (affichées une seule fois si besoin)
const globalLower = document.getElementById("global-lower"); // Tests fonctionnels globaux MI
const globalUpper = document.getElementById("global-upper"); // Tests fonctionnels globaux MS
const globalJumps = document.getElementById("global-jumps"); // Sauts (unique)
// Course globale (unique)
const globalCourse = document.createElement("div");
globalCourse.id = "global-course";
globalCourse.className = "subcard";
globalCourse.style.display = "none";
globalCourse.dataset.ready = "";

// Insère la section Course globale sous les autres (ordre logique)
zoneQuestionsContainer.parentElement.appendChild(globalCourse);

// --- Progress bar
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");
const formSections = document.querySelectorAll(".card");
function updateProgress() {
const filled = [...formSections].filter(sec => sec.querySelector("input:checked")).length;
const total = formSections.length;
const percent = Math.min(100, Math.round((filled / total) * 100));
progressBar.style.width = percent + "%";
progressText.textContent = `Progression : ${percent}%`;
}
document.addEventListener("change", updateProgress);

// ---------------------------------------------------------
// Dictionnaires / données
// ---------------------------------------------------------

// Outils génériques
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

// Paramètres (force)
const paramsForce = [
"Force max",
"Force moyenne",
"Force relative (N/kg)",
"RFD",
"Angle du pic de force",
"Endurance"
];
// Critères communs force
const criteriaForce = [
"Ratio agoniste/antagoniste",
"Ratio droite/gauche",
"Valeur seuil"
];
// Critères mobilité (lombaire: pas droite/gauche)
const criteriaMobilityGeneric = [
"Comparaison droite/gauche",
"Valeur seuil"
];
const criteriaMobilityLumbar = [
"Moyenne du groupe",
"Valeur seuil"
];

// Proprio par zone
const proprioByZone = {
"Cheville / Pied": ["Y-Balance Test", "Star Excursion", "Single Leg Balance Test"],
"Genou": ["Y-Balance Test", "Star Excursion", "FMS (Lower)"],
"Hanche": ["Y-Balance Test", "Star Excursion", "FMS (Lower)"],
"Épaule": ["Y-Balance Test (épaule)", "FMS (Upper)"],
"Tête / Rachis cervical": ["Test proprio cervical (laser)"],
"Poignet / Main": [],
"Coude": [],
"Rachis lombaire": ["FMS (Core)"]
};

// Questionnaires par zone (littérature – liste élargie)
const questionnairesByZone = {
"Genou": [
"KOOS", "IKDC", "Lysholm", "Tegner", "ACL-RSI", "KOS-ADLS", "LEFS"
],
"Hanche": [
"HAGOS", "iHOT-12", "Harris Hip Score", "Hip Outcome Score (HOS)", "FAAM-Sport"
],
"Épaule": [
"QuickDASH", "DASH", "SIRSI", "ASES", "SPADI", "Oxford Shoulder Score"
],
"Coude": [
"Oxford Elbow Score", "DASH", "QuickDASH", "Mayo Elbow Performance Score"
],
"Poignet / Main": [
"PRWE", "DASH", "QuickDASH", "Boston Carpal Tunnel Questionnaire"
],
"Cheville / Pied": [
"CAIT", "FAAM-ADL", "FAAM-Sport", "FAOS"
],
"Rachis lombaire": [
"ODI (Oswestry)", "Roland-Morris", "Quebec Back Pain"
],
"Tête / Rachis cervical": [
"SCAT6", "Neck Disability Index (NDI)", "Copenhagen Neck Functional Scale"
]
};

// Sous-options Isocinétisme
const isokineticSpeeds = ["30°/s", "60°/s", "120°/s", "180°/s", "Autre (précisez)"];
const isokineticModes = ["Concentrique", "Excentrique", "Isométrique", "Combiné"];

// ---------------------------------------------------------
// Helpers UI
// ---------------------------------------------------------
function slug(s) {
return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")
.replace(/[^a-z0-9]+/g,"-");
}
function cssEscape(id) {
return id.replace(/([ #;?%&,.+*~\':"!^$[\]()=>|/@])/g,'\\$1');
}
function addOtherField(container, checkbox, placeholder = "Précisez") {
// Ajoute un champ texte obligatoire quand "Autre" est coché
const id = checkbox.value ? slug(checkbox.value) : "autre";
let other = container.querySelector(`.other-${id}`);
if (checkbox.checked) {
if (!other) {
other = document.createElement("div");
other.className = `slide show other-${id}`;
other.innerHTML = `
<input type="text" class="other-input" placeholder="${placeholder}" required
style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;">
`;
container.appendChild(other);
}
} else if (other) {
other.classList.remove("show");
setTimeout(() => other.remove(), 300);
}
}
function addIsokineticSub(sectionEl) {
// Ajoute sous-questions pour isocinétisme si case cochée
const toolsGroup = sectionEl.querySelector(".tools-group");
if (!toolsGroup) return;
const isoBox = toolsGroup.querySelector("input[type='checkbox'][value='Isocinétisme']");
if (!isoBox) return;

const ensureBlock = () => {
let sub = sectionEl.querySelector(".isokinetic-sub");
if (isoBox.checked) {
if (!sub) {
sub = document.createElement("div");
sub.className = "slide show isokinetic-sub";
sub.innerHTML = `
<label>Vitesse (isocinétisme)</label>
<div class="checkbox-group iso-speed">
${isokineticSpeeds.map(v => `
<label><input type="checkbox" value="${v}"> ${v}</label>`).join("")}
</div>
<label>Mode de contraction (isocinétisme)</label>
<div class="checkbox-group iso-mode">
${isokineticModes.map(m => `
<label><input type="checkbox" value="${m}"> ${m}</label>`).join("")}
</div>
`;
toolsGroup.insertAdjacentElement("afterend", sub);

// "Autre (précisez)" obligatoire si coché
const otherSpeed = sub.querySelector(".iso-speed label:last-child input");
otherSpeed.addEventListener("change", () => {
addOtherField(sub.querySelector(".iso-speed"), otherSpeed, "Vitesse (précisez)");
});
}
} else if (sub) {
sub.classList.remove("show");
setTimeout(() => sub.remove(), 300);
}
};
isoBox.addEventListener("change", ensureBlock);
ensureBlock();
}
function makeOtherReactive(groupEl, placeholder = "Précisez") {
const other = [...groupEl.querySelectorAll("input[type='checkbox'],input[type='radio']")]
.find(i => i.value.toLowerCase().includes("autre"));
if (!other) return;
other.addEventListener("change", () => addOtherField(groupEl, other, placeholder));
}
function addFrequencyOther(sectionEl) {
const freqGroup = sectionEl.querySelector(".moment");
if (!freqGroup) return;
const other = freqGroup.querySelector("input[type='checkbox'][value='Autre fréquence']");
if (!other) return;
other.addEventListener("change", () => {
addOtherField(freqGroup, other, "Fréquence (précisez)");
});
}

// ---------------------------------------------------------
// Gestion des zones cochées/décochées
// ---------------------------------------------------------
zonesCheckboxes.forEach(zone => {
zone.addEventListener("change", () => {
const zoneName = zone.value;
if (zone.checked) {
createZoneSection(zoneName);
} else {
removeZoneSection(zoneName);
}
toggleGlobalSections(); // MI/MS/Sauts/Course uniques
});
});

function toggleGlobalSections() {
const selected = [...zonesCheckboxes].filter(z => z.checked).map(z => z.value);
const hasLower = selected.some(z => lowerBodyZones.includes(z));
const hasUpper = selected.some(z => upperBodyZones.includes(z));
const hasHeadNeck = selected.includes("Tête / Rachis cervical");

// --- Tests fonctionnels MI (question explicite)
if (hasLower) {
if (!globalLower.dataset.ready) {
globalLower.dataset.ready = "1";
globalLower.style.display = "";
globalLower.classList.add("fade-in","active");
globalLower.innerHTML = `
<h3>Tests fonctionnels globaux – Membres inférieurs</h3>
<div class="checkbox-group types">
<label><input type="checkbox" value="Tests fonctionnels MI" class="toggle-mi"> Testez-vous des mouvements globaux / fonctionnels du membre inférieur ?</label>
</div>
<div class="subquestions"></div>
`;
const sub = globalLower.querySelector(".subquestions");
const cb = globalLower.querySelector(".toggle-mi");
cb.addEventListener("change", () => {
const id = "sub-global-mi";
const existing = sub.querySelector(`#${id}`);
if (cb.checked && !existing) {
const block = document.createElement("div");
block.id = id;
block.classList.add("slide","stagger","show");
block.innerHTML = `
<label>Quels tests fonctionnels (MI) ?</label>
<div class="checkbox-group mi-tests">
<label><input type="checkbox" value="Squat"> Squat</label>
<label><input type="checkbox" value="Montée sur banc"> Montée sur banc</label>
<label><input type="checkbox" value="Soulevé de terre"> Soulevé de terre</label>
<label><input type="checkbox" value="Autre"> Autre</label>
</div>

<label>Outils</label>
<div class="checkbox-group mi-tools">
<label><input type="checkbox" value="Encodeur linéaire"> Encodeur linéaire</label>
<label><input type="checkbox" value="Plateforme de force"> Plateforme de force</label>
<label><input type="checkbox" value="Sans outil"> Sans outil</label>
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
`;
sub.appendChild(block);
makeOtherReactive(block.querySelector(".mi-tests"));
makeOtherReactive(block.querySelector(".mi-tools"));
} else if (!cb.checked && existing) {
existing.classList.remove("show");
setTimeout(() => existing.remove(), 400);
}
});
}
} else {
globalLower.style.display = "none";
globalLower.innerHTML = "";
delete globalLower.dataset.ready;
}

// --- Tests fonctionnels MS (question explicite)
if (hasUpper) {
if (!globalUpper.dataset.ready) {
globalUpper.dataset.ready = "1";
globalUpper.style.display = "";
globalUpper.classList.add("fade-in","active");
globalUpper.innerHTML = `
<h3>Tests fonctionnels globaux – Membres supérieurs</h3>
<div class="checkbox-group types">
<label><input type="checkbox" value="Tests fonctionnels MS" class="toggle-ms"> Testez-vous des mouvements globaux / fonctionnels du membre supérieur ?</label>
</div>
<div class="subquestions"></div>
`;
const sub = globalUpper.querySelector(".subquestions");
const cb = globalUpper.querySelector(".toggle-ms");
cb.addEventListener("change", () => {
const id = "sub-global-ms";
const existing = sub.querySelector(`#${id}`);
if (cb.checked && !existing) {
const block = document.createElement("div");
block.id = id;
block.classList.add("slide","stagger","show");
block.innerHTML = `
<label>Quels tests fonctionnels (MS) ?</label>
<div class="checkbox-group ms-tests">
<label><input type="checkbox" value="Développé couché"> Développé couché</label>
<label><input type="checkbox" value="Traction"> Traction</label>
<label><input type="checkbox" value="Tirage"> Tirage</label>
<label><input type="checkbox" value="Test de gripp"> Test de gripp</label>
<label><input type="checkbox" value="Autre"> Autre</label>
</div>

<label>Outils</label>
<div class="checkbox-group ms-tools">
<label><input type="checkbox" value="Encodeur linéaire"> Encodeur linéaire</label>
<label><input type="checkbox" value="Plateforme de force"> Plateforme de force</label>
<label><input type="checkbox" value="Sans outil"> Sans outil</label>
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
`;
sub.appendChild(block);
makeOtherReactive(block.querySelector(".ms-tests"));
makeOtherReactive(block.querySelector(".ms-tools"));
} else if (!cb.checked && existing) {
existing.classList.remove("show");
setTimeout(() => existing.remove(), 400);
}
});
}
} else {
globalUpper.style.display = "none";
globalUpper.innerHTML = "";
delete globalUpper.dataset.ready;
}

// --- Sauts (unique) si au moins une zone MI cochée
if (hasLower) {
if (!globalJumps.dataset.ready) {
globalJumps.dataset.ready = "1";
globalJumps.style.display = "";
globalJumps.classList.add("fade-in","active");
globalJumps.innerHTML = `
<h3>Tests de sauts (affichés une seule fois)</h3>
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
makeOtherReactive(globalJumps.querySelector(".checkbox-group")); // tests
makeOtherReactive(globalJumps.querySelector(".jump-tools")); // outils
}
} else {
globalJumps.style.display = "none";
globalJumps.innerHTML = "";
delete globalJumps.dataset.ready;
}

// --- Course (unique) si MI cochée OU Tête/Rachis coché
if (hasLower || hasHeadNeck) {
if (!globalCourse.dataset.ready) {
globalCourse.dataset.ready = "1";
globalCourse.style.display = "";
globalCourse.classList.add("fade-in","active");
globalCourse.innerHTML = `
<h3>Tests de course (affichés une seule fois)</h3>
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
makeOtherReactive(globalCourse.querySelector(".checkbox-group")); // tests
makeOtherReactive(globalCourse.querySelector(".course-tools")); // outils
}
} else {
globalCourse.style.display = "none";
globalCourse.innerHTML = "";
delete globalCourse.dataset.ready;
}
}

// ---------------------------------------------------------
// Création / suppression section par zone
// ---------------------------------------------------------
function createZoneSection(zoneName) {
const section = document.createElement("div");
section.classList.add("subcard", "fade-in");
section.id = `section-${zoneName.replace(/\s+/g, "-")}`;
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
${zoneName === "Tête / Rachis cervical" ? `
<label><input type="checkbox" value="Questionnaires"> Questionnaires</label>
<label><input type="checkbox" value="Test de cognition"> Test de cognition</label>
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

// Fréquence → champ "précisez" si "Autre fréquence"
addFrequencyOther(section);

const typeCheckboxes = section.querySelectorAll(".types input[type='checkbox']");
const subQContainer = section.querySelector(".subquestions");

typeCheckboxes.forEach((cb, i) => {
cb.addEventListener("change", () => {
const id = `sub-${zoneName}-${cb.value}`;
const existing = subQContainer.querySelector(`#${cssEscape(id)}`);

if (cb.checked) {
let subSection;
if (zoneName === "Tête / Rachis cervical") {
if (cb.value === "Test de cognition") {
subSection = document.createElement("div");
subSection.id = id;
subSection.classList.add("slide","stagger");
subSection.style.animationDelay = `${i * 0.1}s`;
subSection.innerHTML = `
<h4>Test de cognition – ${zoneName}</h4>
<div class="checkbox-group">
<label><input type="checkbox" value="Test oculaire"> Test oculaire</label>
<label><input type="checkbox" value="Test vestibulaire"> Test vestibulaire</label>
<label><input type="checkbox" value="Autre"> Autre</label>
</div>
`;
makeOtherReactive(subSection.querySelector(".checkbox-group"));
} else if (cb.value === "Autres données") {
subSection = document.createElement("div");
subSection.id = id;
subSection.classList.add("slide","stagger");
subSection.style.animationDelay = `${i * 0.1}s`;
subSection.innerHTML = `
<h4>Autres données – ${zoneName}</h4>
<input type="text" class="other-input" placeholder="Précisez la donnée collectée" required
style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;">
`;
} else if (cb.value === "Questionnaires") {
subSection = createQuestionnaireBlock(zoneName, id, i);
}
} else {
// Autres zones
if (cb.value === "Proprioception / Équilibre") {
subSection = createProprioBlock(zoneName, id, i);
} else if (cb.value === "Mobilité") {
subSection = createMobilityBlock(zoneName, id, i);
} else if (cb.value === "Force") {
subSection = createForceBlock(zoneName, id, i);
} else if (cb.value === "Questionnaires") {
subSection = createQuestionnaireBlock(zoneName, id, i);
} else if (cb.value === "Autres données") {
subSection = document.createElement("div");
subSection.id = id;
subSection.classList.add("slide","stagger");
subSection.style.animationDelay = `${i * 0.1}s`;
subSection.innerHTML = `
<h4>Autres données – ${zoneName}</h4>
<input type="text" class="other-input" placeholder="Précisez la donnée collectée" required
style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;">
`;
}
}

if (subSection) {
subQContainer.appendChild(subSection);
section.classList.add("active");
setTimeout(() => subSection.classList.add("show"), 10);
}
} else if (existing) {
existing.classList.remove("show");
setTimeout(() => {
existing.remove();
const stillChecked = section.querySelectorAll(".types input:checked").length > 0;
if (!stillChecked) section.classList.remove("active");
}, 400);
}
});
});
}

function removeZoneSection(zoneName) {
const section = document.getElementById(`section-${zoneName.replace(/\s+/g, "-")}`);
if (section) section.remove();
}

// ---------------------------------------------------------
// BLOCS SPÉCIFIQUES
// ---------------------------------------------------------

// Questionnaires – par zone (liste exhaustive + "Autre")
function createQuestionnaireBlock(zoneName, id, delayIndex) {
const div = document.createElement("div");
div.id = id;
div.classList.add("slide","stagger");
div.style.animationDelay = `${delayIndex * 0.1}s`;

const qList = questionnairesByZone[zoneName] || ["Autre"];
div.innerHTML = `
<h4>Questionnaires – ${zoneName}</h4>
<div class="checkbox-group q-list">
${qList.map(q => `<label><input type="checkbox" value="${q}"> ${q}</label>`).join("")}
<label><input type="checkbox" value="Autre"> Autre</label>
</div>
`;
makeOtherReactive(div.querySelector(".q-list"), "Nom du questionnaire");
return div;
}

// Force : mouvements → pour chaque mouvement : outils (+ isocinétisme), paramètres, critères
function createForceBlock(zoneName, id, delayIndex) {
const div = document.createElement("div");
div.id = id;
div.classList.add("slide","stagger");
div.style.animationDelay = `${delayIndex * 0.1}s`;

// Mouvements par zone
const moves = [];
// génériques
moves.push("Flexion/Extension");
if (["Tête / Rachis cervical","Poignet / Main","Rachis lombaire"].includes(zoneName)) moves.push("Inclinaisons");
if (!["Genou","Cheville / Pied","Coude","Poignet / Main"].includes(zoneName)) moves.push("Rotations");
if (["Épaule","Hanche"].includes(zoneName)) moves.push("Adduction/Abduction");
if (zoneName === "Cheville / Pied") {
moves.push("Éversion/Inversion");
moves.push("Flexion plantaire – Gastrocnémien");
moves.push("Flexion plantaire – Soléaire");
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

// Quand on coche un mouvement → afficher détail
const details = div.querySelector(".force-moves-details");
const moveBoxes = div.querySelectorAll(".force-moves input[type='checkbox']");
moveBoxes.forEach((mb, i) => {
mb.addEventListener("change", () => {
const mid = `${id}-move-${slug(mb.value)}`;
const existing = details.querySelector(`#${cssEscape(mid)}`);

if (mb.checked) {
const block = document.createElement("div");
block.id = mid;
block.classList.add("slide","stagger","show");
block.style.animationDelay = `${i * 0.05}s`;

// Outils de base
let tools = [...toolsForceGeneric];

// Rachis lombaire : Flex/Ext → Shirado / Sorensen
if (zoneName === "Rachis lombaire" && mb.value.includes("Flexion/Extension")) {
tools = [...tools, "Test de Shirado", "Test de Sorensen"];
}

// Genou – Flex/Ext : bloc tests ischios/quads + outils spécifiques
let kneeExtraHTML = "";
if (zoneName === "Genou" && mb.value === "Flexion/Extension") {
kneeExtraHTML = `
<div class="slide show">
<h5 style="margin-top:10px">Sous-tests – Ischiojambiers</h5>
<div class="checkbox-group knee-hams">
<label><input type="checkbox" value="McCall 90°"> McCall 90°</label>
<label><input type="checkbox" value="Isométrie 30°"> Isométrie 30°</label>
<label><input type="checkbox" value="Nordic"> Nordic</label>
<label><input type="checkbox" value="Autre"> Autre</label>
</div>
<label>Outils (ischiojambiers)</label>
<div class="checkbox-group knee-hams-tools tools-group">
<label><input type="checkbox" value="NordBord"> NordBord</label>
<label><input type="checkbox" value="Plateforme de force"> Plateforme de force</label>
<label><input type="checkbox" value="Dynamomètre fixe"> Dynamomètre fixe</label>
<label><input type="checkbox" value="Dynamomètre manuel"> Dynamomètre manuel</label>
<label><input type="checkbox" value="Isocinétisme"> Isocinétisme</label>
<label><input type="checkbox" value="Autre"> Autre</label>
</div>

<h5 style="margin-top:10px">Sous-tests – Quadriceps</h5>
<div class="checkbox-group knee-quads">
<label><input type="checkbox" value="Isométrie 60°"> Isométrie 60°</label>
<label><input type="checkbox" value="Isocinétisme quadriceps"> Isocinétisme</label>
<label><input type="checkbox" value="Autre"> Autre</label>
</div>
<label>Outils (quadriceps)</label>
<div class="checkbox-group knee-quads-tools tools-group">
<label><input type="checkbox" value="Dynamomètre fixe"> Dynamomètre fixe</label>
<label><input type="checkbox" value="Dynamomètre manuel"> Dynamomètre manuel</label>
<label><input type="checkbox" value="Plateforme de force"> Plateforme de force</label>
<label><input type="checkbox" value="Isocinétisme"> Isocinétisme</label>
<label><input type="checkbox" value="Autre"> Autre</label>
</div>
</div>
`;
}

// Épaule : ASH Test → positions
let ashHTML = "";
if (zoneName === "Épaule" && mb.value === "ASH Test") {
ashHTML = `
<label>Dans quelle(s) position(s) évaluez-vous l'ASH test ?</label>
<div class="checkbox-group">
<label><input type="checkbox" value="I (180°)"> I (180°)</label>
<label><input type="checkbox" value="Y (135°)"> Y (135°)</label>
<label><input type="checkbox" value="T (90°)"> T (90°)</label>
<label><input type="checkbox" value="I (0°)"> I (0°)</label>
</div>
`;
}

// HTML du bloc "mouvement"
block.innerHTML = `
<h5 style="margin-top:10px">${mb.value}</h5>
${kneeExtraHTML}

<label>Outils utilisés</label>
<div class="checkbox-group tools-group">
${tools.map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
</div>

${ashHTML}

<label>Paramètres étudiés</label>
<div class="checkbox-group">
${paramsForce.map(p => `<label><input type="checkbox" value="${p}"> ${p}</label>`).join("")}
</div>

<label>Critères d’évaluation</label>
<div class="checkbox-group">
${criteriaForce.map(c => `<label><input type="checkbox" value="${c}"> ${c}</label>`).join("")}
</div>
`;
details.appendChild(block);

// Réactivité "Autre"
const groups = block.querySelectorAll(".checkbox-group");
groups.forEach(g => makeOtherReactive(g));

// Sous-questions isokinétisme
addIsokineticSub(block);
// Pour genou ischio/quads
const hTools = block.querySelector(".knee-hams-tools");
const qTools = block.querySelector(".knee-quads-tools");
if (hTools) { makeOtherReactive(hTools); addIsokineticSub(block.querySelector(".knee-hams-tools").closest(".slide")); }
if (qTools) { makeOtherReactive(qTools); addIsokineticSub(block.querySelector(".knee-quads-tools").closest(".slide")); }

} else if (existing) {
existing.classList.remove("show");
setTimeout(() => existing.remove(), 400);
}
});
});

return div;
}

// Mobilité : mouvements → outils (KTW / Sit-and-reach) → critères
function createMobilityBlock(zoneName, id, delayIndex) {
const div = document.createElement("div");
div.id = id;
div.classList.add("slide","stagger");
div.style.animationDelay = `${delayIndex * 0.1}s`;

// Mouvements par zone
const moves = [];
moves.push("Flexion/Extension");
if (["Tête / Rachis cervical","Poignet / Main","Rachis lombaire"].includes(zoneName)) moves.push("Inclinaisons");
if (!["Genou","Cheville / Pied","Coude","Poignet / Main"].includes(zoneName)) moves.push("Rotations");
if (["Épaule","Hanche"].includes(zoneName)) moves.push("Adduction/Abduction");
if (zoneName === "Cheville / Pied") moves.push("Éversion/Inversion");

div.innerHTML = `
<h4>Mobilité – ${zoneName}</h4>
<label>Quels mouvements évaluez-vous en mobilité ?</label>
<div class="checkbox-group mob-moves">
${moves.map(m => `<label><input type="checkbox" value="${m}"> ${m}</label>`).join("")}
</div>
<div class="mob-moves-details"></div>
`;

const details = div.querySelector(".mob-moves-details");
const moveBoxes = div.querySelectorAll(".mob-moves input[type='checkbox']");

moveBoxes.forEach((mb, i) => {
mb.addEventListener("change", () => {
const mid = `${id}-move-${slug(mb.value)}`;
const existing = details.querySelector(`#${cssEscape(mid)}`);

if (mb.checked) {
const block = document.createElement("div");
block.id = mid;
block.classList.add("slide","stagger","show");
block.style.animationDelay = `${i * 0.05}s`;

// Outils spécifiques additionnels
let tools = [...toolsMobilityGeneric];

// Sit-and-reach (genou extension / lombaire)
if ((zoneName === "Genou" && mb.value === "Flexion/Extension") || zoneName === "Rachis lombaire") {
tools = [...tools, "Sit-and-reach"];
}
// KTW (cheville dorsiflexion) – on l’inclut dès qu’on parle de cheville + flexion
if (zoneName === "Cheville / Pied" && mb.value.toLowerCase().includes("flexion")) {
tools = [...tools, "Knee-to-wall (KTW)"];
}

// Critères – lombaire spécifique
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

// Réactivité "Autre"
const groups = block.querySelectorAll(".checkbox-group");
groups.forEach(g => makeOtherReactive(g));

} else if (existing) {
existing.classList.remove("show");
setTimeout(() => existing.remove(), 400);
}
});
});

return div;
}

// Proprio / Équilibre
function createProprioBlock(zoneName, id, delayIndex) {
const div = document.createElement("div");
div.id = id;
div.classList.add("slide","stagger");
div.style.animationDelay = `${delayIndex * 0.1}s`;

const tests = proprioByZone[zoneName] || [];

div.innerHTML = `
<h4>Proprioception / Équilibre – ${zoneName}</h4>
<label>Quels tests utilisez-vous ?</label>
<div class="checkbox-group proprio-tests">
${tests.map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
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

// ---------------------------------------------------------
// VALIDATION stricte avant envoi (sans encore lier à Google Form)
// ---------------------------------------------------------
submitBtn.addEventListener("click", (e) => {
e.preventDefault();
resultMessage.textContent = "";
resultMessage.style.color = "red";

const role = document.querySelector("input[name='role']:checked");
const structure = document.querySelector("input[name='structure']:checked");
const selectedZones = [...zonesCheckboxes].filter(z => z.checked);

if (!role || !structure) {
resultMessage.textContent = "⚠️ Merci de compléter les informations générales.";
return;
}
if (selectedZones.length === 0) {
resultMessage.textContent = "⚠️ Merci de sélectionner au moins une zone anatomique.";
return;
}

// Vérifie sections de chaque zone
const zonesIncomplete = selectedZones.some(z => {
const sec = document.getElementById(`section-${z.value.replace(/\s+/g, "-")}`);
if (!sec) return true;

// Au moins un choix dans cette section
if (!sec.querySelector(".types input:checked") && !sec.querySelector(".moment input:checked")) return true;

// "Autre fréquence" -> champ précisez non vide
const of = sec.querySelector(".moment input[value='Autre fréquence']:checked");
if (of) {
const txt = sec.querySelector(".moment .other-input");
if (!txt || !txt.value.trim()) return true;
}

// Force/Mobilité cochés -> au moins un mouvement
const forceChecked = sec.querySelector(".types input[value='Force']:checked");
if (forceChecked) {
const movementArea = sec.querySelector(".force-moves");
if (!movementArea || !movementArea.querySelector("input:checked")) return true;
// Si isocinétisme coché dans un bloc, vitesses/modes (si présents) doivent être renseignés si "Autre" coché
const isoOther = sec.querySelector(".isokinetic-sub .iso-speed input[value*='Autre']:checked");
if (isoOther) {
const txt = sec.querySelector(".isokinetic-sub .iso-speed .other-input");
if (!txt || !txt.value.trim()) return true;
}
}
const mobChecked = sec.querySelector(".types input[value='Mobilité']:checked");
if (mobChecked) {
const movementArea = sec.querySelector(".mob-moves");
if (!movementArea || !movementArea.querySelector("input:checked")) return true;
}

// "Autres données" -> champ texte obligatoire
const otherData = [...sec.querySelectorAll(".types input[value='Autres données']:checked")];
for (const _ of otherData) {
const txt = sec.querySelector("input.other-input");
if (!txt || !txt.value.trim()) return true;
}

// Si "Autre" coché quelque part → son champ "Précisez" doit être rempli
const allOtherChecked = sec.querySelectorAll("input[type='checkbox'][value='Autre']:checked, input[type='checkbox'][value='Autres']:checked");
for (const oc of allOtherChecked) {
const group = oc.closest(".checkbox-group");
const txt = group && group.querySelector(".other-input");
if (txt && !txt.value.trim()) return true;
}

return false;
});
if (zonesIncomplete) {
resultMessage.textContent = "⚠️ Merci de compléter toutes les sous-sections (mouvements, outils, paramètres, critères, précisions…).";
return;
}

// Global jumps/course/func → si "Autre" coché, exiger précision
const globals = [globalLower, globalUpper, globalJumps, globalCourse];
for (const g of globals) {
if (!g || !g.dataset.ready) continue;
const allOtherChecked = g.querySelectorAll("input[type='checkbox'][value='Autre']:checked, input[type='checkbox'][value='Autres']:checked");
for (const oc of allOtherChecked) {
const group = oc.closest(".checkbox-group");
const txt = group && group.querySelector(".other-input");
if (txt && !txt.value.trim()) {
resultMessage.textContent = "⚠️ Merci de préciser les champs 'Autre' sélectionnés.";
return;
}
}
}

resultMessage.style.color = "#0074d9";
resultMessage.textContent = "✅ Merci ! Vos réponses sont prêtes à être envoyées (liaison Google Form possible).";
window.scrollTo({ top: 0, behavior: "smooth" });
});

});
