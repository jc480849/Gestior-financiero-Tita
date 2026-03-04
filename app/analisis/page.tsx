"use client";

import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCOP } from "@/lib/format";
import { CHART_COLORS } from "@/lib/constants";

interface AnalisisData {
  tendencia: Array<{ mes: string; ingresos: number; gastos: number }>;
  topGastos: Array<{ categoria: string; icono: string; color: string; total: number }>;
  distribucionIngresos: Array<{ categoria: string; icono: string; color: string; total: number }>;
  volatilidad: { media: number; desviacion: number; coefVariacion: number };
}

function formatMesShort(yyyyMm: string) {
  const [y, m] = yyyyMm.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("es-CO", { month: "short", year: "2-digit" });
}

const RANGO_OPTIONS = [
  { value: "3", label: "3 meses" },
  { value: "6", label: "6 meses" },
  { value: "12", label: "12 meses" },
];

export default function AnalisisPage() {
  const [meses, setMeses] = useState("6");
  const [data, setData] = useState<AnalisisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analisis?meses=${meses}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, [meses]);

  if (loading || !data) {
    return <div className="flex items-center justify-center h-64 text-gray-500 text-sm">Cargando análisis...</div>;
  }

  const hasData = data.tendencia.some((t) => t.ingresos > 0 || t.gastos > 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-xl font-bold text-white">📈 Análisis</h1>
        <div className="flex gap-1">
          {RANGO_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => setMeses(o.value)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                meses === o.value ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Volatilidad ingresos */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <Card>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Ingreso promedio</p>
          <p className="text-lg font-bold text-green-400">{formatCOP(data.volatilidad.media)}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Desv. estándar</p>
          <p className="text-lg font-bold text-yellow-400">{formatCOP(data.volatilidad.desviacion)}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Coef. variación</p>
          <p className={`text-lg font-bold ${data.volatilidad.coefVariacion > 30 ? "text-red-400" : data.volatilidad.coefVariacion > 15 ? "text-yellow-400" : "text-green-400"}`}>
            {data.volatilidad.coefVariacion.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {data.volatilidad.coefVariacion > 30 ? "Alta volatilidad" : data.volatilidad.coefVariacion > 15 ? "Volatilidad moderada" : "Ingresos estables"}
          </p>
        </Card>
      </div>

      {/* Tendencia línea */}
      <Card className="mb-5">
        <p className="text-sm font-semibold text-gray-300 mb-4">Tendencia ingresos vs gastos</p>
        {!hasData ? (
          <EmptyState icon="📈" title="Sin datos" description="Registra transacciones para ver la tendencia" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.tendencia.map((t) => ({ ...t, mes: formatMesShort(t.mes) }))}>
              <XAxis dataKey="mes" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} width={65}
                tickFormatter={(v) => v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
              <Tooltip
                contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }}
                labelStyle={{ color: "#e5e7eb" }}
                formatter={(v: number) => formatCOP(v)}
              />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
              <Line type="monotone" dataKey="ingresos" stroke="#22c55e" strokeWidth={2} dot={false} name="Ingresos" />
              <Line type="monotone" dataKey="gastos" stroke="#ef4444" strokeWidth={2} dot={false} name="Gastos" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Top gastos */}
        <Card>
          <p className="text-sm font-semibold text-gray-300 mb-3">Top gastos por categoría</p>
          {data.topGastos.length === 0 ? (
            <EmptyState icon="💸" title="Sin gastos" description="No hay datos en este período" />
          ) : (
            <>
              {data.topGastos.slice(0, 6).map((g, i) => {
                const totalGastos = data.topGastos.reduce((s, x) => s + x.total, 0);
                const pct = totalGastos > 0 ? (g.total / totalGastos) * 100 : 0;
                return (
                  <div key={i} className="py-2 border-b border-gray-800 last:border-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-200">{g.icono} {g.categoria}</span>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-100">{formatCOP(g.total)}</span>
                        <span className="text-xs text-gray-500 ml-2">{pct.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1">
                      <div className="h-1 rounded-full bg-red-500/70" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </Card>

        {/* Distribución ingresos */}
        <Card>
          <p className="text-sm font-semibold text-gray-300 mb-3">Distribución ingresos</p>
          {data.distribucionIngresos.length === 0 ? (
            <EmptyState icon="💰" title="Sin ingresos" description="No hay datos en este período" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data.distribucionIngresos}
                  dataKey="total"
                  nameKey="categoria"
                  cx="50%" cy="50%"
                  outerRadius={65} innerRadius={25}
                >
                  {data.distribucionIngresos.map((entry, i) => (
                    <Cell key={i} fill={entry.color || CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }}
                  formatter={(v: number) => formatCOP(v)}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
}
