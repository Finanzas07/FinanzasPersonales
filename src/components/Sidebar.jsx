import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Car, LayoutDashboard, ArrowLeftRight, Clock, Landmark, CreditCard,
  PiggyBank, TrendingDown, BarChart2, CalendarDays, Settings, X, ChevronDown,
} from 'lucide-react'
import './Sidebar.css'

const NAV_ITEMS = [
  {
    label: 'Trabajo',
    icon: Car,
    base: '/trabajo',
    children: [
      { to: '/trabajo/evento', label: 'Evento' },
      { to: '/trabajo/meta', label: 'Meta' },
    ],
  },
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
  const location = useLocation()

  const [expanded, setExpanded] = useState(() =>
    location.pathname.startsWith('/trabajo')
  )

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
        {NAV_ITEMS.map((item) => {
          if (item.children) {
            const isParentActive = location.pathname.startsWith(item.base)
            return (
              <div key={item.base}>
                <button
                  className={`sidebar-link sidebar-link-parent ${isParentActive ? 'active' : ''}`}
                  onClick={() => setExpanded(e => !e)}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                  <ChevronDown
                    size={14}
                    className={`sidebar-chevron ${expanded ? 'rotado' : ''}`}
                  />
                </button>

                {expanded && (
                  <div className="sidebar-children">
                    {item.children.map(child => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        className={({ isActive }) => `sidebar-child-link${isActive ? ' active' : ''}`}
                        onClick={onClose}
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              onClick={onClose}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
