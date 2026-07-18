import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { IdentityGate } from './pages/IdentityGate'
import { DetailsStep } from './pages/DetailsStep'
import { ChecklistStep } from './pages/ChecklistStep'

function App() {
  return (
    <Routes>
      <Route path="/" element={<IdentityGate />} />
      {/* QR codes may encode /scan; treat it as an alias for the identity gate. */}
      <Route path="/scan" element={<Navigate to="/" replace />} />
      <Route path="/details" element={<DetailsStep />} />
      <Route path="/checklist" element={<ChecklistStep />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
