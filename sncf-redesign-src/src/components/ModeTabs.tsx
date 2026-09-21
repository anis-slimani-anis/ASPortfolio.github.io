import { Icon } from './Icon'
import { useIsDesktop } from '../lib/useMedia'

/* search/mode-tabs, node 338:2552. */
export function ModeTabs({ value, onChange }: {
  value: 'train' | 'bus'; onChange: (v: 'train' | 'bus') => void
}) {
  const desktop = useIsDesktop()
  const tabs = [
    { id: 'train' as const, glyph: 'train' as const, label: 'Train' },
    { id: 'bus' as const, glyph: 'bus' as const, label: desktop ? 'Bus ou covoiturage' : 'Bus ou covoit.' },
  ]
  return (
    <div className="modetabs" role="tablist" aria-label="Mode de transport">
      {tabs.map((t) => (
        <button key={t.id} role="tab" aria-selected={value === t.id}
          className={`modetab${value === t.id ? ' modetab--on' : ''}`}
          onClick={() => onChange(t.id)}>
          <Icon name={t.glyph} size={20} />{t.label}
        </button>
      ))}
    </div>
  )
}
