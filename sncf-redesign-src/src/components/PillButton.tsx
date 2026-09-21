/* control/button-pill, node 215:216. p16/28, ExtraBold 16 on accent/primary. */
type Props = {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
  full?: boolean
}

export function PillButton({ children, onClick, variant = 'primary', full = true }: Props) {
  return (
    <button
      type="button"
      className={`pill pill--${variant}${full ? ' pill--full' : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
