// ======================================================
// script.js – Version complète (v6 final)
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

// ===== Blocs globaux (Sauts / Course)
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

// ===== Blocs fonctionnels globaux
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
"Dynamomètre manuel","Dynamomètre fixe","Isocinétisme","Plateforme de force","Sans outil","Autre"
];
const paramsForce = [
"Force max","Force moyenne","Force relative (N/kg)","RFD","Angle du pic de force","Endurance"
];
const criteriaForce = [
"Ratio agoniste/antagoniste","Ratio droite/gauche","Valeur seuil"
];
const isokineticSpeeds = ["30°/s","60°/s","120°/s","180°/s","Autre (précisez)"];
const isokineticModes = ["Concentrique","Excentrique","Isométrique","Combiné"];

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

// ===== Helpers
const slug = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-");

// ===== Fonctions utilitaires
function makeOtherReactive(scope, placeholder="Précisez") {
const inputs = scope.querySelectorAll("input[type='checkbox'], input[type='radio']");
inputs.forEach(inp => {
const val = (inp.value||"").toLowerCase();
if (val.includes("autre")) {
inp.addEventListener("change", () => {
const exists = scope.querySelector(".other-input");
if (inp.checked && !exists) {
const div = document.createElement("div");
div.className = "slide show";
div.innerHTML = `<input type="text" class="other-input" placeholder="${placeholder}" required style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;">`;
scope.appendChild(div);
} else if (!inp.checked && exists) {
exists.remove();
}
});
}
});
}

function attachIsokineticHandlers(scope) {
const iso = scope.querySelector("input[value='Isocinétisme']");
if (!iso) return;
iso.addEventListener("change", () => {
let sub = scope.querySelector(".isokinetic-sub");
if (iso.checked) {
if (!sub) {
sub = document.createElement("div");
sub.className = "isokinetic-sub slide show";
sub.innerHTML = `
<label>Vitesse (isocinétisme)</label>
<div class="checkbox-group iso-speed">
${isokineticSpeeds.map(v=>`<label><input type="checkbox" value="${v}">${v}</label>`).join("")}
</div>
<label>Mode de contraction</label>
<div class="checkbox-group iso-mode">
${isokineticModes.map(m=>`<label><input type="checkbox" value="${m}">${m}</label>`).join("")}
</div>`;
scope.appendChild(sub);
makeOtherReactive(sub);
}
} else if (sub) sub.remove();
});
}

// ===== Création des sections dynamiques
function createZoneSection(zoneName){
const id = `section-${slug(zoneName)}`;
if(document.getElementById(id)) return;
const section=document.createElement("div");
section.classList.add("subcard","fade-in");
section.id=id;
section.innerHTML=`
<h3>${zoneName}</h3>
<label>À quel moment testez-vous cette zone ?</label>
<div class="checkbox-group moment">
<label><input type="checkbox" value="Pré-saison"> Pré-saison</label>
<label><input type="checkbox" value="Retour au jeu"> Retour au jeu</label>
<label><input type="checkbox" value="Autre fréquence"> Autre fréquence</label>
</div>
<label>Quels types de tests sont réalisés ?</label>
<div class="checkbox-group types">
${zoneName===headNeckTitle?
`<label><input type="checkbox" value="Test de cognition"> Test de cognition</label>
<label><input type="checkbox" value="Proprioception / Équilibre"> Proprioception / Équilibre</label>
<label><input type="checkbox" value="Questionnaires"> Questionnaires</label>
<label><input type="checkbox" value="Autres données"> Autres données</label>`:
`<label><input type="checkbox" value="Force"> Force</label>
<label><input type="checkbox" value="Mobilité"> Mobilité</label>
<label><input type="checkbox" value="Proprioception / Équilibre"> Proprioception / Équilibre</label>
<label><input type="checkbox" value="Questionnaires"> Questionnaires</label>
<label><input type="checkbox" value="Autres données"> Autres données</label>`}
</div>
<div class="subquestions"></div>`;
zoneQuestionsContainer.appendChild(section);
makeOtherReactive(section);
}

// ===== Gestion des blocs globaux
function toggleGlobalSections() {
const selected = [...zonesCheckboxes].filter(z=>z.checked).map(z=>z.value);
const hasLower = selected.some(z=>lowerBodyZones.includes(z));
const hasUpper = selected.some(z=>upperBodyZones.includes(z));
const hasHead = selected.some(z=>headNeckPair.includes(z));

// --- Tests de sauts
if(hasLower){
globalJumps.dataset.ready="1";
globalJumps.style.display="";
globalJumps.innerHTML=`
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
<label><input type="checkbox" value="RFD"> RFD</label>
<label><input type="checkbox" value="RSI"> RSI</label>
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
</div>`;
makeOtherReactive(globalJumps);
} else {
globalJumps.style.display="none";
delete globalJumps.dataset.ready;
}

// --- Tests de course
if(hasLower||hasHead){
globalCourse.dataset.ready="1";
globalCourse.style.display="";
globalCourse.innerHTML=`
<h3>Tests de course</h3>
<div class="checkbox-group">
<label><input type="checkbox" value="Sprint 10m"> Sprint 10m</label>
<label><input type="checkbox" value="Sprint 20m"> Sprint 20m</label>
<label><input type="checkbox" value="Sprint 30m"> Sprint 30m</label>
<label><input type="checkbox" value="Yoyo"> Yoyo</label>
<label><input type="checkbox" value="30-15 IFT"> 30-15 IFT</label>
<label><input type="checkbox" value="Bronco"> Bronco</label>
<label><input type="checkbox" value="1080 Sprint"> 1080 Sprint</label>
<label><input type="checkbox" value="Autre"> Autre</label>
</div>
<label>Outils</label>
<div class="checkbox-group">
<label><input type="checkbox" value="Chronomètre"> Chronomètre</label>
<label><input type="checkbox" value="Cellules"> Cellules</label>
<label><input type="checkbox" value="GPS"> GPS</label>
<label><input type="checkbox" value="Autre"> Autre</label>
</div>`;
makeOtherReactive(globalCourse);
} else {
globalCourse.style.display="none";
delete globalCourse.dataset.ready;
}

// --- Tests fonctionnels globaux
toggleFunctionalBlocks(hasUpper,hasLower);
}

// ===== Fonction pour blocs fonctionnels
function toggleFunctionalBlocks(hasUpper,hasLower){
if(hasUpper){
globalUpperFunctional.dataset.ready="1";
globalUpperFunctional.style.display="";
globalUpperFunctional.innerHTML=`
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
</div>`;
makeOtherReactive(globalUpperFunctional);
} else {
globalUpperFunctional.style.display="none";
delete globalUpperFunctional.dataset.ready;
}

if(hasLower){
globalLowerFunctional.dataset.ready="1";
globalLowerFunctional.style.display="";
globalLowerFunctional.innerHTML=`
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
</div>`;
makeOtherReactive(globalLowerFunctional);
} else {
globalLowerFunctional.style.display="none";
delete globalLowerFunctional.dataset.ready;
}
}

// ===== Event : création / suppression zones
zonesCheckboxes.forEach(z => z.addEventListener("change",toggleGlobalSections));

// ======================================================
// 🔗 ENVOI AUTOMATIQUE VERS GOOGLE FORM
// ======================================================
function collectFormData() {
const data = {};
const form = document.getElementById("questionnaireForm");
data.role = form.querySelector("input[name='role']:checked")?.value || "";
data.equipe = form.querySelector("input[name='structure']:checked")?.value || "";
data.zones = [...document.querySelectorAll("#zones input:checked")].map(z=>z.value);
data.details = {};
document.querySelectorAll("#zoneQuestions .subcard").forEach(sec=>{
const zone = sec.querySelector("h3")?.textContent?.trim();
if(!zone) return;
const answers=[];
sec.querySelectorAll("input:checked").forEach(chk=>{
answers.push(chk.parentElement.textContent.trim());
});
sec.querySelectorAll(".other-input").forEach(inp=>{
if(inp.value.trim()) answers.push("Autre : "+inp.value.trim());
});
if (answers.length) data.details[zone] = answers;
});

data.timestamp_local = new Date().toLocaleString("fr-FR");
return data;
}

function submitToGoogleForm(data) {
const googleFormURL = "https://docs.google.com/forms/u/0/d/e/1FAIpQLSeNok3wNrafUFIM2VnAo4NKQpdZDaDyFDeVS8dZbXFyt_ySyA/formResponse";
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
const msg = document.getElementById("resultMessage");
msg.style.color = "#0074d9";
msg.textContent = "✅ Réponses transmises à Google Form avec succès. Merci !";
window.scrollTo({ top: 0, behavior: "smooth" });
})
.catch(err => {
const msg = document.getElementById("resultMessage");
msg.style.color = "red";
msg.textContent = "⚠️ Échec de l’envoi au Google Form.";
console.error("Erreur d’envoi :", err);
});
}

submitBtn.addEventListener("click", (e) => {
e.preventDefault();
const formData = collectFormData();
submitToGoogleForm(formData);
});

});
