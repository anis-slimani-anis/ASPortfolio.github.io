import { useIsDesktop } from '../lib/useMedia'

const FILTERS = ['Trajets directs', 'Prix', 'Trajets via', 'Type de train', 'Temps de correspondance']

/* The dark "Aller" block under the header. Mobile is the 295px hero from the
   design, desktop the single-row journey bar. */
export function JourneyBar({ depart, arrivee, dateLabel, onSwap }: {
  depart: string; arrivee: string; dateLabel: string; onSwap?: () => void
}) {
  const desktop = useIsDesktop()
  return (
    <section className="aller" aria-label="Votre recherche">
      <div className="shell aller__inner">
        <div className="aller__head">
          <h1 className="aller__title">Aller</h1>
          {desktop ? (
            <>
              <p className="aller__note">Nos offres sont présentées par horaires de départ.</p>
              <a className="aller__conditions" href="#">Voir conditions</a>
            </>
          ) : (
            <span className="aller__pax">
              <span className="aller__paxitem">1 voyageur</span>
              <span className="aller__paxitem">Codes</span>
            </span>
          )}
        </div>

        <div className="aller__fields">
          <div className="field field--pair">
            <label className="field__seg">
              <span className="field__label">Départ :</span>
              <input className="field__input" defaultValue={depart} aria-label="Gare de départ" />
            </label>
            <button type="button" className="field__swap" onClick={onSwap}
                    aria-label="Inverser départ et arrivée">⇅</button>
            <label className="field__seg">
              <span className="field__label">Arrivée :</span>
              <input className="field__input" defaultValue={arrivee} aria-label="Gare d'arrivée" />
            </label>
          </div>

          <div className="field field--date">
            <span className="field__label">Aller :</span>
            <span className="field__value">{dateLabel}</span>
          </div>

          <button type="button" className="field field--add">
            Ajouter le retour<span className="aller__plus" aria-hidden="true">+</span>
          </button>
        </div>

        <div className="aller__filters">
          {desktop && <span className="aller__filterlabel">Filtrer par :</span>}
          <div className="aller__chips">
            {FILTERS.map((f) => (
              <button key={f} type="button" className="chip">
                {f}<span className="chip__plus" aria-hidden="true">+</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const A = (f: string) => `${import.meta.env.BASE_URL}upsell/${f}`

/* Desktop only, per section 5. Illustrations are the Figma exports.
   Each card now actually goes somewhere rather than sitting as decoration. */
export function UpsellRow({ onPrices, onBus, onHelp }: {
  onPrices?: () => void; onBus?: () => void; onHelp?: () => void
}) {
  const cards = [
    { art: 'prix.svg', title: 'Prix minimum et maximum sur ce trajet',
      link: 'Voir les prix', act: onPrices },
    { art: 'bus.svg', title: 'Avez-vous pensé au bus et covoiturage ?',
      link: 'Voir les propositions', act: onBus },
    { art: 'questions.svg', title: 'Des questions sur les conditions de nos offres ?',
      link: 'Voir toutes nos conditions', act: onHelp },
  ]
  return (
    <div className="upsell">
      {cards.map((u) => (
        <article key={u.title} className="upsell__card">
          <img className="upsell__art" src={A(u.art)} alt="" width={80} height={80} />
          <div>
            <h3 className="upsell__title">{u.title}</h3>
            <button type="button" className="upsell__link" onClick={u.act}>{u.link}</button>
          </div>
        </article>
      ))}
    </div>
  )
}
