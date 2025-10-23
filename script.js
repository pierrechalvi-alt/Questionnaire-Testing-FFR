// ------------------------------
// script.js – v10 (finale complète, basée sur v8 + v9/v10 demandes)
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
[...sec.querySelectorAll(".other-input")].some(t => t.value && t.value.trim())
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
// Genou
"Ischiojambiers": ["McCall 90°", "Isométrie 30°", "Nordic", "Nordic Hold", "Razor Curl", "Single Leg Bridge", "Isocinétique 60°/s", "Isocinétique 180°/s", "Autre"],
"Quadriceps": ["Isométrie 60°", "Leg Extension", "Single Leg Squat", "Isocinétique 60°/s", "Isocinétique 180°/s", "Autre"],
// Hanche
"Fléchisseurs hanche": ["Isométrique 45°", "Straight Leg Raise (force)", "Isocinétique 60°/s", "Isocinétique 180°/s", "Autre"],
"Abducteurs hanche": ["Side-lying isométrique", "Standing belt test", "Isocinétique 60°/s", "Autre"],
"Adducteurs hanche": ["Squeeze test (5s)", "Copenhagen", "Isocinétique 60°/s", "Autre"],
// Cheville / Pied
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
wrap.innerHTML = `<input type="text" class="other-input" placeholder="${placeholder}" required
style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;">`;
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
if (val === "autres donnees" || val === "autres données") {
const container = inp.closest(".checkbox-group") || root;
inp.addEventListener("change", () => ensureOtherFieldOnce(container, inp, "Précisez la donnée"));
}
});
}

function attachIsokineticHandlers(scope) {
const groups = scope.querySelectorAll(".tools-group, .checkbox-group");
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
}

// ===== Validation des champs “Autre”
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
const otherDataInputs = scope.querySelectorAll(".other-input[placeholder*='donnée']");
for (const inp of otherDataInputs) {
if (!inp.value.trim()) return true;
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

// ====== Gestion sections par zone
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

// ====== Blocs simples
function createOtherDataBlock(zoneName, id, delayIndex) {
const div = document.createElement("div");
div.id = id;
div.className = "slide stagger show";
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
div.className = "slide stagger show";
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
div.className = "slide stagger show";
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

// ====== Force (inclut genou/hanche/cheville spécifiques + ASH épaule + tests globaux)
function createForceBlock(zoneName, id, delayIndex) {
const div = document.createElement("div");
div.id = id;
div.className = "slide stagger show";
div.style.animationDelay = `${delayIndex * 0.1}s`;

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
<label><input type="checkbox" value="Autre"> Autre</label>
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
<label><input type="checkbox" value="Autre"> Autre</label>
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

div.querySelectorAll(".force-moves input[type='checkbox']").forEach((mb, i) => {
mb.addEventListener("change", () => {
const mid = `${id}-move-${slug(mb.value)}`;
const existing = details.querySelector(`#${cssEscape(mid)}`);
if (mb.checked) {
const block = document.createElement("div");
block.id = mid;
block.className = "slide stagger show";
block.style.animationDelay = `${i * 0.05}s`;

if (zoneName === "Genou" && mb.value === "Flexion/Extension") {
block.innerHTML = `
<h5>Flexion / Extension</h5>
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
<h5>Flexion / Extension</h5>
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
block.innerHTML = `<h5>Éversion / Inversion</h5><div class="inv-ev-details"></div>`;
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
${toolsForceGeneric.map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
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
block.innerHTML = `
<h5>${mb.value}</h5>
<label>Outils utilisés</label>
<div class="checkbox-group tools-group">
${toolsForceGeneric.map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
${zoneName === "Rachis lombaire" && mb.value.includes("Flexion/Extension") ? `
<label><input type="checkbox" value="Test de Shirado"> Test de Shirado</label>
<label><input type="checkbox" value="Test de Sorensen"> Test de Sorensen</label>` : ""}
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

function createMobilityBlock(zoneName, id, delayIndex) {
const div = document.createElement("div");
div.id = id;
div.className = "slide stagger show";
div.style.animationDelay = `${delayIndex * 0.1}s`;
const moves = ["Flexion/Extension"];
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
if ((zoneName === "Genou" && mb.value === "Flexion/Extension") || zoneName === "Rachis lombaire") tools = [...tools, "Sit-and-reach"];
if (zoneName === "Cheville / Pied" && mb.value.toLowerCase().includes("flexion")) tools = [...tools, "Knee-to-wall (KTW)"];
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

const freqGroup = section.querySelector(".moment");
const other = freqGroup?.querySelector("input[type='checkbox'][value='Autre fréquence']");
if (other) other.addEventListener("change", () => ensureOtherFieldOnce(freqGroup, other, "Fréquence (précisez)"));

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

// ====== Validation finale + envoi Google Form
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

if (hasUncheckedOther(document)) {
resultMessage.textContent = "⚠️ Merci de préciser tous les champs 'Autre'.";
return;
}

resultMessage.style.color = "#0074d9";
resultMessage.textContent = "✅ Envoi en cours…";

const googleFormURL = "https://docs.google.com/forms/u/0/d/e/1FAIpQLSeNok3wNrafUFIM2VnAo4NKQpdZDaDyFDeVS8dZbXFyt_ySyA/formResponse";
const fd = new FormData();
fd.append("entry.1237244370", JSON.stringify(collectAllAnswers()));

fetch(googleFormURL, { method: "POST", mode: "no-cors", body: fd })
.then(() => {
resultMessage.style.color = "green";
resultMessage.textContent = "✅ Réponses envoyées avec succès !";
form.reset();
document.querySelectorAll(".subcard[id^='section-']").forEach(n => n.remove());
globalJumps.innerHTML = ""; globalJumps.style.display = "none"; delete globalJumps.dataset.ready;
globalCourse.innerHTML = ""; globalCourse.style.display = "none"; delete globalCourse.dataset.ready;
window.scrollTo({ top: 0, behavior: "smooth" });
})
.catch(() => {
resultMessage.style.color = "red";
resultMessage.textContent = "⚠️ Erreur lors de l'envoi du formulaire.";
});
});

function collectAllAnswers() {
const data = {};
const role = document.querySelector("input[name='role']:checked")?.value || "";
const roleOther = document.querySelector("#role .other-wrap .other-input")?.value || "";
const structure = document.querySelector("input[name='structure']:checked")?.value || "";
const structureOther = document.querySelector("#structure .other-wrap .other-input")?.value || "";
data.participant = { role, roleOther, structure, structureOther };

data.zones = [];
const selectedZonesRaw = [...zonesCheckboxes].filter(z => z.checked).map(z => z.value);
const zoneKeys = [];
if (selectedZonesRaw.some(z => headNeckPair.includes(z))) zoneKeys.push(headNeckTitle);
selectedZonesRaw.forEach(z => { if (!headNeckPair.includes(z)) zoneKeys.push(z); });

zoneKeys.forEach(zName => {
const zobj = { zone: zName, moments: [], types: {}, otherFrequency: "" };
const sec = document.getElementById(`section-${slug(zName)}`);
if (!sec) return;
sec.querySelectorAll(".moment input:checked").forEach(i => zobj.moments.push(i.value));
const of = sec.querySelector(".moment input[value='Autre fréquence']:checked");
if (of) zobj.otherFrequency = sec.querySelector(".moment .other-wrap .other-input")?.value || "";

sec.querySelectorAll(".types input:checked").forEach(cb => { zobj.types[cb.value] = {}; });

if (zobj.types["Force"]) {
zobj.types["Force"].mouvements = [];
sec.querySelectorAll(".force-moves-details > div").forEach(mb => {
const mname = mb.querySelector("h5")?.textContent || "Mouvement";
const mdata = { mouvement: mname, outils: [], params: [], criteres: [], details: {} };
mb.querySelectorAll(".tools-group input:checked").forEach(x => mdata.outils.push(x.value));
if (mdata.outils.includes("Isocinétisme")) {
mdata.isokinetisme = {
vitesses: [...mb.querySelectorAll(".isokinetic-sub .iso-speed input:checked")].map(x => x.value),
modes: [...mb.querySelectorAll(".isokinetic-sub .iso-mode input:checked")].map(x => x.value),
};
}
const groups = mb.querySelectorAll(".checkbox-group");
if (groups[1]) mdata.params = [...groups[1].querySelectorAll("input:checked")].map(x => x.value);
if (groups[2]) mdata.criteres = [...groups[2].querySelectorAll("input:checked")].map(x => x.value);

mb.querySelectorAll(".knee-muscles-details > div, .hip-muscles-details > div, .ankle-muscles-details > div, .inv-ev-details > div, .foot-intr-details > div").forEach(sub => {
const label = sub.querySelector("h5")?.textContent || "Groupe";
const sg = sub.querySelectorAll(".checkbox-group");
const d = {
groupe: label,
outils: [...sub.querySelectorAll(".tools-group input:checked")].map(x => x.value),
tests: [...sub.querySelectorAll(".muscle-tests input:checked")].map(x => x.value),
params: sg[1] ? [...sg[1].querySelectorAll("input:checked")].map(x => x.value) : [],
criteres: sg[2] ? [...sg[2].querySelectorAll("input:checked")].map(x => x.value) : [],
};
if (d.outils.includes("Isocinétisme")) {
d.isokinetisme = {
vitesses: [...sub.querySelectorAll(".isokinetic-sub .iso-speed input:checked")].map(x => x.value),
modes: [...sub.querySelectorAll(".isokinetic-sub .iso-mode input:checked")].map(x => x.value),
};
}
mdata.details[label] = d;
});

zobj.types["Force"].mouvements.push(mdata);
});
}

if (zobj.types["Mobilité"]) {
zobj.types["Mobilité"].mouvements = [];
sec.querySelectorAll(".mob-moves-details > div").forEach(mb => {
const mname = mb.querySelector("h5")?.textContent || "Mouvement";
const outils = [...mb.querySelectorAll(".checkbox-group")[0].querySelectorAll("input:checked")].map(x => x.value);
const criteres = [...mb.querySelectorAll(".checkbox-group")[1].querySelectorAll("input:checked")].map(x => x.value);
zobj.types["Mobilité"].mouvements.push({ mouvement: mname, outils, criteres });
});
}

if (zobj.types["Proprioception / Équilibre"]) {
const pb = sec.querySelector(`#sub-${slug(zName)}-proprioception-equilibre`);
const tests = pb ? [...pb.querySelectorAll(".proprio-tests input:checked")].map(x => x.value) : [];
const crits = pb ? [...pb.querySelectorAll(".checkbox-group")[1].querySelectorAll("input:checked")].map(x => x.value) : [];
zobj.types["Proprioception / Équilibre"] = { tests, criteres: crits };
}

if (zobj.types["Questionnaires"]) {
const qb = sec.querySelector(`#sub-${slug(zName)}-questionnaires`);
zobj.types["Questionnaires"] = { liste: qb ? [...qb.querySelectorAll(".q-list input:checked")].map(x => x.value) : [] };
}

if (zobj.types["Autres données"]) {
const ob = sec.querySelector(`#sub-${slug(zName)}-autres-donnees .other-input`);
zobj.types["Autres données"] = { texte: ob ? ob.value.trim() : "" };
}

data.zones.push(zobj);
});

data.globals = {};
if (globalJumps.dataset.ready) {
const rq = document.querySelector("input[name='doJumpTests']:checked")?.value || "Non";
data.globals.sauts = { pratique: rq, details: {} };
if (rq === "Oui") {
const sub = globalJumps.querySelector(".jump-sub");
data.globals.sauts.details.tests = [...sub.querySelectorAll(".checkbox-group")[0].querySelectorAll("input:checked")].map(x => x.value);
data.globals.sauts.details.params = [...sub.querySelectorAll(".checkbox-group")[1].querySelectorAll("input:checked")].map(x => x.value);
data.globals.sauts.details.outils = [...sub.querySelectorAll(".jump-tools input:checked")].map(x => x.value);
data.globals.sauts.details.criteres = [...sub.querySelectorAll(".checkbox-group")[3].querySelectorAll("input:checked")].map(x => x.value);
}
}
if (globalCourse.dataset.ready) {
const rq = document.querySelector("input[name='doCourseTests']:checked")?.value || "Non";
data.globals.course = { pratique: rq, details: {} };
if (rq === "Oui") {
const sub = globalCourse.querySelector(".course-sub");
data.globals.course.details.tests = [...sub.querySelectorAll(".checkbox-group")[0].querySelectorAll("input:checked")].map(x => x.value);
data.globals.course.details.outils = [...sub.querySelectorAll(".course-tools input:checked")].map(x => x.value);
data.globals.course.details.criteres = [...sub.querySelectorAll(".checkbox-group")[2].querySelectorAll("input:checked")].map(x => x.value);
}
}

const commonBlock = document.getElementById("commonQuestions");
if (commonBlock) {
data.barrieres = [...commonBlock.querySelectorAll("input[name='barrieres']:checked")].map(x => x.value);
data.guidage = [...commonBlock.querySelectorAll("input[name='raisons']:checked")].map(x => x.value);
const otherCommon = commonBlock.querySelectorAll(".other-wrap .other-input");
if (otherCommon.length) data.autresPrecisions = [...otherCommon].map(t => t.value);
}

return data;
}
});
