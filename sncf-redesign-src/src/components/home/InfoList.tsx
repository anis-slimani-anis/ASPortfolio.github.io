const G = (f: string) => `${import.meta.env.BASE_URL}info/${f}`

/* "Vous, votre entourage, vos bagages" D / M, nodes 622:14261 / 622:14800. */
const ROWS = [
  { icon: 'phishing.svg', label: 'Phishing : restons vigilants' },
  { icon: 'pro.svg', label: 'Nos services handicap' },
  { icon: 'pro.svg', label: 'Pour les professionnels' },
  { icon: 'bagages.svg', label: 'Nouvelles règles de bagages à bord des TGV INOUI & Intercités' },
]

export function InfoList() {
  return (
    <section className="infolist" aria-labelledby="infolist-title">
      <h2 id="infolist-title" className="sect__h">Vous, votre entourage, vos bagages</h2>
      <ul className="infolist__list">
        {ROWS.map((r) => (
          <li key={r.label}>
            <a className="inforow" href="#">
              <img className="inforow__glyph" src={G(r.icon)} alt="" width={24} height={24} />
              <span className="inforow__label">{r.label}</span>
              <span className="inforow__chev" aria-hidden="true">›</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
