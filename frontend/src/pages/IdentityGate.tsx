import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, errorMessage, isNetworkError, type ReportResponse } from '../api'
import { useReport } from '../ReportContext'
import { ProgressHeader } from '../components/ProgressHeader'
import { Toast } from '../components/Toast'

function formatWhen(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function IdentityGate() {
  const navigate = useNavigate()
  const { setReport } = useReport()

  const [name, setName] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [designation, setDesignation] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [netError, setNetError] = useState<string | null>(null)

  // When identify reports an existing draft we pause here to let the user choose.
  const [draft, setDraft] = useState<ReportResponse | null>(null)
  const [mismatch, setMismatch] = useState(false)

  const canContinue = name.trim() && employeeId.trim() && designation.trim() && !busy

  async function createAndGo() {
    const created = await api.createReport({
      name: name.trim(),
      employeeId: employeeId.trim(),
      designation: designation.trim(),
    })
    setReport(created)
    navigate('/details')
  }

  function reportError(e: unknown) {
    if (isNetworkError(e)) setNetError(errorMessage(e))
    else setError(errorMessage(e))
  }

  async function handleContinue() {
    setBusy(true)
    setError(null)
    setNetError(null)
    try {
      const res = await api.identify({
        name: name.trim(),
        employeeId: employeeId.trim(),
        designation: designation.trim(),
      })
      if (res.resume && res.report) {
        setDraft(res.report)
        setMismatch(Boolean(res.mismatchWarning))
      } else {
        await createAndGo()
      }
    } catch (e) {
      reportError(e)
    } finally {
      setBusy(false)
    }
  }

  async function handleResume() {
    if (!draft) return
    setReport(draft)
    navigate('/details')
  }

  async function handleStartNew() {
    setBusy(true)
    setError(null)
    setNetError(null)
    try {
      await createAndGo()
    } catch (e) {
      reportError(e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app">
      <ProgressHeader current="identity" />
      <h1>Identify yourself</h1>

      <div className="form">
        <label className="field">
          <span className="field-label">Name</span>
          <input
            data-testid="identity-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </label>
        <label className="field">
          <span className="field-label">Employee ID</span>
          <input
            data-testid="identity-empid"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          />
        </label>
        <label className="field">
          <span className="field-label">Designation</span>
          <input
            data-testid="identity-designation"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
          />
        </label>

        {error && <p className="error">{error}</p>}

        {!draft && (
          <div className="actions">
            <button
              type="button"
              data-testid="identity-continue"
              className="btn btn-primary"
              disabled={!canContinue}
              onClick={handleContinue}
            >
              {busy ? 'Please wait…' : 'Continue'}
            </button>
          </div>
        )}
      </div>

      {draft && (
        <div className="banner" data-testid="resume-banner">
          <p className="banner-title">
            We found a saved report from {formatWhen(draft.updatedAt)}. Resume where you left off?
          </p>
          {mismatch && (
            <p className="banner-warn" data-testid="resume-mismatch-warning">
              The name/designation you entered don’t closely match the saved record, but you can
              continue.
            </p>
          )}
          <div className="actions">
            <button
              type="button"
              data-testid="resume-continue"
              className="btn btn-primary"
              disabled={busy}
              onClick={handleResume}
            >
              Resume
            </button>
            <button
              type="button"
              data-testid="resume-start-new"
              className="btn btn-secondary"
              disabled={busy}
              onClick={handleStartNew}
            >
              Start new
            </button>
          </div>
        </div>
      )}

      <Toast message={netError} variant="error" onDone={() => setNetError(null)} />
    </div>
  )
}
