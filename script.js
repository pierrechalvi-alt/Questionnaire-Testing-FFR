// script.js — V13 (final)
// =============================================================================
// - Base V12 feature set preserved
// - Removes ALL duplicate "Autre" entries across every ".tools-group"
// - Adds "Précisez" text input whenever "Autre" (or "Autres") is checked
// - Head/Neck fusion ("Tête / Rachis cervical") with Force, Mobilité, Cognition
// - Detailed Force pathways (knee ham/quads; hip flex/abd/add; ankle gastroc/soleus etc.; shoulder ASH test)
// - Mobility tools: adds Sit-and-reach (ext genou & lombaire), KTW (cheville, flexion dorsale), Distance doigt-sol (lombaire inclinaisons)
// - Proprio & Questionnaires per zone (exhaustive lists)
// - Global functional tests (MI & MS) with Yes/No gating
// - Global Jumps (Yes/No gating, only if lower-body selected); Global Course (Yes/No gating, if lower-body or head/neck selected)
// - Strict validation + Google Forms submission (entry.1237244370) with JSON payload
// =============================================================================

document.addEventListener("DOMContentLoaded", () => {
// ===== Grab core elements
const zonesCheckboxes = document.querySelectorAll("#zones input[type='checkbox']");
const zoneQuestionsContainer = document.getElementById("zoneQuestions");
const submitBtn = document.getElementById("submitBtn");
const resultMessage = document.getElementById("resultMessage");

const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");
const formSections = document.querySelectorAll(".card");

// ===== Helpers
const slug = (s) => s.toLowerCase()
.normalize("NFD").replace(/[\u0300-\u036f]/g,"")
.replace(/[^a-z0-9]+/g,"-")
.replace(/(^-|-$)/g,"");

const cssEscape = (id) => id.replace(/([ #;?%&,.+*~':"!^$[\]()=>|/@])/g,'\\$1');

const uniq = (arr) => [...new Set(arr)];

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

// ===== Zones groups
const lowerBodyZones = ["Hanche", "Genou", "Cheville / Pied"];
const upperBodyZones = ["Épaule", "Coude", "Poignet / Main"];
const headNeckPair = ["Tête", "Rachis cervical"];
const headNeckTitle = "Tête / Rachis cervical";

// ===== Global unique blocks (insert after zoneQuestions)
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

// ===== Data dictionaries
const toolsForceGeneric = ["Dynamomètre manuel","Dynamomètre fixe","Isocinétisme","Plateforme de force","Sans outil"];
const toolsMobilityGeneric = ["Goniomètre","Inclinomètre"];
const paramsForce = ["Force max","Force moyenne","Force relative (N/kg)","RFD","Angle du pic de force","Endurance"];
const criteriaForce = ["Ratio agoniste/antagoniste","Ratio droite/gauche","Valeur seuil"];
const criteriaMobilityGeneric = ["Comparaison droite/gauche","Valeur seuil"];
const criteriaMobilityLumbar = ["Moyenne du groupe","Valeur seuil"];
const isokineticSpeeds = ["30°/s","60°/s","120°/s","180°/s","Autre"];
const isokineticModes = ["Concentrique","Excentrique","Isométrique","Combiné"];

const proprioByZone = {
"Cheville / Pied": ["Y-Balance Test","Star Excursion","Single Leg Balance Test"],
"Genou": ["Y-Balance Test","Star Excursion","FMS (Lower)"],
"Hanche": ["Y-Balance Test","Star Excursion","FMS (Lower)"],
"Épaule": ["Y-Balance Test (épaule)","FMS (Upper)"],
[headNeckTitle]: ["Test proprio cervical (laser)"],
"Poignet / Main": [],
"Coude": [],
"Rachis lombaire": ["FMS (Core)"]
};

const questionnairesByZone = {
"Genou": ["KOOS","IKDC","Lysholm","Tegner","ACL-RSI","KOS-ADLS","LEFS","Autre"],
"Hanche": ["HAGOS","iHOT-12","HOOS","HOS","Autre"],
"Épaule": ["QuickDASH","DASH","SIRSI","ASES","SPADI","Oxford Shoulder Score","Autre"],
"Coude": ["Oxford Elbow Score","MEPS","DASH","QuickDASH","Autre"],
"Poignet / Main": ["PRWE","DASH","QuickDASH","Boston Carpal Tunnel","Autre"],
"Cheville / Pied": ["CAIT","FAAM-ADL","FAAM-Sport","FAOS","FFI","Autre"],
"Rachis lombaire": ["ODI (Oswestry)","Roland-Morris","Quebec Back Pain","FABQ","Autre"],
[headNeckTitle]: ["SCAT6","Neck Disability Index (NDI)","Copenhagen Neck Functional Scale","Autre"]
};

const testsByMuscle = {
// Genou
"Ischiojambiers": ["McCall 90°","Isométrie 30°","Nordic","Nordic Hold","Razor Curl","Single Leg Bridge","Isocinétique 60°/s","Isocinétique 180°/s","Autre"],
"Quadriceps": ["Isométrie 60°","Leg Extension","Single Leg Squat","Isocinétique 60°/s","Isocinétique 180°/s","Autre"],

// Hanche
"Fléchisseurs hanche": ["Isométrique 45°","Straight Leg Raise (force)","Isocinétique 60°/s","Isocinétique 180°/s","Autre"],
"Abducteurs hanche": ["Side-lying isométrique","Standing belt test","Isocinétique 60°/s","Autre"],
"Adducteurs hanche": ["Squeeze test (5s)","Copenhagen","Isocinétique 60°/s","Autre"],

// Cheville
"Gastrocnémien": ["Heel Raise – genou tendu (1RM)","Heel Raise – max reps","Isométrie 90°","Isocinétique 60°/s","Autre"],
"Soléaire": ["Heel Raise – genou fléchi (1RM)","Max reps","Isométrie 90°","Isocinétique 60°/s","Autre"],
"Inverseurs/Éverseurs": ["Dynamométrie manuelle","Dynamométrie fixe","Isocinétique 30°/s","Autre"],
"Intrinsèques du pied": ["Toe Curl test","Short Foot test","Dynamométrie","Plateforme de pressions","Autre"]
};

// ===== Other-field helpers
function addOtherField(container, checkbox, placeholder = "Précisez") {
// ensure only ONE text input per "Autre" in this container for this checkbox
let key = checkbox.value ? slug(checkbox.value) : "autre";
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

function hasUncheckedOther(scope) {
const others = scope.querySelectorAll("input[type='checkbox'][value='Autre']:checked, input[type='checkbox'][value='Autres']:checked");
for (const oc of others) {
const group = oc.closest(".checkbox-group");
const txt = group && group.querySelector(".other-input");
if (txt && !txt.value.trim()) return true;
}
return false;
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
const otherSpeed = sub.querySelector(".iso-speed input[value='Autre']");
otherSpeed?.addEventListener("change", () => {
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

function addFrequencyOther(sectionEl) {
const freqGroup = sectionEl.querySelector(".moment");
if (!freqGroup) return;
const other = freqGroup.querySelector("input[type='checkbox'][value='Autre fréquence']");
if (!other) return;
other.addEventListener("change", () => addOtherField(freqGroup, other, "Fréquence (précisez)"));
}

// ===== Participant info: show/hide "Précisez votre rôle" only if "Autre" checked
(function bindRoleOther() {
const roleWrap = document.getElementById("role");
const roleOther = roleWrap?.querySelector("input[type='radio'][value='Autre']");
if (roleOther) {
roleWrap.addEventListener("change", () => {
let txt = document.getElementById("role-other-text");
if (roleOther.checked) {
if (!txt) {
txt = document.createElement("div");
txt.id = "role-other-text";
txt.className = "slide show";
txt.innerHTML = `<input type="text" class="other-input" placeholder="Précisez votre rôle" required style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;margin-top:8px;">`;
roleWrap.insertAdjacentElement("afterend", txt);
}
} else if (txt) {
txt.classList.remove("show");
setTimeout(()=> txt.remove(), 250);
}
});
}
})();

// ===== Common questions: add "Autre" text
(function bindCommonOthers() {
const common = document.getElementById("commonQuestions") || document;
makeOtherReactive(common, "Précisez");
})();

// ===== Head/Neck fusion logic
function getZoneKey(zoneName) {
return headNeckPair.includes(zoneName) ? headNeckTitle : zoneName;
}
function anyHeadNeckChecked() {
return [...zonesCheckboxes].some(z => headNeckPair.includes(z.value) && z.checked);
}

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

// ===== Global sections toggling
function toggleGlobalSections() {
const selected = [...zonesCheckboxes].filter(z => z.checked).map(z => z.value);
const hasLower = selected.some(z => lowerBodyZones.includes(z));
const hasHead = selected.some(z => headNeckPair.includes(z));

// Functional tests MS (show if any upper body selected)
const hasUpper = selected.some(z => upperBodyZones.includes(z));
if (hasUpper) {
if (!globalFuncMS.dataset.ready) {
globalFuncMS.dataset.ready = "1";
globalFuncMS.style.display = "";
globalFuncMS.classList.add("fade-in","active");
globalFuncMS.innerHTML = buildFunctionalMSBlock();
makeOtherReactive(globalFuncMS);
}
} else {
globalFuncMS.style.display = "none";
globalFuncMS.innerHTML = "";
delete globalFuncMS.dataset.ready;
}

// Functional tests MI (if any lower body)
if (hasLower) {
if (!globalFuncMI.dataset.ready) {
globalFuncMI.dataset.ready = "1";
globalFuncMI.style.display = "";
globalFuncMI.classList.add("fade-in","active");
globalFuncMI.innerHTML = buildFunctionalMIBlock();
makeOtherReactive(globalFuncMI);
}
} else {
globalFuncMI.style.display = "none";
globalFuncMI.innerHTML = "";
delete globalFuncMI.dataset.ready;
}

// Jumps (only if lower-body; Yes/No gating)
if (hasLower) {
if (!globalJumps.dataset.ready) {
globalJumps.dataset.ready = "1";
globalJumps.style.display = "";
globalJumps.classList.add("fade-in","active");
globalJumps.innerHTML = buildJumpsBlock();
bindYesNoReveal(globalJumps, "q-jumps-yn", "q-jumps-block");
makeOtherReactive(globalJumps);
}
} else {
globalJumps.style.display = "none";
globalJumps.innerHTML = "";
delete globalJumps.dataset.ready;
}

// Course (if lower-body OR head/neck; Yes/No gating)
if (hasLower || hasHead) {
if (!globalCourse.dataset.ready) {
globalCourse.dataset.ready = "1";
globalCourse.style.display = "";
globalCourse.classList.add("fade-in","active");
globalCourse.innerHTML = buildCourseBlock();
bindYesNoReveal(globalCourse, "q-course-yn", "q-course-block");
makeOtherReactive(globalCourse);
}
} else {
globalCourse.style.display = "none";
globalCourse.innerHTML = "";
delete globalCourse.dataset.ready;
}
}

function buildFunctionalMSBlock() {
return `
<h3>Tests fonctionnels globaux — Membre supérieur</h3>
<div class="checkbox-group" id="q-funcms-yn">
<label><input type="radio" name="funcMSYN" value="Oui"> Oui</label>
<label><input type="radio" name="funcMSYN" value="Non"> Non</label>
</div>
<div id="q-funcms-block" class="slide">
<label>Quels tests réalisez-vous ?</label>
<div class="checkbox-group">
<label><input type="checkbox" value="Traction"> Traction</label>
<label><input type="checkbox" value="Développé couché"> Développé couché</label>
<label><input type="checkbox" value="Tirage"> Tirage</label>
<label><input type="checkbox" value="Force grip"> Force grip</label>
<label><input type="checkbox" value="Autre"> Autre</label>
</div>
<label>Outils</label>
<div class="checkbox-group tools-group">
${uniq(["Pas d’outil particulier","Encodeur linéaire"]).map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
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
</div>
`;
}

function buildFunctionalMIBlock() {
return `
<h3>Tests fonctionnels globaux — Membre inférieur</h3>
<div class="checkbox-group" id="q-funcmi-yn">
<label><input type="radio" name="funcMIYN" value="Oui"> Oui</label>
<label><input type="radio" name="funcMIYN" value="Non"> Non</label>
</div>
<div id="q-funcmi-block" class="slide">
<label>Quels tests réalisez-vous ?</label>
<div class="checkbox-group">
<label><input type="checkbox" value="Squat"> Squat</label>
<label><input type="checkbox" value="Montée sur banc"> Montée sur banc</label>
<label><input type="checkbox" value="Soulevé de terre"> Soulevé de terre</label>
<label><input type="checkbox" value="Autre"> Autre</label>
</div>
<label>Outils</label>
<div class="checkbox-group tools-group">
${uniq(["Pas d’outil particulier","Encodeur linéaire"]).map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
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
</div>
`;
}

function buildJumpsBlock() {
return `
<h3>Tests de sauts</h3>
<div class="checkbox-group" id="q-jumps-yn">
<label><input type="radio" name="jumpsYN" value="Oui"> Oui</label>
<label><input type="radio" name="jumpsYN" value="Non"> Non</label>
</div>
<div id="q-jumps-block" class="slide">
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
<div class="checkbox-group tools-group">
${uniq(["Plateforme de force","Centimétrie","Sans outil"]).map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
<label><input type="checkbox" value="Autre"> Autre</label>
</div>

<label>Critères d’évaluation</label>
<div class="checkbox-group">
<label><input type="checkbox" value="Comparaison droite/gauche"> Comparaison droite/gauche</label>
<label><input type="checkbox" value="Valeur seuil"> Valeur seuil</label>
</div>
</div>
`;
}

function buildCourseBlock() {
return `
<h3>Tests de course</h3>
<div class="checkbox-group" id="q-course-yn">
<label><input type="radio" name="courseYN" value="Oui"> Oui</label>
<label><input type="radio" name="courseYN" value="Non"> Non</label>
</div>
<div id="q-course-block" class="slide">
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
<div class="checkbox-group tools-group">
${uniq(["Chronomètre","Cellules","GPS","1080 Sprint"]).map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
<label><input type="checkbox" value="Autre"> Autre</label>
</div>

<label>Critères d’évaluation</label>
<div class="checkbox-group">
<label><input type="checkbox" value="Moyenne par poste"> Moyenne par poste</label>
<label><input type="checkbox" value="Valeur seuil"> Valeur seuil</label>
</div>
</div>
`;
}

function bindYesNoReveal(root, ynId, blockId) {
const wrap = root.querySelector(`#${cssEscape(ynId)}`);
const block = root.querySelector(`#${cssEscape(blockId)}`);
if (!wrap || !block) return;
wrap.addEventListener("change", () => {
const yes = wrap.querySelector("input[value='Oui']")?.checked;
if (yes) {
block.classList.add("show");
} else {
block.classList.remove("show");
setTimeout(()=>{
block.querySelectorAll("input:checked").forEach(i => i.checked = false);
block.querySelectorAll(".other-input").forEach(t => t.value = "");
}, 250);
}
});
}

// ===== Create/remove zone sections
function createZoneSection(zoneName) {
if (document.getElementById(`section-${slug(zoneName)}`)) return;

const section = document.createElement("div");
section.classList.add("subcard","fade-in");
section.id = `section-${slug(zoneName)}`;

// Types: for head/neck include Force/Mobilité/Cognition/Proprio/Questionnaires/Autres données
const isHeadNeck = (zoneName === headNeckTitle);

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
${isHeadNeck ? `
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
if (cb.value === "Proprioception / Équilibre") subSection = createProprioBlock(zoneName, id, i);
if (cb.value === "Questionnaires") subSection = createQuestionnaireBlock(zoneName, id, i);
if (cb.value === "Autres données") subSection = createOtherDataBlock(zoneName, id, i);
if (cb.value === "Force") subSection = createForceBlock(zoneName, id, i);
if (cb.value === "Mobilité") subSection = createMobilityBlock(zoneName, id, i);
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

// ===== Blocks implementation
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

function toolsGroupHTML(baseTools) {
// ensure unique tools + one "Autre" at end
const uniqTools = uniq(baseTools);
return `
<div class="checkbox-group tools-group">
${uniqTools.map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
<label><input type="checkbox" value="Autre"> Autre</label>
</div>`;
}

function paramsForceHTML() {
return `
<label>Paramètres étudiés</label>
<div class="checkbox-group">
${paramsForce.map(p => `<label><input type="checkbox" value="${p}"> ${p}</label>`).join("")}
</div>`;
}

function criteriaForceHTML() {
return `
<label>Critères d’évaluation</label>
<div class="checkbox-group">
${criteriaForce.map(c => `<label><input type="checkbox" value="${c}"> ${c}</label>`).join("")}
</div>`;
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
${toolsGroupHTML(toolsForceGeneric)}

<label>Tests spécifiques</label>
<div class="checkbox-group muscle-tests">
${testList.map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
<label><input type="checkbox" value="Autre"> Autre</label>
</div>

${paramsForceHTML()}
${criteriaForceHTML()}
`;
wrap.querySelectorAll(".checkbox-group").forEach(g => makeOtherReactive(g));
attachIsokineticHandlers(wrap);
return wrap;
}

function createForceBlock(zoneName, id, delayIndex) {
const div = document.createElement("div");
div.id = id;
div.className = "slide stagger";
div.style.animationDelay = `${delayIndex * 0.1}s`;

const moves = [];
moves.push("Flexion/Extension");
if (!["Genou","Cheville / Pied","Coude","Poignet / Main"].includes(zoneName)) moves.push("Rotations");
if (["Épaule","Hanche"].includes(zoneName)) moves.push("Adduction/Abduction");
if (zoneName === "Cheville / Pied") {
moves.push("Éversion/Inversion");
moves.push("Intrinsèques du pied");
}
if (zoneName === "Épaule") moves.push("ASH Test");
if (zoneName === "Poignet / Main") moves.push("Inclinaisons"); // demandé

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
<label>Position(s)</label>
<div class="checkbox-group">
<label><input type="checkbox" value="I (180°)"> I (180°)</label>
<label><input type="checkbox" value="Y (135°)"> Y (135°)</label>
<label><input type="checkbox" value="T (90°)"> T (90°)</label>
<label><input type="checkbox" value="I (0°)"> I (0°)</label>
<label><input type="checkbox" value="Autre"> Autre</label>
</div>

<label>Outils utilisés</label>
${toolsGroupHTML(toolsForceGeneric)}

${paramsForceHTML()}
${criteriaForceHTML()}
`;
makeOtherReactive(block);
attachIsokineticHandlers(block);

} else {
block.innerHTML = `
<h5>${mb.value}</h5>
<label>Outils utilisés</label>
${toolsGroupHTML(toolsForceGeneric)}
${paramsForceHTML()}
${criteriaForceHTML()}
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

// Tools for mobility
let tools = [...toolsMobilityGeneric];
if ((zoneName === "Genou" && mb.value === "Flexion/Extension") || zoneName === "Rachis lombaire") {
tools = [...tools, "Sit-and-reach"];
}
if (zoneName === "Cheville / Pied" && mb.value.toLowerCase().includes("flexion")) {
tools = [...tools, "Knee-to-wall (KTW)"];
}
if (zoneName === "Rachis lombaire" && mb.value === "Inclinaisons") {
tools = [...tools, "Distance doigt-sol"];
}

const crits = (zoneName === "Rachis lombaire") ? criteriaMobilityLumbar : criteriaMobilityGeneric;

block.innerHTML = `
<h5 style="margin-top:10px">${mb.value}</h5>
<label>Outils utilisés</label>
${toolsGroupHTML(tools)}

<label>Critères d’évaluation</label>
<div class="checkbox-group">
${crits.map(c => `<label><input type="checkbox" value="${c}"> ${c}</label>`).join("")}
</div>
`;
details.appendChild(block);
block.querySelectorAll(".checkbox-group").forEach(g => makeOtherReactive(g));
attachIsokineticHandlers(block);
} else if (existing) {
existing.classList.remove("show");
setTimeout(() => existing.remove(), 250);
}
});
});

return div;
}

// ===== Validation + Google Forms submission
function collectFormJSON() {
const data = {};

// Participant
const role = document.querySelector("input[name='role']:checked")?.value || null;
data.participant_role = role;
const roleOtherTxt = document.querySelector("#role-other-text .other-input")?.value?.trim();
if (role === "Autre" && roleOtherTxt) data.participant_role_precisez = roleOtherTxt;

// Structure/equipe (whatever the radios are named in HTML; we serialize all checked)
const structChecked = document.querySelector("input[name='structure']:checked");
if (structChecked) data.structure = structChecked.value;
// If you renamed to team radios, add similar collection here if needed.

// Zones chosen
data.zones = [...zonesCheckboxes].filter(z => z.checked).map(z => z.value);

// Serialize all dynamic sections as HTML snapshot
data.sections_html = zoneQuestionsContainer.innerHTML;

// Globals
if (globalFuncMS.dataset.ready) data.func_ms_html = globalFuncMS.innerHTML;
if (globalFuncMI.dataset.ready) data.func_mi_html = globalFuncMI.innerHTML;
if (globalJumps.dataset.ready) data.jumps_html = globalJumps.innerHTML;
if (globalCourse.dataset.ready) data.course_html = globalCourse.innerHTML;

// Common questions (checked values + others)
const common = document.getElementById("commonQuestions");
if (common) {
const commonChecks = [...common.querySelectorAll("input[type='checkbox']:checked")].map(i => i.value);
data.common_checked = commonChecks;
// Grab "Autre" texts if any
const others = [...common.querySelectorAll(".other-input")].map(t => t.value.trim()).filter(Boolean);
if (others.length) data.common_others = others;
}

return data;
}

function validateBeforeSubmit() {
// Participant mandatory
const role = document.querySelector("input[name='role']:checked");
const structure = document.querySelector("input[name='structure']:checked");
if (!role || !structure) {
return "⚠️ Merci de compléter les informations générales.";
}
if (role.value === "Autre") {
const txt = document.querySelector("#role-other-text .other-input");
if (!txt || !txt.value.trim()) return "⚠️ Merci de préciser votre rôle.";
}

const selectedZonesRaw = [...zonesCheckboxes].filter(z => z.checked);
if (selectedZonesRaw.length === 0) {
return "⚠️ Merci de sélectionner au moins une zone anatomique.";
}

const selectedZoneKeys = [];
const headOrNeck = selectedZonesRaw.some(z => headNeckPair.includes(z.value));
if (headOrNeck) selectedZoneKeys.push(headNeckTitle);
selectedZonesRaw.forEach(z => {
if (!headNeckPair.includes(z.value)) selectedZoneKeys.push(z.value);
});

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

// If "Force" checked, need at least one move; and inside, need tools, params, criteria; also "Autre" specified
const forceChecked = sec.querySelector(".types input[value='Force']:checked");
if (forceChecked) {
const mArea = sec.querySelector(".force-moves");
if (!mArea || !mArea.querySelector("input:checked")) return true;
if (hasUncheckedOther(sec)) return true;
const isoOther = sec.querySelector(".isokinetic-sub .iso-speed input[value='Autre']:checked");
if (isoOther) {
const txt = sec.querySelector(".isokinetic-sub .iso-speed .other-input");
if (!txt || !txt.value.trim()) return true;
}
}

// If "Mobilité" checked
const mobChecked = sec.querySelector(".types input[value='Mobilité']:checked");
if (mobChecked) {
const mArea = sec.querySelector(".mob-moves");
if (!mArea || !mArea.querySelector("input:checked")) return true;
if (hasUncheckedOther(sec)) return true;
}

// Questionnaires / Autres données other fields
if (hasUncheckedOther(sec)) return true;

// Autres données: must have a text
const otherData = sec.querySelector(".types input[value='Autres données']:checked");
if (otherData) {
const txt = sec.querySelector(".other-input");
if (!txt || !txt.value.trim()) return true;
}

return false;
});

if (zonesIncomplete) {
return "⚠️ Merci de compléter toutes les sous-sections (mouvements, outils, tests, paramètres, critères, précisions…).";
}

// Globals "Autre" must be specified if checked
for (const g of [globalJumps, globalCourse, globalFuncMI, globalFuncMS]) {
if (!g || !g.dataset.ready) continue;
if (hasUncheckedOther(g)) {
return "⚠️ Merci de préciser les champs 'Autre' dans les sections globales.";
}
}

return null;
}

// ===== Submit
submitBtn.addEventListener("click", (e) => {
e.preventDefault();
resultMessage.textContent = "";
resultMessage.style.color = "red";

const err = validateBeforeSubmit();
if (err) {
resultMessage.textContent = err;
return;
}

// Build payload for Google Forms
const payload = collectFormJSON();
const json = JSON.stringify(payload);

const formUrl = "https://docs.google.com/forms/u/0/d/e/1FAIpQLSeNok3wNrafUFIM2VnAo4NKQpdZDaDyFDeVS8dZbXFyt_ySyA/formResponse";
const entryKey = "entry.1237244370"; // single long-answer field in your Form

const body = new URLSearchParams();
body.append(entryKey, json);

fetch(formUrl, {
method: "POST",
mode: "no-cors",
headers: { "Content-Type": "application/x-www-form-urlencoded" },
body
}).then(() => {
resultMessage.style.color = "#0074d9";
resultMessage.textContent = "✅ Merci ! Vos réponses ont été transmises.";
window.scrollTo({ top: 0, behavior: "smooth" });
}).catch(() => {
resultMessage.style.color = "#0074d9";
resultMessage.textContent = "✅ Réponses prêtes. Envoi silencieux (no-cors). Vérifiez vos réponses dans Google Forms.";
});
});

// Initial progress
updateProgress();
});
