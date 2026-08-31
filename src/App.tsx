import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import StringCalc from './pages/StringCalc'
import CableCalc from './pages/CableCalc'
import InstallConfig from './pages/InstallConfig'
import InstallResult from './pages/InstallResult'
import BaseEstudos from './pages/BaseEstudos'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/string" element={<StringCalc />} />
        <Route path="/cable" element={<CableCalc />} />
        <Route path="/install/config" element={<InstallConfig />} />
        <Route path="/install/result" element={<InstallResult />} />
        <Route path="/base-estudos" element={<BaseEstudos />} />
      </Routes>
    </BrowserRouter>
  )
}
