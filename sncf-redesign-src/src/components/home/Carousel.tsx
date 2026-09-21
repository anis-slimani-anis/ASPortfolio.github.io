const IMG = (f: string) => `${import.meta.env.BASE_URL}home/${f}`

/* Margin D / Margin M, nodes 622:14149 / 622:14699.
   A row on desktop, a swipeable rail on mobile. */
const CARDS = [
  { img: 'promos.webp', flag: 'Promo', title: 'Les promos de la rentrée sont là !',
    body: 'Les Jours Traincroyables sont de retour : découvrez nos offres promos pour partir à petits prix. (1)',
    cta: "J'en profite" },
  { img: 'regions.webp', title: 'Explorez les régions autrement',
    body: 'Voyagez en TER et profitez des Pass Touristiques pour découvrir les plus beaux sites, seul ou à plusieurs.',
    cta: "J'en profite" },
  { img: 'recompense.webp', flag: 'Jeu concours', title: 'Et si vos trajets étaient récompensés ?',
    body: 'Achetez la carte Liberté, jouez et tentez de remporter le smartphone de votre choix !',
    cta: 'Je tente ma chance' },
  { img: 'voiture.webp', title: 'Un trajet de prévu ?',
    body: 'Louez une voiture et bénéficiez jusqu’à 15% de réduction pour écrire votre propre itinéraire, en toute liberté. (2)',
    cta: "J'en profite" },
]

export function Carousel() {
  return (
    <section className="carou" aria-labelledby="carou-title">
      <h2 id="carou-title" className="sect__h">Explorez l’univers SNCF Connect :</h2>
      <ul className="carou__rail">
        {CARDS.map((c) => (
          <li key={c.title} className="carou__card">
            <div className="carou__media">
              <img src={IMG(c.img)} alt="" loading="lazy" width={310} height={200} />
            </div>
            <div className="carou__body">
              {c.flag && <span className="carou__flag">{c.flag}</span>}
              <h3 className="carou__title">{c.title}</h3>
              <p className="carou__text">{c.body}</p>
            </div>
            <a className="carou__cta" href="#">
              {c.cta}<span className="bullet" aria-hidden="true">›</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
