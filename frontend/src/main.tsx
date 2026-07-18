import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { ReportProvider } from './ReportContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ReportProvider>
        <App />
      </ReportProvider>
    </BrowserRouter>
  </StrictMode>,
)
