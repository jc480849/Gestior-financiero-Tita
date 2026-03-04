"use client";

import { useState, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { formatCOP } from "@/lib/format";

interface ProyeccionData {
  patrimonioInicial: number;
  puntos: Array<{ año: number; sinAporte: number; conAporte: number }>;
  config: { tasaRetornoEsperada: number; tasaInflacion: number };
  regla4pct: {
    gastoMensualDeseado: number;
    gastoAnual: number;
    meta25x: number;
    ingresosPasivosMeta: number;
    añosParaMeta: number | null;
  };
}

export default function ProyeccionesPage() {
  const [aportacion, setAportacion] = useState("500000");
  const [anos, setAnos] = useState("30");
  const [data, setData] = useState<ProyeccionData | null>(null);
  const [loading, setLoading] = useState(false);

  function fetchData() {
    setLoading(true);
    fetch(`/api/proyecciones?aportacion=${aportacion}&anos=${anos}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-6">🔭 Proyecciones</h1>

      {/* Parámetros */}
      <Card className="mb-5">
        <p className="text-sm font-semibold text-gray-300 mb-3">Simulador de interés compuesto</p>
        <div className="flex gap-4 flex-wrap items-end">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Aportación mensual</label>
            <input
              type="number" min="0"
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white w-40"
              value={aportacion}
              onChange={(e) => setAportacion(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Años a proyectar</label>
            <input
              type="number" min="1" max="50"
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white w-24"
              value={anos}
              onChange={(e) => setAnos(e.target.value)}
            />
          </div>
          <button
            onClick={fetchData}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Calcular
          </button>
        </div>
        {data && (
          <p className="text-xs text-gray-500 mt-2">
            Tasa retorno: {(data.config.tasaRetornoEsperada * 100).toFixed(1)}% anual ·
            Tasa inflación: {(data.config.tasaInflacion * 100).toFixed(1)}% ·
            Patrimonio inicial: {formatCOP(data.patrimonioInicial)}
            {" "}— Configura estos valores en ⚙️ Configuración
          </p>
        )}
      </Card>

      {loading && <div className="text-gray-500 text-sm text-center py-8">Calculando...</div>}

      {data && !loading && (
        <>
          {/* Gráfico proyección */}
          <Card className="mb-5">
            <p className="text-sm font-semibold text-gray-300 mb-4">Patrimonio proyectado</p>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data.puntos}>
                <defs>
                  <linearGradient id="gradSin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradCon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="año" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `${v}a`} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} width={70}
                  tickFormatter={(v) => v >= 1e9 ? `${(v / 1e9).toFixed(1)}B` : v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`} />
                <Tooltip
                  contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }}
                  labelStyle={{ color: "#e5e7eb" }}
                  labelFormatter={(v) => `Año ${v}`}
                  formatter={(v: number) => formatCOP(v)}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
                <Area type="monotone" dataKey="sinAporte" stroke="#6366f1" fill="url(#gradSin)" strokeWidth={2} name="Sin aportación" />
                <Area type="monotone" dataKey="conAporte" stroke="#22c55e" fill="url(#gradCon)" strokeWidth={2} name="Con aportación" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Regla 4% / 25x */}
          <Card>
            <p className="text-sm font-semibold text-gray-300 mb-4">Regla 4% — Independencia financiera</p>
            {data.regla4pct.gastoMensualDeseado > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Gasto mensual deseado</p>
                    <p className="text-base font-bold text-white">{formatCOP(data.regla4pct.gastoMensualDeseado)}</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Gasto anual</p>
                    <p className="text-base font-bold text-white">{formatCOP(data.regla4pct.gastoAnual)}</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 border border-indigo-700">
                    <p className="text-xs text-gray-400 mb-1">Meta 25x (necesitas)</p>
                    <p className="text-base font-bold text-indigo-400">{formatCOP(data.regla4pct.meta25x)}</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Ingreso pasivo anual</p>
                    <p className="text-base font-bold text-green-400">{formatCOP(data.regla4pct.ingresosPasivosMeta)}</p>
                  </div>
                </div>
                {data.regla4pct.añosParaMeta !== null ? (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3">
                    <p className="text-sm text-green-300">
                      🎯 Con una aportación de <strong>{formatCOP(Number(aportacion))}/mes</strong>, alcanzarías
                      tu meta de independencia financiera en aproximadamente{" "}
                      <strong>{data.regla4pct.añosParaMeta} años</strong>.
                    </p>
                  </div>
                ) : (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3">
                    <p className="text-sm text-yellow-300">
                      ⚡ Con la aportación actual no se alcanza la meta en el horizonte proyectado.
                      Aumenta la aportación mensual o ajusta el gasto mensual deseado.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Configura tu <strong>gasto mensual deseado en retiro</strong> en{" "}
                <a href="/configuracion" className="text-indigo-400 hover:text-indigo-300">⚙️ Configuración</a>{" "}
                para ver el análisis de independencia financiera.
              </p>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
