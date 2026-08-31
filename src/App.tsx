import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import StringCalc from './pages/StringCalc'
import CableCalc from './pages/CableCalc'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/string" element={<StringCalc />} />
        <Route path="/cable" element={<CableCalc />} />
      </Routes>
    </BrowserRouter>
  )
}
