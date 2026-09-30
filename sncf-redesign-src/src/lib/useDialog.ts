import { useEffect, useRef } from 'react'

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])'

/* Focus is trapped while the dialog is open, Escape closes it, and focus goes
   back to whatever opened it. Required by section 7 of the brief.

   The dialog itself takes focus on open (it needs tabIndex={-1}), so VoiceOver
   reads its name and description first instead of landing on "Fermer" cold.

   onClose is read through a ref: callers pass a fresh arrow on every render,
   and depending on it re-ran the effect whenever the parent re-rendered, which
   bounced focus to the trigger and back to the top of the dialog. Toggling
   "Suivre ce trajet" did exactly that, so a screen reader user lost their place
   the moment they used the one control in the drawer. */
export function useDialog(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  const restoreTo = useRef<HTMLElement | null>(null)
  const close = useRef(onClose)
  close.current = onClose

  useEffect(() => {
    if (!open) return
    restoreTo.current = document.activeElement as HTMLElement | null

    const node = ref.current
    node?.focus()

    // Everything behind the dialog leaves the accessibility tree, not just the
    // tab order. aria-modal alone is not honoured by every VoiceOver version.
    const root = document.getElementById('root')
    root?.setAttribute('inert', '')

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close.current(); return }
      if (e.key !== 'Tab' || !node) return
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE))
        .filter((el) => el.offsetParent !== null)
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      const at = document.activeElement
      if (e.shiftKey && (at === first || at === node)) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && at === last) { e.preventDefault(); first.focus() }
    }

    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      root?.removeAttribute('inert')
      restoreTo.current?.focus()
    }
  }, [open])

  return ref
}
