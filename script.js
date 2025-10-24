// ============================================================================
// script.js — V16 FINALE (activée Google Form)
// Intègre V8→V15 + dernières demandes utilisateur (janv 2025)
// - Équipes : "7 masculin", "7 féminin" (remplace VII)
// - Course regroupée : Vitesse / Changement de direction / Énergétique
// - Critères : "Valeur de référence individuelle" + "Autre (précisez)"
// - Globaux MI : paramètres = "Résistance maximale", "Isométrie", "Autre"
// - Champs "Autre" partout → champ texte obligatoire quand coché
// - Gating Oui/Non pour Sauts / Course / Globaux MI & MS
// - Aucune duplication de "Autre" dans les groupes "Outils" & "Tests spécifiques"
// - Inclinaisons force & mobilité pour Cervical & Lombaire
// - Poignet/Main : Inclinaisons en force & mobilité
// - Envoi réel vers Google Form (URL fournie par l'utilisateur)
// ============================================================================

/* =============================== CONFIG =============================== */

const GOOGLE_FORM_URL = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSeNok3wNrafUFIM2VnAo4NKQpdZDaDyFDeVS8dZbXFyt_ySyA/formResponse';

/** 
 * IMPORTANT : mappez vos champs Google Form ici (exemples). 
 * Remplacez les entry.XXXX... par les codes de votre Form.
 * Vous pouvez étendre la sérialisation selon vos besoins réels.
 */
const ENTRY_MAP = {
  role: 'entry.ROLE_PLACEHOLDER',              // radio rôle
  role_autre: 'entry.ROLE_AUTRE_PLACEHOLDER',  // texte autre rôle
  equipe: 'entry.EQUIPE_PLACEHOLDER',          // radio équipe
  equipe_autre: 'entry.EQUIPE_AUTRE_PLACEHOLDER', // texte autre équipe
  zones: 'entry.ZONES_PLACEHOLDER',            // zones cochées (concat)
  payload_json: 'entry.PAYLOAD_JSON_PLACEHOLDER' // dump JSON (fallback)
};

/* ============================ DONNÉES LISTES =========================== */

// Groupes d’articulations
const LOWER_ZONES = ["Hanche", "Genou", "Cheville / Pied"];
const UPPER_ZONES = ["Épaule", "Coude", "Poignet / Main"];
const HEAD_NECK_PAIR = ["Tête", "Rachis cervical"];
const HEAD_NECK_TITLE = "Tête / Rachis cervical";

// Outils génériques (Force)
const TOOLS_FORCE = ["Dynamomètre manuel","Dynamomètre fixe","Isocinétisme","Plateforme de force","Sans outil","Autre"];
// Outils Mobilité
const TOOLS_MOB = ["Goniomètre","Inclinomètre","Autre"];

// Vitesses / Modes isocinétique
const ISOK_SPEEDS = ["30°/s","60°/s","120°/s","180°/s","Autre (précisez)"];
const ISOK_MODES = ["Concentrique","Excentrique","Isométrique","Combiné"];

// Paramètres Force
const PARAMS_FORCE = ["Force max","Force moyenne","Force relative (N/kg)","RFD","Angle du pic de force","Endurance"];

// Critères (remplacé par "Valeur de référence individuelle")
const CRITERIA_COMMON = ["Ratio agoniste/antagoniste","Ratio droite/gauche","Valeur de référence individuelle","Autre"];

// Proprio par zone
const PROPRIO_BY_ZONE = {
  "Cheville / Pied": ["Y-Balance Test","Star Excursion","Single Leg Balance Test","Autre"],
  "Genou": ["Y-Balance Test","Star Excursion","FMS (Lower)","Autre"],
  "Hanche": ["Y-Balance Test","Star Excursion","FMS (Lower)","Autre"],
  "Épaule": ["Y-Balance Test (épaule)","FMS (Upper)","Autre"],
  [HEAD_NECK_TITLE]: ["Test proprio cervical (laser)","Autre"],
  "Poignet / Main": ["Autre"],
  "Coude": ["Autre"],
  "Rachis lombaire": ["FMS (Core)","Autre"]
};

// Questionnaires par zone
const QUESTIONNAIRES_BY_ZONE = {
  "Genou": ["KOOS","IKDC","Lysholm","Tegner","ACL-RSI","KOS-ADLS","LEFS","Autre"],
  "Hanche": ["HAGOS","iHOT-12","HOOS","HOS","Autre"],
  "Épaule": ["QuickDASH","DASH","SIRSI","ASES","SPADI","Oxford Shoulder Score","Autre"],
  "Coude": ["Oxford Elbow Score","MEPS","DASH","QuickDASH","Autre"],
  "Poignet / Main": ["PRWE","DASH","QuickDASH","Boston Carpal Tunnel","Autre"],
  "Cheville / Pied": ["CAIT","FAAM-ADL","FAAM-Sport","FAOS","FFI","Autre"],
  "Rachis lombaire": ["ODI (Oswestry)","Roland-Morris","Quebec Back Pain","FABQ","Autre"],
  [HEAD_NECK_TITLE]: ["SCAT6","Neck Disability Index (NDI)","Copenhagen Neck Functional Scale","Autre"]
};

// Tests de course — regroupés en catégories
const RUN_TESTS = {
  vitesse: ["Sprint 10m","Sprint 20m","Sprint 30m","Vmax","1080 Sprint"],
  cod: ["505","T-Test","Illinois","Shuttle test"],
  energetique: ["Yoyo","IR test","30-15 IFT","MAS test","RSA","Bronco","Autre"]
};

// Outils course
const RUN_TOOLS = ["Chronomètre","Cellules","GPS","1080 Sprint","Autres"];

// Paramètres sauts + critères communs sauts
const JUMP_PARAMS = ["Force max","Hauteur","Temps de vol","Pic de puissance","Puissance relative","RFD","RSI","Distance"];
const JUMP_TOOLS = ["Plateforme de force","Centimétrie","Sans outil","Autre"];
const JUMP_CRITERIA = ["Comparaison droite/gauche","Valeur de référence individuelle","Autre"];

// Globaux MS & MI
const GLOBAL_MS = { tests: ["Traction","Développé couché","Tirage","Force grippe"], outils: ["Pas d’outil particulier","Encodeur linéaire","Autre"], params: ["Isométrie","Résistance maximale","Autre"] };
const GLOBAL_MI = { tests: ["Squat","Montée de banc","Soulevé de terre"], outils: ["Pas d’outil particulier","Encodeur linéaire","Autre"], params: ["Isométrie","Résistance maximale","Autre"] };

// Tests par muscle (force) — sans isocinétique dans "tests spécifiques" (isokinétisme traité via outils)
const TESTS_BY_MUSCLE = {
  // Genou
  "Ischiojambiers": ["McCall 90°","Isométrie 30°","Nordic","Nordic Hold","Razor Curl","Single Leg Bridge","Autre"],
  "Quadriceps": ["Isométrie 60°","Leg Extension","Single Leg Squat","Autre"],
  // Hanche
  "Fléchisseurs hanche": ["Isométrique 45°","Straight Leg Raise (force)","Autre"],
  "Abducteurs hanche": ["Side-lying isométrique","Standing belt test","Autre"],
  "Adducteurs hanche": ["Squeeze test (5s)","Copenhagen","Autre"],
  // Cheville
  "Gastrocnémien": ["Heel Raise – genou tendu (1RM)","Heel Raise – max reps","Isométrie 90°","Autre"],
  "Soléaire": ["Heel Raise – genou fléchi (1RM)","Max reps","Isométrie 90°","Autre"],
  "Inverseurs/Éverseurs": ["Dynamométrie manuelle","Dynamométrie fixe","Autre"],
  "Intrinsèques du pied": ["Toe Curl test","Short Foot test","Dynamométrie","Plateforme de pressions","Autre"]
};

/* ============================ HELPERS UI/LOGIC ============================ */

const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
const slug = s => (s||"").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-");
const cssEscape = id => id.replace(/([ #;?%&,.+*~\':\"!^$[\]()=>|/@])/g,'\\$1');

function makeOtherReactive(scope, placeholder="Précisez") {
  const inputs = $$("input[type='checkbox'],input[type='radio']", scope);
  inputs.forEach(inp => {
    const v = (inp.value||"").toLowerCase();
    if (v === "autre" || v === "autres" || v.includes("autre")) {
      inp.addEventListener("change", () => toggleOtherField(inp, placeholder));
    }
  });
}

function toggleOtherField(input, placeholder="Précisez") {
  const group = input.closest(".checkbox-group") || input.parentElement;
  let wrap = group.querySelector(".other-wrap");
  if (input.checked) {
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "other-wrap";
      wrap.innerHTML = `<input type="text" class="other-input" placeholder="${placeholder}" required style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;margin-top:8px;">`;
      group.appendChild(wrap);
    }
  } else if (wrap) {
    wrap.remove();
  }
}

function attachIsokineticHandlers(scope) {
  $$(".tools-group", scope).forEach(group => {
    const iso = $("input[type='checkbox'][value='Isocinétisme']", group);
    if (!iso) return;
    const ensure = () => {
      let sub = group.parentElement.querySelector(".isokinetic-sub");
      if (iso.checked) {
        if (!sub) {
          sub = document.createElement("div");
          sub.className = "isokinetic-sub";
          sub.innerHTML = `
            <label>Vitesse (isocinétisme)</label>
            <div class="checkbox-group iso-speed">
              ${ISOK_SPEEDS.map(v => `<label><input type="checkbox" value="${v}"> ${v}</label>`).join("")}
            </div>
            <label>Mode de contraction (isocinétisme)</label>
            <div class="checkbox-group iso-mode">
              ${ISOK_MODES.map(m => `<label><input type="checkbox" value="${m}"> ${m}</label>`).join("")}
            </div>`;
          group.insertAdjacentElement("afterend", sub);
          makeOtherReactive(sub, "Précisez");
        }
      } else if (sub) {
        sub.remove();
      }
    };
    iso.addEventListener("change", ensure);
    ensure();
  });
}

function criteriaBlockHtml() {
  return `
    <label>Critères d’évaluation</label>
    <div class="checkbox-group criteria-group">
      ${CRITERIA_COMMON.map(c => `<label><input type="checkbox" value="${c}"> ${c}</label>`).join("")}
    </div>`;
}

function paramsBlockHtml(paramsList) {
  return `
    <label>Paramètres étudiés</label>
    <div class="checkbox-group params-group">
      ${paramsList.map(p => `<label><input type="checkbox" value="${p}"> ${p}</label>`).join("")}
    </div>`;
}

function toolsBlockHtml(force=false, extras=[]) {
  const base = force ? TOOLS_FORCE : TOOLS_MOB;
  // garantir un seul "Autre"
  const list = Array.from(new Set([...base, ...extras]));
  return `
    <label>Outils utilisés</label>
    <div class="checkbox-group tools-group">
      ${list.map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
    </div>`;
}

function addOtherEverywhere(scope) {
  makeOtherReactive(scope, "Précisez");
  // critères : si "Autre", champ texte
  $$(".criteria-group", scope).forEach(grp => makeOtherReactive(grp, "Critère (précisez)"));
  // params : si "Autre", champ texte
  $$(".params-group", scope).forEach(grp => makeOtherReactive(grp, "Paramètre (précisez)"));
}

/* ============================ RENDUS PAR ZONE ============================ */

function movementListForce(zone) {
  const moves = [];
  // De base
  moves.push("Flexion/Extension");
  // Rotations sauf zones exclues
  if (!["Genou", "Cheville / Pied", "Coude", "Poignet / Main"].includes(zone)) moves.push("Rotations");
  // Adduction/Abduction pour Épaule & Hanche
  if (["Épaule", "Hanche"].includes(zone)) moves.push("Adduction/Abduction");
  // Éversion/Inversion pour Cheville
  if (zone === "Cheville / Pied") {
    moves.push("Éversion/Inversion");
    moves.push("Intrinsèques du pied");
  }
  // Inclinaisons pour Cervical & Lombaire (demandé)
  if ([HEAD_NECK_TITLE, "Rachis lombaire"].includes(zone)) moves.push("Inclinaisons");
  // Inclinaisons pour Poignet/Main (demandé)
  if (zone === "Poignet / Main") moves.push("Inclinaisons");
  // ASH test épaule
  if (zone === "Épaule") moves.push("ASH Test");
  return moves;
}

function movementListMobility(zone) {
  const moves = [];
  moves.push("Flexion/Extension");
  if (!["Genou","Cheville / Pied","Coude","Poignet / Main"].includes(zone)) moves.push("Rotations");
  if (["Épaule","Hanche"].includes(zone)) moves.push("Adduction/Abduction");
  if (zone === "Cheville / Pied") moves.push("Éversion/Inversion");
  // Inclinaisons pour Cervical & Lombaire (demandé)
  if ([HEAD_NECK_TITLE, "Rachis lombaire"].includes(zone)) moves.push("Inclinaisons");
  // Inclinaisons pour Poignet/Main (demandé)
  if (zone === "Poignet / Main") moves.push("Inclinaisons");
  return moves;
}

function mobilityToolsExtra(zone, moveLabel) {
  let extra = [];
  if ((zone === "Genou" && moveLabel === "Flexion/Extension") || zone === "Rachis lombaire") {
    extra = [...extra, "Sit-and-reach"];
  }
  if (zone === "Cheville / Pied" && moveLabel.toLowerCase().includes("flexion")) {
    extra = [...extra, "Knee-to-wall (KTW)"];
  }
  if (zone === "Rachis lombaire" && moveLabel === "Inclinaisons") {
    extra = [...extra, "Distance doigt-sol"];
  }
  return extra;
}

function createForceBlock(zoneName) {
  const div = document.createElement("div");
  div.className = "subcard";
  const moves = movementListForce(zoneName);
  div.innerHTML = `
    <h4>Force – ${zoneName}</h4>
    <label>Quels mouvements évaluez-vous en force ?</label>
    <div class="checkbox-group force-moves">
      ${moves.map(m => `<label><input type="checkbox" value="${m}"> ${m}</label>`).join("")}
    </div>
    <div class="force-details"></div>`;

  const details = $(".force-details", div);
  $$(".force-moves input", div).forEach((mb, i) => {
    mb.addEventListener("change", () => {
      const mid = `${slug(zoneName)}-force-${slug(mb.value)}`;
      const existing = details.querySelector(`#${cssEscape(mid)}`);
      if (mb.checked) {
        const block = document.createElement("div");
        block.id = mid;
        block.className = "nested";
        // cas particuliers par articulation / mouvement
        if (zoneName === "Genou" && mb.value === "Flexion/Extension") {
          block.innerHTML = `
            <h5>${mb.value}</h5>
            <label>Groupe musculaire</label>
            <div class="checkbox-group knee-muscles">
              <label><input type="checkbox" value="Ischiojambiers"> Ischiojambiers</label>
              <label><input type="checkbox" value="Quadriceps"> Quadriceps</label>
            </div>
            <div class="knee-muscles-details"></div>`;
          const dWrap = $(".knee-muscles-details", block);
          $$(".knee-muscles input", block).forEach((mc, j) => {
            mc.addEventListener("change", () => {
              const gid = `${mid}-${slug(mc.value)}`;
              const ex = dWrap.querySelector(`#${cssEscape(gid)}`);
              if (mc.checked && !ex) dWrap.appendChild(createMuscleDetail(zoneName, mc.value, gid, true));
              else if (!mc.checked && ex) ex.remove();
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
            <div class="hip-muscles-details"></div>`;
          const dWrap = $(".hip-muscles-details", block);
          $$(".hip-muscles input", block).forEach((mc, j) => {
            mc.addEventListener("change", () => {
              const gid = `${mid}-${slug(mc.value)}`;
              const ex = dWrap.querySelector(`#${cssEscape(gid)}`);
              if (mc.checked && !ex) dWrap.appendChild(createMuscleDetail(zoneName, mc.value, gid, true));
              else if (!mc.checked && ex) ex.remove();
            });
          });
        } else if (zoneName === "Cheville / Pied" && (mb.value.includes("Flexion/Extension") || mb.value.includes("Éversion/Inversion") || mb.value.includes("Intrinsèques"))) {
          if (mb.value.includes("Flexion/Extension")) {
            block.innerHTML = `
              <h5>${mb.value}</h5>
              <label>Groupe musculaire</label>
              <div class="checkbox-group ankle-muscles">
                <label><input type="checkbox" value="Gastrocnémien"> Gastrocnémien</label>
                <label><input type="checkbox" value="Soléaire"> Soléaire</label>
              </div>
              <div class="ankle-muscles-details"></div>`;
            const dWrap = $(".ankle-muscles-details", block);
            $$(".ankle-muscles input", block).forEach((mc, j) => {
              mc.addEventListener("change", () => {
                const gid = `${mid}-${slug(mc.value)}`;
                const ex = dWrap.querySelector(`#${cssEscape(gid)}`);
                if (mc.checked && !ex) dWrap.appendChild(createMuscleDetail(zoneName, mc.value, gid, true));
                else if (!mc.checked && ex) ex.remove();
              });
            });
          } else if (mb.value.includes("Éversion/Inversion")) {
            const gid = `${mid}-inv-ev`;
            block.innerHTML = `<h5>${mb.value}</h5><div class="inv-ev-details"></div>`;
            $(".inv-ev-details", block).appendChild(createMuscleDetail(zoneName, "Inverseurs/Éverseurs", gid, true));
          } else {
            const gid = `${mid}-intrinseques`;
            block.innerHTML = `<h5>Intrinsèques du pied</h5><div class="foot-intr-details"></div>`;
            $(".foot-intr-details", block).appendChild(createMuscleDetail(zoneName, "Intrinsèques du pied", gid, true));
          }
        } else if (zoneName === "Épaule" && mb.value === "ASH Test") {
          block.innerHTML = `
            <h5>ASH Test</h5>
            ${toolsBlockHtml(true)}
            <label>Dans quelle(s) position(s) évaluez-vous l'ASH test ?</label>
            <div class="checkbox-group">
              <label><input type="checkbox" value="I (180°)"> I (180°)</label>
              <label><input type="checkbox" value="Y (135°)"> Y (135°)</label>
              <label><input type="checkbox" value="T (90°)"> T (90°)</label>
              <label><input type="checkbox" value="I (0°)"> I (0°)</label>
              <label><input type="checkbox" value="Autre"> Autre</label>
            </div>
            ${paramsBlockHtml(PARAMS_FORCE)}
            ${criteriaBlockHtml()}`;
          addOtherEverywhere(block);
          attachIsokineticHandlers(block);
        } else {
          // Mouvement "simple"
          let extra = [];
          if (zoneName === "Rachis lombaire" && mb.value === "Flexion/Extension") {
            extra = ["Test de Shirado","Test de Sorensen"];
          }
          block.innerHTML = `
            <h5>${mb.value}</h5>
            ${toolsBlockHtml(true, extra)}
            ${paramsBlockHtml(PARAMS_FORCE)}
            ${criteriaBlockHtml()}`;
          addOtherEverywhere(block);
          attachIsokineticHandlers(block);
        }
        details.appendChild(block);
      } else if (existing) {
        existing.remove();
      }
    });
  });

  return div;
}

function createMuscleDetail(zoneName, muscleLabel, gid, withParams=true) {
  const wrap = document.createElement("div");
  wrap.id = gid;
  wrap.className = "nested";
  const list = TESTS_BY_MUSCLE[muscleLabel] || ["Autre"];
  wrap.innerHTML = `
    <h6 style="margin:8px 0">${muscleLabel}</h6>
    ${toolsBlockHtml(true)}
    <label>Tests spécifiques</label>
    <div class="checkbox-group muscle-tests">
      ${Array.from(new Set(list)).map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
    </div>
    ${withParams ? paramsBlockHtml(PARAMS_FORCE) : ""}
    ${criteriaBlockHtml()}`;
  addOtherEverywhere(wrap);
  attachIsokineticHandlers(wrap);
  return wrap;
}

function createMobilityBlock(zoneName) {
  const div = document.createElement("div");
  div.className = "subcard";
  const moves = movementListMobility(zoneName);
  div.innerHTML = `
    <h4>Mobilité – ${zoneName}</h4>
    <label>Quels mouvements évaluez-vous en mobilité ?</label>
    <div class="checkbox-group mob-moves">
      ${moves.map(m => `<label><input type="checkbox" value="${m}"> ${m}</label>`).join("")}
    </div>
    <div class="mob-details"></div>`;

  const details = $(".mob-details", div);
  $$(".mob-moves input", div).forEach((mb, i) => {
    mb.addEventListener("change", () => {
      const mid = `${slug(zoneName)}-mob-${slug(mb.value)}`;
      const existing = details.querySelector(`#${cssEscape(mid)}`);
      if (mb.checked) {
        const block = document.createElement("div");
        block.id = mid;
        block.className = "nested";
        block.innerHTML = `
          <h5>${mb.value}</h5>
          ${toolsBlockHtml(false, mobilityToolsExtra(zoneName, mb.value))}
          ${criteriaBlockHtml()}`;
        addOtherEverywhere(block);
        details.appendChild(block);
      } else if (existing) {
        existing.remove();
      }
    });
  });

  return div;
}

function createProprioBlock(zoneName) {
  const div = document.createElement("div");
  div.className = "subcard";
  const list = PROPRIO_BY_ZONE[zoneName] || ["Autre"];
  div.innerHTML = `
    <h4>Proprioception / Équilibre – ${zoneName}</h4>
    <label>Quels tests utilisez-vous ?</label>
    <div class="checkbox-group proprio-tests">
      ${list.map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
    </div>
    ${criteriaBlockHtml()}`;
  addOtherEverywhere(div);
  return div;
}

function createQuestionnaireBlock(zoneName) {
  const div = document.createElement("div");
  div.className = "subcard";
  const list = QUESTIONNAIRES_BY_ZONE[zoneName] || ["Autre"];
  div.innerHTML = `
    <h4>Questionnaires – ${zoneName}</h4>
    <div class="checkbox-group q-list">
      ${list.map(q => `<label><input type="checkbox" value="${q}"> ${q}</label>`).join("")}
    </div>`;
  addOtherEverywhere(div);
  return div;
}

function createOtherDataBlock(zoneName) {
  const div = document.createElement("div");
  div.className = "subcard";
  div.innerHTML = `
    <h4>Autres données – ${zoneName}</h4>
    <input type="text" class="other-input" placeholder="Précisez la donnée collectée" required
      style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;">`;
  return div;
}

/* ============================ BLOCS GLOBAUX ============================ */

function buildGlobalJumps(container) {
  const block = document.createElement("div");
  block.className = "subcard";
  block.id = "global-jumps";
  block.innerHTML = `
    <h3>Tests de sauts</h3>
    <div class="checkbox-group">
      <label><input type="radio" name="use-jumps" value="Oui"> Oui</label>
      <label><input type="radio" name="use-jumps" value="Non" checked> Non</label>
    </div>
    <div class="jumps-body" style="display:none">
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
      ${paramsBlockHtml(JUMP_PARAMS)}
      <label>Outils</label>
      <div class="checkbox-group">
        ${JUMP_TOOLS.map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
      </div>
      ${criteriaBlockHtml()}
    </div>`;
  addOtherEverywhere(block);
  const radios = $$("input[name='use-jumps']", block);
  const body = $(".jumps-body", block);
  radios.forEach(r => r.addEventListener("change", () => {
    body.style.display = (r.value === "Oui" && r.checked) ? "" : "none";
  }));
  container.appendChild(block);
}

function buildGlobalCourse(container) {
  const block = document.createElement("div");
  block.className = "subcard";
  block.id = "global-course";
  block.innerHTML = `
    <h3>Tests de course</h3>
    <div class="checkbox-group">
      <label><input type="radio" name="use-run" value="Oui"> Oui</label>
      <label><input type="radio" name="use-run" value="Non" checked> Non</label>
    </div>
    <div class="run-body" style="display:none">
      <label>Quels tests de course utilisez-vous ?</label>
      <div class="run-groups">
        <h5>Tests de vitesse</h5>
        <div class="checkbox-group run-speed">
          ${RUN_TESTS.vitesse.map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
        </div>
        <h5>Tests de changement de direction</h5>
        <div class="checkbox-group run-cod">
          ${RUN_TESTS.cod.map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
        </div>
        <h5>Tests énergétiques</h5>
        <div class="checkbox-group run-energy">
          ${RUN_TESTS.energetique.map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
        </div>
      </div>
      <label>Outils</label>
      <div class="checkbox-group">
        ${RUN_TOOLS.map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
      </div>
      ${criteriaBlockHtml()}
    </div>`;
  addOtherEverywhere(block);
  const radios = $$("input[name='use-run']", block);
  const body = $(".run-body", block);
  radios.forEach(r => r.addEventListener("change", () => {
    body.style.display = (r.value === "Oui" && r.checked) ? "" : "none";
  }));
  container.appendChild(block);
}

function buildGlobalUpper(container) {
  const block = document.createElement("div");
  block.className = "subcard";
  block.id = "global-upper";
  block.style.display = "none";
  block.innerHTML = `
    <h3>Tests fonctionnels globaux — Membre Supérieur</h3>
    <div class="checkbox-group">
      <label><input type="radio" name="use-global-ms" value="Oui"> Oui</label>
      <label><input type="radio" name="use-global-ms" value="Non" checked> Non</label>
    </div>
    <div class="global-ms-body" style="display:none">
      <label>Quels tests utilisez-vous ?</label>
      <div class="checkbox-group">
        ${GLOBAL_MS.tests.map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
      </div>
      <label>Outils</label>
      <div class="checkbox-group">
        ${GLOBAL_MS.outils.map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
      </div>
      ${paramsBlockHtml(GLOBAL_MS.params)}
      ${criteriaBlockHtml()}
    </div>`;
  addOtherEverywhere(block);
  const radios = $$("input[name='use-global-ms']", block);
  const body = $(".global-ms-body", block);
  radios.forEach(r => r.addEventListener("change", () => {
    body.style.display = (r.value === "Oui" && r.checked) ? "" : "none";
  }));
  container.appendChild(block);
}

function buildGlobalLower(container) {
  const block = document.createElement("div");
  block.className = "subcard";
  block.id = "global-lower";
  block.style.display = "none";
  block.innerHTML = `
    <h3>Tests fonctionnels globaux — Membre Inférieur</h3>
    <div class="checkbox-group">
      <label><input type="radio" name="use-global-mi" value="Oui"> Oui</label>
      <label><input type="radio" name="use-global-mi" value="Non" checked> Non</label>
    </div>
    <div class="global-mi-body" style="display:none">
      <label>Quels tests utilisez-vous ?</label>
      <div class="checkbox-group">
        ${GLOBAL_MI.tests.map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
      </div>
      <label>Outils</label>
      <div class="checkbox-group">
        ${GLOBAL_MI.outils.map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
      </div>
      ${paramsBlockHtml(GLOBAL_MI.params)}
      ${criteriaBlockHtml()}
    </div>`;
  addOtherEverywhere(block);
  const radios = $$("input[name='use-global-mi']", block);
  const body = $(".global-mi-body", block);
  radios.forEach(r => r.addEventListener("change", () => {
    body.style.display = (r.value === "Oui" && r.checked) ? "" : "none";
  }));
  container.appendChild(block);
}

/* ============================ PAGE WIRING ============================ */

document.addEventListener("DOMContentLoaded", () => {
  const zoneContainer = document.getElementById("zoneQuestions");
  const zonesCheckboxes = $$("#zones input[type='checkbox']");
  const submitBtn = document.getElementById("submitBtn");
  const resultMessage = document.getElementById("resultMessage");

  // Infos participant — "Autre" → précisez
  makeOtherReactive(document, "Précisez");

  // Track selected zones, render sections
  zonesCheckboxes.forEach(zone => {
    zone.addEventListener("change", () => {
      const zVal = zone.value;
      const key = HEAD_NECK_PAIR.includes(zVal) ? HEAD_NECK_TITLE : zVal;
      // Fusion tête/rachis : si l’un est coché → créer une seule section
      if (HEAD_NECK_PAIR.includes(zVal)) {
        const any = zonesCheckboxes.some(z => HEAD_NECK_PAIR.includes(z.value) && z.checked);
        if (any) {
          if (!document.getElementById(`section-${slug(HEAD_NECK_TITLE)}`)) {
            renderZoneSection(HEAD_NECK_TITLE, zoneContainer);
          }
        } else {
          removeZoneSection(HEAD_NECK_TITLE);
        }
      } else {
        if (zone.checked) renderZoneSection(key, zoneContainer);
        else removeZoneSection(key);
      }
      toggleGlobalBlocks();
    });
  });

  // Global blocks containers
  const globalContainer = document.getElementById("dynamicSection");
  buildGlobalUpper(globalContainer);
  buildGlobalLower(globalContainer);
  buildGlobalJumps(globalContainer);
  buildGlobalCourse(globalContainer);

  function toggleGlobalBlocks() {
    const selected = zonesCheckboxes.filter(z => z.checked).map(z => z.value);
    const hasLower = selected.some(z => LOWER_ZONES.includes(z));
    const hasUpper = selected.some(z => UPPER_ZONES.includes(z));
    const hasHead = selected.some(z => HEAD_NECK_PAIR.includes(z));

    // Sauts : visible si MI cochée (mais gating Oui/Non à l'intérieur)
    const gj = document.getElementById("global-jumps");
    gj.style.display = hasLower ? "" : "none";

    // Course : visible si MI cochée OU tête/rachis cochés
    const gc = document.getElementById("global-course");
    gc.style.display = (hasLower || hasHead) ? "" : "none";

    // Globaux MS : visible si MS coché
    const gum = document.getElementById("global-upper");
    gum.style.display = hasUpper ? "" : "none";

    // Globaux MI : visible si MI coché
    const glm = document.getElementById("global-lower");
    glm.style.display = hasLower ? "" : "none";
  }

  // Envoi Google Form
  submitBtn.addEventListener("click", (e) => {
    e.preventDefault();
    resultMessage.textContent = "";

    // Validation minimale : role + équipe + au moins une zone si détail demandé
    const role = $("input[name='role']:checked");
    const roleAutre = role && role.value.toLowerCase().includes("autre") ? $("#role-autre") : null;
    if (!role) return showError("⚠️ Merci d’indiquer votre rôle.");
    if (roleAutre && !roleAutre.value.trim()) return showError("⚠️ Merci de préciser votre rôle (Autre).");

    const equipe = $("input[name='structure']:checked"); // renommée équipe dans index ? (adapter name si besoin)
    const equipeAutre = equipe && equipe.value.toLowerCase().includes("autre") ? $("#structure-autre") : null;
    if (!equipe) return showError("⚠️ Merci d’indiquer l’équipe.");
    if (equipeAutre && !equipeAutre.value.trim()) return showError("⚠️ Merci de préciser l’équipe (Autre).");

    const selectedZones = zonesCheckboxes.filter(z => z.checked);
    if (selectedZones.length === 0) return showError("⚠️ Merci de sélectionner au moins une zone anatomique.");

    // Validation "Autre" textes présents
    if ($$(".other-input").some(inp => inp.closest("label")?.querySelector("input[type='checkbox']:checked") && !inp.value.trim())) {
      return showError("⚠️ Merci de préciser les champs 'Autre' sélectionnés.");
    }

    // Collecte simplifiée : dump JSON + champs principaux
    const payloadJSON = collectAllData();
    const payload = new URLSearchParams();
    if (ENTRY_MAP.role !== 'entry.ROLE_PLACEHOLDER') payload.append(ENTRY_MAP.role, role.value);
    if (roleAutre && ENTRY_MAP.role_autre !== 'entry.ROLE_AUTRE_PLACEHOLDER') payload.append(ENTRY_MAP.role_autre, roleAutre.value.trim());
    if (ENTRY_MAP.equipe !== 'entry.EQUIPE_PLACEHOLDER') payload.append(ENTRY_MAP.equipe, equipe.value);
    if (equipeAutre && ENTRY_MAP.equipe_autre !== 'entry.EQUIPE_AUTRE_PLACEHOLDER') payload.append(ENTRY_MAP.equipe_autre, equipeAutre.value.trim());
    if (ENTRY_MAP.zones !== 'entry.ZONES_PLACEHOLDER') payload.append(ENTRY_MAP.zones, selectedZones.map(z=>z.value).join("; "));
    if (ENTRY_MAP.payload_json !== 'entry.PAYLOAD_JSON_PLACEHOLDER') payload.append(ENTRY_MAP.payload_json, JSON.stringify(payloadJSON));

    fetch(GOOGLE_FORM_URL, { method: 'POST', mode: 'no-cors', body: payload })
      .then(() => showOk("✅ Réponses envoyées avec succès !"))
      .catch(() => showError("⚠️ Erreur lors de l’envoi. Vérifiez la connexion ou les entries."));
  });

  function showError(msg){ resultMessage.style.color="red"; resultMessage.textContent = msg; window.scrollTo({top:0,behavior:"smooth"}); }
  function showOk(msg){ resultMessage.style.color="#0074d9"; resultMessage.textContent = msg; window.scrollTo({top:0,behavior:"smooth"}); }

  /* ===== Render Zone Section ===== */
  function renderZoneSection(zoneName, container) {
    // éviter duplication
    if (document.getElementById(`section-${slug(zoneName)}`)) return;
    const sec = document.createElement("div");
    sec.className = "subcard";
    sec.id = `section-${slug(zoneName)}`;
    sec.innerHTML = `
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
        ${zoneName===HEAD_NECK_TITLE?`<label><input type="checkbox" value="Test de cognition"> Test de cognition</label>`:""}
      </div>
      <div class="zone-sub"></div>`;
    container.appendChild(sec);

    // "Autre fréquence" → précisez
    const freqGroup = $(".moment", sec);
    const otherFreq = $("input[value='Autre fréquence']", freqGroup);
    otherFreq.addEventListener("change", () => toggleOtherField(otherFreq, "Fréquence (précisez)"));

    const sub = $(".zone-sub", sec);
    $$(".types input", sec).forEach((cb,i)=>{
      cb.addEventListener("change", () => {
        const id = `${slug(zoneName)}-type-${slug(cb.value)}`;
        const exist = sub.querySelector(`#${cssEscape(id)}`);
        if (cb.checked) {
          let block=null;
          if (cb.value==="Force") block = createForceBlock(zoneName);
          else if (cb.value==="Mobilité") block = createMobilityBlock(zoneName);
          else if (cb.value==="Proprioception / Équilibre") block = createProprioBlock(zoneName);
          else if (cb.value==="Questionnaires") block = createQuestionnaireBlock(zoneName);
          else if (cb.value==="Autres données") block = createOtherDataBlock(zoneName);
          else if (cb.value==="Test de cognition") {
            block = document.createElement("div");
            block.className = "subcard";
            block.innerHTML = `
              <h4>Test de cognition – ${zoneName}</h4>
              <div class="checkbox-group">
                <label><input type="checkbox" value="Test oculaire"> Test oculaire</label>
                <label><input type="checkbox" value="Test vestibulaire"> Test vestibulaire</label>
                <label><input type="checkbox" value="Autre"> Autre</label>
              </div>`;
            addOtherEverywhere(block);
          }
          if (block) {
            block.id = id;
            sub.appendChild(block);
          }
        } else if (exist) exist.remove();
      });
    });
  }

  function removeZoneSection(zoneName) {
    const sec = document.getElementById(`section-${slug(zoneName)}`);
    if (sec) sec.remove();
  }

  /* ===== Collecte JSON simplifiée ===== */
  function collectAllData() {
    const data = { participant:{}, zones:{}, global:{} };
    // participant
    const role = $("input[name='role']:checked");
    const roleAutre = $("#role-autre");
    data.participant.role = role ? role.value : "";
    if (roleAutre && roleAutre.value) data.participant.role_autre = roleAutre.value;

    const equipe = $("input[name='structure']:checked");
    const equipeAutre = $("#structure-autre");
    data.participant.equipe = equipe ? equipe.value : "";
    if (equipeAutre && equipeAutre.value) data.participant.equipe_autre = equipeAutre.value;

    // zones
    const selectedZones = $$("#zones input[type='checkbox']:checked").map(z=>z.value);
    selectedZones.forEach(z => {
      const key = HEAD_NECK_PAIR.includes(z) ? HEAD_NECK_TITLE : z;
      data.zones[key] = collectZone(key);
    });

    // globaux
    data.global.jumps = collectBlock("#global-jumps");
    data.global.run   = collectBlock("#global-course");
    data.global.ms    = collectBlock("#global-upper");
    data.global.mi    = collectBlock("#global-lower");

    return data;
  }

  function collectBlock(sel) {
    const root = $(sel);
    if (!root || root.style.display==="none") return null;
    const enabledRadio = $$("input[type='radio']:checked", root)[0];
    const enabled = enabledRadio ? enabledRadio.value === "Oui" : false;
    const out = {enabled, tests:[], outils:[], params:[], criteria:[]};
    if (!enabled) return out;

    // tests
    $$(".checkbox-group input[type='checkbox']", root).forEach(ch=>{
      const name = ch.closest(".checkbox-group");
      if (ch.checked) {
        const label = ch.value;
        const txt = name.querySelector(".other-wrap .other-input");
        if (label.toLowerCase().includes("autre") && txt) out.tests.push(`Autre: ${txt.value}`);
        else {
          // heuristique par sections
          if (name.classList.contains("run-speed") || name.classList.contains("run-cod") || name.classList.contains("run-energy")) {
            out.tests.push(label);
          } else {
            // pour sauts/global : on les pousse aussi
            out.tests.push(label);
          }
        }
      }
    });
    // outils / params / critères (collecte simple)
    $$(".tools-group input[type='checkbox']:checked", root).forEach(c=> out.outils.push(c.value));
    $$(".params-group input[type='checkbox']:checked", root).forEach(c=> out.params.push(c.value));
    $$(".criteria-group input[type='checkbox']:checked", root).forEach(c=> out.criteria.push(c.value));
    return out;
  }

  function collectZone(zoneName) {
    const sec = document.getElementById(`section-${slug(zoneName)}`);
    if (!sec) return null;
    const z = { moments:[], types:[] };
    $$(".moment input:checked", sec).forEach(x=>{
      if (x.value==="Autre fréquence") {
        const txt = $(".moment .other-wrap .other-input", sec);
        z.moments.push(`Autre: ${txt?txt.value:""}`);
      } else z.moments.push(x.value);
    });
    $$(".types input:checked", sec).forEach(x=> z.types.push(x.value));
    // sous-sections : on pourrait étendre la collecte fine si nécessaire
    return z;
  }

});
