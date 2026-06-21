const API_BASE = 'http://localhost:3001';

const commonChecks = [
  'Verifier le moteur et le cablage pour court-circuit.',
  'Verifier la resistance de freinage et le cablage.',
  'Verifier le couplage moteur (triangle/etoile).',
  'Verifier le parametrage des donnees moteur.',
].join('\n');

const rows = [
  {
    code: '2250',
    en: 'CiA: Continuous overcurrent (inside the device)',
    fr: "CiA : Surintensite continue (interne a l'appareil)",
    severity: 'Trouble (Probleme)',
    solution: commonChecks,
  },
  {
    code: '2320',
    en: 'Short circuit or earth leakage on the motor side',
    fr: 'Court-circuit ou fuite a la terre cote moteur',
    severity: 'Trouble (Probleme)',
    solution: commonChecks,
  },
  {
    code: '2340',
    en: 'CiA: Short circuit (inside the device)',
    fr: "CiA : Court-circuit (interne a l'appareil)",
    severity: 'Trouble (Probleme)',
    solution: commonChecks,
  },
  {
    code: '2350',
    en: 'CiA: i2*t overload (thermal state)',
    fr: 'CiA : Surcharge i2*t (etat thermique)',
    severity: 'Trouble (Probleme)',
    solution: commonChecks,
  },
  {
    code: '2382',
    en: 'Error: Device utilization (Ixt) too high',
    fr: "Erreur : Utilisation de l'appareil (Ixt) trop elevee",
    severity: 'Trouble (Probleme)',
    solution: commonChecks,
  },
  {
    code: '3120',
    en: 'Mains phase fault',
    fr: 'Defaut de phase secteur',
    severity: 'Trouble (Probleme)',
    solution: commonChecks,
  },
  {
    code: '3210',
    en: 'DC bus overvoltage',
    fr: 'Surtension du bus CC',
    severity: 'Trouble (Probleme)',
    solution: commonChecks,
  },
  {
    code: '3220',
    en: 'DC bus undervoltage',
    fr: 'Sous-tension du bus CC',
    severity: 'Trouble (Probleme)',
    solution: commonChecks,
  },
  {
    code: '4210',
    en: 'PU: Overtemperature fault',
    fr: 'Defaut de surchauffe (Unite de Puissance)',
    severity: 'Trouble (Probleme)',
    solution: commonChecks,
  },
  {
    code: '4310',
    en: 'Error: Motor overtemperature',
    fr: 'Erreur : Surchauffe moteur',
    severity: 'Trouble (Probleme)',
    solution: commonChecks,
  },
  {
    code: '6280',
    en: 'Trigger/functions connected incorrectly',
    fr: 'Declencheurs/fonctions mal connectes',
    severity: 'Trouble (Probleme)',
    solution: [
      "Verifier et corriger l'attribution des declencheurs aux fonctions.",
      'Avec la commande par clavier ou reseau, les deux fonctions Inverter enable (P400.01) et Run (P400.02) peuvent etre reglees sur Constant TRUE [1] pour demarrer le moteur.',
    ].join('\n'),
  },
  {
    code: '7180',
    en: 'Motor overcurrent',
    fr: 'Surintensite moteur',
    severity: 'Trouble (Probleme)',
    solution: [
      'Verifier la charge du moteur.',
      'Verifier le dimensionnement du variateur.',
      "Adapter le seuil d'erreur regle (P353.01).",
    ].join('\n'),
  },
  {
    code: '9080',
    en: 'Keypad removed',
    fr: 'Clavier retire',
    severity: 'Trouble (Probleme)',
    solution: 'Rebrancher le clavier ou activer une autre source de commande.',
  },
  {
    code: 'FF02',
    en: 'Error: Brake resistor overload',
    fr: 'Erreur : Surcharge de la resistance de freinage',
    severity: 'Trouble (Probleme)',
    solution: [
      'Verifier le dimensionnement du variateur.',
      "Verifier les reglages de gestion de l'energie de freinage.",
      "Note: l'erreur sera reinitialisee si la charge thermique descend en dessous du seuil d'erreur (P707.09) de -20 %.",
    ].join('\n'),
  },
  {
    code: 'FF06',
    en: 'Motor overspeed',
    fr: 'Survitesse moteur',
    severity: 'Trouble (Probleme)',
    solution: "Adapter la vitesse maximale du moteur (P322.00) et le seuil d'erreur (P350.01).",
  },
  {
    code: 'FF37',
    en: 'Automatic start disabled',
    fr: 'Demarrage automatique desactive',
    severity: 'Trouble (Probleme)',
    solution: "Desactiver la commande de demarrage et reinitialiser l'erreur.",
  },
  {
    code: '2383',
    en: 'Warning: Device utilization (Ixt) too high',
    fr: "Avertissement : Utilisation de l'appareil (Ixt) trop elevee",
    severity: 'Warning (Avertissement)',
    solution: commonChecks,
  },
  {
    code: '3211',
    en: 'Warning: DC bus overvoltage',
    fr: 'Avertissement : Surtension du bus CC',
    severity: 'Warning (Avertissement)',
    solution: commonChecks,
  },
  {
    code: '3221',
    en: 'Warning: DC bus undervoltage',
    fr: 'Avertissement : Sous-tension du bus CC',
    severity: 'Warning (Avertissement)',
    solution: commonChecks,
  },
  {
    code: '3222',
    en: 'DC-bus voltage too low for switch-on',
    fr: 'Tension du bus CC trop faible pour la mise en marche',
    severity: 'Warning (Avertissement)',
    solution: commonChecks,
  },
  {
    code: '4281',
    en: 'Heatsink fan warning',
    fr: 'Avertissement ventilateur dissipateur',
    severity: 'Warning (Avertissement)',
    solution: commonChecks,
  },
  {
    code: '5112',
    en: '24 V supply critical',
    fr: 'Alimentation 24 V critique',
    severity: 'Warning (Avertissement)',
    solution: commonChecks,
  },
  {
    code: '5180',
    en: '24-V supply overload',
    fr: "Surcharge de l'alimentation 24 V",
    severity: 'Warning (Avertissement)',
    solution: commonChecks,
  },
  {
    code: 'FF36',
    en: 'Warning: Brake resistor overload',
    fr: 'Avertissement : Surcharge de la resistance de freinage',
    severity: 'Warning (Avertissement)',
    solution: [
      'Verifier le dimensionnement du variateur.',
      "Verifier les reglages de gestion de l'energie de freinage.",
      "Note: l'avertissement sera reinitialise si la charge thermique descend en dessous du seuil d'avertissement (P707.08) de -20 %.",
    ].join('\n'),
  },
  {
    code: 'FF85',
    en: 'Keypad full control active',
    fr: 'Controle total via clavier actif',
    severity: 'Warning (Avertissement)',
    solution: 'Appuyer sur la touche CTRL pour quitter le mode de commande.',
  },
];

async function request(method, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${path} failed: ${res.status} ${text}`);
  }

  return res.json();
}

async function main() {
  const existingPannes = await request('GET', '/pannes');
  const existingSolutions = await request('GET', '/panne-solutions');

  const panneByCode = new Map(existingPannes.map((p) => [p.panne_id, p]));
  const solutionById = new Map(existingSolutions.map((s) => [s.solution_id, s]));

  let panneCreated = 0;
  let panneUpdated = 0;
  let solutionCreated = 0;
  let solutionUpdated = 0;

  for (const row of rows) {
    const pannePayload = {
      panne_id: row.code,
      code_panne: row.en,
      description: row.fr,
      gravite: row.severity,
    };

    let panneDoc = panneByCode.get(row.code);
    if (panneDoc) {
      panneDoc = await request('PATCH', `/pannes/${panneDoc._id}`, pannePayload);
      panneUpdated += 1;
    } else {
      panneDoc = await request('POST', '/pannes', pannePayload);
      panneCreated += 1;
    }

    const solutionId = `${row.code}-SOL`;
    const solutionPayload = {
      solution_id: solutionId,
      panne_id: panneDoc._id,
      cause_probable: `${row.en} | ${row.fr}`,
      solution_recommandee: row.solution,
    };

    const existingSolution = solutionById.get(solutionId);
    if (existingSolution) {
      await request('PATCH', `/panne-solutions/${existingSolution._id}`, solutionPayload);
      solutionUpdated += 1;
    } else {
      const created = await request('POST', '/panne-solutions', solutionPayload);
      solutionById.set(solutionId, created);
      solutionCreated += 1;
    }
  }

  const finalPannes = await request('GET', '/pannes');
  const finalSolutions = await request('GET', '/panne-solutions');

  console.log(`PANNES_CREATED=${panneCreated}`);
  console.log(`PANNES_UPDATED=${panneUpdated}`);
  console.log(`SOLUTIONS_CREATED=${solutionCreated}`);
  console.log(`SOLUTIONS_UPDATED=${solutionUpdated}`);
  console.log(`PANNES_TOTAL=${finalPannes.length}`);
  console.log(`SOLUTIONS_TOTAL=${finalSolutions.length}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
