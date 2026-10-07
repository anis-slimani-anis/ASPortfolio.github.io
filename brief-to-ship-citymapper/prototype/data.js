/*
 * À ma façon · données du prototype
 *
 * Tout ce que le prototype affiche vient de cet objet. Les valeurs sont
 * ILLUSTRATIVES : elles reprennent les maquettes Figma et mon expérience du
 * trajet, pas un horaire officiel. À remplacer plus tard par les données
 * ouvertes d'Île-de-France Mobilités (GTFS, licence ODbL) :
 *   - lines[].stops      <- stop_times.txt (temps de parcours entre arrêts)
 *   - transfers[]        <- transfers.txt + pathways.txt (marche en station)
 *   - suggested[]        <- la réponse du calculateur d'itinéraire
 */
window.CM_DATA = {
  // Trajet étudié
  origin: 'massy',
  destination: 'louis-blanc',
  arriveBy: '18:30',            // mode "arriver à", modifiable dans le prototype
  timeStep: 5,                  // pas du réglage de l'heure, en minutes
  fare: '2.55€',

  // Bandeau "autres modes" de l'écran de résultats (statique)
  otherModes: [
    { value: '263', label: 'min · À pied' },
    { value: '95',  label: 'min · Vélo' },
    { value: '~63', label: 'min · Taxi' }
  ],

  // Stations. `otherLines` : lignes qui existent à la station mais que le
  // prototype ne modélise pas (affichées en information, jamais proposées).
  stations: {
    'massy':          { name: 'Massy - Palaiseau' },
    'antony':         { name: 'Antony' },
    'bourg-la-reine': { name: 'Bourg-la-Reine' },
    'cite-u':         { name: 'Cité Universitaire' },
    'denfert':        { name: 'Denfert-Rochereau' },
    'port-royal':     { name: 'Port-Royal' },
    'luxembourg':     { name: 'Luxembourg' },
    'saint-michel':   { name: 'Saint-Michel Notre-Dame' },
    'chatelet':       { name: 'Châtelet', otherLines: ['1', '11', '14', 'RER D'] },
    'gare-du-nord':   { name: 'Gare du Nord' },
    'gare-de-lyon':   { name: 'Gare de Lyon' },
    'auber':          { name: 'Auber' },
    'etoile':         { name: 'Charles de Gaulle - Étoile' },
    'etienne-marcel': { name: 'Étienne Marcel' },
    'reaumur':        { name: 'Réaumur - Sébastopol' },
    'strasbourg-sd':  { name: 'Strasbourg - Saint-Denis' },
    'chateau-d-eau':  { name: 'Château d’Eau' },
    'gare-de-l-est':  { name: 'Gare de l’Est' },
    'pont-neuf':      { name: 'Pont Neuf' },
    'palais-royal':   { name: 'Palais Royal' },
    'pyramides':      { name: 'Pyramides' },
    'opera':          { name: 'Opéra' },
    'chaussee-d-antin': { name: 'Chaussée d’Antin' },
    'le-peletier':    { name: 'Le Peletier' },
    'cadet':          { name: 'Cadet' },
    'poissonniere':   { name: 'Poissonnière' },
    'chateau-landon': { name: 'Château-Landon' },
    'louis-blanc':    { name: 'Louis Blanc' }
  },

  // Lignes. `t` = minutes cumulées depuis le premier arrêt listé ; le temps
  // de parcours entre deux arrêts est la différence des `t`.
  // `badge` = fichier exporté du composant Figma "Line Badge" (6:12).
  lines: {
    'RER B': {
      label: 'le RER B', badge: 'line-rer-b.png',
      stops: [
        { s: 'massy', t: 0 }, { s: 'antony', t: 5 }, { s: 'bourg-la-reine', t: 10 },
        { s: 'cite-u', t: 17 }, { s: 'denfert', t: 20 }, { s: 'port-royal', t: 22 },
        { s: 'luxembourg', t: 24 }, { s: 'saint-michel', t: 27 },
        { s: 'chatelet', t: 31 }, { s: 'gare-du-nord', t: 35 }
      ]
    },
    'RER A': {
      label: 'le RER A', badge: 'line-rer-a.png',
      stops: [
        { s: 'gare-de-lyon', t: 0 }, { s: 'chatelet', t: 3 },
        { s: 'auber', t: 6 }, { s: 'etoile', t: 9 }
      ]
    },
    'M4': {
      label: 'le 4', badge: 'line-m4.png',
      stops: [
        { s: 'chatelet', t: 0 }, { s: 'etienne-marcel', t: 1 }, { s: 'reaumur', t: 2 },
        { s: 'strasbourg-sd', t: 3 }, { s: 'chateau-d-eau', t: 4 },
        { s: 'gare-de-l-est', t: 5 }, { s: 'gare-du-nord', t: 7 }
      ]
    },
    'M5': {
      label: 'le 5', badge: 'line-m5.png',
      stops: [ { s: 'gare-du-nord', t: 0 }, { s: 'gare-de-l-est', t: 2 } ]
    },
    'M7': {
      label: 'le 7', badge: 'line-m7.png',
      stops: [
        { s: 'chatelet', t: 0 }, { s: 'pont-neuf', t: 1 }, { s: 'palais-royal', t: 2 },
        { s: 'pyramides', t: 3 }, { s: 'opera', t: 4 }, { s: 'chaussee-d-antin', t: 5 },
        { s: 'le-peletier', t: 7 }, { s: 'cadet', t: 8 }, { s: 'poissonniere', t: 9 },
        { s: 'gare-de-l-est', t: 11 }, { s: 'chateau-landon', t: 13 }, { s: 'louis-blanc', t: 14 }
      ]
    }
  },

  // Temps de parcours imposés, prioritaires sur les `t` ci-dessus.
  // Sert uniquement à retrouver les 47 min du trajet suggéré B puis 7 par
  // Châtelet (31 + 9 + 7). À supprimer dès que les vrais temps GTFS arrivent.
  rideOverrides: {
    'M7|chatelet|louis-blanc': 7
  },

  // Correspondances. Le coût d'une correspondance est le coeur du concept.
  //   at    : station où l'on descend
  //   from  : ligne que l'on quitte        to : ligne que l'on prend
  //   board : station où l'on remonte (si différente, même complexe)
  //   min   : minutes de marche            long : true = couleur d'alerte
  //   walk  : true = libellé "à pied"
  transfers: [
    { at: 'chatelet',      from: 'RER B', to: 'RER A', board: 'chatelet',      min: 1, label: 'Quai en face' },
    { at: 'chatelet',      from: 'RER B', to: 'M4',    board: 'chatelet',      min: 5, label: 'Couloir' },
    { at: 'chatelet',      from: 'RER B', to: 'M7',    board: 'chatelet',      min: 9, label: 'Correspondance longue', long: true, walk: true },
    { at: 'auber',         from: 'RER A', to: 'M7',    board: 'opera',         min: 4, label: 'Même complexe', walk: true },
    { at: 'gare-de-l-est', from: 'M4',    to: 'M7',    board: 'gare-de-l-est', min: 3, label: 'Couloir' },
    { at: 'gare-de-l-est', from: 'M5',    to: 'M7',    board: 'gare-de-l-est', min: 3, label: 'Couloir' },
    { at: 'gare-du-nord',  from: 'RER B', to: 'M5',    board: 'gare-du-nord',  min: 4, label: 'Couloir' }
  ],

  // Liste "Suggérés" telle que dans la maquette (réponse du calculateur,
  // statique ici). `early` = minutes d'avance sur l'heure d'arrivée demandée.
  suggested: [
    { lines: ['RER B', 'M5', 'M7'], total: 47, early: 0 },
    { lines: ['RER B'], walk: true,  total: 49, early: 0 },
    { lines: ['RER B', 'M4', 'M7'], total: 47, early: 0 },
    { lines: ['RER B', 'M5', 'M7'], total: 48, early: 0 },
    { lines: ['RER B', 'M4', 'M7'], total: 49, early: 1 }
  ],

  // Référence pour la phrase de comparaison de l'écran "Ton trajet" :
  // le trajet suggéré B puis 7 par Châtelet.
  reference: { total: 47, transferWalk: 9 }
};
