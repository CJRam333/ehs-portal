export interface SegmentedOption<T extends string> {
  value: T
  label: string
  testId: string
}

interface SegmentedProps<T extends string> {
  label: string
  options: SegmentedOption<T>[]
  value: T | null
  onChange: (value: T) => void
}

// A compact inline group of choice buttons; exactly one is active at a time.
export function Segmented<T extends string>({ label, options, value, onChange }: SegmentedProps<T>) {
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <div className="segmented" role="group" aria-label={label}>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            data-testid={opt.testId}
            className={'seg' + (value === opt.value ? ' seg-active' : '')}
            aria-pressed={value === opt.value}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
