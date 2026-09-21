import { Icon, type IconName } from './Icon'

/* search/mode-tabs, node 338:2552. Landing, desktop only: the autocomplete
   drops the row rather than carrying it over the scrim.

   Deliberately not interactive. The demo runs one scripted scenario, so a tab
   that moved the selection would change nothing underneath it. Rendering the
   row as marked-up state rather than as four buttons is the honest version:
   nothing here invites a click it cannot answer. */
const TABS: { label: string; icon: IconName }[] = [
  { label: 'Tout rechercher', icon: 'loupe' },
  { label: 'Trains', icon: 'train' },
  { label: 'Bus et covoiturage', icon: 'bus' },
  { label: 'Itinéraires urbains', icon: 'route' },
]

export function SearchTabs() {
  return (
    <div className="segmented" role="group" aria-label="Type de recherche">
      {TABS.map((t, i) => (
        <span
          key={t.label}
          className={`segmented__tab${i === 0 ? ' segmented__tab--on' : ''}`}
          aria-current={i === 0 ? 'true' : undefined}
        >
          <Icon name={t.icon} size={22} />
          {t.label}
        </span>
      ))}
    </div>
  )
}
