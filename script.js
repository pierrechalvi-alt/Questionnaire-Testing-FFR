
// ===== Questionnaire Rugby – V19 (complète) =====
document.addEventListener('DOMContentLoaded', () => {

  // ---- raccourcis DOM
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  // ---- progress
  const progressBar = $('#progress-bar');
  const progressText = $('#progress-text');

  function updateProgress(){
    const reqs = [
      () => $('#nom').value.trim(),
      () => $('#prenom').value.trim(),
      () => $$('input[name="role"]:checked').length,
      () => $$('input[name="equipe"]:checked').length,
      () => $$('#zones input:checked').length
    ];
    const filled = reqs.reduce((a,f)=>a + (f()?1:0), 0);
    const total = reqs.length;
    const pct = Math.round(100*filled/total);
    progressBar.style.width = pct+'%';
    progressText.textContent = 'Progression : ' + pct + '%';
  }
  document.addEventListener('input', updateProgress);
  document.addEventListener('change', updateProgress);
  updateProgress();

  // ---- affichage champs "Autre" (role + communes)
  const roleAutre = $('#role-autre');
  const roleWrap = $('#role-autre-wrap');
  roleAutre.addEventListener('change', () => {
    if (roleAutre.checked){ roleWrap.classList.add('show'); $('#role-autre-text').setAttribute('required','required'); }
  });
  $$('#role input[type="radio"]').forEach(r=>{
    if (r!==roleAutre) r.addEventListener('change', ()=>{
      roleWrap.classList.remove('show');
      $('#role-autre-text').removeAttribute('required');
      $('#role-autre-text').value='';
    });
  });
  const barrAutre = $('#barrieres-autre');
  const barrWrap = $('#barrieres-autre-wrap');
  barrAutre.addEventListener('change', ()=>{
    if (barrAutre.checked){ barrWrap.classList.add('show'); $('#barrieres-autre-text').setAttribute('required','required'); }
    else { barrWrap.classList.remove('show'); $('#barrieres-autre-text').removeAttribute('required'); $('#barrieres-autre-text').value=''; }
  });
  const choixAutre = $('#choix-autre');
  const choixWrap = $('#choix-autre-wrap');
  choixAutre.addEventListener('change', ()=>{
    if (choixAutre.checked){ choixWrap.classList.add('show'); $('#choix-autre-text').setAttribute('required','required'); }
    else { choixWrap.classList.remove('show'); $('#choix-autre-text').removeAttribute('required'); $('#choix-autre-text').value=''; }
  });

  // ---- zones
  const lowerBody = ['Hanche','Genou','Cheville / Pied'];
  const headNeck = 'Tête / Rachis cervical';

  const zoneContainer = $('#zoneContainer');
  const zones = $$('#zones input[type="checkbox"]');

  // données communes
  const forceTools = ['Dynamomètre manuel','Dynamomètre fixe','Isocinétisme','Plateforme de force','Sans outil','Autre'];
  const mobilityToolsBase = ['Goniomètre','Inclinomètre','Autre'];
  const criteriaForce = ['Ratio agoniste/antagoniste','Ratio droite/gauche','Valeur de référence individuelle','Autre'];
  const criteriaMobility = ['Comparaison droite/gauche','Valeur de référence individuelle','Autre'];
  const criteriaMobilityLumbar = ['Moyenne du groupe','Valeur de référence individuelle','Autre'];
  const paramsForce = [
    'Force max (N)','Force moyenne (N)',
    'Force relative (N/kg)','RFD (Rate of Force Development)',
    'Angle du pic de force (°)','Endurance'
  ];

  const proprioByZone = {
    'Cheville / Pied': ['Y-Balance Test','Star Excursion','Single Leg Balance Test','Autre'],
    'Genou': ['Y-Balance Test','Star Excursion','FMS (Lower)','Autre'],
    'Hanche': ['Y-Balance Test','Star Excursion','FMS (Lower)','Autre'],
    'Épaule': ['Y-Balance Test (épaule)','FMS (Upper)','Autre'],
    [headNeck]: ['Test proprio cervical (laser)','Autre'],
    'Poignet / Main': ['Autre'],
    'Coude': ['Autre'],
    'Rachis lombaire': ['FMS (Core)','Autre']
  };

  const questionnairesByZone = {
    'Genou': ['KOOS','IKDC','Lysholm','Tegner','ACL-RSI','KOS-ADLS','LEFS','Autre'],
    'Hanche': ['HAGOS','iHOT-12','HOOS','HOS','Autre'],
    'Épaule': ['QuickDASH','DASH','SIRSI','ASES','SPADI','Oxford Shoulder Score','Autre'],
    'Coude': ['Oxford Elbow Score','MEPS','DASH','QuickDASH','Autre'],
    'Poignet / Main': ['PRWE','DASH','QuickDASH','Boston Carpal Tunnel','Autre'],
    'Cheville / Pied': ['CAIT','FAAM-ADL','FAAM-Sport','FAOS','FFI','Autre'],
    'Rachis lombaire': ['ODI (Oswestry)','Roland-Morris','Quebec Back Pain','FABQ','Autre'],
    [headNeck]: ['SCAT6','Neck Disability Index (NDI)','Copenhagen Neck Functional Scale','Autre']
  };

  // tests force par groupes musculaires (sans doublons "isocinétique" ici – géré via Outils)
  const testsByMuscle = {
    'Ischiojambiers': ['McCall 90°','Isométrie 30°','Nordic','Nordic Hold','Razor Curl','Single Leg Bridge','Autre'],
    'Quadriceps': ['Isométrie 60°','Leg Extension','Single Leg Squat','Autre'],
    'Fléchisseurs hanche': ['Isométrique 45°','Straight Leg Raise (force)','Autre'],
    'Abducteurs hanche': ['Side-lying isométrique','Standing belt test','Autre'],
    'Adducteurs hanche': ['Squeeze test (5s)','Copenhagen','Autre'],
    'Gastrocnémien': ['Heel Raise – genou tendu (1RM)','Heel Raise – max reps','Isométrie 90°','Autre'],
    'Soléaire': ['Heel Raise – genou fléchi (1RM)','Max reps','Isométrie 90°','Autre'],
    'Inverseurs/Éverseurs': ['Dynamométrie manuelle','Dynamométrie fixe','Autre'],
    'Intrinsèques du pied': ['Toe Curl test','Short Foot test','Dynamométrie','Plateforme de pressions','Autre']
  };

  const isokineticSpeeds = ['30°/s','60°/s','120°/s','180°/s','Autre'];
  const isokineticModes = ['Concentrique','Excentrique','Isométrique','Combiné'];

  // util
  const slug = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-');

  function addOtherInputAfter(checkbox, placeholder='Précisez'){
    const group = checkbox.closest('.checkbox-group') || checkbox.parentElement;
    let wrap = group.nextElementSibling;
    // unique per group by data-flag
    if (checkbox.checked){
      if (!wrap || !wrap.classList.contains('other-wrap')){
        wrap = document.createElement('div');
        wrap.className = 'slide show other-wrap';
        wrap.innerHTML = `<input type="text" class="other-input" placeholder="${placeholder}" required>`;
        group.insertAdjacentElement('afterend', wrap);
      } else {
        wrap.classList.add('show');
        const inp = wrap.querySelector('input'); if (inp) inp.setAttribute('required','required');
      }
    } else if (wrap && wrap.classList.contains('other-wrap')) {
      const inp = wrap.querySelector('input');
      if (inp){ inp.removeAttribute('required'); inp.value=''; }
      wrap.classList.remove('show');
    }
  }

  function attachOtherLogic(scope){
    scope.querySelectorAll('input[type="checkbox"],input[type="radio"]').forEach(inp=>{
      const val = (inp.value||'').toLowerCase();
      if (val === 'autre' || val.includes('autre')){
        inp.addEventListener('change', ()=> addOtherInputAfter(inp, 'Précisez'));
      }
      if (val === 'autres'){
        inp.addEventListener('change', ()=> addOtherInputAfter(inp, 'Précisez'));
      }
    });
  }

  function attachIsokineticHandlers(scope){
    scope.querySelectorAll('.tools-group').forEach(group => {
      const iso = group.querySelector('input[type="checkbox"][value="Isocinétisme"]');
      if (!iso) return;
      const ensure = () => {
        let sub = group.parentElement.querySelector('.isokinetic-sub');
        if (iso.checked){
          if (!sub){
            sub = document.createElement('div');
            sub.className = 'slide show isokinetic-sub';
            sub.innerHTML = `
              <label>Vitesse (isocinétisme)</label>
              <div class="checkbox-group iso-speed">
                ${isokineticSpeeds.map(v=>`<label><input type="checkbox" value="${v}"> ${v}</label>`).join('')}
              </div>
              <label>Mode de contraction (isocinétisme)</label>
              <div class="checkbox-group iso-mode">
                ${isokineticModes.map(v=>`<label><input type="checkbox" value="${v}"> ${v}</label>`).join('')}
              </div>
            `;
            group.insertAdjacentElement('afterend', sub);
            attachOtherLogic(sub);
          }
        } else if (sub){
          sub.classList.remove('show');
          setTimeout(()=> sub.remove(), 250);
        }
      };
      iso.addEventListener('change', ensure);
      ensure();
    });
  }

  // ---- Création section par zone
  function createZoneSection(zoneName){
    const id = 'zone-' + slug(zoneName);
    if ($('#'+id)) return;
    const card = document.createElement('div');
    card.className = 'subcard';
    card.id = id;
    card.innerHTML = `
      <h3>${zoneName}</h3>
      <label>À quel moment testez-vous cette zone ?</label>
      <div class="checkbox-group moment">
        <label><input type="checkbox" value="Pré-saison"> Pré-saison</label>
        <label><input type="checkbox" value="Retour au jeu" class="retour"> Retour au jeu</label>
        <label><input type="checkbox" value="Autre fréquence" class="freq-autre"> Autre fréquence</label>
      </div>
      <div class="slide" id="${id}-freq-autre"><input type="text" placeholder="Fréquence (précisez)" class="other-input"></div>

      <label>Quels types de tests sont réalisés ?</label>
      <div class="checkbox-group types">
        <label><input type="checkbox" value="Force"> Force</label>
        <label><input type="checkbox" value="Mobilité"> Mobilité</label>
        <label><input type="checkbox" value="Proprioception / Équilibre"> Proprioception / Équilibre</label>
        <label><input type="checkbox" value="Questionnaires"> Questionnaires</label>
        ${zoneName===headNeck ? `<label><input type="checkbox" value="Test de cognition"> Test de cognition</label>`:''}
        <label><input type="checkbox" value="Autres données"> Autres données</label>
      </div>
      <div class="zone-sub"></div>
      <div class="zone-globals-anchor"></div>
    `;
    zoneContainer.appendChild(card);

    // autre fréquence
    const freqAutre = card.querySelector('.freq-autre');
    const freqWrap = $('#'+id+'-freq-autre');
    freqAutre.addEventListener('change', ()=>{
      if (freqAutre.checked){ freqWrap.classList.add('show'); freqWrap.querySelector('input').setAttribute('required','required'); }
      else { freqWrap.classList.remove('show'); const i=freqWrap.querySelector('input'); i.removeAttribute('required'); i.value=''; }
    });

    // types → sous-blocs
    const sub = card.querySelector('.zone-sub');
    card.querySelectorAll('.types input').forEach((cb, idx)=>{
      cb.addEventListener('change', ()=>{
        const sid = id + '-' + slug(cb.value);
        const exist = $('#'+sid);
        if (cb.checked){
          let block = null;
          if (cb.value==='Force') block = buildForceBlock(zoneName, sid);
          else if (cb.value==='Mobilité') block = buildMobilityBlock(zoneName, sid);
          else if (cb.value==='Proprioception / Équilibre') block = buildProprioBlock(zoneName, sid);
          else if (cb.value==='Questionnaires') block = buildQuestionnairesBlock(zoneName, sid);
          else if (cb.value==='Test de cognition') block = buildCognitionBlock(sid);
          else if (cb.value==='Autres données') block = buildOtherDataBlock(zoneName, sid);
          if (block){ sub.appendChild(block); setTimeout(()=> block.classList.add('show'), 20); }
        } else if (exist){
          exist.classList.remove('show');
          setTimeout(()=> exist.remove(), 250);
        }
        refreshGlobalsVisibility();
      });
    });

    // Retour au jeu → peut déclencher “Combat” global après Course
    card.querySelectorAll('.moment .retour').forEach(r=> r.addEventListener('change', refreshGlobalsVisibility));

    attachOtherLogic(card);
  }

  function removeZoneSection(zoneName){
    const id = 'zone-' + slug(zoneName);
    const el = $('#'+id);
    if (el) el.remove();
    refreshGlobalsVisibility();
  }

  zones.forEach(z=>{
    z.addEventListener('change', ()=>{
      if (z.checked) createZoneSection(z.value);
      else removeZoneSection(z.value);
      refreshGlobalsVisibility();
    });
  });

  // ---- Sous-blocs par type
  function uniqueToolsHTML(tools){
    // supprime doublons et ne laisse "Autre" qu'une seule fois en fin
    const set = new Set();
    const list = [];
    tools.forEach(t => {
      const k = t.toLowerCase();
      if (k==='autre') return; // postpone
      if (!set.has(k)){ set.add(k); list.push(t); }
    });
    list.push('Autre');
    return list.map(t=>`<label><input type="checkbox" value="${t}"> ${t}</label>`).join('');
  }

  function buildForceBlock(zoneName, sid){
    const block = document.createElement('div');
    block.className = 'slide subcard';
    block.id = sid;

    // mouvements par zone
    const moves = [];
    moves.push('Flexion/Extension');
    if (!['Genou','Cheville / Pied','Coude','Poignet / Main'].includes(zoneName)) moves.push('Rotations');
    if (['Épaule','Hanche'].includes(zoneName)) moves.push('Adduction/Abduction');
    if (zoneName==='Cheville / Pied'){ moves.push('Éversion/Inversion'); moves.push('Intrinsèques du pied'); }
    if (zoneName==='Rachis lombaire' || zoneName===headNeck) moves.push('Inclinaisons');
    if (zoneName==='Épaule') moves.push('ASH Test');

    block.innerHTML = `
      <h4>Force – ${zoneName}</h4>
      <label>Quels mouvements évaluez-vous en force ?</label>
      <div class="checkbox-group force-moves">
        ${moves.map(m=>`<label><input type="checkbox" value="${m}"> ${m}</label>`).join('')}
      </div>
      <div class="force-details"></div>
    `;

    const details = block.querySelector('.force-details');
    block.querySelectorAll('.force-moves input').forEach((mv,i)=>{
      mv.addEventListener('change', ()=>{
        const mid = sid+'-mv-'+slug(mv.value);
        const ex = $('#'+mid);
        if (mv.checked){
          const sub = document.createElement('div');
          sub.className = 'slide show';
          sub.id = mid;

          // cas particuliers (genou / hanche / cheville / épaule ASH / rachis tools)
          if (zoneName==='Genou' && mv.value==='Flexion/Extension'){
            sub.innerHTML = `
              <h5>${mv.value}</h5>
              <label>Groupe musculaire</label>
              <div class="checkbox-group knee-muscles">
                <label><input type="checkbox" value="Ischiojambiers"> Ischiojambiers</label>
                <label><input type="checkbox" value="Quadriceps"> Quadriceps</label>
              </div>
              <div class="knee-muscles-details"></div>
            `;
            const d = sub.querySelector('.knee-muscles-details');
            sub.querySelectorAll('.knee-muscles input').forEach(kb=>{
              kb.addEventListener('change', ()=>{
                const gid = mid+'-'+slug(kb.value);
                const gx = $('#'+gid);
                if (kb.checked && !gx){
                  d.appendChild( buildMuscleForceBlock(zoneName, kb.value, gid) );
                } else if (!kb.checked && gx){
                  gx.classList.remove('show'); setTimeout(()=>gx.remove(), 200);
                }
              });
            });

          } else if (zoneName==='Hanche' && ['Adduction/Abduction','Flexion/Extension'].includes(mv.value)){
            sub.innerHTML = `
              <h5>${mv.value}</h5>
              <label>Groupe musculaire</label>
              <div class="checkbox-group hip-muscles">
                <label><input type="checkbox" value="Fléchisseurs hanche"> Fléchisseurs hanche</label>
                <label><input type="checkbox" value="Abducteurs hanche"> Abducteurs hanche</label>
                <label><input type="checkbox" value="Adducteurs hanche"> Adducteurs hanche</label>
              </div>
              <div class="hip-muscles-details"></div>
            `;
            const d = sub.querySelector('.hip-muscles-details');
            sub.querySelectorAll('.hip-muscles input').forEach(hb=>{
              hb.addEventListener('change', ()=>{
                const gid = mid+'-'+slug(hb.value);
                const gx = $('#'+gid);
                if (hb.checked && !gx){
                  d.appendChild( buildMuscleForceBlock(zoneName, hb.value, gid) );
                } else if (!hb.checked && gx){
                  gx.classList.remove('show'); setTimeout(()=>gx.remove(), 200);
                }
              });
            });

          } else if (zoneName==='Cheville / Pied' && mv.value.includes('Flexion/Extension')){
            sub.innerHTML = `
              <h5>${mv.value}</h5>
              <label>Groupe musculaire</label>
              <div class="checkbox-group ankle-muscles">
                <label><input type="checkbox" value="Gastrocnémien"> Gastrocnémien</label>
                <label><input type="checkbox" value="Soléaire"> Soléaire</label>
              </div>
              <div class="ankle-muscles-details"></div>
            `;
            const d = sub.querySelector('.ankle-muscles-details');
            sub.querySelectorAll('.ankle-muscles input').forEach(ab=>{
              ab.addEventListener('change', ()=>{
                const gid = mid+'-'+slug(ab.value);
                const gx = $('#'+gid);
                if (ab.checked && !gx){
                  d.appendChild( buildMuscleForceBlock(zoneName, ab.value, gid) );
                } else if (!ab.checked && gx){
                  gx.classList.remove('show'); setTimeout(()=>gx.remove(), 200);
                }
              });
            });

          } else if (zoneName==='Cheville / Pied' && mv.value.includes('Intrinsèques')){
            const gid = mid+'-intrinseques';
            sub.innerHTML = `<h5>Intrinsèques du pied</h5><div class="foot-intr-details"></div>`;
            const d = sub.querySelector('.foot-intr-details');
            d.appendChild( buildMuscleForceBlock(zoneName, 'Intrinsèques du pied', gid) );

          } else if (zoneName==='Épaule' && mv.value==='ASH Test'){
            sub.innerHTML = `
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
              <div class="checkbox-group tools-group">
                ${uniqueToolsHTML(forceTools)}
              </div>
              <label>Paramètres étudiés</label>
              <div class="checkbox-group">
                ${paramsForce.map(p=>`<label><input type="checkbox" value="${p}"> ${p}</label>`).join('')}
              </div>
              <label>Critères d’évaluation</label>
              <div class="checkbox-group">
                ${criteriaForce.map(c=>`<label><input type="checkbox" value="${c}"> ${c}</label>`).join('')}
              </div>
            `;
            attachOtherLogic(sub);
            attachIsokineticHandlers(sub);

          } else {
            // mouvement générique
            const extraTools = (zoneName==='Rachis lombaire' && mv.value==='Flexion/Extension')
              ? ['Test de Shirado','Test de Sorensen']
              : [];
            sub.innerHTML = `
              <h5>${mv.value}</h5>
              <label>Outils utilisés</label>
              <div class="checkbox-group tools-group">
                ${uniqueToolsHTML(forceTools.concat(extraTools))}
              </div>
              <label>Paramètres étudiés</label>
              <div class="checkbox-group">
                ${paramsForce.map(p=>`<label><input type="checkbox" value="${p}"> ${p}</label>`).join('')}
              </div>
              <label>Critères d’évaluation</label>
              <div class="checkbox-group">
                ${criteriaForce.map(c=>`<label><input type="checkbox" value="${c}"> ${c}</label>`).join('')}
              </div>
            `;
            attachOtherLogic(sub);
            attachIsokineticHandlers(sub);
          }

          details.appendChild(sub);
        } else if (ex){
          ex.classList.remove('show'); setTimeout(()=> ex.remove(), 200);
        }
      });
    });

    return block;
  }

  function buildMuscleForceBlock(zoneName, muscleLabel, gid){
    const w = document.createElement('div');
    w.className = 'slide show subcard';
    w.id = gid;

    const tests = (testsByMuscle[muscleLabel] || ['Autre']).filter(t => !/^Isocin[ée]t/i.test(t)); // pas de tests "isocinétiques" ici
    w.innerHTML = `
      <h5 style="margin-top:8px">${muscleLabel}</h5>
      <label>Outils utilisés</label>
      <div class="checkbox-group tools-group">
        ${uniqueToolsHTML(forceTools)}
      </div>
      <label>Tests spécifiques</label>
      <div class="checkbox-group muscle-tests">
        ${tests.map(t=>`<label><input type="checkbox" value="${t}"> ${t}</label>`).join('')}
        <label><input type="checkbox" value="Autre"> Autre</label>
      </div>
      <label>Paramètres étudiés</label>
      <div class="checkbox-group">
        ${['Force max (N)','Force moyenne (N)','Force relative (N/kg)','RFD (Rate of Force Development)','Angle du pic de force (°)','Endurance'].map(p=>`<label><input type="checkbox" value="${p}"> ${p}</label>`).join('')}
      </div>
      <label>Critères d’évaluation</label>
      <div class="checkbox-group">
        ${['Ratio agoniste/antagoniste','Ratio droite/gauche','Valeur de référence individuelle','Autre'].map(c=>`<label><input type="checkbox" value="${c}"> ${c}</label>`).join('')}
      </div>
    `;
    attachOtherLogic(w);
    attachIsokineticHandlers(w);
    return w;
  }

  function buildMobilityBlock(zoneName, sid){
    const block = document.createElement('div');
    block.className = 'slide subcard';
    block.id = sid;
    const moves = [];
    moves.push('Flexion/Extension');
    if (!['Genou','Cheville / Pied','Coude','Poignet / Main'].includes(zoneName)) moves.push('Rotations');
    if (['Épaule','Hanche'].includes(zoneName)) moves.push('Adduction/Abduction');
    if (zoneName==='Cheville / Pied'){ moves.push('Éversion/Inversion'); }
    if (zoneName==='Rachis lombaire' || zoneName===headNeck) moves.push('Inclinaisons');
    if (zoneName==='Poignet / Main') moves.push('Inclinaisons'); // ajouté

    block.innerHTML = `
      <h4>Mobilité – ${zoneName}</h4>
      <label>Quels mouvements évaluez-vous en mobilité ?</label>
      <div class="checkbox-group mob-moves">
        ${moves.map(m=>`<label><input type="checkbox" value="${m}"> ${m}</label>`).join('')}
      </div>
      <div class="mob-details"></div>
    `;
    const details = block.querySelector('.mob-details');

    block.querySelectorAll('.mob-moves input').forEach((mv)=>{
      mv.addEventListener('change', ()=>{
        const mid = sid+'-mv-'+slug(mv.value);
        const ex = $('#'+mid);
        if (mv.checked){
          const sub = document.createElement('div');
          sub.className = 'slide show';
          sub.id = mid;

          let tools = mobilityToolsBase.slice();
          // outils spé
          if ((zoneName==='Genou' && mv.value==='Flexion/Extension') || zoneName==='Rachis lombaire'){
            tools = tools.concat(['Sit-and-reach']);
          }
          if (zoneName==='Cheville / Pied' && mv.value.toLowerCase().includes('flexion')){
            tools = tools.concat(['Knee-to-wall (KTW)']);
          }
          // pour lombaire inclinaisons : distance doigt-sol (et pas "test spécifique" de base)
          if (zoneName==='Rachis lombaire' && mv.value==='Inclinaisons'){
            tools = ['Goniomètre','Inclinomètre','Distance doigt-sol','Autre'];
          }

          // critères lombaire vs génériques
          const crits = (zoneName==='Rachis lombaire') ? criteriaMobilityLumbar : criteriaMobility;

          sub.innerHTML = `
            <h5>${mv.value}</h5>
            <label>Outils utilisés</label>
            <div class="checkbox-group">
              ${uniqueToolsHTML(tools)}
            </div>
            <label>Critères d’évaluation</label>
            <div class="checkbox-group">
              ${crits.map(c=>`<label><input type="checkbox" value="${c}"> ${c}</label>`).join('')}
            </div>
          `;
          attachOtherLogic(sub);
          details.appendChild(sub);
        } else if (ex){
          ex.classList.remove('show'); setTimeout(()=>ex.remove(), 200);
        }
      });
    });

    return block;
  }

  function buildProprioBlock(zoneName, sid){
    const block = document.createElement('div');
    block.className = 'slide subcard';
    block.id = sid;
    const tests = proprioByZone[zoneName] || ['Autre'];
    block.innerHTML = `
      <h4>Proprioception / Équilibre – ${zoneName}</h4>
      <label>Quels tests utilisez-vous ?</label>
      <div class="checkbox-group proprio-tests">
        ${tests.map(t=>`<label><input type="checkbox" value="${t}"> ${t}</label>`).join('')}
      </div>
      <label>Critères d’évaluation</label>
      <div class="checkbox-group">
        <label><input type="checkbox" value="Moyenne du groupe"> Moyenne du groupe</label>
        <label><input type="checkbox" value="Valeur de référence individuelle"> Valeur de référence individuelle</label>
        <label><input type="checkbox" value="Autre"> Autre</label>
      </div>
    `;
    attachOtherLogic(block);
    return block;
  }

  function buildQuestionnairesBlock(zoneName, sid){
    const block = document.createElement('div');
    block.className = 'slide subcard';
    block.id = sid;
    const list = questionnairesByZone[zoneName] || ['Autre'];
    block.innerHTML = `
      <h4>Questionnaires – ${zoneName}</h4>
      <div class="checkbox-group q-list">
        ${list.map(q=>`<label><input type="checkbox" value="${q}"> ${q}</label>`).join('')}
      </div>
      <label>Critères d’évaluation</label>
      <div class="checkbox-group">
        <label><input type="checkbox" value="Moyenne du groupe"> Moyenne du groupe</label>
        <label><input type="checkbox" value="Ratio droite/gauche"> Ratio droite/gauche</label>
        <label><input type="checkbox" value="Valeur de référence individuelle"> Valeur de référence individuelle</label>
        <label><input type="checkbox" value="Autre"> Autre</label>
      </div>
    `;
    attachOtherLogic(block);
    return block;
  }

  function buildCognitionBlock(sid){
    const block = document.createElement('div');
    block.className = 'slide subcard';
    block.id = sid;
    block.innerHTML = `
      <h4>Test de cognition</h4>
      <div class="checkbox-group">
        <label><input type="checkbox" value="Test oculaire"> Test oculaire</label>
        <label><input type="checkbox" value="Test vestibulaire"> Test vestibulaire</label>
        <label><input type="checkbox" value="Autre"> Autre</label>
      </div>
    `;
    attachOtherLogic(block);
    return block;
  }

  function buildOtherDataBlock(zoneName, sid){
    const block = document.createElement('div');
    block.className = 'slide subcard';
    block.id = sid;
    block.innerHTML = `
      <h4>Autres données – ${zoneName}</h4>
      <input type="text" class="other-input" placeholder="Précisez la donnée collectée" required>
    `;
    return block;
  }

  // ---- Blocs globaux (Sauts, Course, Globaux MI/MS, Combat)
  const globalWrap = $('#global-blocks');

  function refreshGlobalsVisibility(){
    const selectedZones = $$('#zones input:checked').map(z=>z.value);
    const hasLower = selectedZones.some(z => lowerBody.includes(z));
    const hasHead = selectedZones.includes(headNeck);
    const anyRetour = $$('#zoneContainer .moment .retour:checked').length>0;

    // Sauts (si MI cochée) + question Oui/Non
    ensureJumpBlock(hasLower);

    // Course (si MI cochée OU tête/rachis cochée) + Oui/Non
    ensureCourseBlock(hasLower || hasHead);

    // Fonctionnels MI (si MI) + Oui/Non
    ensureFuncMIBlock(hasLower);

    // Fonctionnels MS (si MS cochée) + Oui/Non
    const hasUpper = selectedZones.some(z=> ['Épaule','Coude','Poignet / Main'].includes(z));
    ensureFuncMSBlock(hasUpper);

    // Combat (si "Retour au jeu" coché dans au moins une zone) apparaît après Course
    ensureCombatBlock(anyRetour);
  }

  function ensureJumpBlock(visible){
    const id='global-jumps';
    let el = $('#'+id);
    if (!visible){
      if (el){ el.remove(); }
      return;
    }
    if (!el){
      el = document.createElement('div');
      el.className='subcard';
      el.id=id;
      el.innerHTML = `
        <h3>Tests de sauts</h3>
        <div class="checkbox-group">
          <label><input type="radio" name="jumps-yn" value="Oui"> Oui</label>
          <label><input type="radio" name="jumps-yn" value="Non"> Non</label>
        </div>
        <div class="slide" id="jumps-body">
          <label>Quels tests de sauts utilisez-vous ?</label>
          <div class="checkbox-group">
            <label><input type="checkbox" value="CMJ (Counter Movement Jump)"> CMJ (Counter Movement Jump)</label>
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
            <label><input type="checkbox" value="Force max (N)"> Force max (N)</label>
            <label><input type="checkbox" value="Hauteur (cm)"> Hauteur (cm)</label>
            <label><input type="checkbox" value="Temps de vol (ms)"> Temps de vol (ms)</label>
            <label><input type="checkbox" value="Temps de contact (ms)"> Temps de contact (ms)</label>
            <label><input type="checkbox" value="Pic de puissance (W)"> Pic de puissance (W)</label>
            <label><input type="checkbox" value="Puissance relative (W/kg)"> Puissance relative (W/kg)</label>
            <label><input type="checkbox" value="RFD (Rate of Force Development)"> RFD (Rate of Force Development)</label>
            <label><input type="checkbox" value="RSI (Reactive Strength Index)"> RSI (Reactive Strength Index)</label>
            <label><input type="checkbox" value="Distance (cm)"> Distance (cm)</label>
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
            <label><input type="checkbox" value="Valeur de référence individuelle"> Valeur de référence individuelle</label>
            <label><input type="checkbox" value="Autre"> Autre</label>
          </div>
        </div>
      `;
      globalWrap.appendChild(el);
      attachOtherLogic(el);
      const radios = el.querySelectorAll('input[name="jumps-yn"]');
      const body = $('#jumps-body');
      radios.forEach(r=> r.addEventListener('change', ()=>{
        if (r.value==='Oui'){ body.classList.add('show'); }
        else { body.classList.remove('show'); }
      }));
    }
  }

  function ensureCourseBlock(visible){
    const id='global-course';
    let el = $('#'+id);
    if (!visible){
      if (el){ el.remove(); }
      return;
    }
    if (!el){
      el = document.createElement('div');
      el.className='subcard';
      el.id=id;
      el.innerHTML = `
        <h3>Tests de course</h3>
        <div class="checkbox-group">
          <label><input type="radio" name="course-yn" value="Oui"> Oui</label>
          <label><input type="radio" name="course-yn" value="Non"> Non</label>
        </div>
        <div class="slide" id="course-body">
          <label>Quels tests de course utilisez-vous ?</label>

          <h5>Tests énergétiques</h5>
          <div class="checkbox-group">
            <label><input type="checkbox" value="Yoyo IR test 1"> Yoyo IR test 1</label>
            <label><input type="checkbox" value="Bronco"> Bronco</label>
            <label><input type="checkbox" value="Broken Bronco"> Broken Bronco</label>
            <label><input type="checkbox" value="Test VAMEVAL"> Test VAMEVAL</label>
            <label><input type="checkbox" value="Test de Léger (Luc Léger)"> Test de Léger (Luc Léger)</label>
            <label><input type="checkbox" value="Autre (énergétique)"> Autre (énergétique)</label>
          </div>

          <h5>Tests de vitesse</h5>
          <div class="checkbox-group">
            <label><input type="checkbox" value="Sprint 10m"> Sprint 10m</label>
            <label><input type="checkbox" value="Sprint 20m"> Sprint 20m</label>
            <label><input type="checkbox" value="Sprint 30m"> Sprint 30m</label>
            <label><input type="checkbox" value="Vmax"> Vmax</label>
            <label><input type="checkbox" value="Autre (vitesse)"> Autre (vitesse)</label>
          </div>

          <h5>Tests de changement de direction (COD)</h5>
          <div class="checkbox-group">
            <label><input type="checkbox" value="505"> 505</label>
            <label><input type="checkbox" value="T-Test"> T-Test</label>
            <label><input type="checkbox" value="Illinois"> Illinois</label>
            <label><input type="checkbox" value="ZigZag test"> ZigZag test</label>
            <label><input type="checkbox" value="Autre (COD)"> Autre (COD)</label>
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
            <label><input type="checkbox" value="Valeur de référence individuelle"> Valeur de référence individuelle</label>
            <label><input type="checkbox" value="Autre"> Autre</label>
          </div>
        </div>
      `;
      globalWrap.appendChild(el);
      attachOtherLogic(el);
      const radios = el.querySelectorAll('input[name="course-yn"]');
      const body = $('#course-body');
      radios.forEach(r=> r.addEventListener('change', ()=>{
        if (r.value==='Oui'){ body.classList.add('show'); }
        else { body.classList.remove('show'); }
      }));
    }
  }

  function ensureFuncMIBlock(visible){
    const id='global-func-mi';
    let el = $('#'+id);
    if (!visible){ if (el) el.remove(); return; }
    if (!el){
      el = document.createElement('div');
      el.className='subcard';
      el.id=id;
      el.innerHTML = `
        <h3>Tests fonctionnels globaux – Membre inférieur</h3>
        <div class="checkbox-group">
          <label><input type="radio" name="funcmi-yn" value="Oui"> Oui</label>
          <label><input type="radio" name="funcmi-yn" value="Non"> Non</label>
        </div>
        <div class="slide" id="funcmi-body">
          <label>Quels tests réalisez-vous ?</label>
          <div class="checkbox-group">
            <label><input type="checkbox" value="Squat"> Squat</label>
            <label><input type="checkbox" value="Montée de banc"> Montée de banc</label>
            <label><input type="checkbox" value="Soulevé de terre"> Soulevé de terre</label>
            <label><input type="checkbox" value="Autre"> Autre</label>
          </div>

          <label>Outils</label>
          <div class="checkbox-group">
            <label><input type="checkbox" value="Sans outil"> Sans outil</label>
            <label><input type="checkbox" value="Encodeur linéaire"> Encodeur linéaire</label>
            <label><input type="checkbox" value="Autre"> Autre</label>
          </div>

          <label>Paramètres étudiés</label>
          <div class="checkbox-group">
            <label><input type="checkbox" value="Répétition maximale (RM)"> Répétition maximale (RM)</label>
            <label><input type="checkbox" value="Isométrie"> Isométrie</label>
            <label><input type="checkbox" value="Autre"> Autre</label>
          </div>

          <label>Critères d’évaluation</label>
          <div class="checkbox-group">
            <label><input type="checkbox" value="Moyenne du groupe"> Moyenne du groupe</label>
            <label><input type="checkbox" value="Ratio / poids du corps"> Ratio / poids du corps</label>
            <label><input type="checkbox" value="Ratio droite/gauche"> Ratio droite/gauche</label>
            <label><input type="checkbox" value="Valeur de référence individuelle"> Valeur de référence individuelle</label>
            <label><input type="checkbox" value="Autre"> Autre</label>
          </div>
        </div>
      `;
      globalWrap.appendChild(el);
      attachOtherLogic(el);
      const radios = el.querySelectorAll('input[name="funcmi-yn"]');
      const body = $('#funcmi-body');
      radios.forEach(r=> r.addEventListener('change', ()=>{
        if (r.value==='Oui'){ body.classList.add('show'); }
        else { body.classList.remove('show'); }
      }));
    }
  }

  function ensureFuncMSBlock(visible){
    const id='global-func-ms';
    let el = $('#'+id);
    if (!visible){ if (el) el.remove(); return; }
    if (!el){
      el = document.createElement('div');
      el.className='subcard';
      el.id=id;
      el.innerHTML = `
        <h3>Tests fonctionnels globaux – Membre supérieur</h3>
        <div class="checkbox-group">
          <label><input type="radio" name="funcms-yn" value="Oui"> Oui</label>
          <label><input type="radio" name="funcms-yn" value="Non"> Non</label>
        </div>
        <div class="slide" id="funcms-body">
          <label>Quels tests réalisez-vous ?</label>
          <div class="checkbox-group">
            <label><input type="checkbox" value="Développé couché"> Développé couché</label>
            <label><input type="checkbox" value="Traction"> Traction</label>
            <label><input type="checkbox" value="Tirage"> Tirage</label>
            <label><input type="checkbox" value="Force grip"> Force grip</label>
            <label><input type="checkbox" value="Autre"> Autre</label>
          </div>

          <label>Outils</label>
          <div class="checkbox-group">
            <label><input type="checkbox" value="Sans outil"> Sans outil</label>
            <label><input type="checkbox" value="Encodeur linéaire"> Encodeur linéaire</label>
            <label><input type="checkbox" value="Autre"> Autre</label>
          </div>

          <label>Paramètres étudiés</label>
          <div class="checkbox-group">
            <label><input type="checkbox" value="Répétition maximale (RM)"> Répétition maximale (RM)</label>
            <label><input type="checkbox" value="Isométrie"> Isométrie</label>
            <label><input type="checkbox" value="Autre"> Autre</label>
          </div>

          <label>Critères d’évaluation</label>
          <div class="checkbox-group">
            <label><input type="checkbox" value="Moyenne du groupe"> Moyenne du groupe</label>
            <label><input type="checkbox" value="Ratio / poids du corps"> Ratio / poids du corps</label>
            <label><input type="checkbox" value="Ratio droite/gauche"> Ratio droite/gauche</label>
            <label><input type="checkbox" value="Valeur de référence individuelle"> Valeur de référence individuelle</label>
            <label><input type="checkbox" value="Autre"> Autre</label>
          </div>
        </div>
      `;
      globalWrap.appendChild(el);
      attachOtherLogic(el);
      const radios = el.querySelectorAll('input[name="funcms-yn"]');
      const body = $('#funcms-body');
      radios.forEach(r=> r.addEventListener('change', ()=>{
        if (r.value==='Oui'){ body.classList.add('show'); }
        else { body.classList.remove('show'); }
      }));
    }
  }

  function ensureCombatBlock(visible){
    const id='global-combat';
    let el = $('#'+id);
    if (!visible){ if (el) el.remove(); return; }
    if (!el){
      el = document.createElement('div');
      el.className='subcard';
      el.id=id;
      el.innerHTML = `
        <h3>Tests spécifiques de combat</h3>
        <div class="checkbox-group">
          <label><input type="radio" name="combat-yn" value="Oui"> Oui</label>
          <label><input type="radio" name="combat-yn" value="Non"> Non</label>
        </div>
      `;
      // insérer juste après "course" si présent
      const course = $('#global-course');
      if (course) course.insertAdjacentElement('afterend', el);
      else globalWrap.appendChild(el);
    }
  }

  // ---- création/décréation initiales si besoin
  refreshGlobalsVisibility();

  // ---- VALIDATION + ENVOI Google Form
  function gatherSection(el){
    // parcours récursif basique pour convertir en objet
    const data = {};
    el.querySelectorAll('input[type="checkbox"],input[type="radio"]').forEach(inp=>{
      const label = inp.closest('label') ? inp.closest('label').innerText.trim() : inp.value;
      const group = inp.closest('.checkbox-group');
      const gkey = group ? (group.previousElementSibling && group.previousElementSibling.tagName.startsWith('LABEL') ? group.previousElementSibling.innerText.trim() : 'groupe') : 'groupe';
      if (inp.checked){
        if (!data[gkey]) data[gkey] = [];
        data[gkey].push(label);
      }
    });
    el.querySelectorAll('input.other-input').forEach(inp=>{
      const key = inp.placeholder || 'Précisions';
      if (inp.value.trim()){
        data[key] = inp.value.trim();
      }
    });
    return data;
  }

  function buildPayload(){
    const payload = {};
    payload.participant = {
      nom: $('#nom').value.trim(),
      prenom: $('#prenom').value.trim(),
      role: ($$('input[name="role"]:checked')[0]||{}).value || '',
      role_autre: $('#role-autre-text').value.trim() || '',
      equipe: ($$('input[name="equipe"]:checked')[0]||{}).value || ''
    };
    payload.zones = {};
    $$('#zoneContainer .subcard').forEach(card=>{
      const zone = card.querySelector('h3').innerText.trim();
      payload.zones[zone] = gatherSection(card);
    });
    payload.globaux = {};
    $$('#global-blocks .subcard').forEach(g=>{
      const title = g.querySelector('h3').innerText.trim();
      payload.globaux[title] = gatherSection(g);
    });
    payload.commun = {
      barrieres: gatherSection($('#barrieres').closest('.card'))['Quelles sont les limites ou barrières rencontrées ?'] || [],
      barrieres_autre: $('#barrieres-autre-text').value.trim() || '',
      choix: gatherSection($('#choix').closest('.card'))['Qu’est-ce qui guide vos choix de tests ?'] || [],
      choix_autre: $('#choix-autre-text').value.trim() || ''
    };
    return payload;
  }

  function validateRequired(){
    // basiques
    if (!$('#nom').value.trim() || !$('#prenom').value.trim()) return false;
    if (!$$('input[name="role"]:checked').length) return false;
    if ($('#role-autre').checked && !$('#role-autre-text').value.trim()) return false;
    if (!$$('input[name="equipe"]:checked').length) return false;
    if (!$$('#zones input:checked').length) return false;

    // “autre fréquence” -> préciser
    let ok = true;
    $$('#zoneContainer .subcard').forEach(card=>{
      const f = card.querySelector('.freq-autre');
      if (f && f.checked){
        const t = card.querySelector('#'+card.id+'-freq-autre input');
        if (!t || !t.value.trim()) ok = false;
      }
      // si un type est coché, s'assurer qu'au moins un élément interne est coché
      card.querySelectorAll('.types input:checked').forEach(()=>{
        // vérification générique : présence d'au moins une case cochée dans la zone-sub
        const has = card.querySelector('.zone-sub input:checked');
        if (!has) ok = false;
      });
    });

    // Autre -> préciser (global + zones)
    document.querySelectorAll('input[type="checkbox"][value^="Autre"]').forEach(oc=>{
      if (oc.checked){
        const group = oc.closest('.checkbox-group');
        const wrap = group && group.nextElementSibling && group.nextElementSibling.classList.contains('other-wrap') ? group.nextElementSibling : null;
        const inp = wrap ? wrap.querySelector('input') : null;
        if (inp && !inp.value.trim()) ok = false;
      }
    });

    // Jumps/Course/Func blocks: si Oui → vérifier qu'au moins un choix est coché
    const gc = $('#global-course');
    const gj = $('#global-jumps');
    const gmi = $('#global-func-mi');
    const gms = $('#global-func-ms');
    const ynPairs = [
      [gj, 'jumps-yn', '#jumps-body'],
      [gc, 'course-yn', '#course-body'],
      [gmi, 'funcmi-yn', '#funcmi-body'],
      [gms, 'funcms-yn', '#funcms-body']
    ];
    ynPairs.forEach(([el, name, bodySel])=>{
      if (!el) return;
      const yes = el.querySelector(`input[name="${name}"][value="Oui"]`);
      const no = el.querySelector(`input[name="${name}"][value="Non"]`);
      if (yes && no && !yes.checked && !no.checked) ok = false;
      if (yes && yes.checked){
        if (!el.querySelector(bodySel+' input:checked')) ok = false;
      }
    });

    return ok;
    }

  // ENVOI
  $('#send').addEventListener('click', async ()=>{
    $('#result').style.color = '#d22';
    $('#result').textContent = '';

    if (!validateRequired()){
      $('#result').textContent = '⚠️ Merci de compléter les champs obligatoires et précisions "Autre" avant envoi.';
      return;
    }

    const payload = buildPayload();
    const text = JSON.stringify(payload, null, 2);

    const url = window.GOOGLE_FORM_URL;
    const entry = window.GOOGLE_ENTRY_ID;

    const formData = new FormData();
    formData.append(entry, text);

    try {
      const resp = await fetch(url, { method:'POST', mode:'no-cors', body: formData });
      // succès supposé en mode no-cors
      $('#result').style.color = '#0074d9';
      $('#result').textContent = '✅ Merci, vos réponses ont été enregistrées.';
      // reset
      setTimeout(()=>{
        document.getElementById('form').reset();
        // nettoyer les blocs dynamiques
        $('#zoneContainer').innerHTML = '';
        $('#global-blocks').innerHTML = '';
        updateProgress();
        window.scrollTo({top:0,behavior:'smooth'});
      }, 800);
    } catch(err){
      $('#result').textContent = '❌ Erreur réseau lors de l’envoi.';
      console.error(err);
    }
  });

});
