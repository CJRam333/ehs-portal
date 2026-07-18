// Typed API client for the EHS portal backend. Field shapes mirror the Spring
// DTOs (IdentifyRequest/Response, CreateReportRequest, DetailsRequest,
// ReportResponse). Requests go to /api/* and Vite proxies them to :8080.

export type ReportType =
  | 'NEAR_MISS'
  | 'UNSAFE_ACT'
  | 'UNSAFE_CONDITION'
  | 'FIRE_INCIDENT'
  | 'PERMIT_TO_WORK'
  | 'BEHAVIOUR_BASED'
  | 'SAFETY_VIOLATION'

export type Shift = 'A' | 'B' | 'C' | 'G'

export type ReporterCategory = 'STAFF' | 'CONTRACTOR' | 'OTHER' | 'VISITOR'

export type Severity = 'HIGH' | 'MEDIUM' | 'LOW'

export type ReportStatus = 'DRAFT' | 'SUBMITTED'

export type ChecklistAnswer = 'YES' | 'NO' | null

export interface ChecklistItemResponse {
  section: string
  itemCode: string
  itemLabel: string
  answer: ChecklistAnswer
}

// GET /api/checklist-template — canonical items grouped by section, in order.
export interface ChecklistTemplateItem {
  code: string
  label: string
}

export interface ChecklistTemplateSection {
  section: string
  items: ChecklistTemplateItem[]
}

export interface ChecklistTemplateResponse {
  sections: ChecklistTemplateSection[]
}

// One element of the PUT /api/reports/{id}/checklist body.
export interface ChecklistAnswerRequest {
  itemCode: string
  answer: ChecklistAnswer
}

export interface ReportResponse {
  id: number
  employeeId: string
  employeeName: string
  designation: string
  reportType: ReportType | null
  shift: Shift | null
  reporterCategory: ReporterCategory | null
  severity: Severity | null
  location: string | null
  eventDate: string | null // YYYY-MM-DD
  eventTime: string | null // HH:MM[:SS]
  reportDescription: string | null
  correctiveAction: string | null
  hodComments: string | null
  reporterName: string | null
  status: ReportStatus
  createdAt: string
  updatedAt: string
  checklist: ChecklistItemResponse[]
}

export interface IdentifyRequest {
  name: string
  employeeId: string
  designation: string
}

export interface IdentifyResponse {
  resume: boolean
  report?: ReportResponse
  mismatchWarning?: boolean
}

export interface CreateReportRequest {
  name: string
  employeeId: string
  designation: string
}

// All fields optional: the same payload backs both "Save" (partial) and "Next".
export interface DetailsRequest {
  reportType?: ReportType | null
  shift?: Shift | null
  reporterCategory?: ReporterCategory | null
  severity?: Severity | null
  location?: string | null
  eventDate?: string | null
  eventTime?: string | null
  reportDescription?: string | null
  correctiveAction?: string | null
  hodComments?: string | null
  reporterName?: string | null
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
  // status 0 is our sentinel for "the request never reached the server"
  // (offline, DNS, CORS, connection refused) — surfaced as a toast, not inline.
  get isNetwork(): boolean {
    return this.status === 0
  }
}

// True for the "request could not be sent / server unreachable" case, which we
// present as a transient toast rather than an inline field error.
export function isNetworkError(e: unknown): boolean {
  return e instanceof ApiError && e.isNetwork
}

// Consistent user-facing message for any thrown value.
export function errorMessage(e: unknown, fallback = 'Something went wrong. Please try again.'): string {
  return e instanceof ApiError ? e.message : fallback
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`/api${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    })
  } catch {
    // fetch rejects (TypeError) only when the request never completed.
    throw new ApiError(0, 'Network error — check your connection and try again.')
  }
  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`
    try {
      const body = await res.json()
      if (body && typeof body.message === 'string') message = body.message
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, message)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export const api = {
  identify(body: IdentifyRequest): Promise<IdentifyResponse> {
    return request('/identify', { method: 'POST', body: JSON.stringify(body) })
  },
  createReport(body: CreateReportRequest): Promise<ReportResponse> {
    return request('/reports', { method: 'POST', body: JSON.stringify(body) })
  },
  updateDetails(id: number, body: DetailsRequest): Promise<ReportResponse> {
    return request(`/reports/${id}/details`, { method: 'PUT', body: JSON.stringify(body) })
  },
  getReport(id: number): Promise<ReportResponse> {
    return request(`/reports/${id}`)
  },
  getChecklistTemplate(): Promise<ChecklistTemplateResponse> {
    return request('/checklist-template')
  },
  updateChecklist(id: number, answers: ChecklistAnswerRequest[]): Promise<ReportResponse> {
    return request(`/reports/${id}/checklist`, { method: 'PUT', body: JSON.stringify(answers) })
  },
  submit(id: number): Promise<ReportResponse> {
    return request(`/reports/${id}/submit`, { method: 'POST' })
  },
}
