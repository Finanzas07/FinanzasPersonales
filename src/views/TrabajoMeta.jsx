import { useState, useEffect } from 'react'
import { Pencil, Check, X as XIcon, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import './TrabajoView.css'

function formatHora(ts) {
  return new Date(ts).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

function formatFecha(ts) {
  return new Date(ts).toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

const META_ACTIVA_KEY    = 'trabajo_meta_activa'
const META_HISTORIAL_KEY = 'trabajo_meta_historial'

const cargar = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}

export default function TrabajoMeta() {
  const [metaActiva, setMetaActiva]             = useState(() => cargar(META_ACTIVA_KEY, null))
  const [historial, setHistorial]               = useState(() => cargar(META_HISTORIAL_KEY, []))
  const [modalTipo, setModalTipo]               = useState(null) // 'viaje' | 'propina' | null
  const [monto, setMonto]                       = useState('')
  const [editandoId, setEditandoId]             = useState(null)
  const [montoEdicion, setMontoEdicion]         = useState('')
  const [historialAbierto, setHistorialAbierto] = useState(null)
  const [confirmEliminar, setConfirmEliminar]   = useState(null)

  useEffect(() => {
    if (metaActiva) localStorage.setItem(META_ACTIVA_KEY, JSON.stringify(metaActiva))
    else localStorage.removeItem(META_ACTIVA_KEY)
  }, [metaActiva])

  const registros        = metaActiva?.registros ?? []
  const totalGanado      = registros.reduce((s, r) => s + r.monto, 0)
  const viajesRealizados = registros.filter(r => r.tipo !== 'propina').length

  // Asigna número de viaje a cada registro (propinas no llevan número)
  let viajeContador = 0
  const registrosConNum = registros.map(r => {
    if (r.tipo !== 'propina') viajeContador++
    return { ...r, viajeNum: r.tipo !== 'propina' ? viajeContador : null }
  })

  const nuevaMeta = () => {
    setMetaActiva({ startTime: Date.now(), registros: [] })
  }

  const abrirModal = (tipo) => {
    setMonto('')
    setModalTipo(tipo)
  }

  const cerrarModal = () => {
    setModalTipo(null)
    setMonto('')
  }

  const registrarMovimiento = () => {
    const montoNum = parseFloat(monto) || 0
    const ahora = Date.now()
    setMetaActiva(prev => ({
      ...prev,
      registros: [...prev.registros, { id: ahora, monto: montoNum, hora: ahora, tipo: modalTipo }],
    }))
    cerrarModal()
  }

  const guardarEdicion = (id) => {
    setMetaActiva(prev => ({
      ...prev,
      registros: prev.registros.map(r => r.id === id ? { ...r, monto: parseFloat(montoEdicion) || 0 } : r),
    }))
    setEditandoId(null)
  }

  const terminarMeta = () => {
    if (metaActiva && registros.length > 0) {
      const entrada = { id: Date.now(), fecha: metaActiva.startTime, viajesRealizados, totalGanado, registros }
      const nuevo = [entrada, ...historial]
      setHistorial(nuevo)
      localStorage.setItem(META_HISTORIAL_KEY, JSON.stringify(nuevo))
    }
    setMetaActiva(null)
  }

  const eliminarMeta = (id) => {
    const nuevo = historial.filter(m => m.id !== id)
    setHistorial(nuevo)
    localStorage.setItem(META_HISTORIAL_KEY, JSON.stringify(nuevo))
    setConfirmEliminar(null)
    if (historialAbierto === id) setHistorialAbierto(null)
  }

  // ── Meta activa ──
  if (metaActiva) {
    return (
      <div className="trabajo-dashboard">
        <div className="meta-metricas">
          <div className="meta-metrica">
            <span className="meta-metrica-label">Viajes realizados</span>
            <span className="meta-metrica-valor">{viajesRealizados}</span>
          </div>
          <div className="meta-metrica meta-metrica-dinero">
            <span className="meta-metrica-label">Monto total</span>
            <span className="meta-metrica-valor">
              ${totalGanado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="meta-btns-row">
          <button className="trabajo-btn-registrar" onClick={() => abrirModal('viaje')}>
            + Registrar Viaje
          </button>
          <button className="meta-btn-propina" onClick={() => abrirModal('propina')}>
            + Propina
          </button>
        </div>

        {registros.length > 0 && (
          <div className="trabajo-historial">
            <p className="trabajo-historial-titulo">Movimientos</p>
            <div className="trabajo-historial-lista">
              {[...registrosConNum].reverse().map(r => (
                <div key={r.id} className="trabajo-historial-item">
                  <div className="trabajo-historial-info">
                    {r.tipo === 'propina'
                      ? <span className="trabajo-historial-num meta-label-propina">Propina</span>
                      : <span className="trabajo-historial-num">Viaje {r.viajeNum}</span>
                    }
                    <span className="trabajo-historial-hora">{formatHora(r.hora)}</span>
                  </div>
                  {editandoId === r.id ? (
                    <div className="trabajo-historial-edicion">
                      <span className="trabajo-historial-peso">$</span>
                      <input className="trabajo-historial-input" type="number" min="0" step="0.50"
                        value={montoEdicion} autoFocus
                        onChange={e => setMontoEdicion(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') guardarEdicion(r.id); if (e.key === 'Escape') setEditandoId(null) }} />
                      <button className="trabajo-historial-btn guardar" onClick={() => guardarEdicion(r.id)}><Check size={14} /></button>
                      <button className="trabajo-historial-btn cancelar" onClick={() => setEditandoId(null)}><XIcon size={14} /></button>
                    </div>
                  ) : (
                    <div className="trabajo-historial-monto-row">
                      <span className={`trabajo-historial-monto ${r.tipo === 'propina' ? 'meta-monto-propina' : ''}`}>
                        ${r.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                      <button className="trabajo-historial-btn editar" onClick={() => { setEditandoId(r.id); setMontoEdicion(String(r.monto)) }}>
                        <Pencil size={13} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="trabajo-btn-terminar" onClick={terminarMeta}>
          Terminar Meta
        </button>

        {modalTipo && (
          <div className="trabajo-modal-overlay" onClick={cerrarModal}>
            <div className="trabajo-modal" onClick={e => e.stopPropagation()}>
              <h3>{modalTipo === 'propina' ? 'Registrar Propina' : 'Registrar Viaje'}</h3>
              <p>{modalTipo === 'propina' ? '¿Cuánto recibiste de propina?' : '¿Cuánto ganaste en este viaje?'}</p>
              <input type="number" min="0" step="0.50" placeholder="$ 0.00"
                value={monto} autoFocus
                onChange={e => setMonto(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && registrarMovimiento()} />
              <div className="trabajo-modal-btns">
                <button className="trabajo-modal-cancel" onClick={cerrarModal}>Cancelar</button>
                <button
                  className={`trabajo-modal-confirm ${modalTipo === 'propina' ? 'meta-modal-propina' : ''}`}
                  onClick={registrarMovimiento}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Sin meta activa ──
  return (
    <div className="trabajo-wrap">
      <div className="trabajo-config">
        <div className="trabajo-config-icon">🎯</div>
        <h2>Meta de Viajes</h2>
        <p className="trabajo-config-sub">Registra tus viajes sin cronómetro</p>
        <button className="trabajo-btn-iniciar" style={{ marginTop: 8 }} onClick={nuevaMeta}>
          + Agregar nueva meta
        </button>
      </div>

      {historial.length > 0 && (
        <div className="trabajo-jornadas">
          <p className="trabajo-jornadas-titulo">Historial de metas</p>
          {historial.map(m => {
            // Numeración para el detalle del historial
            let vc = 0
            const regsConNum = m.registros.map(r => {
              if (r.tipo !== 'propina') vc++
              return { ...r, viajeNum: r.tipo !== 'propina' ? vc : null }
            })
            return (
              <div key={m.id} className="trabajo-jornada-card">
                <div className="trabajo-jornada-header" onClick={() => setHistorialAbierto(historialAbierto === m.id ? null : m.id)}>
                  <div className="trabajo-jornada-info">
                    <span className="trabajo-jornada-fecha">{formatFecha(m.fecha)}</span>
                    <span className="trabajo-jornada-horario">{formatHora(m.fecha)}</span>
                  </div>
                  <div className="trabajo-jornada-resumen">
                    <span className="trabajo-jornada-ganado">
                      ${m.totalGanado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="trabajo-jornada-viajes">{m.viajesRealizados} viajes</span>
                    {historialAbierto === m.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {historialAbierto === m.id && (
                  <div className="trabajo-jornada-detalle">
                    {regsConNum.map(r => (
                      <div key={r.id} className="trabajo-jornada-viaje">
                        <span>
                          {r.tipo === 'propina' ? 'Propina' : `Viaje ${r.viajeNum}`}
                          {' — '}{formatHora(r.hora)}
                        </span>
                        <span className={`trabajo-jornada-viaje-monto ${r.tipo === 'propina' ? 'meta-monto-propina' : ''}`}>
                          ${r.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                    {confirmEliminar === m.id ? (
                      <div className="trabajo-jornada-confirm">
                        <span>¿Eliminar esta meta?</span>
                        <div className="trabajo-jornada-confirm-btns">
                          <button className="trabajo-jornada-btn-cancel" onClick={() => setConfirmEliminar(null)}>No</button>
                          <button className="trabajo-jornada-btn-delete" onClick={() => eliminarMeta(m.id)}>Sí, eliminar</button>
                        </div>
                      </div>
                    ) : (
                      <button className="trabajo-jornada-btn-eliminar" onClick={e => { e.stopPropagation(); setConfirmEliminar(m.id) }}>
                        <Trash2 size={13} /> Eliminar meta
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
