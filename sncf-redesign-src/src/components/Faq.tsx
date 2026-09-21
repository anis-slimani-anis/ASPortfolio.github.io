/* FAQ D / FAQ M, nodes 622:13404 / 622:13775. */
const SUGGESTIONS = [
  'Que signifie non réservable ?',
  'Comment ajouter un bagage ?',
  'Quand acheter mon billet ?',
]

export function Faq() {
  return (
    <section id="besoin-aide" className="faq" aria-labelledby="faq-title">
      <div className="faq__lead">
        <svg className="faq__glyph" width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
          <path d="M11 20a7 7 0 0 1 7-7h20a7 7 0 0 1 7 7v10a7 7 0 0 1-7 7H25l-9 7v-7h-5V20Z"
                stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
          <circle cx="23" cy="24" r="1.9" fill="currentColor" />
          <circle cx="33" cy="24" r="1.9" fill="currentColor" />
          <path d="M22.5 29.5a7 7 0 0 0 11 0" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
        <div className="faq__copy">
          <h2 id="faq-title" className="faq__title">Besoin d’aide ?</h2>
          <p className="faq__sub">Posez-nous votre question.</p>
          <button type="button" className="faq__cta">Lancer la conversation</button>
        </div>
      </div>
      <div className="faq__side">
        <p className="faq__label">Suggestions :</p>
        <ul className="faq__chips">
          {SUGGESTIONS.map((s) => (
            <li key={s}><button type="button" className="faq__chip">{s}</button></li>
          ))}
        </ul>
      </div>
    </section>
  )
}
