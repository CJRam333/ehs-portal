import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  api,
  errorMessage,
  isNetworkError,
  type NonEmployeeType,
  type PersonKind,
  type ReportResponse,
} from '../api'
import { useReport } from '../ReportContext'
import { ProgressHeader } from '../components/ProgressHeader'
import { Toast } from '../components/Toast'
import { PageTransition, Reveal, TapButton } from '../components/motion'
import { VantaBackground } from '../components/VantaBackground'

// Exact location options for the identity dropdown (phase 6 change 1). The
// source list had "Guntur" twice; it appears here once.
const LOCATIONS = [
  'Kandlakoya',
  'Kompally',
  'Kothur',
  'Kalakal',
  'Shanbhag Nagar',
  'Bargah',
  'Chandole',
  'Edlapadu',
  'Guntur',
  'Veeravalli',
]

const NON_EMP_TYPES: { value: NonEmployeeType; label: string }[] = [
  { value: 'CONTRACTOR', label: 'Contractor' },
  { value: 'VISITOR', label: 'Visitor' },
  { value: 'OTHER', label: 'Other' },
]

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

  const [personKind, setPersonKind] = useState<PersonKind>('EMPLOYEE')
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')

  // Employee-only
  const [employeeId, setEmployeeId] = useState('')
  const [designation, setDesignation] = useState('')

  // Non-employee-only
  const [nonEmpType, setNonEmpType] = useState<NonEmployeeType | null>(null)
  const [otherDesc, setOtherDesc] = useState('')

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [netError, setNetError] = useState<string | null>(null)

  // Employee-only: when identify reports an existing draft we pause to let the
  // user choose. Non-employees always start fresh, so this stays null for them.
  const [draft, setDraft] = useState<ReportResponse | null>(null)
  const [mismatch, setMismatch] = useState(false)

  const isEmployee = personKind === 'EMPLOYEE'

  const identityComplete = isEmployee
    ? Boolean(employeeId.trim() && designation.trim())
    : Boolean(nonEmpType && (nonEmpType !== 'OTHER' || otherDesc.trim()))

  const canContinue = Boolean(name.trim()) && Boolean(location) && identityComplete && !busy

  function choosePersonKind(kind: PersonKind) {
    setPersonKind(kind)
    setDraft(null)
    setMismatch(false)
    setError(null)
  }

  async function createAndGo() {
    const created = await api.createReport({
      personKind,
      name: name.trim(),
      location,
      employeeId: isEmployee ? employeeId.trim() : null,
      designation: isEmployee ? designation.trim() : null,
      nonEmployeeType: isEmployee ? null : nonEmpType,
      nonEmployeeOtherDesc: !isEmployee && nonEmpType === 'OTHER' ? otherDesc.trim() : null,
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
      // Non-employees never resume — go straight to a fresh report.
      if (!isEmployee) {
        await createAndGo()
        return
      }
      const res = await api.identify({
        personKind: 'EMPLOYEE',
        name: name.trim(),
        employeeId: employeeId.trim(),
        designation: designation.trim(),
        location,
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

  function handleResume() {
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
    <PageTransition>
      <VantaBackground />
      <ProgressHeader current="identity" />
      <h1>Identify yourself</h1>

      <div className="form">
        <Reveal className="field">
          <span className="field-label">Are you an employee?</span>
          <div className="segmented" role="group" aria-label="Employee or non-employee">
            <TapButton
              type="button"
              data-testid="person-kind-employee"
              className={'seg' + (isEmployee ? ' seg-active' : '')}
              aria-pressed={isEmployee}
              onClick={() => choosePersonKind('EMPLOYEE')}
            >
              Employee
            </TapButton>
            <TapButton
              type="button"
              data-testid="person-kind-non-employee"
              className={'seg' + (!isEmployee ? ' seg-active' : '')}
              aria-pressed={!isEmployee}
              onClick={() => choosePersonKind('NON_EMPLOYEE')}
            >
              Non-employee
            </TapButton>
          </div>
        </Reveal>

        <Reveal className="field">
          <label className="field">
            <span className="field-label">Name</span>
            <input
              data-testid="identity-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </label>
        </Reveal>

        {isEmployee ? (
          <>
            <Reveal className="field">
              <label className="field">
                <span className="field-label">Employee ID</span>
                <input
                  data-testid="identity-empid"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                />
              </label>
            </Reveal>
            <Reveal className="field">
              <label className="field">
                <span className="field-label">Designation</span>
                <input
                  data-testid="identity-designation"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                />
              </label>
            </Reveal>
          </>
        ) : (
          <>
            <Reveal className="field">
              <span className="field-label">Type</span>
              <div className="segmented" role="group" aria-label="Non-employee type">
                {NON_EMP_TYPES.map((t) => (
                  <TapButton
                    key={t.value}
                    type="button"
                    data-testid={`nonemp-type-${t.value}`}
                    className={'seg' + (nonEmpType === t.value ? ' seg-active' : '')}
                    aria-pressed={nonEmpType === t.value}
                    onClick={() => setNonEmpType(t.value)}
                  >
                    {t.label}
                  </TapButton>
                ))}
              </div>
            </Reveal>
            {nonEmpType === 'OTHER' && (
              <Reveal className="field">
                <label className="field">
                  <span className="field-label">Please describe</span>
                  <input
                    data-testid="nonemp-other-desc"
                    value={otherDesc}
                    onChange={(e) => setOtherDesc(e.target.value)}
                  />
                </label>
              </Reveal>
            )}
          </>
        )}

        <Reveal className="field">
          <label className="field">
            <span className="field-label">Location</span>
            <select
              data-testid="identity-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option value="">Select location…</option>
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </label>
        </Reveal>

        {error && <p className="error">{error}</p>}

        {!draft && (
          <div className="actions">
            <TapButton
              type="button"
              data-testid="identity-continue"
              className="btn btn-primary"
              disabled={!canContinue}
              onClick={handleContinue}
            >
              {busy ? 'Please wait…' : 'Continue'}
            </TapButton>
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
            <TapButton
              type="button"
              data-testid="resume-continue"
              className="btn btn-primary"
              disabled={busy}
              onClick={handleResume}
            >
              Resume
            </TapButton>
            <TapButton
              type="button"
              data-testid="resume-start-new"
              className="btn btn-secondary"
              disabled={busy}
              onClick={handleStartNew}
            >
              Start new
            </TapButton>
          </div>
        </div>
      )}

      <Toast message={netError} variant="error" onDone={() => setNetError(null)} />
    </PageTransition>
  )
}
