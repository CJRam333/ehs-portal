import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  api,
  ApiError,
  errorMessage,
  isNetworkError,
  type ChecklistAnswer,
  type ChecklistTemplateSection,
  type ReportResponse,
} from '../api'
import { useReport } from '../ReportContext'
import { ProgressHeader } from '../components/ProgressHeader'
import { Toast } from '../components/Toast'

// Friendly section headers for the enum codes returned by the template.
const SECTION_TITLES: Record<string, string> = {
  PPE: 'PPE',
  BEHAVIOUR: 'Behaviour',
  TOOLS: 'Tools & Equipment',
  RISK: 'Risk / Violations',
  PROCEDURES: 'Procedures',
}

export function ChecklistStep() {
  const { report } = useReport()
  // No active report → nothing to fill; send them back to identify.
  // Keyed by id so the form re-seeds if the underlying report changes.
  if (!report) return <Navigate to="/" replace />
  return <ChecklistForm key={report.id} report={report} />
}

function ChecklistForm({ report }: { report: ReportResponse }) {
  const navigate = useNavigate()
  const { setReport } = useReport()

  const [sections, setSections] = useState<ChecklistTemplateSection[] | null>(null)
  const [answers, setAnswers] = useState<Record<string, ChecklistAnswer>>({})
  const [loadError, setLoadError] = useState<string | null>(null)

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [netError, setNetError] = useState<string | null>(null)

  // Set once submit succeeds; drives the confirmation screen.
  const [confirmed, setConfirmed] = useState<ReportResponse | null>(null)
  // Set when the backend rejects a submit because it is already submitted.
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)

  // On entry: load the template and the latest report to prefill saved answers.
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [template, fresh] = await Promise.all([
          api.getChecklistTemplate(),
          api.getReport(report.id),
        ])
        if (cancelled) return
        const seeded: Record<string, ChecklistAnswer> = {}
        for (const item of fresh.checklist) seeded[item.itemCode] = item.answer
        setAnswers(seeded)
        setSections(template.sections)
        setReport(fresh)
      } catch (e) {
        if (cancelled) return
        setLoadError(e instanceof ApiError ? e.message : 'Could not load the checklist.')
      }
    }
    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report.id])

  // Flat list of every item code in template order, for building the save payload.
  const codes = useMemo(
    () => (sections ?? []).flatMap((s) => s.items.map((i) => i.code)),
    [sections],
  )

  function setAnswer(code: string, value: 'YES' | 'NO') {
    setAnswers((prev) => ({ ...prev, [code]: prev[code] === value ? null : value }))
  }

  async function saveChecklist(): Promise<ReportResponse> {
    const payload = codes.map((code) => ({ itemCode: code, answer: answers[code] ?? null }))
    const updated = await api.updateChecklist(report.id, payload)
    setReport(updated)
    return updated
  }

  async function handleBack() {
    setBusy(true)
    setError(null)
    setNetError(null)
    try {
      await saveChecklist()
      navigate('/details')
    } catch (e) {
      if (isNetworkError(e)) setNetError(errorMessage(e))
      else setError(errorMessage(e, 'Could not save. Please try again.'))
      setBusy(false)
    }
  }

  async function handleSubmit() {
    setBusy(true)
    setError(null)
    setNetError(null)
    try {
      await saveChecklist()
      const submitted = await api.submit(report.id)
      setReport(submitted)
      setConfirmed(submitted)
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        setAlreadySubmitted(true)
      } else if (isNetworkError(e)) {
        setNetError(errorMessage(e))
      } else {
        setError(errorMessage(e, 'Could not submit. Please try again.'))
      }
      setBusy(false)
    }
  }

  function reportAnother() {
    setReport(null)
    navigate('/')
  }

  if (confirmed) return <Confirmation report={confirmed} onReportAnother={reportAnother} />

  if (alreadySubmitted) {
    return (
      <div className="app">
        <ProgressHeader current="checklist" />
        <div className="banner" data-testid="already-submitted">
          <p className="banner-title">This report has already been submitted.</p>
          <p className="banner-note">Nothing more to do here — you can start a new report.</p>
          <div className="actions">
            <button
              type="button"
              data-testid="report-another"
              className="btn btn-primary"
              onClick={reportAnother}
            >
              Report another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <ProgressHeader current="checklist" />
      <h1>Safety checklist</h1>

      {loadError && <p className="error">{loadError}</p>}
      {!sections && !loadError && <p className="muted">Loading checklist…</p>}

      {sections?.map((section) => (
        <section key={section.section} className="check-section">
          <h2 className="check-section-title">
            {SECTION_TITLES[section.section] ?? section.section}
          </h2>
          <table className="check-table">
            <tbody>
              {section.items.map((item) => {
                const answer = answers[item.code] ?? null
                return (
                  <tr
                    key={item.code}
                    className="check-row"
                    data-testid={`checklist-${item.code}`}
                  >
                    <td className="check-label">{item.label}</td>
                    <td className="check-toggles">
                      <div className="toggle-group" role="group" aria-label={item.label}>
                        <button
                          type="button"
                          data-testid={`checklist-${item.code}-yes`}
                          className={'toggle toggle-yes' + (answer === 'YES' ? ' toggle-active' : '')}
                          aria-pressed={answer === 'YES'}
                          onClick={() => setAnswer(item.code, 'YES')}
                        >
                          YES
                        </button>
                        <button
                          type="button"
                          data-testid={`checklist-${item.code}-no`}
                          className={'toggle toggle-no' + (answer === 'NO' ? ' toggle-active' : '')}
                          aria-pressed={answer === 'NO'}
                          onClick={() => setAnswer(item.code, 'NO')}
                        >
                          NO
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>
      ))}

      {error && <p className="error">{error}</p>}

      <div className="actions">
        <button
          type="button"
          data-testid="checklist-back"
          className="btn btn-secondary"
          disabled={busy || !sections}
          onClick={handleBack}
        >
          Back
        </button>
        <button
          type="button"
          data-testid="checklist-submit"
          className="btn btn-primary"
          disabled={busy || !sections}
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>

      <Toast message={netError} variant="error" onDone={() => setNetError(null)} />
    </div>
  )
}

function Confirmation({
  report,
  onReportAnother,
}: {
  report: ReportResponse
  onReportAnother: () => void
}) {
  return (
    <div className="app">
      <div className="confirm" data-testid="confirm-screen">
        <div className="confirm-check" aria-hidden="true">
          ✓
        </div>
        <h1 className="confirm-title">Report submitted</h1>
        <p className="confirm-lead">Thank you. Your safety report has been recorded.</p>
        <p className="confirm-ref">
          Reference: <strong data-testid="confirm-report-id">#{report.id}</strong>
        </p>
        <div className="actions">
          <button
            type="button"
            data-testid="report-another"
            className="btn btn-primary"
            onClick={onReportAnother}
          >
            Report another
          </button>
        </div>
      </div>
    </div>
  )
}
