/* Footer D / Footer M, nodes 622:13439 / 622:13812.
   The link columns and the accordions are reproduced; the third-party payment,
   partner and app-store marks are shown as neutral labels rather than pulling a
   dozen unrelated brand assets into the bundle. */
const COLUMNS = [
  {
    title: "L'entreprise",
    links: ['Conditions de présentation des offres sur le site', 'Conditions générales de vente',
      "Droits des voyageurs ferroviaires et Règlement européen n°2021/782", 'Informations légales',
      'Charte de confidentialité et cookies', 'Gestion des cookies'],
  },
  { title: 'Partenariat', links: ['Régie publicitaire', 'Devenir partenaire ou affilié', 'Widget SNCF Connect'] },
  { title: 'Sites du groupe', links: ['Site SNCF Connect & Tech', 'Espace Presse SNCF Connect & Tech',
      'Carrières SNCF Connect & Tech', 'Groupe-sncf.com', 'Emploi Groupe SNCF'] },
  { title: 'Vous informer', links: ['Aide', 'Contactez-nous', 'Vos billets', 'Communauté SNCF Connect',
      'Plan du site SNCF Connect', 'Guide du voyageur', 'Franchissement frontière', 'Tous nos transporteurs'] },
  { title: 'Handicap & mobilité réduite', links: ['Nos services pour les voyageurs PSH/PMR',
      "Tout savoir sur le service d'assistance en gare", 'Accessibilité numérique : conformité partielle',
      "Fonctionnalités d'accessibilité de nos applications mobiles", "Les autres services d'assistance en Europe"] },
]

const ACCORDIONS = ['Transporteurs', 'Itinéraires populaires', 'Trajets Transporteurs', 'Top destinations']
const PAYMENTS = ['CB', 'Visa', 'Mastercard', 'Amex', 'PayPal', 'Apple Pay', 'Google Pay']

export function SiteFooter() {
  return (
    <footer className="ftr">
      <div className="ftr__inner">
        <div className="ftr__top">
          <div className="ftr__block">
            <h2 className="ftr__h">Nos engagements</h2>
            <ul className="ftr__links">
              {['Meilleurs prix garantis', 'Paiement sécurisé', 'Contact 7j/7'].map((l) => (
                <li key={l}><a href="#">{l}</a></li>
              ))}
            </ul>
          </div>
          <div className="ftr__block">
            <h2 className="ftr__h">Moyens de paiement</h2>
            <ul className="ftr__pay">
              {PAYMENTS.map((p) => <li key={p}>{p}</li>)}
            </ul>
            <ul className="ftr__links">
              {['Infos et conditions', 'Paiement en Chèque-Vacances Connect',
                'Infos et conditions de paiement avec les cartes de mobilité durable'].map((l) => (
                <li key={l}><a href="#">{l}</a></li>
              ))}
            </ul>
          </div>
          <div className="ftr__block">
            <h2 className="ftr__h">Choix du pays</h2>
            <label className="ftr__country">
              <span>Langue</span>
              <select aria-label="Choix du pays"><option>France</option></select>
            </label>
          </div>
        </div>

        <hr className="ftr__rule" />

        <div className="ftr__top ftr__top--social">
          <div className="ftr__block">
            <h2 className="ftr__h">Nos partenaires</h2>
            <ul className="ftr__pay"><li>Allianz Travel</li><li>Railteam</li></ul>
          </div>
          <div className="ftr__block">
            <h2 className="ftr__h">Suivez-nous !</h2>
            <ul className="ftr__pay">
              {['Instagram', 'TikTok', 'Facebook', 'X', 'Pinterest'].map((s) => <li key={s}>{s}</li>)}
            </ul>
          </div>
        </div>

        <hr className="ftr__rule" />

        <div className="ftr__cols">
          {COLUMNS.map((c) => (
            <div key={c.title} className="ftr__col">
              <h2 className="ftr__h">{c.title}</h2>
              <ul className="ftr__links">
                {c.links.map((l) => <li key={l}><a href="#">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>

        <hr className="ftr__rule" />

        <div className="ftr__acc">
          {ACCORDIONS.map((a) => (
            <details key={a} className="ftr__accitem">
              <summary>{a}</summary>
              <p>Contenu à venir.</p>
            </details>
          ))}
        </div>

        <div className="ftr__bottom">
          <ul className="ftr__stores"><li>App Store</li><li>Google Play</li></ul>
          <a className="ftr__debug" href="#">Debug infos</a>
        </div>
      </div>
    </footer>
  )
}
