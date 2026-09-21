import { Icon } from './Icon'
import { useIsDesktop } from '../lib/useMedia'

/* bar/afficher-suivants, node 333:2222. The class switch is desktop only. */
export function LoadMoreBar({ klass, onKlass }: {
  klass: '2de' | '1re'; onKlass: (k: '2de' | '1re') => void
}) {
  const desktop = useIsDesktop()
  return (
    <div className="loadmore">
      <button type="button" className="loadmore__more">
        Afficher les trajets suivants
        <span className="loadmore__bullet" aria-hidden="true"><Icon name="chevron" size={12} /></span>
      </button>
      {desktop && (
        <div className="loadmore__class" role="group" aria-label="Classe">
          {(['2de', '1re'] as const).map((k) => (
            <button key={k} type="button" aria-pressed={klass === k}
              className={`loadmore__klass${klass === k ? ' loadmore__klass--on' : ''}`}
              onClick={() => onKlass(k)}>{k} classe</button>
          ))}
        </div>
      )}
    </div>
  )
}
