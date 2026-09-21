/* date/day-card, node 209:212.
   Only the travaux state is carried. A normal day shows just the day and the
   price: there is no "Normal" label and no grey dot, so the strip reads as
   "these three are disrupted" rather than as a row of status badges. */
type Props = {
  day: string          // "Mer 16"
  price: string        // "19 €"
  severity?: 'normal' | 'travaux'
  selected?: boolean
  onSelect?: () => void
}

export function DateChip({ day, price, severity = 'normal', selected = false, onSelect }: Props) {
  const travaux = severity === 'travaux'
  return (
    <button
      type="button"
      className={`daychip${selected ? ' daychip--selected' : ''} daychip--${severity}`}
      aria-pressed={selected}
      aria-label={`${day}, à partir de ${price}${travaux ? ', travaux' : ''}`}
      onClick={onSelect}
    >
      <span className="daychip__day">{day}</span>
      <span className="daychip__price">{price}</span>
      {travaux && (
        <span className="daychip__status">
          <span className="daychip__dot" aria-hidden="true" />
          Travaux
        </span>
      )}
    </button>
  )
}
