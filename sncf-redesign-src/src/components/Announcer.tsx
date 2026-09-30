import { useCallback, useState } from 'react'
import { createPortal } from 'react-dom'

/* A live region that is in the DOM before anything is said into it.
   VoiceOver ignores a role="status" node that arrives already holding its
   text, which is how the toast was built, so confirmations were silent.

   Portalled to <body> so it keeps talking while the drawer has made #root
   inert. The alternating no-break space makes a repeated message a real
   change, so saying the same thing twice is still heard twice. */
export function useAnnouncer() {
  const [msg, setMsg] = useState({ text: '', n: 0 })
  const say = useCallback((text: string) => setMsg((m) => ({ text, n: m.n + 1 })), [])
  const region = createPortal(
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {msg.text}{msg.n % 2 ? ' ' : ''}
    </div>,
    document.body,
  )
  return { say, region }
}
