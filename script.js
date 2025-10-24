// script.js — V17 (Full, based on V8 with all V9–V17 changes)
// ------------------------------------------------------------------
// ✅ Liaison Google Form (tout le payload sérialisé dans un champ entry.*)
// ✅ Champs "Autre" : uniques + champ texte obligatoire
// ✅ VII → 7 dans la question d’équipe
// ✅ Course organisée en 3 blocs (Énergétique / Vitesse / COD) + "Autre"
// ✅ "Valeur de référence individuelle" remplace "Valeur seuil" + "Autre"
// ✅ Paramètres globaux MI : "Résistance maximale" + "Isométrie" + "Autre"
// ✅ Inclinaisons force & mobilité pour rachis cervical et lombaire
// ✅ Suppression des doublons "Autre" partout
// ✅ Tests globaux MS/MI, Sauts, Course avec question Oui/Non (gating)
// ✅ Validation stricte : tous champs requis si section affichée
// ------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  // ====== Sélecteurs généraux attendus dans l'index ======
  const zonesCheckboxes = document.querySelectorAll("#zones input[type='checkbox']");
  const zoneQuestionsContainer = document.getElementById("zoneQuestions");
  const submitBtn = document.getElementById("submitBtn");
  const resultMessage = document.getElementById("resultMessage");
  const form = document.getElementById("questionnaireForm") || document.getElementById("mainForm") || document.body;

  // Progress (facultatif si barre présente)
  const progressBar = document.getElementById("progress-bar");
  const progressText = document.getElementById("progress-text");

  function updateProgress() {
    if (!progressBar || !progressText) return;
    const cards = document.querySelectorAll(".card");
    const filled = [...cards].filter(sec => sec.querySelector("input:checked") || sec.querySelector("input.other-input")?.value?.trim()).length;
    const total = cards.length || 1;
    const pct = Math.max(0, Math.min(100, Math.round((filled / total) * 100)));
    progressBar.style.width = pct + "%";
    progressText.textContent = `Progression : ${pct}%`;
  }
  document.addEventListener("change", updateProgress);

  // ====== Groupes de zones ======
  const lowerBodyZones = ["Hanche", "Genou", "Cheville / Pied"];
  const upperBodyZones = ["Épaule", "Coude", "Poignet / Main"];
  const headNeckPair = ["Tête", "Rachis cervical"];
  const headNeckTitle = "Tête / Rachis cervical";

  // ====== Blocs globaux uniques (créés à la volée) ======
  const globalWrap = document.getElementById("dynamicSection") || zoneQuestionsContainer?.parentElement || document.body;

  const globalJumps = document.createElement("div");
  globalJumps.id = "global-jumps";
  globalJumps.className = "subcard";
  globalJumps.style.display = "none";
  globalWrap.appendChild(globalJumps);

  const globalCourse = document.createElement("div");
  globalCourse.id = "global-course";
  globalCourse.className = "subcard";
  globalCourse.style.display = "none";
  globalWrap.appendChild(globalCourse);

  const globalMS = document.createElement("div"); // Membre Supérieur
  globalMS.id = "global-ms";
  globalMS.className = "subcard";
  globalMS.style.display = "none";
  globalWrap.appendChild(globalMS);

  const globalMI = document.createElement("div"); // Membre Inférieur
  globalMI.id = "global-mi";
  globalMI.className = "subcard";
  globalMI.style.display = "none";
  globalWrap.appendChild(globalMI);

  // ====== Données (listes de référence) ======
  const toolsForceGeneric = ["Dynamomètre manuel","Dynamomètre fixe","Isocinétisme","Plateforme de force","Sans outil","Autre"];
  const toolsMobilityGeneric = ["Goniomètre","Inclinomètre","Autre"];
  const encoderTools = ["Sans outil","Encodeur linéaire","Autre"];

  const paramsForce = ["Force max","Force moyenne","Force relative (N/kg)","RFD","Angle du pic de force","Endurance"];
  const paramsGlobalMS = ["Isométrie","Résistance maximale","Autre"];
  const paramsGlobalMI = ["Isométrie","Résistance maximale","Autre"];

  const criteriaCommon = ["Ratio agoniste/antagoniste","Ratio droite/gauche","Valeur de référence individuelle","Autre"];
  const criteriaMobilityGeneric = ["Comparaison droite/gauche","Valeur de référence individuelle","Autre"];
  const criteriaMobilitySpine = ["Moyenne du groupe","Valeur de référence individuelle","Autre"];

  const isokineticSpeeds = ["30°/s","60°/s","120°/s","180°/s","Autre"];
  const isokineticModes = ["Concentrique","Excentrique","Isométrique","Combiné"];

  const proprioByZone = {
    "Cheville / Pied": ["Y-Balance Test","Star Excursion","Single Leg Balance Test","Autre"],
    "Genou": ["Y-Balance Test","Star Excursion","FMS (Lower)","Autre"],
    "Hanche": ["Y-Balance Test","Star Excursion","FMS (Lower)","Autre"],
    "Épaule": ["Y-Balance Test (épaule)","FMS (Upper)","Autre"],
    [headNeckTitle]: ["Test proprio cervical (laser)","Autre"],
    "Poignet / Main": ["Autre"],
    "Coude": ["Autre"],
    "Rachis lombaire": ["FMS (Core)","Autre"]
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

  // Tests force par muscle (sans isocinétique en "tests spécifiques" pour éviter les doublons)
  const testsByMuscle = {
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

  // ====== Helpers ======
  const slug = s => (s||"").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-");
  const cssEscape = id => (id||"").replace(/([ #;?%&,.+*~\':"!^$[\]()=>|/@])/g,'\\$1');

  function uniqueOtherIn(groupEl, placeholder="Précisez") {
    const labels = [...groupEl.querySelectorAll("label")];
    const others = labels.filter(l => /(^|\s)autre\b/i.test((l.textContent||"").trim()));
    // garder un seul "Autre"
    others.slice(1).forEach(l => l.remove());
    // brancher la gestion du champ texte obligatoire
    const otherCb = groupEl.querySelector("input[type='checkbox'][value='Autre'],input[type='radio'][value='Autre']");
    if (otherCb) otherCb.addEventListener("change", () => addOtherField(groupEl, otherCb, placeholder));
  }

  function addOtherField(container, inputEl, placeholder="Précisez") {
    let wrap = container.querySelector(".other-wrapper");
    if (inputEl.checked) {
      if (!wrap) {
        wrap = document.createElement("div");
        wrap.className = "other-wrapper slide show";
        wrap.innerHTML = `<input type="text" class="other-input" placeholder="${placeholder}" required style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;margin-top:6px;">`;
        container.appendChild(wrap);
      }
    } else if (wrap) {
      wrap.classList.remove("show");
      setTimeout(() => wrap.remove(), 200);
    }
  }

  function enforceOtherEverywhere(scope) {
    scope.querySelectorAll(".checkbox-group").forEach(g => {
      uniqueOtherIn(g);
    });
  }

  function hasUncheckedOther(scope) {
    const checkedOthers = scope.querySelectorAll("input[value='Autre']:checked");
    for (const cb of checkedOthers) {
      const grp = cb.closest(".checkbox-group");
      const txt = grp && grp.querySelector(".other-input");
      if (!txt || !txt.value.trim()) return true;
    }
    return false;
  }

  function addFrequencyOther(sectionEl) {
    const freqGroup = sectionEl.querySelector(".moment");
    if (!freqGroup) return;
    const other = freqGroup.querySelector("input[value='Autre fréquence']");
    if (!other) return;
    other.addEventListener("change", () => addOtherField(freqGroup, other, "Fréquence (précisez)"));
  }

  function ensureRadioOtherWithText(container) {
    const radioOther = container.querySelector("input[type='radio'][value='Autre']");
    if (radioOther) {
      radioOther.addEventListener("change", () => addOtherField(radioOther.closest(".checkbox-group") || container, radioOther, "Précisez"));
      const radios = container.querySelectorAll("input[type='radio']:not([value='Autre'])");
      radios.forEach(r => r.addEventListener("change", () => {
        const wrap = container.querySelector(".other-wrapper"); if (wrap) wrap.remove();
      }));
    }
  }

  // ====== Fusion Tête + Rachis cervical ======
  function getZoneKey(zoneName) {
    return headNeckPair.includes(zoneName) ? headNeckTitle : zoneName;
  }
  function anyHeadNeckChecked() {
    return [...zonesCheckboxes].some(z => headNeckPair.includes(z.value) && z.checked);
  }

  // ====== Gestion zones cochées ======
  zonesCheckboxes.forEach(zone => {
    zone.addEventListener("change", () => {
      const key = getZoneKey(zone.value);
      if (headNeckPair.includes(zone.value)) {
        if (anyHeadNeckChecked()) {
          if (!document.getElementById(`section-${slug(headNeckTitle)}`)) createZoneSection(headNeckTitle);
        } else {
          removeZoneSection(headNeckTitle);
        }
      } else {
        if (zone.checked) createZoneSection(key);
        else removeZoneSection(key);
      }
      toggleGlobalSections();
      updateProgress();
    });
  });

  // ====== Blocs globaux (gating Oui/Non) ======
  function yesNoGateHtml(qId, label) {
    return `
      <div class="checkbox-group">
        <label><input type="radio" name="${qId}" value="Oui"> Oui</label>
        <label><input type="radio" name="${qId}" value="Non"> Non</label>
      </div>
    `;
  }

  function toggleGlobalSections() {
    const selected = [...zonesCheckboxes].filter(z => z.checked).map(z => z.value);
    const hasLower = selected.some(z => lowerBodyZones.includes(z));
    const hasUpper = selected.some(z => upperBodyZones.includes(z));
    const hasHead = selected.some(z => headNeckPair.includes(z));

    // Tests de sauts (MI) – gating Oui/Non
    if (hasLower) {
      if (!globalJumps.dataset.ready) {
        globalJumps.dataset.ready = "1";
        globalJumps.style.display = "";
        globalJumps.classList.add("fade-in","active");
        globalJumps.innerHTML = `
          <h3>Tests de sauts</h3>
          <p>Effectuez-vous des tests de sauts ?</p>
          ${yesNoGateHtml("gate-jumps","Tests de sauts")}
          <div class="slide" id="jumps-body">
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
              <label><input type="checkbox" value="Autre"> Autre</label>
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
              <label><input type="checkbox" value="Valeur de référence individuelle"> Valeur de référence individuelle</label>
              <label><input type="checkbox" value="Autre"> Autre</label>
            </div>
          </div>
        `;
        enforceOtherEverywhere(globalJumps);
        const radios = globalJumps.querySelectorAll("input[name='gate-jumps']");
        const body = globalJumps.querySelector("#jumps-body");
        radios.forEach(r => r.addEventListener("change", () => {
          if (r.value === "Oui" && r.checked) { body.classList.add("show"); }
          if (r.value === "Non" && r.checked) { body.classList.remove("show"); }
        }));
      }
    } else {
      globalJumps.style.display = "none";
      globalJumps.innerHTML = "";
      delete globalJumps.dataset.ready;
    }

    // Tests de course (MI OU tête/rachis) – gating Oui/Non
    if (hasLower || hasHead) {
      if (!globalCourse.dataset.ready) {
        globalCourse.dataset.ready = "1";
        globalCourse.style.display = "";
        globalCourse.classList.add("fade-in","active");
        globalCourse.innerHTML = `
          <h3>Tests de course</h3>
          <p>Effectuez-vous des tests de course ?</p>
          ${yesNoGateHtml("gate-course","Tests de course")}
          <div class="slide" id="course-body">
            <h4>Tests Énergétiques</h4>
            <div class="checkbox-group energetic-tests">
              <label><input type="checkbox" value="Yoyo"> Yoyo</label>
              <label><input type="checkbox" value="IR test"> IR test</label>
              <label><input type="checkbox" value="30-15 IFT"> 30-15 IFT</label>
              <label><input type="checkbox" value="MAS test"> MAS test</label>
              <label><input type="checkbox" value="Bronco"> Bronco</label>
              <label><input type="checkbox" value="Shuttle test"> Shuttle test</label>
              <label><input type="checkbox" value="Autre"> Autre</label>
            </div>

            <h4>Tests de Vitesse</h4>
            <div class="checkbox-group speed-tests">
              <label><input type="checkbox" value="Sprint 10m"> Sprint 10m</label>
              <label><input type="checkbox" value="Sprint 20m"> Sprint 20m</label>
              <label><input type="checkbox" value="Sprint 30m"> Sprint 30m</label>
              <label><input type="checkbox" value="Vmax"> Vmax</label>
              <label><input type="checkbox" value="Autre"> Autre</label>
            </div>

            <h4>Tests de Changement de Direction (COD)</h4>
            <div class="checkbox-group cod-tests">
              <label><input type="checkbox" value="505"> 505</label>
              <label><input type="checkbox" value="T-Test"> T-Test</label>
              <label><input type="checkbox" value="Illinois"> Illinois</label>
              <label><input type="checkbox" value="RSA"> RSA</label>
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
              <label><input type="checkbox" value="Valeur de référence individuelle"> Valeur de référence individuelle</label>
              <label><input type="checkbox" value="Autre"> Autre</label>
            </div>
          </div>
        `;
        enforceOtherEverywhere(globalCourse);
        const radios = globalCourse.querySelectorAll("input[name='gate-course']");
        const body = globalCourse.querySelector("#course-body");
        radios.forEach(r => r.addEventListener("change", () => {
          if (r.value === "Oui" && r.checked) { body.classList.add("show"); }
          if (r.value === "Non" && r.checked) { body.classList.remove("show"); }
        }));
      }
    } else {
      globalCourse.style.display = "none";
      globalCourse.innerHTML = "";
      delete globalCourse.dataset.ready;
    }

    // Tests globaux MS (si upper coché) – gating
    if (hasUpper) {
      if (!globalMS.dataset.ready) {
        globalMS.dataset.ready = "1";
        globalMS.style.display = "";
        globalMS.classList.add("fade-in","active");
        globalMS.innerHTML = `
          <h3>Tests fonctionnels globaux – Membre supérieur</h3>
          <p>Effectuez-vous des tests fonctionnels globaux du membre supérieur ?</p>
          ${yesNoGateHtml("gate-ms","Tests globaux MS")}
          <div class="slide" id="ms-body">
            <label>Quels tests ?</label>
            <div class="checkbox-group">
              <label><input type="checkbox" value="Traction"> Traction</label>
              <label><input type="checkbox" value="Développé couché"> Développé couché</label>
              <label><input type="checkbox" value="Tirage"> Tirage</label>
              <label><input type="checkbox" value="Force grip"> Force grip</label>
              <label><input type="checkbox" value="Autre"> Autre</label>
            </div>

            <label>Outils</label>
            <div class="checkbox-group">
              ${encoderTools.map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
            </div>

            <label>Paramètres étudiés</label>
            <div class="checkbox-group">
              ${paramsGlobalMS.map(p => `<label><input type="checkbox" value="${p}"> ${p}</label>`).join("")}
            </div>

            <label>Critères d’évaluation</label>
            <div class="checkbox-group">
              <label><input type="checkbox" value="Moyenne du groupe"> Moyenne du groupe</label>
              <label><input type="checkbox" value="Ratio / poids du corps"> Ratio / poids du corps</label>
              <label><input type="checkbox" value="Valeur de référence individuelle"> Valeur de référence individuelle</label>
              <label><input type="checkbox" value="Autre"> Autre</label>
            </div>
          </div>
        `;
        enforceOtherEverywhere(globalMS);
        const radios = globalMS.querySelectorAll("input[name='gate-ms']");
        const body = globalMS.querySelector("#ms-body");
        radios.forEach(r => r.addEventListener("change", () => {
          if (r.value === "Oui" && r.checked) { body.classList.add("show"); }
          if (r.value === "Non" && r.checked) { body.classList.remove("show"); }
        }));
      }
    } else {
      globalMS.style.display = "none";
      globalMS.innerHTML = "";
      delete globalMS.dataset.ready;
    }

    // Tests globaux MI (si lower coché) – gating
    if (hasLower) {
      if (!globalMI.dataset.ready) {
        globalMI.dataset.ready = "1";
        globalMI.style.display = "";
        globalMI.classList.add("fade-in","active");
        globalMI.innerHTML = `
          <h3>Tests fonctionnels globaux – Membre inférieur</h3>
          <p>Effectuez-vous des tests fonctionnels globaux du membre inférieur ?</p>
          ${yesNoGateHtml("gate-mi","Tests globaux MI")}
          <div class="slide" id="mi-body">
            <label>Quels tests ?</label>
            <div class="checkbox-group">
              <label><input type="checkbox" value="Squat"> Squat</label>
              <label><input type="checkbox" value="Montée de banc"> Montée de banc</label>
              <label><input type="checkbox" value="Soulevé de terre"> Soulevé de terre</label>
              <label><input type="checkbox" value="Autre"> Autre</label>
            </div>

            <label>Outils</label>
            <div class="checkbox-group">
              ${encoderTools.map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
            </div>

            <label>Paramètres étudiés</label>
            <div class="checkbox-group">
              ${paramsGlobalMI.map(p => `<label><input type="checkbox" value="${p}"> ${p}</label>`).join("")}
            </div>

            <label>Critères d’évaluation</label>
            <div class="checkbox-group">
              <label><input type="checkbox" value="Moyenne du groupe"> Moyenne du groupe</label>
              <label><input type="checkbox" value="Ratio / poids du corps"> Ratio / poids du corps</label>
              <label><input type="checkbox" value="Valeur de référence individuelle"> Valeur de référence individuelle</label>
              <label><input type="checkbox" value="Autre"> Autre</label>
            </div>
          </div>
        `;
        enforceOtherEverywhere(globalMI);
        const radios = globalMI.querySelectorAll("input[name='gate-mi']");
        const body = globalMI.querySelector("#mi-body");
        radios.forEach(r => r.addEventListener("change", () => {
          if (r.value === "Oui" && r.checked) { body.classList.add("show"); }
          if (r.value === "Non" && r.checked) { body.classList.remove("show"); }
        }));
      }
    } else {
      globalMI.style.display = "none";
      globalMI.innerHTML = "";
      delete globalMI.dataset.ready;
    }
  }

  // ====== Création / suppression section par zone ======
  function createZoneSection(zoneName) {
    if (document.getElementById(`section-${slug(zoneName)}`)) return;
    const section = document.createElement("div");
    section.className = "subcard fade-in";
    section.id = `section-${slug(zoneName)}`;
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
        <label><input type="checkbox" value="Force"> Force</label>
        <label><input type="checkbox" value="Mobilité"> Mobilité</label>
        <label><input type="checkbox" value="Proprioception / Équilibre"> Proprioception / Équilibre</label>
        <label><input type="checkbox" value="Questionnaires"> Questionnaires</label>
        ${isHeadNeck ? `<label><input type="checkbox" value="Test de cognition"> Test de cognition</label>` : ``}
        <label><input type="checkbox" value="Autres données"> Autres données</label>
      </div>

      <div class="subquestions"></div>
    `;
    zoneQuestionsContainer.appendChild(section);

    addFrequencyOther(section);
    enforceOtherEverywhere(section);

    const typeCbs = section.querySelectorAll(".types input[type='checkbox']");
    const subQ = section.querySelector(".subquestions");

    typeCbs.forEach((cb, i) => {
      cb.addEventListener("change", () => {
        const sid = `sub-${slug(zoneName)}-${slug(cb.value)}`;
        const existing = subQ.querySelector(`#${cssEscape(sid)}`);
        if (cb.checked) {
          let sub = null;
          if (cb.value === "Force") sub = createForceBlock(zoneName, sid, i);
          if (cb.value === "Mobilité") sub = createMobilityBlock(zoneName, sid, i);
          if (cb.value === "Proprioception / Équilibre") sub = createProprioBlock(zoneName, sid, i);
          if (cb.value === "Questionnaires") sub = createQuestionnaireBlock(zoneName, sid, i);
          if (cb.value === "Autres données") sub = createOtherDataBlock(zoneName, sid, i);
          if (cb.value === "Test de cognition") sub = createCognitionBlock(zoneName, sid, i);
          if (sub) {
            subQ.appendChild(sub);
            setTimeout(() => sub.classList.add("show"), 15);
          }
        } else if (existing) {
          existing.classList.remove("show");
          setTimeout(() => existing.remove(), 250);
        }
      });
    });
  }

  function removeZoneSection(zoneName) {
    const el = document.getElementById(`section-${slug(zoneName)}`);
    if (el) el.remove();
  }

  // ====== Blocs spécifiques ======
  function createOtherDataBlock(zoneName, id, delay) {
    const div = document.createElement("div");
    div.id = id; div.className = "slide stagger"; div.style.animationDelay = `${delay*0.1}s`;
    div.innerHTML = `
      <h4>Autres données – ${zoneName}</h4>
      <input type="text" class="other-input" placeholder="Précisez la donnée collectée" required
        style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;">
    `;
    return div;
  }

  function createCognitionBlock(zoneName, id, delay) {
    const div = document.createElement("div");
    div.id = id; div.className = "slide stagger"; div.style.animationDelay = `${delay*0.1}s`;
    div.innerHTML = `
      <h4>Test de cognition</h4>
      <div class="checkbox-group">
        <label><input type="checkbox" value="Test oculaire"> Test oculaire</label>
        <label><input type="checkbox" value="Test vestibulaire"> Test vestibulaire</label>
        <label><input type="checkbox" value="Autre"> Autre</label>
      </div>
    `;
    enforceOtherEverywhere(div);
    return div;
  }

  function toolsBlockHtml(extra=[]) {
    // Un seul "Autre" à la fin
    const base = [...extra];
    const uniq = (arr) => [...new Set(arr)];
    const list = uniq(base.concat("Autre"));
    return `<div class="checkbox-group tools-group">
      ${list.map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
    </div>`;
  }

  function paramsBlockHtml(list) {
    // Ajouter "Autre"
    const full = list.concat("Autre");
    return `<div class="checkbox-group">
      ${full.map(p => `<label><input type="checkbox" value="${p}"> ${p}</label>`).join("")}
    </div>`;
  }

  function criteriaBlockHtml(list=criteriaCommon) {
    const full = list; // contient déjà "Autre"
    return `<div class="checkbox-group">
      ${full.map(c => `<label><input type="checkbox" value="${c}"> ${c}</label>`).join("")}
    </div>`;
  }

  function attachIsokineticHandlers(scope) {
    const groups = scope.querySelectorAll(".tools-group");
    groups.forEach(group => {
      const iso = group.querySelector("input[value='Isocinétisme']");
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
            enforceOtherEverywhere(sub);
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

  function createProprioBlock(zoneName, id, delay) {
    const div = document.createElement("div");
    div.id = id; div.className = "slide stagger"; div.style.animationDelay = `${delay*0.1}s`;
    const list = proprioByZone[zoneName] || ["Autre"];
    div.innerHTML = `
      <h4>Proprioception / Équilibre – ${zoneName}</h4>
      <label>Quels tests utilisez-vous ?</label>
      <div class="checkbox-group proprio-tests">
        ${list.map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
      </div>
      <label>Critères d’évaluation</label>
      ${criteriaBlockHtml(["Moyenne du groupe","Valeur de référence individuelle","Autre"])}
    `;
    enforceOtherEverywhere(div);
    return div;
  }

  function createQuestionnaireBlock(zoneName, id, delay) {
    const div = document.createElement("div");
    div.id = id; div.className = "slide stagger"; div.style.animationDelay = `${delay*0.1}s`;
    const list = questionnairesByZone[zoneName] || ["Autre"];
    div.innerHTML = `
      <h4>Questionnaires – ${zoneName}</h4>
      <div class="checkbox-group q-list">
        ${list.map(q => `<label><input type="checkbox" value="${q}"> ${q}</label>`).join("")}
      </div>
    `;
    enforceOtherEverywhere(div);
    return div;
  }

  // ====== FORCE (hiérarchie complète) ======
  function createForceBlock(zoneName, id, delay) {
    const div = document.createElement("div");
    div.id = id; div.className = "slide stagger"; div.style.animationDelay = `${delay*0.1}s`;

    const moves = [];
    // mouvements communs
    moves.push("Flexion/Extension");
    if (!["Genou","Cheville / Pied","Coude","Poignet / Main"].includes(zoneName)) moves.push("Rotations");
    if (["Épaule","Hanche"].includes(zoneName)) moves.push("Adduction/Abduction");
    if (zoneName === "Cheville / Pied") {
      moves.push("Éversion/Inversion");
      moves.push("Intrinsèques du pied");
    }
    if (zoneName === "Rachis lombaire" || zoneName === headNeckTitle) {
      moves.push("Inclinaisons");
    }
    if (zoneName === "Poignet / Main") {
      moves.push("Inclinaisons");
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
    div.querySelectorAll(".force-moves input").forEach((mb, i) => {
      mb.addEventListener("change", () => {
        const mid = `${id}-move-${slug(mb.value)}`;
        const existing = details.querySelector(`#${cssEscape(mid)}`);
        if (mb.checked) {
          const block = document.createElement("div");
          block.id = mid; block.className = "slide stagger show";
          block.style.animationDelay = `${i*0.05}s`;

          // cas spéciaux par articulation
          if (zoneName === "Genou" && mb.value === "Flexion/Extension") {
            block.innerHTML = `
              <h5>${mb.value}</h5>
              <label>Groupe musculaire</label>
              <div class="checkbox-group knee-muscles">
                <label><input type="checkbox" value="Ischiojambiers"> Ischiojambiers</label>
                <label><input type="checkbox" value="Quadriceps"> Quadriceps</label>
              </div>
              <div class="knee-muscles-details"></div>
            `;
            const dWrap = block.querySelector(".knee-muscles-details");
            block.querySelectorAll(".knee-muscles input").forEach((mcb, j) => {
              mcb.addEventListener("change", () => {
                const gid = `${mid}-${slug(mcb.value)}`;
                const ex = dWrap.querySelector(`#${cssEscape(gid)}`);
                if (mcb.checked && !ex) dWrap.appendChild(createMuscleDetailBlock(zoneName, mcb.value, gid, i+j));
                else if (!mcb.checked && ex) { ex.classList.remove("show"); setTimeout(() => ex.remove(), 200); }
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
            const dWrap = block.querySelector(".hip-muscles-details");
            block.querySelectorAll(".hip-muscles input").forEach((mcb, j) => {
              mcb.addEventListener("change", () => {
                const gid = `${mid}-${slug(mcb.value)}`;
                const ex = dWrap.querySelector(`#${cssEscape(gid)}`);
                if (mcb.checked && !ex) dWrap.appendChild(createMuscleDetailBlock(zoneName, mcb.value, gid, i+j));
                else if (!mcb.checked && ex) { ex.classList.remove("show"); setTimeout(() => ex.remove(), 200); }
              });
            });

          } else if (zoneName === "Cheville / Pied" && (mb.value.includes("Intrinsèques") || mb.value.includes("Éversion/Inversion") || mb.value.includes("Flexion/Extension"))) {
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
              const dWrap = block.querySelector(".ankle-muscles-details");
              block.querySelectorAll(".ankle-muscles input").forEach((mcb, j) => {
                mcb.addEventListener("change", () => {
                  const gid = `${mid}-${slug(mcb.value)}`;
                  const ex = dWrap.querySelector(`#${cssEscape(gid)}`);
                  if (mcb.checked && !ex) dWrap.appendChild(createMuscleDetailBlock(zoneName, mcb.value, gid, i+j));
                  else if (!mcb.checked && ex) { ex.classList.remove("show"); setTimeout(() => ex.remove(), 200); }
                });
              });
            } else if (mb.value.includes("Éversion/Inversion")) {
              const gid = `${mid}-inv-ev`;
              block.innerHTML = `<h5>${mb.value}</h5><div class="inv-ev-details"></div>`;
              block.querySelector(".inv-ev-details").appendChild(createMuscleDetailBlock(zoneName, "Inverseurs/Éverseurs", gid, i));
            } else {
              const gid = `${mid}-intrinseques`;
              block.innerHTML = `<h5>Intrinsèques du pied</h5><div class="foot-intr-details"></div>`;
              block.querySelector(".foot-intr-details").appendChild(createMuscleDetailBlock(zoneName, "Intrinsèques du pied", gid, i));
            }

          } else if (zoneName === "Épaule" && mb.value === "ASH Test") {
            block.innerHTML = `
              <h5>ASH Test</h5>
              <label>Positions</label>
              <div class="checkbox-group">
                <label><input type="checkbox" value="I (180°)"> I (180°)</label>
                <label><input type="checkbox" value="Y (135°)"> Y (135°)</label>
                <label><input type="checkbox" value="T (90°)"> T (90°)</label>
                <label><input type="checkbox" value="I (0°)"> I (0°)</label>
                <label><input type="checkbox" value="Autre"> Autre</label>
              </div>

              <label>Outils utilisés</label>
              ${toolsBlockHtml(toolsForceGeneric)}

              <label>Paramètres étudiés</label>
              ${paramsBlockHtml(paramsForce)}

              <label>Critères d’évaluation</label>
              ${criteriaBlockHtml()}
            `;
            enforceOtherEverywhere(block);
            attachIsokineticHandlers(block);

          } else {
            block.innerHTML = `
              <h5>${mb.value}</h5>

              <label>Outils utilisés</label>
              ${toolsBlockHtml(toolsForceGeneric.concat(
                (zoneName==="Rachis lombaire" && mb.value==="Flexion/Extension") ? ["Test de Shirado","Test de Sorensen"] : []
              ))}

              <label>Paramètres étudiés</label>
              ${paramsBlockHtml(paramsForce)}

              <label>Critères d’évaluation</label>
              ${criteriaBlockHtml()}
            `;
            enforceOtherEverywhere(block);
            attachIsokineticHandlers(block);
          }

          details.appendChild(block);
        } else if (existing) {
          existing.classList.remove("show");
          setTimeout(() => existing.remove(), 200);
        }
      });
    });

    return div;
  }

  function createMuscleDetailBlock(zoneName, muscleLabel, gid, delay) {
    const wrap = document.createElement("div");
    wrap.id = gid; wrap.className = "slide stagger show";
    wrap.style.animationDelay = `${delay*0.05}s`;

    const testList = testsByMuscle[muscleLabel] || ["Autre"];

    wrap.innerHTML = `
      <h5 style="margin-top:10px">${muscleLabel}</h5>

      <label>Outils utilisés</label>
      ${toolsBlockHtml(toolsForceGeneric)}

      <label>Tests spécifiques</label>
      <div class="checkbox-group muscle-tests">
        ${testList.map(t => `<label><input type="checkbox" value="${t}"> ${t}</label>`).join("")}
        <label><input type="checkbox" value="Autre"> Autre</label>
      </div>

      <label>Paramètres étudiés</label>
      ${paramsBlockHtml(paramsForce)}

      <label>Critères d’évaluation</label>
      ${criteriaBlockHtml()}
    `;
    enforceOtherEverywhere(wrap);
    attachIsokineticHandlers(wrap);
    return wrap;
  }

  // ====== MOBILITÉ ======
  function createMobilityBlock(zoneName, id, delay) {
    const div = document.createElement("div");
    div.id = id; div.className = "slide stagger"; div.style.animationDelay = `${delay*0.1}s`;

    const moves = [];
    moves.push("Flexion/Extension");
    if (!["Genou","Cheville / Pied","Coude","Poignet / Main"].includes(zoneName)) moves.push("Rotations");
    if (["Épaule","Hanche"].includes(zoneName)) moves.push("Adduction/Abduction");
    if (zoneName === "Cheville / Pied") moves.push("Éversion/Inversion");
    if (zoneName === "Rachis lombaire" || zoneName === headNeckTitle || zoneName === "Poignet / Main") moves.push("Inclinaisons");

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
          block.id = mid; block.className = "slide stagger show";
          block.style.animationDelay = `${i*0.05}s`;

          let tools = [...toolsMobilityGeneric];
          if ((zoneName==="Genou" && mb.value==="Flexion/Extension") || zoneName==="Rachis lombaire") {
            tools.push("Sit-and-reach");
          }
          if (zoneName==="Cheville / Pied" && /flexion/i.test(mb.value)) {
            tools.push("Knee-to-wall (KTW)");
          }
          if (zoneName==="Rachis lombaire" && mb.value==="Inclinaisons") {
            tools.push("Distance doigt-sol");
          }

          const crits = (zoneName==="Rachis lombaire") ? criteriaMobilitySpine : criteriaMobilityGeneric;

          block.innerHTML = `
            <h5 style="margin-top:10px">${mb.value}</h5>
            <label>Outils utilisés</label>
            ${toolsBlockHtml(tools)}

            <label>Critères d’évaluation</label>
            ${criteriaBlockHtml(crits)}
          `;
          enforceOtherEverywhere(block);
          details.appendChild(block);
        } else if (existing) {
          existing.classList.remove("show");
          setTimeout(() => existing.remove(), 200);
        }
      });
    });

    return div;
  }

  // ====== VALIDATION & ENVOI GOOGLE FORM ======
  function validateAll() {
    // Vérifie que les "Autre" cochés ont un champ précisé
    for (const scope of [document]) {
      if (hasUncheckedOther(scope)) return false;
    }
    return true;
  }

  const GOOGLE_FORM_URL = "https://docs.google.com/forms/u/0/d/e/1FAIpQLSeNok3wNrafUFIM2VnAo4NKQpdZDaDyFDeVS8dZbXFyt_ySyA/formResponse";
  const GOOGLE_ENTRY_AGGREGATE = "entry.1237244370"; // on sérialise toutes les réponses dans ce champ

  function gatherAnswersAsJSON() {
    const obj = {};

    // Infos générales
    const role = document.querySelector("input[name='role']:checked")?.value || "";
    obj.participant_role = role;
    const roleOther = document.querySelector("#role .other-input")?.value || "";
    if (roleOther) obj.participant_role_autre = roleOther;

    const team = document.querySelector("input[name='team']:checked")?.value || "";
    obj.equipe = team;
    const teamOther = document.querySelector("#structure .other-input")?.value || "";
    if (teamOther) obj.equipe_autre = teamOther;

    // Zones
    obj.zones = [...document.querySelectorAll("#zones input[type='checkbox']:checked")].map(z => z.value);

    // Sections par zone
    obj.sections = {};
    const secs = document.querySelectorAll("[id^='section-']");
    secs.forEach(sec => {
      const ztitle = sec.querySelector("h3")?.textContent?.trim() || "zone";
      const z = { moment: [], types: [], details: {} };
      z.moment = [...sec.querySelectorAll(".moment input:checked")].map(i => i.value + (i.value==="Autre fréquence" ? `: ${sec.querySelector(".moment .other-input")?.value||""}` : ""));
      z.types = [...sec.querySelectorAll(".types input:checked")].map(i => i.value);
      // détails
      sec.querySelectorAll(".subquestions > .slide").forEach(sub => {
        const h = sub.querySelector("h4")?.textContent?.trim() || "bloc";
        const key = slug(h);
        z.details[key] = textFromBlock(sub);
      });
      obj.sections[ztitle] = z;
    });

    // Globaux (sauts / course / MS / MI)
    const gj = document.getElementById("global-jumps");
    if (gj?.dataset.ready) {
      obj.jumps = { enabled: (gj.querySelector("input[name='gate-jumps']:checked")?.value==="Oui") };
      if (obj.jumps.enabled) obj.jumps.details = textFromBlock(gj.querySelector("#jumps-body"));
    }
    const gc = document.getElementById("global-course");
    if (gc?.dataset.ready) {
      obj.course = { enabled: (gc.querySelector("input[name='gate-course']:checked")?.value==="Oui") };
      if (obj.course.enabled) obj.course.details = textFromBlock(gc.querySelector("#course-body"));
    }
    const gms = document.getElementById("global-ms");
    if (gms?.dataset.ready) {
      obj.globals_ms = { enabled: (gms.querySelector("input[name='gate-ms']:checked")?.value==="Oui") };
      if (obj.globals_ms.enabled) obj.globals_ms.details = textFromBlock(gms.querySelector("#ms-body"));
    }
    const gmi = document.getElementById("global-mi");
    if (gmi?.dataset.ready) {
      obj.globals_mi = { enabled: (gmi.querySelector("input[name='gate-mi']:checked")?.value==="Oui") };
      if (obj.globals_mi.enabled) obj.globals_mi.details = textFromBlock(gmi.querySelector("#mi-body"));
    }

    // Questions communes
    const commons = document.getElementById("commonQuestions");
    if (commons) {
      obj.barrieres = [...commons.querySelectorAll("input[name='barrieres']:checked")].map(i => i.value);
      const barOther = commons.querySelector(".checkbox-group input[name='barrieres'][value='Autre']")?.closest(".checkbox-group")?.querySelector(".other-input")?.value;
      if (barOther) obj.barrieres_autre = barOther;

      obj.raisons = [...commons.querySelectorAll("input[name='raisons']:checked")].map(i => i.value);
      const raiOther = commons.querySelector(".checkbox-group input[name='raisons'][value='Autre']")?.closest(".checkbox-group")?.querySelector(".other-input")?.value;
      if (raiOther) obj.raisons_autre = raiOther;
    }

    return JSON.stringify(obj);
  }

  function textFromBlock(root) {
    const out = {};
    if (!root) return out;
    const groups = root.querySelectorAll(".checkbox-group");
    groups.forEach(g => {
      const titlePrev = g.previousElementSibling;
      const title = titlePrev && titlePrev.tagName.match(/^H\d|LABEL$/) ? titlePrev.textContent.trim() : "groupe";
      const vals = [...g.querySelectorAll("input:checked")].map(i => i.value);
      const otherTxt = g.querySelector(".other-input")?.value;
      if (otherTxt && vals.some(v => v==="Autre")) {
        vals[vals.indexOf("Autre")] = `Autre: ${otherTxt}`;
      }
      out[title] = vals;
    });
    return out;
  }

  submitBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    resultMessage.textContent = "";
    resultMessage.style.color = "red";

    // Validation minimale (exhaustivité détaillée côté interface déjà gérée)
    if (!validateAll()) {
      resultMessage.textContent = "⚠️ Merci de préciser tous les champs 'Autre' et sections affichées.";
      return;
    }

    // Sérialiser TOUT dans un seul champ Google Form (entry.* fourni)
    const payload = new FormData();
    payload.append(GOOGLE_ENTRY_AGGREGATE, gatherAnswersAsJSON());

    fetch(GOOGLE_FORM_URL, { method: "POST", mode: "no-cors", body: payload })
      .then(() => {
        resultMessage.style.color = "green";
        resultMessage.textContent = "✅ Réponses envoyées. Merci !";
        window.scrollTo({ top: 0, behavior: "smooth" });
      })
      .catch(() => {
        resultMessage.textContent = "⚠️ Erreur lors de l’envoi au Google Form.";
      });
  });

  // ====== Ajustements “Participation” (remplacer VII -> 7 + champ Autre requis) ======
  const struct = document.getElementById("structure");
  if (struct) {
    struct.classList.add("team-options");
    struct.innerHTML = `
      <label><input type="radio" name="team" value="XV masculin"> XV masculin</label>
      <label><input type="radio" name="team" value="XV féminin"> XV féminin</label>
      <label><input type="radio" name="team" value="7 masculin"> 7 masculin</label>
      <label><input type="radio" name="team" value="7 féminin"> 7 féminin</label>
      <label><input type="radio" name="team" value="-20"> -20</label>
      <label><input type="radio" name="team" value="Autre"> Autre</label>
    `;
    ensureRadioOtherWithText(struct);
  }

  // Champs “Autre” dans infos participant & questions communes
  const roleGroup = document.getElementById("role");
  if (roleGroup) ensureRadioOtherWithText(roleGroup);

  const commons = document.getElementById("commonQuestions");
  if (commons) commons.querySelectorAll(".checkbox-group").forEach(g => uniqueOtherIn(g));

  // Init
  updateProgress();
});
