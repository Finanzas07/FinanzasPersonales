import { NavLink } from 'react-router-dom'
import {
  Car, LayoutDashboard, ArrowLeftRight, Clock, Landmark, CreditCard,
  PiggyBank, TrendingDown, BarChart2, CalendarDays, Settings, X,
} from 'lucide-react'
import './Sidebar.css'

const NAV_ITEMS = [
  { to: '/trabajo', label: 'Trabajo', icon: Car },
  { to: '/', label: 'Vista General', icon: LayoutDashboard },
  { to: '/transacciones', label: 'Transacciones', icon: ArrowLeftRight },
  { to: '/programadas', label: 'Trans. programadas', icon: Clock },
  { to: '/cuentas', label: 'Cuentas', icon: Landmark },
  { to: '/tarjetas', label: 'Tarjetas de crédito', icon: CreditCard },
  { to: '/presupuestos', label: 'Presupuestos', icon: PiggyBank },
  { to: '/deudas', label: 'Deudas', icon: TrendingDown },
  { to: '/graficos', label: 'Gráficos', icon: BarChart2 },
  { to: '/calendario', label: 'Calendario', icon: CalendarDays },
  { to: '/preferencias', label: 'Preferencias', icon: Settings },
]

export default function Sidebar({ isOpen, onClose }) {
  return (
    <aside className={`sidebar${isOpen ? ' sidebar-open' : ''}`}>
      <div className="sidebar-brand">
        <span className="sidebar-brand-icon">💰</span>
        <span className="sidebar-brand-name">Finanzas</span>
        <button className="sidebar-close" onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
