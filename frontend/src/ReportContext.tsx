import { createContext, useContext, useState, type ReactNode } from 'react'
import type { ReportResponse } from './api'

interface ReportContextValue {
  report: ReportResponse | null
  setReport: (report: ReportResponse | null) => void
}

const ReportContext = createContext<ReportContextValue | undefined>(undefined)

export function ReportProvider({ children }: { children: ReactNode }) {
  const [report, setReport] = useState<ReportResponse | null>(null)
  return (
    <ReportContext.Provider value={{ report, setReport }}>
      {children}
    </ReportContext.Provider>
  )
}

export function useReport(): ReportContextValue {
  const ctx = useContext(ReportContext)
  if (!ctx) throw new Error('useReport must be used within a ReportProvider')
  return ctx
}
