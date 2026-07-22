import { TapButton } from './motion'

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
          <TapButton
            key={opt.value}
            type="button"
            data-testid={opt.testId}
            className={'seg' + (value === opt.value ? ' seg-active' : '')}
            aria-pressed={value === opt.value}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </TapButton>
        ))}
      </div>
    </div>
  )
}

interface MultiSegmentedProps<T extends string> {
  label: string
  options: SegmentedOption<T>[]
  values: T[]
  max: number
  onToggle: (value: T) => void
}

// Like Segmented but allows up to `max` active values. Once the cap is reached
// the remaining options are disabled so a further selection can't be made.
export function MultiSegmented<T extends string>({
  label,
  options,
  values,
  max,
  onToggle,
}: MultiSegmentedProps<T>) {
  const atCap = values.length >= max
  return (
    <div className="field">
      <span className="field-label">
        {label}
        <span className="field-hint"> — pick up to {max}</span>
      </span>
      <div className="segmented" role="group" aria-label={label}>
        {options.map((opt) => {
          const active = values.includes(opt.value)
          const disabled = !active && atCap
          return (
            <TapButton
              key={opt.value}
              type="button"
              data-testid={opt.testId}
              className={'seg' + (active ? ' seg-active' : '')}
              aria-pressed={active}
              disabled={disabled}
              onClick={() => onToggle(opt.value)}
            >
              {opt.label}
            </TapButton>
          )
        })}
      </div>
      {atCap && <p className="field-note">Maximum {max} selected.</p>}
    </div>
  )
}
