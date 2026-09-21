import { Toggle } from './Toggle'

/* control/follow-route, node 612:673.
   Sits inside both sheet types at both breakpoints, above the dismiss action.
   This is the opt-in that turns a one-off disruption into proactive comms. */
type Props = {
  checked: boolean
  onChange: (v: boolean) => void
  id?: string
  /* "si les travaux changent" is wrong on a delay and wrong again on a clean
     journey, so the drawer says what it is actually watching. */
  sub?: string
}

export function FollowRoute({
  checked, onChange, id = 'follow-route',
  sub = 'Être prévenu si les travaux changent',
}: Props) {
  return (
    <div className="follow">
      <span className="follow__text">
        <label htmlFor={id} className="follow__title">Suivre ce trajet</label>
        <span className="follow__sub">{sub}</span>
      </span>
      <Toggle id={id} checked={checked} onChange={onChange} label="Suivre ce trajet" />
    </div>
  )
}
