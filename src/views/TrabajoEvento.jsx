import { useState, useEffect } from 'react'
import { Pencil, Check, X as XIcon, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import './TrabajoView.css'

function formatCountdown(seconds) {
  const neg = seconds < 0
  const abs = Math.abs(seconds)
  const h = Math.floor(abs / 3600)
  const m = Math.floor((abs % 3600) / 60)
  const s = abs % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  const base = h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
  return neg ? `-${base}` : base
}

function formatHora(ts) {
  return new Date(ts).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

function formatFecha(ts) {
  return new Date(ts).toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

const SESION_KEY        = 'trabajo_sesion_activa'
const HISTORIAL_KEY     = 'trabajo_historial'
const META_ACTIVA_KEY   = 'trabajo_meta_activa'
const META_HISTORIAL_KEY = 'trabajo_meta_historial'

const cargar = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}

export default function TrabajoEvento() {
  const [sesion, setSesion]               = useState(() => cargar(SESION_KEY, null))
  const [historial, setHistorial]         = useState(() => cargar(HISTORIAL_KEY, []))
  const [form, setForm]                   = useState({ meta: '', horaInicio: '', horaFin: '' })
  const [mostrarModal, setMostrarModal]   = useState(false)
  const [monto, setMonto]                 = useState('')
  const [now, setNow]                     = useState(Date.now())
  const [editandoId, setEditandoId]       = useState(null)
  const [montoEdicion, setMontoEdicion]   = useState('')
  const [historialAbierto, setHistorialAbierto] = useState(null)
  const [confirmEliminar, setConfirmEliminar]   = useState(null)

  useEffect(() => {
    if (!sesion) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [!!sesion])

  useEffect(() => {
    if (sesion) localStorage.setItem(SESION_KEY, JSON.stringify(sesion))
    else localStorage.removeItem(SESION_KEY)
  }, [sesion])

  // Sincroniza automáticamente con la vista de Meta
  useEffect(() => {
    if (sesion) {
      localStorage.setItem(META_ACTIVA_KEY, JSON.stringify({ startTime: sesion.startTime, registros: sesion.registros }))
    } else {
      localStorage.removeItem(META_ACTIVA_KEY)
    }
  }, [sesion])

  const registros       = sesion?.registros ?? []
  const totalGanado     = registros.reduce((s, r) => s + r.monto, 0)
  const viajesRealizados = registros.length
  const tiempoGlobal    = sesion ? Math.max(0, Math.round((sesion.endTime - now) / 1000)) : 0
  const tiempoViaje     = sesion ? Math.round((sesion.tripEndTime - now) / 1000) : 0
  const viajesFaltantes = sesion ? Math.max(0, sesion.meta - viajesRealizados) : 0
  const jornadaTerminada = sesion && (tiempoGlobal === 0 || viajesFaltantes === 0)

  const iniciarJornada = () => {
    const { meta, horaInicio, horaFin } = form
    if (!meta || !horaInicio || !horaFin) return
    const metaNum = parseInt(meta)
    const [hI, mI] = horaInicio.split(':').map(Number)
    const [hF, mF] = horaFin.split(':').map(Number)
    const hoy = new Date()
    const inicio = new Date(hoy); inicio.setHours(hI, mI, 0, 0)
    const fin = new Date(hoy); fin.setHours(hF, mF, 0, 0)
    if (fin <= inicio) fin.setDate(fin.getDate() + 1)
    const totalMs = fin - inicio
    const tiempoPorViajeMs = totalMs / metaNum
    const ahora = Date.now()
    setSesion({ meta: metaNum, horaInicio, horaFin, tiempoPorViajeMs, registros: [], startTime: ahora, endTime: fin.getTime(), tripEndTime: ahora + tiempoPorViajeMs })
    setNow(ahora)
  }

  const registrarViaje = () => {
    const montoNum = parseFloat(monto) || 0
    const ahora = Date.now()
    setSesion(prev => ({
      ...prev,
      registros: [...prev.registros, { id: ahora, monto: montoNum, hora: ahora }],
      tripEndTime: prev.tripEndTime + prev.tiempoPorViajeMs,
    }))
    setMonto('')
    setMostrarModal(false)
  }

  const guardarEdicion = (id) => {
    setSesion(prev => ({ ...prev, registros: prev.registros.map(r => r.id === id ? { ...r, monto: parseFloat(montoEdicion) || 0 } : r) }))
    setEditandoId(null)
  }

  const eliminarJornada = (id) => {
    const nuevo = historial.filter(j => j.id !== id)
    setHistorial(nuevo)
    localStorage.setItem(HISTORIAL_KEY, JSON.stringify(nuevo))
    setConfirmEliminar(null)
    if (historialAbierto === id) setHistorialAbierto(null)
  }

  const terminarJornada = () => {
    if (sesion && viajesRealizados > 0) {
      const id = Date.now()
      const entrada = { id, fecha: sesion.startTime, horaInicio: sesion.horaInicio, horaFin: sesion.horaFin, meta: sesion.meta, viajesRealizados, totalGanado, registros: sesion.registros }
      const nuevo = [entrada, ...historial]
      setHistorial(nuevo)
      localStorage.setItem(HISTORIAL_KEY, JSON.stringify(nuevo))

      // Guarda también en el historial de Meta
      const metaHistorial = cargar(META_HISTORIAL_KEY, [])
      const metaEntrada = { id, fecha: sesion.startTime, viajesRealizados, totalGanado, registros: sesion.registros }
      localStorage.setItem(META_HISTORIAL_KEY, JSON.stringify([metaEntrada, ...metaHistorial]))
    }
    setSesion(null)
    setForm({ meta: '', horaInicio: '', horaFin: '' })
  }

  // Dashboard activo
  if (sesion) {
    const tiempoPorViajeMins = Math.round(sesion.tiempoPorViajeMs / 60000)
    return (
      <div className="trabajo-dashboard">
        {jornadaTerminada && (
          <div className="trabajo-banner-fin">
            {viajesFaltantes === 0 ? '🎉 ¡Meta alcanzada!' : '⏰ Tiempo terminado'} —
            Ganaste ${totalGanado.toLocaleString('es-MX', { minimumFractionDigits: 2 })} en {viajesRealizados} viajes
          </div>
        )}
        <div className="trabajo-metricas">
          <div className="trabajo-metrica">
            <span className="trabajo-metrica-label">Viajes faltantes</span>
            <span className="trabajo-metrica-valor">{viajesFaltantes}</span>
            <span className="trabajo-metrica-sub">de {sesion.meta} meta</span>
          </div>
          <div className="trabajo-metrica trabajo-metrica-dinero">
            <span className="trabajo-metrica-label">Total ganado</span>
            <span className="trabajo-metrica-valor">${totalGanado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            <span className="trabajo-metrica-sub">{viajesRealizados} viajes realizados</span>
          </div>
        </div>
        <div className="trabajo-timers">
          <div className="trabajo-timer">
            <span className="trabajo-timer-label">Tiempo de jornada</span>
            <span className={`trabajo-timer-valor ${tiempoGlobal < 300 ? 'urgente' : ''}`}>{formatCountdown(tiempoGlobal)}</span>
          </div>
          <div className="trabajo-timer trabajo-timer-viaje">
            <span className="trabajo-timer-label">Tiempo por viaje</span>
            <span className={`trabajo-timer-valor ${tiempoViaje < 0 ? 'negativo' : tiempoViaje < 60 ? 'urgente' : ''}`}>{formatCountdown(tiempoViaje)}</span>
            <span className="trabajo-timer-sub">objetivo: {tiempoPorViajeMins} min/viaje</span>
          </div>
        </div>
        <button className="trabajo-btn-registrar" onClick={() => setMostrarModal(true)} disabled={viajesFaltantes <= 0}>
          + Registrar Viaje
        </button>
        {registros.length > 0 && (
          <div className="trabajo-historial">
            <p className="trabajo-historial-titulo">Viajes registrados</p>
            <div className="trabajo-historial-lista">
              {[...registros].reverse().map((r, i) => (
                <div key={r.id} className="trabajo-historial-item">
                  <div className="trabajo-historial-info">
                    <span className="trabajo-historial-num">Viaje {viajesRealizados - i}</span>
                    <span className="trabajo-historial-hora">{formatHora(r.hora)}</span>
                  </div>
                  {editandoId === r.id ? (
                    <div className="trabajo-historial-edicion">
                      <span className="trabajo-historial-peso">$</span>
                      <input className="trabajo-historial-input" type="number" min="0" step="0.50" value={montoEdicion} autoFocus
                        onChange={e => setMontoEdicion(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') guardarEdicion(r.id); if (e.key === 'Escape') setEditandoId(null) }} />
                      <button className="trabajo-historial-btn guardar" onClick={() => guardarEdicion(r.id)}><Check size={14} /></button>
                      <button className="trabajo-historial-btn cancelar" onClick={() => setEditandoId(null)}><XIcon size={14} /></button>
                    </div>
                  ) : (
                    <div className="trabajo-historial-monto-row">
                      <span className="trabajo-historial-monto">${r.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                      <button className="trabajo-historial-btn editar" onClick={() => { setEditandoId(r.id); setMontoEdicion(String(r.monto)) }}><Pencil size={13} /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        <button className="trabajo-btn-terminar" onClick={terminarJornada}>Terminar Jornada</button>
        {mostrarModal && (
          <div className="trabajo-modal-overlay" onClick={() => setMostrarModal(false)}>
            <div className="trabajo-modal" onClick={e => e.stopPropagation()}>
              <h3>Registrar Viaje</h3>
              <p>¿Cuánto ganaste en este viaje?</p>
              <input type="number" min="0" step="0.50" placeholder="$ 0.00" value={monto} autoFocus
                onChange={e => setMonto(e.target.value)} onKeyDown={e => e.key === 'Enter' && registrarViaje()} />
              <div className="trabajo-modal-btns">
                <button className="trabajo-modal-cancel" onClick={() => setMostrarModal(false)}>Cancelar</button>
                <button className="trabajo-modal-confirm" onClick={registrarViaje}>Confirmar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Pantalla de configuración
  return (
    <div className="trabajo-wrap">
      <div className="trabajo-config">
        <div className="trabajo-config-icon">🚗</div>
        <h2>Configurar Jornada</h2>
        <p className="trabajo-config-sub">Planifica tu jornada de Didi</p>
        <div className="trabajo-form">
          <div className="trabajo-field">
            <label>Meta de viajes</label>
            <input type="number" min="1" placeholder="Ej: 12" value={form.meta}
              onChange={e => setForm(f => ({ ...f, meta: e.target.value }))} />
          </div>
          <div className="trabajo-field-row">
            <div className="trabajo-field">
              <label>Hora de inicio</label>
              <input type="time" value={form.horaInicio} onChange={e => setForm(f => ({ ...f, horaInicio: e.target.value }))} />
            </div>
            <div className="trabajo-field">
              <label>Hora de fin</label>
              <input type="time" value={form.horaFin} onChange={e => setForm(f => ({ ...f, horaFin: e.target.value }))} />
            </div>
          </div>
          {form.meta && form.horaInicio && form.horaFin && (() => {
            const [hI, mI] = form.horaInicio.split(':').map(Number)
            const [hF, mF] = form.horaFin.split(':').map(Number)
            let totalMins = (hF * 60 + mF) - (hI * 60 + mI)
            if (totalMins <= 0) totalMins += 24 * 60
            return (
              <div className="trabajo-preview">
                <span>⏱ {totalMins} min totales</span><span>·</span>
                <span>{Math.round(totalMins / parseInt(form.meta))} min por viaje</span>
              </div>
            )
          })()}
          <button className="trabajo-btn-iniciar" onClick={iniciarJornada} disabled={!form.meta || !form.horaInicio || !form.horaFin}>
            Iniciar Jornada
          </button>
        </div>
      </div>

      {historial.length > 0 && (
        <div className="trabajo-jornadas">
          <p className="trabajo-jornadas-titulo">Historial de jornadas</p>
          {historial.map(j => (
            <div key={j.id} className="trabajo-jornada-card">
              <div className="trabajo-jornada-header" onClick={() => setHistorialAbierto(historialAbierto === j.id ? null : j.id)}>
                <div className="trabajo-jornada-info">
                  <span className="trabajo-jornada-fecha">{formatFecha(j.fecha)}</span>
                  <span className="trabajo-jornada-horario">{j.horaInicio} – {j.horaFin}</span>
                </div>
                <div className="trabajo-jornada-resumen">
                  <span className="trabajo-jornada-ganado">${j.totalGanado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  <span className="trabajo-jornada-viajes">{j.viajesRealizados}/{j.meta} viajes</span>
                  {historialAbierto === j.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>
              {historialAbierto === j.id && (
                <div className="trabajo-jornada-detalle">
                  {j.registros.map((r, i) => (
                    <div key={r.id} className="trabajo-jornada-viaje">
                      <span>Viaje {i + 1} — {formatHora(r.hora)}</span>
                      <span className="trabajo-jornada-viaje-monto">${r.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                  {confirmEliminar === j.id ? (
                    <div className="trabajo-jornada-confirm">
                      <span>¿Eliminar esta jornada?</span>
                      <div className="trabajo-jornada-confirm-btns">
                        <button className="trabajo-jornada-btn-cancel" onClick={() => setConfirmEliminar(null)}>No</button>
                        <button className="trabajo-jornada-btn-delete" onClick={() => eliminarJornada(j.id)}>Sí, eliminar</button>
                      </div>
                    </div>
                  ) : (
                    <button className="trabajo-jornada-btn-eliminar" onClick={e => { e.stopPropagation(); setConfirmEliminar(j.id) }}>
                      <Trash2 size={13} /> Eliminar jornada
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
