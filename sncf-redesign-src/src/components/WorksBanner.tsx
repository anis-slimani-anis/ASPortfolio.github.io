import { Icon } from './Icon'
import { useIsDesktop } from '../lib/useMedia'

/* banner/travaux, nodes 333:2175 / 333:2187. */
export function WorksBanner({ title, body, onOpen }: {
  title: string; body: string; onOpen?: () => void
}) {
  const desktop = useIsDesktop()
  const more = (
    <button type="button" className={`banner__more${desktop ? '' : ' banner__more--mobile'}`} onClick={onOpen}>
      <span>Lire la suite</span>
      <span className="banner__bullet" aria-hidden="true"><Icon name="chevron" size={12} /></span>
    </button>
  )
  return (
    <section className="banner" aria-label={title}>
      <div className="banner__row">
        <Icon name="critique" size={24} className="banner__glyph" />
        <div className="banner__text">
          <div className="banner__head">
            <h2 className="banner__title">{title}</h2>
            {desktop && more}
          </div>
          <p className="banner__body">{body}</p>
          {!desktop && more}
        </div>
      </div>
    </section>
  )
}
