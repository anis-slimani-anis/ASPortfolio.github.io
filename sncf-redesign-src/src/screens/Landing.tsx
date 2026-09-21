import { useState } from 'react'
import { Icon } from './../components/Icon'
import { useIsDesktop } from '../lib/useMedia'
import { go } from '../lib/router'
import { SearchTabs } from '../components/SearchTabs'
import { Carousel } from '../components/home/Carousel'
import { AlertPromo } from '../components/home/AlertPromo'
import { InfoList } from '../components/home/InfoList'

const HERO = `${import.meta.env.BASE_URL}hero/envie.webp`
const LINKS = ['Location de voiture', 'Taxi et VTC', 'Hôtels']

/* 01 RECHERCHE, LANDING. Nodes 352:2966 (desktop) / 352:3073 (mobile). */
export function Landing() {
  const desktop = useIsDesktop()
  const [q, setQ] = useState('')
  const search = () => go('/recherche')

  return (
    <main className="landing">
      <div className="shell landing__inner">
        <h1 className="landing__title">
          {desktop
            ? 'Trains, bus, transports en commun : trouvez facilement votre trajet'
            : 'Trouvez facilement votre trajet'}
        </h1>

        {desktop && <SearchTabs />}

        <form className="bigsearch" onSubmit={(e) => { e.preventDefault(); search() }} role="search">
          <input
            className="bigsearch__input"
            placeholder="Entrez une destination, un trajet..."
            aria-label="Entrez une destination, un trajet"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={search}
          />
          <button type="submit" className="bigsearch__go" aria-label="Rechercher">
            {desktop ? 'Rechercher' : <Icon name="loupe" size={20} />}
          </button>
        </form>

        <nav className="landing__links" aria-label="Autres services">
          {LINKS.map((l) => <a key={l} href="#">{l}</a>)}
        </nav>
      </div>

      <div className="shell shell--wide promo__wrap">
      <section className="promo" aria-label="Offre dernière minute">
        <div className="promo__media">
          <img src={HERO} alt="" width={812} height={457} loading="lazy" />
        </div>
        <div className="promo__panel">
          <span className="promo__flag">Dernière minute</span>
          <h2 className="promo__title">Une envie ? Une destination. A vous de jouer !</h2>
          <p className="promo__body">
            Cliquez sur votre envie du moment et découvrez une destination qui vous ressemble.
          </p>
          <button type="button" className="promo__cta">Je choisis mon envie</button>
        </div>
      </section>
      </div>

      <div className="shell sect__wrap">
        <Carousel />
        <AlertPromo />
        <InfoList />
      </div>
    </main>
  )
}
