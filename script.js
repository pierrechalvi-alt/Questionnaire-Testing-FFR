// ------------------------------
// script.js – Version avancée (toutes demandes intégrées)
// ------------------------------

document.addEventListener("DOMContentLoaded", () => {

// --- Sélecteurs principaux
const zonesCheckboxes = document.querySelectorAll("#zones input[type='checkbox']");
const zoneQuestionsContainer = document.getElementById("zoneQuestions");
const submitBtn = document.getElementById("submitBtn");
const resultMessage = document.getElementById("resultMessage");

// --- Groupes
const lowerBodyZones = ["Hanche", "Genou", "Cheville / Pied"];
const upperBodyZones = ["Épaule", "Coude", "Poignet / Main"];
const specialZones = ["Tête / Rachis cervical", "Rachis lombaire"];

// --- Global one-time sections
const globalLower = document.getElementById("global-lower"); // Tests fonctionnels globaux MI
const globalUpper = document.getElementById("global-upper"); // Tests fonctionnels globaux MS
const globalJumps = document.getElementById("global-jumps"); // Sauts (unique)

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
// Dictionnaires de mouvements et d’options par zone
// ---------------------------------------------------------

// Mouvements génériques (seront filtrés par zone)
const movementBase = {
"Flexion/Extension": true,
"Inclinaisons": true, // cervical, poignet/main, lombaire
"Rotations": true, // pas pour genou, cheville/pied, coude, poignet/main
"Adduction/Abduction": true, // épaule, hanche
"Éversion/Inversion": true // cheville/pied
};

// Outils génériques
const toolsForceGeneric = [
"Dynamomètre manuel",
"Dynamomètre fixe",
"Isocinétisme (préciser vitesse et mode)",
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

// Critères mobilité
const criteriaMobility = [
"Comparaison droite/gauche",
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
toggleGlobalSections(); // MI/MS/Sauts uniques
});
});

function toggleGlobalSections() {
const selected = [...zonesCheckboxes].filter(z => z.checked).map(z => z.value);
const hasLower = selected.some(z => lowerBodyZones.includes(z));
const hasUpper = selected.some(z => upperBodyZones.includes(z));

// Global MI – Tests fonctionnels
if (hasLower) {
if (!globalLower.dataset.ready) {
globalLower.dataset.ready = "1";
globalLower.style.display = "";
globalLower.classList.add("fade-in","active");
globalLower.innerHTML = `
<h3>Tests fonctionnels globaux – Membres inférieurs</h3>
<div class="checkbox-group types">
<label><input type="checkbox" value="Tests fonctionnels MI" class="toggle-mi"> Tests fonctionnels globaux</label>
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
<div class="checkbox-group">
<label><input type="checkbox" value="Squat"> Squat</label>
<label><input type="checkbox" value="Montée sur banc"> Montée sur banc</label>
<label><input type="checkbox" value="Soulevé de terre"> Soulevé de terre</label>
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

// Global MS – Tests fonctionnels
if (hasUpper) {
if (!globalUpper.dataset.ready) {
globalUpper.dataset.ready = "1";
globalUpper.style.display = "";
globalUpper.classList.add("fade-in","active");
globalUpper.innerHTML = `
<h3>Tests fonctionnels globaux – Membres supérieurs</h3>
<div class="checkbox-group types">
<label><input type="checkbox" value="Tests fonctionnels MS" class="toggle-ms"> Tests fonctionnels globaux</label>
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
<div class="checkbox-group">
<label><input type="checkbox" value="Développé couché"> Développé couché</label>
<label><input type="checkbox" value="Traction"> Traction</label>
<label><input type="checkbox" value="Tirage"> Tirage</label>
<label><input type="checkbox" value="Test de gripp"> Test de gripp</label>
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

// Sauts (unique) si MI sélectionné
if (hasLower) {
if (!globalJumps.dataset.ready) {
globalJumps.dataset.ready = "1";
globalJumps.style.display = "";
globalJumps.classList.add("fade-in","active");
globalJumps.innerHTML = `
<h3>Tests de sauts (MI – affichés une seule fois)</h3>
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
</div>
<label>Critères d’évaluation</label>
<div class="checkbox-group">
<label><input type="checkbox" value="Comparaison droite/gauche"> Comparaison droite/gauche</label>
<label><input type="checkbox" value="Valeur seuil"> Valeur seuil</label>
</div>
`;
}
} else {
globalJumps.style.display = "none";
globalJumps.innerHTML = "";
delete globalJumps.dataset.ready;
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
${lowerBodyZones.includes(zoneName) ? `
<label><input type="checkbox" value="Course"> Course</label>
` : ``}
<label><input type="checkbox" value="Proprioception / Équilibre"> Proprioception / Équilibre</label>
<label><input type="checkbox" value="Questionnaires"> Questionnaires</label>
<label><input type="checkbox" value="Autres données"> Autres données</label>
`}
</div>

<div class="subquestions"></div>
`;
zoneQuestionsContainer.appendChild(section);

const typeCheckboxes = section.querySelectorAll(".types input[type='checkbox']");
const subQContainer = section.querySelector(".subquestions");

typeCheckboxes.forEach((cb, i) => {
cb.addEventListener("change", () => {
const id = `sub-${zoneName}-${cb.value}`;
const existing = subQContainer.querySelector(`#${cssEscape(id)}`);

if (cb.checked) {
let subSection;
if (zoneName === "Tête / Rachis cervical" && cb.value === "Autres données") {
subSection = document.createElement("div");
subSection.id = id;
subSection.classList.add("slide","stagger");
subSection.style.animationDelay = `${i * 0.1}s`;
subSection.innerHTML = `
<h4>Autres données – ${zoneName}</h4>
<div class="checkbox-group">
<label><input type="checkbox" value="Antécédents médicaux"> Antécédents médicaux</label>
<label><input type="checkbox" value="Test de cognition"> Test de cognition</label>
</div>
<label>Précisions (facultatif)</label>
<input type="text" placeholder="Autre donnée (précisez)" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;">
`;
} else if (cb.value === "Questionnaires" && zoneName === "Tête / Rachis cervical") {
subSection = document.createElement("div");
subSection.id = id;
subSection.classList.add("slide","stagger");
subSection.style.animationDelay = `${i * 0.1}s`;
subSection.innerHTML = `
<h4>Questionnaires – ${zoneName}</h4>
<div class="checkbox-group">
<label><input type="checkbox" value="Bien-être (sommeil, RPE, hydratation, nutrition)"> Bien-être (sommeil, RPE, hydratation, nutrition)</label>
<label><input type="checkbox" value="Autre"> Autre</label>
</div>
`;
} else if (cb.value === "Proprioception / Équilibre") {
subSection = createProprioBlock(zoneName, id, i);
} else if (cb.value === "Course") {
subSection = createCourseBlock(zoneName, id, i);
} else if (cb.value === "Mobilité") {
subSection = createMobilityBlock(zoneName, id, i);
} else if (cb.value === "Force") {
subSection = createForceBlock(zoneName, id, i);
} else {
// Autres données / Questionnaires génériques
subSection = document.createElement("div");
subSection.id = id;
subSection.classList.add("slide","stagger");
subSection.style.animationDelay = `${i * 0.1}s`;
subSection.innerHTML = `
<h4>${cb.value} – ${zoneName}</h4>
<div class="checkbox-group">
<label><input type="checkbox" value="Oui"> Oui</label>
<label><input type="checkbox" value="Non"> Non</label>
<label><input type="checkbox" value="Autre"> Autre</label>
</div>
`;
}

subQContainer.appendChild(subSection);
section.classList.add("active");
setTimeout(() => subSection.classList.add("show"), 10);
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

// Force : génère mouvements → pour chaque mouvement, outils + paramètres + critères
function createForceBlock(zoneName, id, delayIndex) {
const div = document.createElement("div");
div.id = id;
div.classList.add("slide","stagger");
div.style.animationDelay = `${delayIndex * 0.1}s`;

// Mouvements dispo selon zone
const moves = [];
// De base
moves.push("Flexion/Extension");
if (["Tête / Rachis cervical","Poignet / Main","Rachis lombaire"].includes(zoneName)) moves.push("Inclinaisons");
if (!["Genou","Cheville / Pied","Coude","Poignet / Main"].includes(zoneName)) moves.push("Rotations");
if (["Épaule","Hanche"].includes(zoneName)) moves.push("Adduction/Abduction");
if (zoneName === "Cheville / Pied") {
moves.push("Éversion/Inversion");
// Détails demandés pour muscles
moves.push("Flexion plantaire – Gastrocnémien");
moves.push("Flexion plantaire – Soléaire");
}
// Épaule : ASH test
if (zoneName === "Épaule") moves.push("ASH Test");

// Genou : dissocier Flexion/Extension + ischios/quads
if (zoneName === "Genou") {
// on garde Flex/Ext mais on ajoutera sous-tests spécifiques
}
// Hanche : idem (on applique logique générique + tests possibles)
// Rachis lombaire : outils spécifiques Shirado/Sorensen si Flex/Ext

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

// Outils spécifiques selon zone/mouvement
let tools = [...toolsForceGeneric];
if (zoneName === "Rachis lombaire" && mb.value.includes("Flexion/Extension")) {
tools = [
...tools,
"Test de Shirado",
"Test de Sorensen"
];
}

// Genou : sous-tests ischios/quads si Flexion/Extension
let extraTestsHTML = "";
if (zoneName === "Genou" && mb.value === "Flexion/Extension") {
extraTestsHTML = `
<label>Tests spécifiques (genou)</label>
<div class="checkbox-group">
<label><input type="checkbox" value="McCall 90"> McCall 90</label>
<label><input type="checkbox" value="Isométrie 30°"> Isométrie 30°</label>
<label><input type="checkbox" value="Nordic"> Nordic</label>
<label><input type="checkbox" value="Autre"> Autre</label>
</div>
<label>Outils utilisés pour ces tests (précisez si isocinétisme : vitesse & mode)</label>
<div class="checkbox-group">
<label><input type="checkbox" value="NordBord"> NordBord</label>
<label><input type="checkbox" value="Plateforme de force"> Plateforme de force</label>
<label><input type="checkbox" value="Dynamomètre fixe"> Dynamomètre fixe</label>
<label><input type="checkbox" value="Dynamomètre manuel"> Dynamomètre manuel</label>
<label><input type="checkbox" value="Isocinétisme (préciser vitesse et mode)"> Isocinétisme (préciser vitesse et mode)</label>
<label><input type="checkbox" value="Autre"> Autre</label>
</div>
`;
}

// Hanche : logique analogue (garde générique)
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

// Cheville : rien de plus à ajouter (déjà musclés séparés)

block.innerHTML = `
<h5 style="margin-top:10px">${mb.value}</h5>
${extraTestsHTML}
<label>Outils utilisés</label>
<div class="checkbox-group">
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

} else if (existing) {
existing.classList.remove("show");
setTimeout(() => existing.remove(), 400);
}
});
});

return div;
}

// Mobilité : mouvements → outils (ajouts demandés) → critères
function createMobilityBlock(zoneName, id, delayIndex) {
const div = document.createElement("div");
div.id = id;
div.classList.add("slide","stagger");
div.style.animationDelay = `${delayIndex * 0.1}s`;

// Mouvements par zone (comme force)
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

// Ajouts : Sit & Reach (genou extension + lombaire)
if ((zoneName === "Genou" && mb.value === "Flexion/Extension") || zoneName === "Rachis lombaire") {
tools = [...tools, "Sit-and-reach"];
}
// Cheville dorsiflexion : KTW
if (zoneName === "Cheville / Pied" && mb.value.includes("Flexion")) {
tools = [...tools, "Knee-to-wall (KTW)"];
}

block.innerHTML = `
<h5 style="margin-top:10px">${mb.value}</h5>
<label>Outils utilisés</label>
<div class="checkbox-group">
${tools.map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
</div>

<label>Critères d’évaluation</label>
<div class="checkbox-group">
${criteriaMobility.map(c => `<label><input type="checkbox" value="${c}"> ${c}</label>`).join("")}
</div>
`;
details.appendChild(block);

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
<div class="checkbox-group">
${tests.map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
<label><input type="checkbox" value="Autre"> Autre</label>
</div>
<label>Critères d’évaluation</label>
<div class="checkbox-group">
<label><input type="checkbox" value="Moyenne du groupe"> Moyenne du groupe</label>
<label><input type="checkbox" value="Valeur seuil"> Valeur seuil</label>
</div>
`;
return div;
}

// Course (affichée par zone mais OK)
function createCourseBlock(zoneName, id, delayIndex) {
const div = document.createElement("div");
div.id = id;
div.classList.add("slide","stagger");
div.style.animationDelay = `${delayIndex * 0.1}s`;

div.innerHTML = `
<h4>Course – ${zoneName}</h4>
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
<label><input type="checkbox" value="Autres"> Autres</label>
</div>

<label>Critères d’évaluation</label>
<div class="checkbox-group">
<label><input type="checkbox" value="Moyenne par poste"> Moyenne par poste</label>
<label><input type="checkbox" value="Valeur seuil"> Valeur seuil</label>
</div>
`;
return div;
}

// ---------------------------------------------------------
// Helpers
// ---------------------------------------------------------
function slug(s) {
return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")
.replace(/[^a-z0-9]+/g,"-");
}
function cssEscape(id) {
return id.replace(/([ #;?%&,.+*~\':"!^$[\]()=>|/@])/g,'\\$1');
}

// ---------------------------------------------------------
// VALIDATION avant envoi (stricte mais pragmatique)
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

// Pour chaque zone cochée, il doit y avoir au moins 1 case cochée dans la section correspondante
const zonesIncomplete = selectedZones.some(z => {
const sec = document.getElementById(`section-${z.value.replace(/\s+/g, "-")}`);
if (!sec) return true;
const anyChecked = sec.querySelector("input:checked");
if (!anyChecked) return true;

// Si Force/Mobilité cochés → vérifier au moins 1 mouvement
const forceChecked = sec.querySelector(".types input[value='Force']:checked");
if (forceChecked) {
const movementArea = sec.querySelector(".force-moves");
if (!movementArea || !movementArea.querySelector("input:checked")) return true;
}
const mobChecked = sec.querySelector(".types input[value='Mobilité']:checked");
if (mobChecked) {
const movementArea = sec.querySelector(".mob-moves");
if (!movementArea || !movementArea.querySelector("input:checked")) return true;
}

return false;
});

if (zonesIncomplete) {
resultMessage.textContent = "⚠️ Merci de compléter les sous-questions (mouvements, outils, paramètres, critères).";
return;
}

resultMessage.style.color = "#0074d9";
resultMessage.textContent = "✅ Merci ! Vos réponses sont prêtes à être envoyées (liaison Google Form possible).";
window.scrollTo({ top: 0, behavior: "smooth" });
});

});
