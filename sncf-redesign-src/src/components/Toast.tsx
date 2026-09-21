import { useEffect, useState } from 'react'

const VISIBLE = 3600
const LEAVE = 260

/* Desktop confirmation for "Suivre ce trajet".
   It disappears on its own after a few seconds: a confirmation should never
   require an interaction to get rid of. It also animates out rather than
   vanishing, so the eye can follow it leaving. role="status" so a screen
   reader announces it politely without stealing focus. */
export function Toast({ message, tone = 'on', onDismiss }: {
  message: string
  tone?: 'on' | 'off'
  onDismiss: () => void
}) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const out = setTimeout(() => setLeaving(true), VISIBLE)
    const gone = setTimeout(onDismiss, VISIBLE + LEAVE)
    return () => { clearTimeout(out); clearTimeout(gone) }
  }, [message, onDismiss])

  return (
    <div
      className={`toast toast--${tone}${leaving ? ' toast--leaving' : ''}`}
      role="status"
      aria-live="polite"
    >
      <span className="toast__dot" aria-hidden="true" />
      <p className="toast__msg">{message}</p>
    </div>
  )
}
