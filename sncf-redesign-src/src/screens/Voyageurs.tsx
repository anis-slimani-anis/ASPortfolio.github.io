import { Icon } from '../components/Icon'
import { go, useRoute } from '../lib/router'
import { DATE_DISRUPTED } from '../lib/types'

const CHIPS = ['Trajets directs', 'Trajets via', 'Temps de correspondance']
const TILES = [
  { label: 'Voyageur', icon: 'info' as const },
  { label: 'Animal', icon: 'route' as const },
  { label: 'Vélo', icon: 'bus' as const },
]

/* Screens before results, nodes 627:16227 (desktop) / 627:15571 (mobile).
   Sits between /recherche and /resultats.

   The whole step used to live inside one white card, which on the day palette
   is all but invisible against the page and turned every field into a box
   inside a box. It is now a column of grouped blocks on the page itself, and
   the filter chips float free of any container. */
export function Voyageurs() {
  const route = useRoute()

  const next = () => {
    // Whatever brought the user here is carried through unchanged; only the
    // date is defaulted if it is missing.
    const params = new URLSearchParams(route.params)
    if (!params.get('date')) params.set('date', DATE_DISRUPTED)
    go(`/resultats?${params.toString()}`)
  }

  return (
    <>
      <div className="rechbar">
        <div className="shell"><h1 className="rechbar__title">Rechercher</h1></div>
      </div>

      <main className="main">
        <div className="shell voyageurs">
          <div className="voyageurs__main">
            {/* search summary: one grouped field, hairlines instead of nested boxes */}
            <section className="vsum" aria-label="Votre recherche">
              <div className="vsum__pair">
                <label className="vsum__seg">
                  <span className="vsum__label">Départ :</span>
                  <input className="vsum__input" defaultValue="Massy" aria-label="Gare de départ" />
                </label>
                <label className="vsum__seg">
                  <span className="vsum__label">Arrivée :</span>
                  <input className="vsum__input" defaultValue="Marseille Saint-Charles" aria-label="Gare d'arrivée" />
                </label>
                <button type="button" className="vsum__swap" aria-label="Inverser départ et arrivée">⇅</button>
              </div>
              <div className="vsum__row">
                <span className="vsum__date">Aller : Aujourd’hui, 14h</span>
                <button type="button" className="vsum__add">
                  Ajouter le retour<span className="vsum__plus" aria-hidden="true">+</span>
                </button>
              </div>
            </section>

            {/* filters float on the page; a single scrolling row keeps them even */}
            <section className="vfilters" aria-label="Filtrer les trajets">
              <span className="vfilters__label">Filtrer par :</span>
              <div className="vfilters__row">
                {CHIPS.map((c) => (
                  <button key={c} type="button" className="vchip">
                    {c}<span className="vchip__plus" aria-hidden="true">+</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="vsection">
              <div className="qui">
                <h2 className="qui__title">Qui voyage ?</h2>
                <a className="qui__link" href="#">Réserver pour 10+ voyageurs</a>
              </div>

              <button type="button" className="pax">
                <span className="pax__avatar" aria-hidden="true">A</span>
                <span className="pax__txt">
                  <span className="pax__name">Voyageur 1 : 30 - 59 ans</span>
                  <span className="pax__meta">Sans carte de réduction</span>
                  <span className="pax__meta">Sans carte de fidélité</span>
                </span>
                <Icon name="chevron" size={20} />
              </button>

              <div className="tiles">
                {TILES.map((t) => (
                  <button key={t.label} type="button" className="tile">
                    <span className="tile__circle"><Icon name={t.icon} size={20} /></span>
                    <span className="tile__label">{t.label}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="vsection selects">
              <div className="selects__col">
                <span className="selects__label">
                  Code de réduction<Icon name="info" size={16} />
                </span>
                <div className="selects__field">
                  <input placeholder="Code avantage SNCF" aria-label="Code de réduction" />
                  <span className="selects__plus" aria-hidden="true">+</span>
                </div>
              </div>
              <div className="selects__col">
                <span className="selects__label">
                  Motif du voyage<Icon name="info" size={16} />
                </span>
                <div className="selects__field">
                  <select aria-label="Motif du voyage" defaultValue="perso">
                    <option value="perso">Voyage personnel</option>
                    <option value="pro">Voyage professionnel</option>
                  </select>
                </div>
              </div>
            </section>

            <div className="vactions">
              <button type="button" className="pill pill--primary voyageurs__cta" onClick={next}>
                Voir les prix
              </button>
              <button type="button" className="voyageurs__alt" onClick={next}>
                Voir les horaires uniquement
              </button>
            </div>
          </div>

          {/* desktop-only side panel */}
          <aside className="vpanel" aria-label="+ de choix de trajets">
            <svg className="vpanel__art" viewBox="0 0 300 150" fill="none" aria-hidden="true">
              <path d="M18 116C54 96 62 60 96 52c30-7 44 24 74 18 26-5 34-38 64-40"
                    stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 10" />
              <path d="M96 20c9 0 16 7 16 16 0 12-16 26-16 26S80 48 80 36c0-9 7-16 16-16Z"
                    stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
              <circle cx="96" cy="36" r="5" fill="currentColor" />
              <path d="M242 24v44M242 26c12-6 22 6 34 0v20c-12 6-22-6-34 0"
                    stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
            </svg>
            <div className="vpanel__modes" aria-hidden="true">
              <Icon name="train" size={22} /><Icon name="bus" size={22} />
              <Icon name="route" size={22} /><Icon name="clock" size={22} />
            </div>
            <h2 className="vpanel__title">+ de choix de trajets</h2>
            <p className="vpanel__body">
              Pour vous déplacer, au quotidien comme pour les grandes occasions : comparez et
              planifiez vos itinéraires partout en France
            </p>
          </aside>
        </div>
      </main>
    </>
  )
}
