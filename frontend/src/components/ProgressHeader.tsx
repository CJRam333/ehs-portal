export type Step = 'identity' | 'details' | 'checklist'

const STEPS: { key: Step; label: string }[] = [
  { key: 'identity', label: 'Identity' },
  { key: 'details', label: 'Details' },
  { key: 'checklist', label: 'Checklist' },
]

// Identity → Details → Checklist, with the current step highlighted.
export function ProgressHeader({ current }: { current: Step }) {
  return (
    <nav className="progress" aria-label="Progress">
      {STEPS.map((step, i) => (
        <span key={step.key} className="progress-part">
          <span
            className={'progress-step' + (step.key === current ? ' progress-current' : '')}
            aria-current={step.key === current ? 'step' : undefined}
          >
            {step.label}
          </span>
          {i < STEPS.length - 1 && <span className="progress-arrow">→</span>}
        </span>
      ))}
    </nav>
  )
}
