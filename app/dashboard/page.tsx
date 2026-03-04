"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { TransactionRow } from "@/components/ui/TransactionRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { MonthPicker } from "@/components/ui/MonthPicker";
import { formatCOP, currentMes } from "@/lib/format";

interface DashboardData {
  ingresos: number;
  gastos: number;
  balance: number;
  tasaAhorro: number;
  totalDeuda: number;
  totalActivos: number;
  patrimonioNeto: number;
  pieData: Array<{ nombre: string; icono: string; color: string; monto: number }>;
  tendencia: Array<{ mes: string; ingresos: number; gastos: number }>;
  ultimasTransacciones: Array<{
    id: number; tipo: string; descripcion: string; monto: number; fecha: string;
    categoria: { nombre: string; icono?: string };
  }>;
  alertas: Array<{ categoria: string; presupuestado: number; gastado: number }>;
  hhiAlerta: boolean;
}

function formatMesShort(yyyyMm: string) {
  const [y, m] = yyyyMm.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("es-CO", { month: "short" });
}

export default function DashboardPage() {
  const [mes, setMes] = useState(currentMes());
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/dashboard?mes=${mes}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, [mes]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
        Cargando dashboard...
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-xl font-bold text-white">📊 Dashboard</h1>
        <MonthPicker value={mes} onChange={setMes} />
      </div>

      {/* Alertas */}
      {(data.alertas.length > 0 || data.hhiAlerta) && (
        <div className="mb-4 space-y-2">
          {data.alertas.map((a) => (
            <div key={a.categoria} className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2.5 text-sm">
              <span>⚠️</span>
              <span className="text-red-300">
                <strong>{a.categoria}</strong>: gastado {formatCOP(a.gastado)} de {formatCOP(a.presupuestado)} ({((a.gastado / a.presupuestado) * 100).toFixed(0)}%)
              </span>
            </div>
          ))}
          {data.hhiAlerta && (
            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-2.5 text-sm">
              <span>⚡</span>
              <span className="text-yellow-300">Más del 80% de tus ingresos viene de una sola fuente. Considera diversificar.</span>
            </div>
          )}
        </div>
      )}

      {/* KPIs principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Ingresos" value={data.ingresos} icon="💰" color="green" />
        <StatCard label="Gastos" value={data.gastos} icon="💸" color="red" />
        <StatCard label="Balance" value={data.balance} icon="⚖️" color={data.balance >= 0 ? "green" : "red"} />
        <StatCard label="Tasa ahorro" value={data.tasaAhorro} icon="🏦" format="percent" color={data.tasaAhorro >= 20 ? "green" : data.tasaAhorro > 0 ? "yellow" : "red"} />
      </div>

      {/* Patrimonio */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Activos" value={data.totalActivos} icon="📦" color="blue" />
        <StatCard label="Deudas" value={data.totalDeuda} icon="💳" color="red" />
        <StatCard label="Patrimonio neto" value={data.patrimonioNeto} icon="💎" color={data.patrimonioNeto >= 0 ? "green" : "red"} />
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-5">
        {/* Gráfico barras tendencia */}
        <Card>
          <p className="text-sm font-semibold text-gray-300 mb-4">Ingresos vs Gastos (6 meses)</p>
          {data.tendencia.every((t) => t.ingresos === 0 && t.gastos === 0) ? (
            <EmptyState icon="📊" title="Sin datos" description="Registra transacciones para ver la tendencia" />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.tendencia.map((t) => ({ ...t, mes: formatMesShort(t.mes) }))} barGap={2}>
                <XAxis dataKey="mes" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} width={60}
                  tickFormatter={(v) => v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
                <Tooltip
                  contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }}
                  labelStyle={{ color: "#e5e7eb" }}
                  formatter={(v) => formatCOP(v as number)}
                />
                <Bar dataKey="ingresos" fill="#22c55e" radius={[3, 3, 0, 0]} name="Ingresos" />
                <Bar dataKey="gastos" fill="#ef4444" radius={[3, 3, 0, 0]} name="Gastos" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Pie gastos por categoría */}
        <Card>
          <p className="text-sm font-semibold text-gray-300 mb-4">Gastos por categoría</p>
          {data.pieData.length === 0 ? (
            <EmptyState icon="🥧" title="Sin gastos" description="Registra gastos para ver el desglose" />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={data.pieData} dataKey="monto" nameKey="nombre" cx="50%" cy="50%" outerRadius={65} innerRadius={30}>
                  {data.pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }}
                  formatter={(v) => formatCOP(v as number)}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Últimas transacciones */}
      <Card>
        <p className="text-sm font-semibold text-gray-300 mb-3">Últimas transacciones</p>
        {data.ultimasTransacciones.length === 0 ? (
          <EmptyState icon="💳" title="Sin transacciones este mes" description="Registra tus movimientos en Transacciones" />
        ) : (
          data.ultimasTransacciones.map((t) => (
            <TransactionRow
              key={t.id}
              id={t.id}
              tipo={t.tipo as "INGRESO" | "GASTO" | "TRANSFERENCIA"}
              descripcion={t.descripcion}
              monto={t.monto}
              fecha={t.fecha}
              categoriaNombre={t.categoria.nombre}
              categoriaIcono={t.categoria.icono}
            />
          ))
        )}
      </Card>
    </div>
  );
}
