/* control/toggle, node 215:213. 46x26, knob 20.
   A real checkbox with role="switch" so it is operable and announced. */
type Props = { checked: boolean; onChange: (v: boolean) => void; label: string; id: string }

export function Toggle({ checked, onChange, label, id }: Props) {
  return (
    <span className="toggle">
      <input
        id={id}
        type="checkbox"
        role="switch"
        className="toggle__input"
        checked={checked}
        aria-label={label}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="toggle__track" aria-hidden="true"><span className="toggle__knob" /></span>
    </span>
  )
}
