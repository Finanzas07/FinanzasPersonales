import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'
import './VistaGeneral.css'

const COLORES_DONA = ['#22c55e', '#ef4444']

export default function VistaGeneral({ moneda = 'MXN', simbolo = '$' }) {
  // Datos de ejemplo — se reemplazarán con Firestore
  const resumen = { balance: 13627.71, tarjetas: -249.0 }
  const esteMes = { ingresos: 1452.0, gastos: -573.53 }
  const mesPasado = { ingresos: 1500.0, gastos: -388.76 }

  const cuentas = [
    { nombre: 'Cartera', saldo: 90.24 },
    { nombre: 'Cuenta Bancaria', saldo: 13537.47 },
  ]

  const balanceHistorico = [
    { mes: 'Mar', balance: 11200 },
    { mes: 'Abr', balance: 11400 },
    { mes: 'May', balance: 12500 },
    { mes: 'May', balance: 12600 },
    { mes: 'May', balance: 13627 },
  ]

  const pct = (mes) => {
    const total = mes.ingresos + Math.abs(mes.gastos)
    return [
      { value: (mes.ingresos / total) * 100 },
      { value: (Math.abs(mes.gastos) / total) * 100 },
    ]
  }

  const fmt = (n) =>
    `${simbolo} ${Math.abs(n).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`

  return (
    <div className="vg-container">
      {/* Resumen superior */}
      <div className="vg-cards">
        {/* Resumen total */}
        <div className="vg-card">
          <p className="vg-card-title">Resumen</p>
          <div className="vg-row">
            <span>Balance:</span>
            <span className="vg-green">{fmt(resumen.balance)} {moneda}</span>
          </div>
          <div className="vg-row">
            <span>Tarjetas de crédito:</span>
            <span className="vg-red">{fmt(resumen.tarjetas)} {moneda}</span>
          </div>
          <div className="vg-row vg-total">
            <span></span>
            <span className="vg-green">{fmt(resumen.balance + resumen.tarjetas)} {moneda}</span>
          </div>
        </div>

        {/* Este mes */}
        <div className="vg-card vg-card-mes">
          <PieChart width={80} height={80}>
            <Pie data={pct(esteMes)} innerRadius={25} outerRadius={38} dataKey="value" startAngle={90} endAngle={-270}>
              {COLORES_DONA.map((c, i) => <Cell key={i} fill={c} />)}
            </Pie>
          </PieChart>
          <div>
            <p className="vg-card-title">Este mes</p>
            <div className="vg-row"><TrendingUp size={14} className="vg-green" /><span className="vg-green">{fmt(esteMes.ingresos)} {moneda}</span></div>
            <div className="vg-row"><TrendingDown size={14} className="vg-red" /><span className="vg-red">{fmt(esteMes.gastos)} {moneda}</span></div>
            <div className="vg-row vg-total"><span></span><span className="vg-green">{fmt(esteMes.ingresos + esteMes.gastos)} {moneda}</span></div>
          </div>
        </div>

        {/* Mes pasado */}
        <div className="vg-card vg-card-mes">
          <PieChart width={80} height={80}>
            <Pie data={pct(mesPasado)} innerRadius={25} outerRadius={38} dataKey="value" startAngle={90} endAngle={-270}>
              {COLORES_DONA.map((c, i) => <Cell key={i} fill={c} />)}
            </Pie>
          </PieChart>
          <div>
            <p className="vg-card-title">Mes pasado</p>
            <div className="vg-row"><TrendingUp size={14} className="vg-green" /><span className="vg-green">{fmt(mesPasado.ingresos)} {moneda}</span></div>
            <div className="vg-row"><TrendingDown size={14} className="vg-red" /><span className="vg-red">{fmt(mesPasado.gastos)} {moneda}</span></div>
            <div className="vg-row vg-total"><span></span><span className="vg-green">{fmt(mesPasado.ingresos + mesPasado.gastos)} {moneda}</span></div>
          </div>
        </div>
      </div>

      {/* Fila inferior */}
      <div className="vg-bottom">
        {/* Cuentas */}
        <div className="vg-panel">
          <p className="vg-panel-title">Cuentas</p>
          {cuentas.map((c) => (
            <div key={c.nombre} className="vg-cuenta">
              <span>{c.nombre}</span>
              <span className="vg-green">{fmt(c.saldo)} {moneda}</span>
            </div>
          ))}
        </div>

        {/* Gráfica de balance */}
        <div className="vg-panel vg-panel-chart">
          <p className="vg-panel-title">Balance</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={balanceHistorico}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => `${simbolo} ${v.toLocaleString('es-MX')}`} />
              <Line type="monotone" dataKey="balance" stroke="#1a56db" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
