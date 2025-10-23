// script_v12_full.js — Version finale complète
// =====================================================================================
// Inclus : V8 + V9 + V10 + V11 + V12 (toutes corrections et ajouts demandés)
// - Champs “Autre” dynamiques (affichés uniquement quand cochés) y compris Infos participant + Questions communes
// - Suppression de tous les doublons “Autre” dans les sous-sections
// - Poignet/Main : ajout “Inclinaisons” en Force et Mobilité
// - Tête/Rachis cervical : ajout Force & Mobilité (Flex/Ext, Inclinaisons, Rotations) avec même logique que les autres zones
// - Mobilité : suppression “Test spécifique”, ajout “Distance doigt-sol” pour Rachis lombaire
// - Isocinétisme uniquement dans Outils avec sous-questions “Vitesse” + “Mode”
// - Force détaillée : Genou (Ischios / Quadriceps), Hanche (groupes), Cheville (Gastro / Soléaire + Inversion/Éversion + Intrinsèques), Épaule (ASH Test positions)
// - Questionnaires exhaustifs par zone
// - Proprioception par zone (Y-Balance, Star Excursion, FMS, Laser cervical, etc.)
// - Tests Fonctionnels Globaux MI / MS avec question Oui/Non + outils (Encodeur linéaire), paramètres (1RM / 3RM / Isométrie), critères
// - Sauts (unique si MI cochée) + question Oui/Non préalable
// - Course (si MI ou Tête/Rachis cochés) + question Oui/Non préalable + 1080 Sprint
// - Validation stricte (tous champs requis si la section est affichée + “Autre” → champ précisez obligatoire)
// - Envoi Google Forms (entry.1237244370) en JSON complet
// =====================================================================================

document.addEventListener("DOMContentLoaded", () => {
// -----------------------------
// Sélecteurs principaux & UI
// -----------------------------
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
const filled = [...formSections].filter(sec => {
return !!sec.querySelector("input:checked") || !!sec.querySelector("input[type='text'].other-input") && sec.querySelector("input[type='text'].other-input").value.trim();
}).length;
const total = formSections.length;
const percent = Math.min(100, Math.round((filled / total) * 100));
if (progressBar) progressBar.style.width = percent + "%";
if (progressText) progressText.textContent = `Progression : ${percent}%`;
}
document.addEventListener("change", updateProgress);

// -----------------------------
// Données & constantes
// -----------------------------
const lowerBodyZones = ["Hanche", "Genou", "Cheville / Pied"];
const upperBodyZones = ["Épaule", "Coude", "Poignet / Main"];
const headNeckPair = ["Tête", "Rachis cervical"];
const headNeckTitle = "Tête / Rachis cervical";

// Global uniques (sauts / course / fonctionnels MI / MS)
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

const globalFuncMI = document.createElement("div");
globalFuncMI.id = "global-func-mi";
globalFuncMI.className = "subcard";
globalFuncMI.style.display = "none";
zoneQuestionsContainer.parentElement.appendChild(globalFuncMI);

const globalFuncMS = document.createElement("div");
globalFuncMS.id = "global-func-ms";
globalFuncMS.className = "subcard";
globalFuncMS.style.display = "none";
zoneQuestionsContainer.parentElement.appendChild(globalFuncMS);

// Outils & listes génériques
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

// Questionnaires par zone (exhaustifs)
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

// Utilitaires
const slug = s => (s || "").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-");
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
// “Autre (précisez)” formats
if (val.includes("(précisez)")) {
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
const others = scope.querySelectorAll("input[type='checkbox'][value='Autre']:checked, input[type='checkbox'][value='Autres']:checked, input[type='radio'][value='Autre']:checked");
for (const oc of others) {
const group = oc.closest(".checkbox-group") || scope;
const txt = group.querySelector(".other-input");
if (txt && !txt.value.trim()) return true;
}
// isokinetic other speed
const isoOther = scope.querySelector(".isokinetic-sub .iso-speed input[value*='Autre']:checked");
if (isoOther) {
const txt = scope.querySelector(".isokinetic-sub .iso-speed .other-input");
if (!txt || !txt.value.trim()) return true;
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

function getZoneKey(zoneName) {
return headNeckPair.includes(zoneName) ? headNeckTitle : zoneName;
}
function anyHeadNeckChecked() {
return [...zonesCheckboxes].some(z => headNeckPair.includes(z.value) && z.checked);
}

// -------------------------------------
// Infos participant : “Autre” dynamique
// -------------------------------------
(function initParticipantOther() {
const roleWrap = document.getElementById("role");
if (roleWrap) {
const other = roleWrap.querySelector("input[name='role'][value='Autre']");
let otherField = null;
const ensure = () => {
if (other && other.checked) {
if (!otherField) {
otherField = document.createElement("div");
otherField.className = "slide show";
otherField.innerHTML = `<input type="text" class="other-input" placeholder="Précisez votre rôle" required style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;">`;
roleWrap.appendChild(otherField);
}
} else if (otherField) {
otherField.classList.remove("show");
setTimeout(() => { if (otherField) otherField.remove(); otherField = null; }, 250);
}
};
roleWrap.querySelectorAll("input[name='role']").forEach(r => r.addEventListener("change", ensure));
ensure();
}
// Question commune “guides de choix” : autre dynamique
const common = document.getElementById("commonQuestions");
if (common) {
const reasons = common.querySelectorAll("input[name='raisons']");
reasons.forEach(r => {
if (r.value.toLowerCase().includes("autre")) {
r.addEventListener("change", () => addOtherField(r.closest(".checkbox-group"), r, "Précisez"));
}
});
}
})();

// -------------------------------------
// Gestion des zones sélectionnées
// -------------------------------------
zonesCheckboxes.forEach(zone => {
zone.addEventListener("change", () => {
const zKey = getZoneKey(zone.value);
if (headNeckPair.includes(zone.value)) {
// fusion tête/rachis
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

// -------------------------------------
// Blocs globaux (Sauts / Course / MI-MS)
// -------------------------------------
function toggleGlobalSections() {
const selected = [...zonesCheckboxes].filter(z => z.checked).map(z => z.value);
const hasLower = selected.some(z => lowerBodyZones.includes(z));
const hasHead = selected.some(z => headNeckPair.includes(z));

// Tests fonctionnels MI — affichés si MI cochée
if (hasLower) {
if (!globalFuncMI.dataset.ready) {
globalFuncMI.dataset.ready = "1";
globalFuncMI.style.display = "";
globalFuncMI.classList.add("fade-in", "active");
globalFuncMI.innerHTML = `
<h3>Tests fonctionnels globaux – Membre inférieur</h3>
<div class="checkbox-group">
<label><input type="radio" name="funcMI_yesno" value="Oui"> Oui</label>
<label><input type="radio" name="funcMI_yesno" value="Non"> Non</label>
</div>
<div class="slide func-mi-details"></div>
`;
const details = globalFuncMI.querySelector(".func-mi-details");
const radios = globalFuncMI.querySelectorAll("input[name='funcMI_yesno']");
radios.forEach(r => r.addEventListener("change", () => {
if (r.value === "Oui") {
details.classList.add("show");
details.innerHTML = `
<label>Quels mouvements globaux / fonctionnels du MI ?</label>
<div class="checkbox-group mi-global-tests">
<label><input type="checkbox" value="Squat"> Squat</label>
<label><input type="checkbox" value="Montée sur banc"> Montée sur banc</label>
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
<label><input type="checkbox" value="Ratio / poids du corps"> Ratio / poids du corps</label>
<label><input type="checkbox" value="Valeur seuil"> Valeur seuil</label>
</div>
`;
makeOtherReactive(details);
} else {
details.classList.remove("show");
setTimeout(() => details.innerHTML = "", 250);
}
}));
}
} else {
globalFuncMI.style.display = "none";
globalFuncMI.innerHTML = "";
delete globalFuncMI.dataset.ready;
}

// Tests fonctionnels MS — affichés si MS cochée
const hasUpper = selected.some(z => upperBodyZones.includes(z));
if (hasUpper) {
if (!globalFuncMS.dataset.ready) {
globalFuncMS.dataset.ready = "1";
globalFuncMS.style.display = "";
globalFuncMS.classList.add("fade-in", "active");
globalFuncMS.innerHTML = `
<h3>Tests fonctionnels globaux – Membre supérieur</h3>
<div class="checkbox-group">
<label><input type="radio" name="funcMS_yesno" value="Oui"> Oui</label>
<label><input type="radio" name="funcMS_yesno" value="Non"> Non</label>
</div>
<div class="slide func-ms-details"></div>
`;
const details = globalFuncMS.querySelector(".func-ms-details");
const radios = globalFuncMS.querySelectorAll("input[name='funcMS_yesno']");
radios.forEach(r => r.addEventListener("change", () => {
if (r.value === "Oui") {
details.classList.add("show");
details.innerHTML = `
<label>Quels mouvements globaux / fonctionnels du MS ?</label>
<div class="checkbox-group ms-global-tests">
<label><input type="checkbox" value="Traction"> Traction</label>
<label><input type="checkbox" value="Développé couché"> Développé couché</label>
<label><input type="checkbox" value="Tirage"> Tirage</label>
<label><input type="checkbox" value="Force de grip"> Force de grip</label>
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
<label><input type="checkbox" value="Ratio / poids du corps"> Ratio / poids du corps</label>
<label><input type="checkbox" value="Valeur seuil"> Valeur seuil</label>
</div>
`;
makeOtherReactive(details);
} else {
details.classList.remove("show");
setTimeout(() => details.innerHTML = "", 250);
}
}));
}
} else {
globalFuncMS.style.display = "none";
globalFuncMS.innerHTML = "";
delete globalFuncMS.dataset.ready;
}

// SAUTS : uniques si MI cochée, précédés d’un Oui/Non
if (hasLower) {
if (!globalJumps.dataset.ready) {
globalJumps.dataset.ready = "1";
globalJumps.style.display = "";
globalJumps.classList.add("fade-in", "active");
globalJumps.innerHTML = `
<h3>Tests de sauts</h3>
<div class="checkbox-group">
<label><input type="radio" name="jumps_yesno" value="Oui"> Oui</label>
<label><input type="radio" name="jumps_yesno" value="Non"> Non</label>
</div>
<div class="slide jump-details"></div>
`;
const details = globalJumps.querySelector(".jump-details");
globalJumps.querySelectorAll("input[name='jumps_yesno']").forEach(r => {
r.addEventListener("change", () => {
if (r.value === "Oui") {
details.classList.add("show");
details.innerHTML = `
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
makeOtherReactive(details);
} else {
details.classList.remove("show");
setTimeout(() => details.innerHTML = "", 250);
}
});
});
}
} else {
globalJumps.style.display = "none";
globalJumps.innerHTML = "";
delete globalJumps.dataset.ready;
}

// COURSE : si MI cochée OU tête/rachis cochés — Oui/Non préalable
if (hasLower || hasHead) {
if (!globalCourse.dataset.ready) {
globalCourse.dataset.ready = "1";
globalCourse.style.display = "";
globalCourse.classList.add("fade-in","active");
globalCourse.innerHTML = `
<h3>Tests de course</h3>
<div class="checkbox-group">
<label><input type="radio" name="course_yesno" value="Oui"> Oui</label>
<label><input type="radio" name="course_yesno" value="Non"> Non</label>
</div>
<div class="slide course-details"></div>
`;
const details = globalCourse.querySelector(".course-details");
globalCourse.querySelectorAll("input[name='course_yesno']").forEach(r => {
r.addEventListener("change", () => {
if (r.value === "Oui") {
details.classList.add("show");
details.innerHTML = `
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
makeOtherReactive(details);
} else {
details.classList.remove("show");
setTimeout(() => details.innerHTML = "", 250);
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

// -------------------------------------
// Création / suppression section zone
// -------------------------------------
function createZoneSection(zoneName) {
if (document.getElementById(`section-${slug(zoneName)}`)) return;

const section = document.createElement("div");
section.classList.add("subcard","fade-in");
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
<label><input type="checkbox" value="Force"> Force</label>
<label><input type="checkbox" value="Mobilité"> Mobilité</label>
<label><input type="checkbox" value="Proprioception / Équilibre"> Proprioception / Équilibre</label>
<label><input type="checkbox" value="Questionnaires"> Questionnaires</label>
<label><input type="checkbox" value="Autres données"> Autres données</label>
${zoneName === headNeckTitle ? `<label><input type="checkbox" value="Test de cognition"> Test de cognition</label>` : ``}
</div>

<div class="subquestions"></div>
`;
zoneQuestionsContainer.appendChild(section);

// “Autre fréquence” → précisez
addFrequencyOther(section);

// Gestion dynamique des sous-sections
const typeCheckboxes = section.querySelectorAll(".types input[type='checkbox']");
const subQContainer = section.querySelector(".subquestions");

typeCheckboxes.forEach((cb, i) => {
cb.addEventListener("change", () => {
const id = `sub-${slug(zoneName)}-${slug(cb.value)}`;
const existing = subQContainer.querySelector(`#${cssEscape(id)}`);
if (cb.checked) {
let subSection = null;
if (cb.value === "Force") subSection = createForceBlock(zoneName, id, i);
if (cb.value === "Mobilité") subSection = createMobilityBlock(zoneName, id, i);
if (cb.value === "Proprioception / Équilibre") subSection = createProprioBlock(zoneName, id, i);
if (cb.value === "Questionnaires") subSection = createQuestionnaireBlock(zoneName, id, i);
if (cb.value === "Autres données") subSection = createOtherDataBlock(zoneName, id, i);
if (zoneName === headNeckTitle && cb.value === "Test de cognition") subSection = createCognitionBlock(zoneName, id, i);

if (subSection) {
subQContainer.appendChild(subSection);
// “Autre” partout + isok handlers
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
}, 250);
}
});
});
}

function removeZoneSection(zoneName) {
const section = document.getElementById(`section-${slug(zoneName)}`);
if (section) section.remove();
}

// -------------------------------------
// Blocs spécifiques par type
// -------------------------------------
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

function createCognitionBlock(zoneName, id, delayIndex) {
const div = document.createElement("div");
div.id = id;
div.className = "slide stagger";
div.style.animationDelay = `${delayIndex * 0.1}s`;
div.innerHTML = `
<h4>Test de cognition – ${zoneName}</h4>
<div class="checkbox-group">
<label><input type="checkbox" value="Test oculaire"> Test oculaire</label>
<label><input type="checkbox" value="Test vestibulaire"> Test vestibulaire</label>
<label><input type="checkbox" value="Autre"> Autre</label>
</div>`;
makeOtherReactive(div);
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

// --------- FORCE (mouvements → outils → paramètres → critères) ---------
function createForceBlock(zoneName, id, delayIndex) {
const div = document.createElement("div");
div.id = id;
div.className = "slide stagger";
div.style.animationDelay = `${delayIndex * 0.1}s`;

const moves = [];
// mouvements par défaut
moves.push("Flexion/Extension");
if (!["Genou", "Cheville / Pied", "Coude", "Poignet / Main"].includes(zoneName)) moves.push("Rotations");
if (["Épaule", "Hanche"].includes(zoneName)) moves.push("Adduction/Abduction");
if (zoneName === "Cheville / Pied") {
moves.push("Éversion/Inversion");
moves.push("Intrinsèques du pied");
}
if (zoneName === "Poignet / Main") moves.push("Inclinaisons");
if (zoneName === headNeckTitle) moves.push("Inclinaisons"); // Tête/Rachis
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

// Cas spécifiques
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
dWrap.appendChild(createMuscleDetailBlock(zoneName, mcb.value, gid, i+j));
} else if (!mcb.checked && ex) {
ex.classList.remove("show");
setTimeout(() => ex.remove(), 250);
}
});
});

} else if (zoneName === "Hanche" && ["Adduction/Abduction","Flexion/Extension"].includes(mb.value)) {
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
dWrap.appendChild(createMuscleDetailBlock(zoneName, mcb.value, gid, i+j));
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
dWrap.appendChild(createMuscleDetailBlock(zoneName, mcb.value, gid, i+j));
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
<label>Position(s) d’évaluation</label>
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

} else {
// Mouvement “simple”
block.innerHTML = `
<h5>${mb.value}</h5>
<label>Outils utilisés</label>
<div class="checkbox-group tools-group">
${toolsForceGeneric.map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
${zoneName === "Rachis lombaire" && mb.value.includes("Flexion/Extension") ? `
<label><input type="checkbox" value="Test de Shirado"> Test de Shirado</label>
<label><input type="checkbox" value="Test de Sorensen"> Test de Sorensen</label>
` : ``}
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

// Détail par groupe musculaire
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

// Autre → préciser & iso handlers
wrap.querySelectorAll(".checkbox-group").forEach(g => makeOtherReactive(g));
attachIsokineticHandlers(wrap);

return wrap;
}

// --------- MOBILITÉ (mouvement → outils → critères) ---------
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
if (zoneName === "Poignet / Main") moves.push("Inclinaisons");
if (zoneName === headNeckTitle) moves.push("Inclinaisons");

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

// Outils de mobilité sans “Test spécifique”
let tools = [...toolsMobilityGeneric];
if ((zoneName === "Genou" && mb.value === "Flexion/Extension") || zoneName === "Rachis lombaire") {
tools = [...tools, "Sit-and-reach"];
}
if (zoneName === "Rachis lombaire" && mb.value === "Inclinaisons") {
tools = tools.filter(t => t !== "Sit-and-reach");
tools = [...tools, "Distance doigt-sol"];
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

// -------------------------------------
// VALIDATION stricte + ENVOI Google Form
// -------------------------------------
submitBtn.addEventListener("click", (e) => {
e.preventDefault();
resultMessage.textContent = "";
resultMessage.style.color = "red";

// Infos générales
const role = document.querySelector("input[name='role']:checked");
const structure = document.querySelector("input[name='structure']:checked");
if (!role || !structure) {
resultMessage.textContent = "⚠️ Merci de compléter les informations générales.";
return;
}
// “Autre” rôle → préciser
if (role.value === "Autre") {
const rtxt = document.querySelector("#role .other-input");
if (!rtxt || !rtxt.value.trim()) {
resultMessage.textContent = "⚠️ Merci de préciser votre rôle.";
return;
}
}

// Zones
const selectedZonesRaw = [...zonesCheckboxes].filter(z => z.checked);
if (selectedZonesRaw.length === 0) {
resultMessage.textContent = "⚠️ Merci de sélectionner au moins une zone anatomique.";
return;
}

// Ensemble des zones “logiques” (fusion tête/rachis)
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

const hasFreq = !!sec.querySelector(".moment input:checked");
const hasType = !!sec.querySelector(".types input:checked");
if (!hasFreq && !hasType) return true;

const of = sec.querySelector(".moment input[value='Autre fréquence']:checked");
if (of) {
const txt = sec.querySelector(".moment .other-input");
if (!txt || !txt.value.trim()) return true;
}

// “Autre” → préciser partout
if (hasUncheckedOther(sec)) return true;

// Force : si cochée, exiger au moins un mouvement
const forceChecked = sec.querySelector(".types input[value='Force']:checked");
if (forceChecked) {
const mArea = sec.querySelector(".force-moves");
if (!mArea || !mArea.querySelector("input:checked")) return true;
}

// Mobilité : si cochée, exiger au moins un mouvement
const mobChecked = sec.querySelector(".types input[value='Mobilité']:checked");
if (mobChecked) {
const mArea = sec.querySelector(".mob-moves");
if (!mArea || !mArea.querySelector("input:checked")) return true;
}

return false;
});

if (zonesIncomplete) {
resultMessage.textContent = "⚠️ Merci de compléter toutes les sous-sections (mouvements, outils, paramètres, critères, précisions…).";
return;
}

// Globaux : “Autre” → préciser si Oui
for (const g of [globalJumps, globalCourse, globalFuncMI, globalFuncMS]) {
if (!g || !g.dataset.ready) continue;
const yesno = g.querySelector("input[type='radio'][value='Oui']");
if (yesno && yesno.checked) {
if (hasUncheckedOther(g)) {
resultMessage.textContent = "⚠️ Merci de préciser les champs 'Autre' dans les sections globales.";
return;
}
}
}

// Si tout bon
resultMessage.style.color = "#0074d9";
resultMessage.textContent = "✅ Merci ! Vos réponses sont prêtes à être envoyées (liaison Google Form possible).";

// ----- ENVOI GOOGLE FORM -----
// On sérialise l’ensemble dans un unique champ (entry.1237244370)
const payload = collectAllAnswers();
const formData = new FormData();
formData.append("entry.1237244370", JSON.stringify(payload));

fetch("https://docs.google.com/forms/u/0/d/e/1FAIpQLSeNok3wNrafUFIM2VnAo4NKQpdZDaDyFDeVS8dZbXFyt_ySyA/formResponse", {
method: "POST",
mode: "no-cors",
body: formData
}).then(() => {
resultMessage.style.color = "#2e8b57";
resultMessage.textContent = "✅ Réponses envoyées. Merci pour votre participation !";
window.scrollTo({ top: 0, behavior: "smooth" });
// form.reset(); // dé-commenter si on veut vider
}).catch(() => {
resultMessage.style.color = "#b22222";
resultMessage.textContent = "⚠️ Envoi tenté. Si vous ne voyez pas de soumission côté Google Form, vérifiez l’ID ‘entry’.";
});
});

// Collecte “best effort” des champs (structure simplifiée en arbre)
function collectAllAnswers() {
const out = {};
// Identité
const role = document.querySelector("input[name='role']:checked");
const structure = document.querySelector("input[name='structure']:checked");
out.participant = {
role: role ? role.value : null,
role_precisez: role && role.value === "Autre" ? (document.querySelector("#role .other-input")?.value || "") : "",
structure: structure ? structure.value : null
};

// Zones
out.zones = [];
const selectedZonesRaw = [...zonesCheckboxes].filter(z => z.checked);
const keys = new Set();
if (selectedZonesRaw.some(z => headNeckPair.includes(z.value))) keys.add(headNeckTitle);
selectedZonesRaw.forEach(z => { if (!headNeckPair.includes(z.value)) keys.add(z.value); });

keys.forEach(zName => {
const sec = document.getElementById(`section-${slug(zName)}`);
const zoneObj = { zone: zName, moments: [], types: {}, autres_donnees: "" };
// moments
sec.querySelectorAll(".moment input:checked").forEach(i => {
if (i.value === "Autre fréquence") {
const txt = sec.querySelector(".moment .other-input");
zoneObj.moments.push({ type: i.value, precision: txt ? txt.value : "" });
} else {
zoneObj.moments.push({ type: i.value });
}
});
// types → détail
sec.querySelectorAll(".types input:checked").forEach(t => {
const tkey = t.value;
const sub = sec.querySelector(`#sub-${slug(zName)}-${slug(tkey)}`);
if (!sub) { zoneObj.types[tkey] = true; return; }
zoneObj.types[tkey] = extractTypeBlock(zName, tkey, sub);
});
out.zones.push(zoneObj);
});

// Globaux
out.globals = {};
// MI
if (globalFuncMI.dataset.ready) {
const yes = globalFuncMI.querySelector("input[name='funcMI_yesno'][value='Oui']:checked");
out.globals.func_mi = yes ? extractFuncBlock(globalFuncMI) : { active: false };
}
// MS
if (globalFuncMS.dataset.ready) {
const yes = globalFuncMS.querySelector("input[name='funcMS_yesno'][value='Oui']:checked");
out.globals.func_ms = yes ? extractFuncBlock(globalFuncMS) : { active: false };
}
// Sauts
if (globalJumps.dataset.ready) {
const yes = globalJumps.querySelector("input[name='jumps_yesno'][value='Oui']:checked");
out.globals.sauts = yes ? extractJumpBlock(globalJumps) : { active: false };
}
// Course
if (globalCourse.dataset.ready) {
const yes = globalCourse.querySelector("input[name='course_yesno'][value='Oui']:checked");
out.globals.course = yes ? extractCourseBlock(globalCourse) : { active: false };
}

// Communes
const common = document.getElementById("commonQuestions");
out.commun = {
barrieres: [...common.querySelectorAll("input[name='barrieres']:checked")].map(i => i.value),
raisons: [...common.querySelectorAll("input[name='raisons']:checked")].map(i => i.value),
raisons_autre: (() => {
const other = [...common.querySelectorAll("input[name='raisons']")].find(i => i.value.toLowerCase().includes("autre") && i.checked);
if (other) {
const txt = common.querySelector(".checkbox-group .other-input");
return txt ? txt.value : "";
}
return "";
})()
};

return out;
}

function extractTypeBlock(zone, type, root) {
const out = { type };
if (type === "Autres données") {
out.precision = root.querySelector(".other-input")?.value || "";
return out;
}
if (type === "Test de cognition") {
out.tests = [...root.querySelectorAll(".checkbox-group input:checked")].map(i => i.value);
const other = root.querySelector(".checkbox-group input[value='Autre']:checked");
out.autre = other ? (root.querySelector(".checkbox-group .other-input")?.value || "") : "";
return out;
}
if (type === "Questionnaires") {
out.liste = [...root.querySelectorAll(".q-list input:checked")].map(i => i.value);
const other = root.querySelector(".q-list input[value='Autre']:checked");
out.autre = other ? (root.querySelector(".q-list .other-input")?.value || "") : "";
return out;
}
if (type === "Proprioception / Équilibre") {
out.tests = [...root.querySelectorAll(".proprio-tests input:checked")].map(i => i.value);
const other = root.querySelector(".proprio-tests input[value='Autre']:checked");
out.autre = other ? (root.querySelector(".proprio-tests .other-input")?.value || "") : "";
out.criteres = [...root.querySelectorAll("label input[type='checkbox']:checked")].filter(i => i.closest(".proprio-tests") == null).map(i => i.value);
return out;
}
if (type === "Mobilité") {
out.mouvements = [];
root.querySelectorAll(".mob-moves input:checked").forEach(m => {
const mid = `#${cssEscape(root.id)}-move-${slug(m.value)}`;
const b = root.parentElement.querySelector(mid) || root.querySelector(mid);
const obj = { mouvement: m.value };
obj.outils = [...b.querySelectorAll(".checkbox-group input[type='checkbox']:checked")].map(i => i.value);
const other = b.querySelector(".checkbox-group input[value='Autre']:checked");
obj.autre_outil = other ? (b.querySelector(".checkbox-group .other-input")?.value || "") : "";
const isLumbar = (zone === "Rachis lombaire");
obj.criteres = [...b.querySelectorAll("label input[type='checkbox']:checked")].filter(i => i.closest(".tools-group") == null).map(i => i.value);
out.mouvements.push(obj);
});
return out;
}
if (type === "Force") {
out.mouvements = [];
root.querySelectorAll(".force-moves input:checked").forEach(m => {
const mid = `#${cssEscape(root.id)}-move-${slug(m.value)}`;
const b = root.parentElement.querySelector(mid) || root.querySelector(mid);
const obj = { mouvement: m.value };

// cas “complexes” (genou, hanche, cheville, épaule ASH)
if (zone === "Genou" && m.value === "Flexion/Extension") {
obj.muscles = [];
b.querySelectorAll(".knee-muscles input:checked").forEach(ms => {
const gid = `#${cssEscape(mid)}-${slug(ms.value)}`;
const w = b.querySelector(gid) || root.querySelector(gid);
const mObj = { muscle: ms.value };
mObj.outils = [...w.querySelectorAll(".tools-group input:checked")].map(i => i.value);
const other = w.querySelector(".tools-group input[value='Autre']:checked");
mObj.autre_outil = other ? (w.querySelector(".tools-group .other-input")?.value || "") : "";
// iso
const iso = w.querySelector(".isokinetic-sub");
if (iso) {
mObj.isokinetic = {
vitesses: [...iso.querySelectorAll(".iso-speed input:checked")].map(i => i.value),
modes: [...iso.querySelectorAll(".iso-mode input:checked")].map(i => i.value),
autre_vitesse: (() => {
const other = iso.querySelector(".iso-speed input[value*='Autre']:checked");
if (other) return iso.querySelector(".iso-speed .other-input")?.value || "";
return "";
})()
};
}
mObj.tests = [...w.querySelectorAll(".muscle-tests input:checked")].map(i => i.value);
mObj.parametres = [...w.querySelectorAll("label input[type='checkbox']:checked")].filter(i => i.closest(".tools-group") == null && i.closest(".muscle-tests") == null).map(i => i.value);
mObj.criteres = [...w.querySelectorAll("label input[type='checkbox']:checked")].slice(-3).map(i => i.value); // heuristique
obj.muscles.push(mObj);
});
} else if (zone === "Hanche" && ["Adduction/Abduction","Flexion/Extension"].includes(m.value)) {
obj.muscles = [];
b.querySelectorAll(".hip-muscles input:checked").forEach(ms => {
const gid = `#${cssEscape(mid)}-${slug(ms.value)}`;
const w = b.querySelector(gid) || root.querySelector(gid);
const mObj = { muscle: ms.value };
mObj.outils = [...w.querySelectorAll(".tools-group input:checked")].map(i => i.value);
const other = w.querySelector(".tools-group input[value='Autre']:checked");
mObj.autre_outil = other ? (w.querySelector(".tools-group .other-input")?.value || "") : "";
const iso = w.querySelector(".isokinetic-sub");
if (iso) {
mObj.isokinetic = {
vitesses: [...iso.querySelectorAll(".iso-speed input:checked")].map(i => i.value),
modes: [...iso.querySelectorAll(".iso-mode input:checked")].map(i => i.value),
autre_vitesse: (() => {
const other = iso.querySelector(".iso-speed input[value*='Autre']:checked");
if (other) return iso.querySelector(".iso-speed .other-input")?.value || "";
return "";
})()
};
}
mObj.tests = [...w.querySelectorAll(".muscle-tests input:checked")].map(i => i.value);
mObj.parametres = [...w.querySelectorAll("label input[type='checkbox']:checked")].filter(i => i.closest(".tools-group") == null && i.closest(".muscle-tests") == null).map(i => i.value);
mObj.criteres = [...w.querySelectorAll("label input[type='checkbox']:checked")].slice(-3).map(i => i.value);
obj.muscles.push(mObj);
});
} else if (zone === "Cheville / Pied" && (m.value.includes("Éversion/Inversion") || m.value.includes("Flexion/Extension") || m.value.includes("Intrinsèques"))) {
if (m.value.includes("Flexion/Extension")) {
obj.muscles = [];
b.querySelectorAll(".ankle-muscles input:checked").forEach(ms => {
const gid = `#${cssEscape(mid)}-${slug(ms.value)}`;
const w = b.querySelector(gid) || root.querySelector(gid);
const mObj = { muscle: ms.value };
mObj.outils = [...w.querySelectorAll(".tools-group input:checked")].map(i => i.value);
const other = w.querySelector(".tools-group input[value='Autre']:checked");
mObj.autre_outil = other ? (w.querySelector(".tools-group .other-input")?.value || "") : "";
const iso = w.querySelector(".isokinetic-sub");
if (iso) {
mObj.isokinetic = {
vitesses: [...iso.querySelectorAll(".iso-speed input:checked")].map(i => i.value),
modes: [...iso.querySelectorAll(".iso-mode input:checked")].map(i => i.value),
autre_vitesse: (() => {
const other = iso.querySelector(".iso-speed input[value*='Autre']:checked");
if (other) return iso.querySelector(".iso-speed .other-input")?.value || "";
return "";
})()
};
}
mObj.tests = [...w.querySelectorAll(".muscle-tests input:checked")].map(i => i.value);
mObj.parametres = [...w.querySelectorAll("label input[type='checkbox']:checked")].filter(i => i.closest(".tools-group") == null && i.closest(".muscle-tests") == null).map(i => i.value);
mObj.criteres = [...w.querySelectorAll("label input[type='checkbox']:checked")].slice(-3).map(i => i.value);
obj.muscles.push(mObj);
});
} else {
// inverseurs/éverseurs ou intrinsèques → déjà gérés comme un “muscle”
const w = b;
const mObj = { muscle: muscleLabelFromCheville(m.value) };
mObj.outils = [...w.querySelectorAll(".tools-group input:checked")].map(i => i.value);
const other = w.querySelector(".tools-group input[value='Autre']:checked");
mObj.autre_outil = other ? (w.querySelector(".tools-group .other-input")?.value || "") : "";
const iso = w.querySelector(".isokinetic-sub");
if (iso) {
mObj.isokinetic = {
vitesses: [...iso.querySelectorAll(".iso-speed input:checked")].map(i => i.value),
modes: [...iso.querySelectorAll(".iso-mode input:checked")].map(i => i.value),
autre_vitesse: (() => {
const other = iso.querySelector(".iso-speed input[value*='Autre']:checked");
if (other) return iso.querySelector(".iso-speed .other-input")?.value || "";
return "";
})()
};
}
mObj.tests = [...w.querySelectorAll(".muscle-tests input:checked")].map(i => i.value);
mObj.parametres = [...w.querySelectorAll("label input[type='checkbox']:checked")].filter(i => i.closest(".tools-group") == null && i.closest(".muscle-tests") == null).map(i => i.value);
mObj.criteres = [...w.querySelectorAll("label input[type='checkbox']:checked")].slice(-3).map(i => i.value);
obj.muscles = [mObj];
}
} else if (zone === "Épaule" && m.value === "ASH Test") {
obj.positions = [...b.querySelectorAll("label input[type='checkbox']:checked")].map(i => i.value);
obj.outils = [...b.querySelectorAll(".tools-group input[type='checkbox']:checked")].map(i => i.value);
const iso = b.querySelector(".isokinetic-sub");
if (iso) {
obj.isokinetic = {
vitesses: [...iso.querySelectorAll(".iso-speed input:checked")].map(i => i.value),
modes: [...iso.querySelectorAll(".iso-mode input:checked")].map(i => i.value),
autre_vitesse: (() => {
const other = iso.querySelector(".iso-speed input[value*='Autre']:checked");
if (other) return iso.querySelector(".iso-speed .other-input")?.value || "";
return "";
})()
};
}
obj.parametres = [...b.querySelectorAll("label input[type='checkbox']:checked")].filter(i => i.closest(".tools-group") == null).map(i => i.value);
obj.criteres = criteriaForce.filter(c => b.innerHTML.includes(c) && [...b.querySelectorAll("label input[type='checkbox']:checked")].map(x=>x.value).includes(c));
} else {
// mouvement simple
obj.outils = [...b.querySelectorAll(".tools-group input[type='checkbox']:checked")].map(i => i.value);
const other = b.querySelector(".tools-group input[value='Autre']:checked");
obj.autre_outil = other ? (b.querySelector(".tools-group .other-input")?.value || "") : "";
const iso = b.querySelector(".isokinetic-sub");
if (iso) {
obj.isokinetic = {
vitesses: [...iso.querySelectorAll(".iso-speed input:checked")].map(i => i.value),
modes: [...iso.querySelectorAll(".iso-mode input:checked")].map(i => i.value),
autre_vitesse: (() => {
const other = iso.querySelector(".iso-speed input[value*='Autre']:checked");
if (other) return iso.querySelector(".iso-speed .other-input")?.value || "";
return "";
})()
};
}
obj.parametres = [...b.querySelectorAll("label input[type='checkbox']:checked")].filter(i => i.closest(".tools-group") == null).map(i => i.value);
obj.criteres = criteriaForce.filter(c => [...b.querySelectorAll("label input[type='checkbox']:checked")].map(x=>x.value).includes(c));
}

out.mouvements.push(obj);
});
return out;
}
return out;
}

function muscleLabelFromCheville(moveVal) {
if (moveVal.includes("Éversion") || moveVal.includes("Inversion")) return "Inverseurs/Éverseurs";
if (moveVal.includes("Intrinsèques")) return "Intrinsèques du pied";
return "Cheville";
}

function extractFuncBlock(root) {
const out = { active: true };
const tests = root.querySelector(".mi-global-tests, .ms-global-tests");
if (tests) {
out.tests = [...tests.querySelectorAll("input:checked")].map(i => i.value);
const other = tests.querySelector("input[value='Autre']:checked");
out.autre = other ? (tests.querySelector(".other-input")?.value || "") : "";
}
const outilsGroup = root.querySelectorAll(".checkbox-group")[1];
if (outilsGroup) {
out.outils = [...outilsGroup.querySelectorAll("input:checked")].map(i => i.value);
const other = [...outilsGroup.querySelectorAll("input")].find(i => i.value === "Autre" && i.checked);
out.autre_outil = other ? (outilsGroup.querySelector(".other-input")?.value || "") : "";
}
const paramsGroup = root.querySelectorAll(".checkbox-group")[2];
if (paramsGroup) out.parametres = [...paramsGroup.querySelectorAll("input:checked")].map(i => i.value);
const critGroup = root.querySelectorAll(".checkbox-group")[3];
if (critGroup) out.criteres = [...critGroup.querySelectorAll("input:checked")].map(i => i.value);
return out;
}

function extractJumpBlock(root) {
const out = { active: true };
const groups = root.querySelectorAll(".checkbox-group");
if (groups[1]) {
out.tests = [...groups[1].querySelectorAll("input:checked")].map(i => i.value);
const other = groups[1].querySelector("input[value='Autre']:checked");
out.autre_test = other ? (groups[1].querySelector(".other-input")?.value || "") : "";
}
if (groups[2]) {
out.parametres = [...groups[2].querySelectorAll("input:checked")].map(i => i.value);
}
if (groups[3]) {
out.outils = [...groups[3].querySelectorAll("input:checked")].map(i => i.value);
const other = groups[3].querySelector("input[value='Autre']:checked");
out.autre_outil = other ? (groups[3].querySelector(".other-input")?.value || "") : "";
}
if (groups[4]) {
out.criteres = [...groups[4].querySelectorAll("input:checked")].map(i => i.value);
}
return out;
}

function extractCourseBlock(root) {
const out = { active: true };
const groups = root.querySelectorAll(".checkbox-group");
if (groups[1]) {
out.tests = [...groups[1].querySelectorAll("input:checked")].map(i => i.value);
const other = groups[1].querySelector("input[value='Autre']:checked");
out.autre_test = other ? (groups[1].querySelector(".other-input")?.value || "") : "";
}
if (groups[2]) {
out.outils = [...groups[2].querySelectorAll("input:checked")].map(i => i.value);
const other = groups[2].querySelector("input[value='Autres']:checked, input[value='Autre']:checked");
out.autre_outil = other ? (groups[2].querySelector(".other-input")?.value || "") : "";
}
if (groups[3]) {
out.criteres = [...groups[3].querySelectorAll("input:checked")].map(i => i.value);
}
return out;
}

});
