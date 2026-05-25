import { useState } from 'react'
import './TrabajoView.css'

const META_ACTIVA_KEY    = 'trabajo_meta_activa'
const META_HISTORIAL_KEY = 'trabajo_meta_historial'
const GASOLINA_KEY       = 'trabajo_gasolina_hoy'

const cargar = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}

const esHoy = (ts) => {
  const hoy = new Date()
  const d   = new Date(ts)
  return d.getFullYear() === hoy.getFullYear() &&
         d.getMonth()    === hoy.getMonth()    &&
         d.getDate()     === hoy.getDate()
}

export default function TrabajoGanancias() {
  const fechaHoy = new Date().toDateString()

  const [gasolinaStr, setGasolinaStr] = useState(() => {
    const guardado = cargar(GASOLINA_KEY, null)
    return guardado?.fecha === fechaHoy ? String(guardado.monto) : ''
  })

  // Leer siempre desde localStorage para que refleje cambios al navegar
  const metaActiva    = cargar(META_ACTIVA_KEY, null)
  const metaHistorial = cargar(META_HISTORIAL_KEY, [])

  const viajesActivos    = metaActiva?.registros?.length ?? 0
  const totalActivo      = metaActiva?.registros?.reduce((s, r) => s + r.monto, 0) ?? 0

  const sesionesHoy      = metaHistorial.filter(m => esHoy(m.fecha))
  const viajesHistorial  = sesionesHoy.reduce((s, m) => s + m.viajesRealizados, 0)
  const totalHistorial   = sesionesHoy.reduce((s, m) => s + m.totalGanado, 0)

  const totalHoy  = totalActivo + totalHistorial
  const viajesHoy = viajesActivos + viajesHistorial

  const estimadoGasolina = totalHoy / 3
  const gasolinaReal     = parseFloat(gasolinaStr) || 0
  const diferencia       = estimadoGasolina - gasolinaReal
  const gananciaNeta     = totalHoy - gasolinaReal

  const handleGasolina = (val) => {
    setGasolinaStr(val)
    localStorage.setItem(GASOLINA_KEY, JSON.stringify({ fecha: fechaHoy, monto: parseFloat(val) || 0 }))
  }

  const fmt = (n) => n.toLocaleString('es-MX', { minimumFractionDigits: 2 })

  return (
    <div className="trabajo-wrap">

      {/* Total del día */}
      <div className="gan-card">
        <p className="gan-card-titulo">Ganancias del día</p>
        <div className="gan-total-valor">${fmt(totalHoy)}</div>
        <div className="gan-total-sub">
          {viajesHoy} viaje{viajesHoy !== 1 ? 's' : ''}
          {metaActiva && <span className="gan-badge-activo">en curso</span>}
        </div>
      </div>

      {/* Gasolina */}
      <div className="gan-card">
        <p className="gan-card-titulo">Gasolina</p>

        <div className="gan-fila">
          <span className="gan-fila-label">Estimado (1/3 de ganancias)</span>
          <span className="gan-fila-valor">${fmt(estimadoGasolina)}</span>
        </div>

        <div className="gan-fila">
          <span className="gan-fila-label">Real gastado</span>
          <div className="gan-input-wrap">
            <span className="gan-peso">$</span>
            <input
              className="gan-input"
              type="number" min="0" step="0.50" placeholder="0.00"
              value={gasolinaStr}
              onChange={e => handleGasolina(e.target.value)}
            />
          </div>
        </div>

        {gasolinaReal > 0 && (
          <div className={`gan-diferencia ${diferencia >= 0 ? 'positivo' : 'negativo'}`}>
            {diferencia >= 0
              ? <>Ahorraste <strong>${fmt(diferencia)}</strong> en gasolina</>
              : <>Gastaste <strong>${fmt(Math.abs(diferencia))}</strong> de más en gasolina</>
            }
          </div>
        )}
      </div>

      {/* Ganancia neta */}
      <div className={`gan-card gan-card-neta ${gananciaNeta < 0 ? 'perdida' : ''}`}>
        <p className="gan-card-titulo">Ganancia neta</p>
        <div className={`gan-neta-valor ${gananciaNeta < 0 ? 'negativo' : ''}`}>
          ${fmt(gananciaNeta)}
        </div>
        {gasolinaReal === 0
          ? <p className="gan-neta-hint">Ingresa el gasto real de gasolina para ver tu ganancia neta</p>
          : <p className="gan-neta-hint">
              ${fmt(totalHoy)} ganados − ${fmt(gasolinaReal)} gasolina
            </p>
        }
      </div>

    </div>
  )
}
