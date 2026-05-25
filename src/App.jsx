import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Menu } from 'lucide-react'
import './App.css'
import Sidebar from './components/Sidebar'
import TrabajoView from './views/TrabajoView'
import VistaGeneral from './views/VistaGeneral'
import Placeholder from './views/Placeholder'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <BrowserRouter>
      <div className={`app-layout${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
        {/* Overlay móvil */}
        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="app-main">
          {/* Header móvil */}
          <header className="mobile-header">
            <button className="hamburger" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <span className="mobile-header-title">Finanzas</span>
          </header>

          {/* Botón colapsar sidebar en PC */}
          <button className="desktop-toggle" onClick={() => setSidebarCollapsed(c => !c)}>
            <Menu size={18} />
          </button>

          <div className="app-content">
            <Routes>
              <Route path="/trabajo" element={<TrabajoView />} />
              <Route path="/" element={<VistaGeneral moneda="MXN" simbolo="$" />} />
              <Route path="/transacciones" element={<Placeholder titulo="Transacciones" />} />
              <Route path="/programadas" element={<Placeholder titulo="Transacciones programadas" />} />
              <Route path="/cuentas" element={<Placeholder titulo="Cuentas" />} />
              <Route path="/tarjetas" element={<Placeholder titulo="Tarjetas de crédito" />} />
              <Route path="/presupuestos" element={<Placeholder titulo="Presupuestos" />} />
              <Route path="/deudas" element={<Placeholder titulo="Deudas" />} />
              <Route path="/graficos" element={<Placeholder titulo="Gráficos" />} />
              <Route path="/calendario" element={<Placeholder titulo="Calendario" />} />
              <Route path="/preferencias" element={<Placeholder titulo="Preferencias" />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
