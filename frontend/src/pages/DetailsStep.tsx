import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  api,
  errorMessage,
  isNetworkError,
  type DetailsRequest,
  type ReporterCategory,
  type ReportType,
  type Severity,
  type Shift,
} from '../api'
import { useReport } from '../ReportContext'
import type { ReportResponse } from '../api'
import { ProgressHeader } from '../components/ProgressHeader'
import { Segmented, MultiSegmented, type SegmentedOption } from '../components/Segmented'
import { Toast } from '../components/Toast'
import { PageTransition, Reveal, TapButton } from '../components/motion'

const MAX_TYPES = 3

const REPORT_TYPES: SegmentedOption<ReportType>[] = [
  { value: 'NEAR_MISS', label: 'Near miss', testId: 'report-type-NEAR_MISS' },
  { value: 'UNSAFE_ACT', label: 'Unsafe act', testId: 'report-type-UNSAFE_ACT' },
  { value: 'UNSAFE_CONDITION', label: 'Unsafe condition', testId: 'report-type-UNSAFE_CONDITION' },
  { value: 'FIRE_INCIDENT', label: 'Fire incident', testId: 'report-type-FIRE_INCIDENT' },
  { value: 'PERMIT_TO_WORK', label: 'Permit to work', testId: 'report-type-PERMIT_TO_WORK' },
  { value: 'BEHAVIOUR_BASED', label: 'Behaviour based', testId: 'report-type-BEHAVIOUR_BASED' },
  { value: 'SAFETY_VIOLATION', label: 'Safety violation', testId: 'report-type-SAFETY_VIOLATION' },
]

const SHIFTS: SegmentedOption<Shift>[] = (['A', 'B', 'C', 'G'] as Shift[]).map((s) => ({
  value: s,
  label: s,
  testId: `shift-${s}`,
}))

const CATEGORIES: SegmentedOption<ReporterCategory>[] = [
  { value: 'STAFF', label: 'Staff', testId: 'category-STAFF' },
  { value: 'CONTRACTOR', label: 'Contractor', testId: 'category-CONTRACTOR' },
  { value: 'OTHER', label: 'Other', testId: 'category-OTHER' },
  { value: 'VISITOR', label: 'Visitor', testId: 'category-VISITOR' },
]

const SEVERITIES: SegmentedOption<Severity>[] = [
  { value: 'HIGH', label: 'High', testId: 'severity-HIGH' },
  { value: 'MEDIUM', label: 'Medium', testId: 'severity-MEDIUM' },
  { value: 'LOW', label: 'Low', testId: 'severity-LOW' },
]

// Native time inputs want HH:MM; the backend may return HH:MM:SS.
function toTimeInput(v: string | null): string {
  return v ? v.slice(0, 5) : ''
}

export function DetailsStep() {
  const { report } = useReport()
  // Guard: without an active report there is nothing to edit — go identify.
  // Keyed by id so the form remounts (and re-seeds state) if the report changes.
  if (!report) return <Navigate to="/" replace />
  return <DetailsForm key={report.id} report={report} />
}

function DetailsForm({ report }: { report: ReportResponse }) {
  const navigate = useNavigate()
  const { setReport } = useReport()

  const [reportTypes, setReportTypes] = useState<ReportType[]>(report.reportTypes ?? [])
  const [shift, setShift] = useState<Shift | null>(report.shift)
  const [category, setCategory] = useState<ReporterCategory | null>(report.reporterCategory)
  const [severity, setSeverity] = useState<Severity | null>(report.severity)
  const [eventDate, setEventDate] = useState(report.eventDate ?? '')
  const [eventTime, setEventTime] = useState(toTimeInput(report.eventTime))
  const [description, setDescription] = useState(report.reportDescription ?? '')
  const [corrective, setCorrective] = useState(report.correctiveAction ?? '')

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [descriptionError, setDescriptionError] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [netError, setNetError] = useState<string | null>(null)

  function toggleType(value: ReportType) {
    setReportTypes((prev) => {
      if (prev.includes(value)) return prev.filter((v) => v !== value)
      if (prev.length >= MAX_TYPES) return prev // cap reached — ignore
      return [...prev, value]
    })
  }

  function buildPayload(): DetailsRequest {
    return {
      reportTypes,
      shift,
      reporterCategory: category,
      severity,
      eventDate: eventDate || null,
      eventTime: eventTime || null,
      reportDescription: description.trim() || null,
      correctiveAction: corrective.trim() || null,
    }
  }

  // Description is mandatory: block Save/Next and surface an inline error.
  function requireDescription(): boolean {
    if (!description.trim()) {
      setDescriptionError(true)
      return false
    }
    setDescriptionError(false)
    return true
  }

  async function persist(): Promise<boolean> {
    setBusy(true)
    setError(null)
    setNetError(null)
    try {
      const updated = await api.updateDetails(report.id, buildPayload())
      setReport(updated)
      return true
    } catch (e) {
      // Server rejected the request → inline; couldn't reach it → toast.
      if (isNetworkError(e)) setNetError(errorMessage(e))
      else setError(errorMessage(e, 'Could not save. Please try again.'))
      return false
    } finally {
      setBusy(false)
    }
  }

  async function handleSave() {
    if (!requireDescription()) return
    if (await persist()) setToast('Saved')
  }

  async function handleNext() {
    if (!requireDescription()) return
    if (await persist()) navigate('/checklist')
  }

  return (
    <PageTransition>
      <ProgressHeader current="details" />
      <h1>Report details</h1>

      <div className="form">
        <Reveal>
          <MultiSegmented
            label="Report type"
            options={REPORT_TYPES}
            values={reportTypes}
            max={MAX_TYPES}
            onToggle={toggleType}
          />
        </Reveal>
        <Reveal>
          <Segmented label="Shift" options={SHIFTS} value={shift} onChange={setShift} />
        </Reveal>
        <Reveal>
          <Segmented label="Reporter category" options={CATEGORIES} value={category} onChange={setCategory} />
        </Reveal>
        <Reveal>
          <Segmented label="Severity" options={SEVERITIES} value={severity} onChange={setSeverity} />
        </Reveal>

        <Reveal className="row">
          <label className="field">
            <span className="field-label">Date</span>
            <input
              type="date"
              data-testid="details-date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
          </label>
          <label className="field">
            <span className="field-label">Time</span>
            <input
              type="time"
              data-testid="details-time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
            />
          </label>
        </Reveal>

        <Reveal className="field">
          <label className="field">
            <span className="field-label">Report description *</span>
            <textarea
              data-testid="details-description"
              rows={3}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                if (descriptionError && e.target.value.trim()) setDescriptionError(false)
              }}
              aria-invalid={descriptionError}
            />
          </label>
          {descriptionError && (
            <p className="error" data-testid="details-description-error">
              Report description is required.
            </p>
          )}
        </Reveal>

        <Reveal className="field">
          <label className="field">
            <span className="field-label">Corrective action / suggestion</span>
            <textarea
              data-testid="details-corrective"
              rows={3}
              value={corrective}
              onChange={(e) => setCorrective(e.target.value)}
            />
          </label>
        </Reveal>

        {error && <p className="error">{error}</p>}

        <div className="actions">
          <TapButton
            type="button"
            data-testid="details-save"
            className="btn btn-secondary"
            disabled={busy}
            onClick={handleSave}
          >
            Save
          </TapButton>
          <TapButton
            type="button"
            data-testid="details-next"
            className="btn btn-primary"
            disabled={busy}
            onClick={handleNext}
          >
            Next
          </TapButton>
        </div>
      </div>

      <Toast message={toast} onDone={() => setToast(null)} />
      <Toast message={netError} variant="error" onDone={() => setNetError(null)} />
    </PageTransition>
  )
}
