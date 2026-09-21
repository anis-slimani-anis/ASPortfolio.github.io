import { DateChip } from './DateChip'
import { useIsDesktop } from '../lib/useMedia'

export type DayEntry = { iso: string; label: string; price: string; severity: 'normal' | 'travaux' }

export function DateStrip({ days, selected, onSelect }: {
  days: DayEntry[]; selected: string; onSelect: (iso: string) => void
}) {
  const desktop = useIsDesktop()
  // Desktop shows all 7. Mobile shows a window of 4 that keeps the selected day
  // in view rather than always starting at the first date.
  let shown = days
  if (!desktop) {
    const i = Math.max(0, days.findIndex((d) => d.iso === selected))
    const start = Math.min(Math.max(0, i - 1), Math.max(0, days.length - 4))
    shown = days.slice(start, start + 4)
  }
  return (
    <div className="datestrip" role="group" aria-label="Choisir une date">
      {shown.map((d) => (
        <DateChip key={d.iso} day={d.label} price={d.price} severity={d.severity}
          selected={d.iso === selected} onSelect={() => onSelect(d.iso)} />
      ))}
    </div>
  )
}
