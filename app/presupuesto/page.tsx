"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { MonthPicker } from "@/components/ui/MonthPicker";
import { formatCOP, currentMes } from "@/lib/format";

interface PresupuestoItem {
  id: number;
  mes: string;
  monto: number;
  gastado: number;
  categoriaId: number;
  categoria: { nombre: string; icono?: string; color?: string };
}
interface Categoria { id: number; nombre: string; tipo: string; icono?: string }

export default function PresupuestoPage() {
  const [mes, setMes] = useState(currentMes());
  const [items, setItems] = useState<PresupuestoItem[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [form, setForm] = useState({ categoriaId: "", monto: "" });
  const [adding, setAdding] = useState(false);

  const fetchPresupuesto = useCallback(async () => {
    const r = await fetch(`/api/presupuesto?mes=${mes}`);
    const data = await r.json();
    setItems(Array.isArray(data) ? data : []);
  }, [mes]);

  useEffect(() => { fetchPresupuesto(); }, [fetchPresupuesto]);

  useEffect(() => {
    fetch("/api/categorias?tipo=GASTO").then((r) => r.json()).then(setCategorias);
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.categoriaId || !form.monto) return;
    await fetch("/api/presupuesto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mes, ...form }),
    });
    setForm({ categoriaId: "", monto: "" });
    setAdding(false);
    fetchPresupuesto();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/presupuesto?id=${id}`, { method: "DELETE" });
    fetchPresupuesto();
  }

  const totalPresupuestado = items.reduce((s, i) => s + i.monto, 0);
  const totalGastado = items.reduce((s, i) => s + i.gastado, 0);
  const pctTotal = totalPresupuestado > 0 ? (totalGastado / totalPresupuestado) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-xl font-bold text-white">📋 Presupuesto</h1>
        <div className="flex items-center gap-3">
          <MonthPicker value={mes} onChange={setMes} />
          <button
            onClick={() => setAdding(!adding)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            + Agregar
          </button>
        </div>
      </div>

      {adding && (
        <Card className="mb-5">
          <form onSubmit={handleAdd} className="flex gap-3 flex-wrap items-end">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Categoría</label>
              <select
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                value={form.categoriaId}
                onChange={(e) => setForm((p) => ({ ...p, categoriaId: e.target.value }))}
                required
              >
                <option value="">Seleccionar</option>
                {categorias
                  .filter((c) => !items.some((i) => i.categoriaId === c.id))
                  .map((c) => (
                    <option key={c.id} value={c.id}>{c.icono} {c.nombre}</option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Monto presupuestado</label>
              <input
                type="number" min="0" step="any"
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white w-40"
                placeholder="0"
                value={form.monto}
                onChange={(e) => setForm((p) => ({ ...p, monto: e.target.value }))}
                required
              />
            </div>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm">
              Guardar
            </button>
            <button type="button" onClick={() => setAdding(false)} className="text-gray-400 hover:text-white text-sm px-2 py-2">
              Cancelar
            </button>
          </form>
        </Card>
      )}

      {/* Resumen total */}
      {items.length > 0 && (
        <Card className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Total presupuestado</span>
            <span className="text-sm font-medium text-white">{formatCOP(totalPresupuestado)}</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full transition-all ${pctTotal > 90 ? "bg-red-500" : pctTotal > 70 ? "bg-yellow-500" : "bg-indigo-500"}`}
              style={{ width: `${Math.min(pctTotal, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Gastado: {formatCOP(totalGastado)}</span>
            <span>{pctTotal.toFixed(1)}%</span>
          </div>
        </Card>
      )}

      <Card>
        {items.length === 0 ? (
          <EmptyState icon="📋" title="Sin presupuesto" description="Agrega categorías para este mes" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 uppercase">
                <th className="text-left pb-3">Categoría</th>
                <th className="text-right pb-3">Presupuesto</th>
                <th className="text-right pb-3">Gastado</th>
                <th className="text-right pb-3">Diferencia</th>
                <th className="text-right pb-3">%</th>
                <th className="pb-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const pct = item.monto > 0 ? (item.gastado / item.monto) * 100 : 0;
                const dif = item.monto - item.gastado;
                const over = pct > 100;
                return (
                  <tr key={item.id} className="border-t border-gray-800">
                    <td className="py-3">
                      <span className="mr-1">{item.categoria.icono}</span>
                      <span className="text-gray-200">{item.categoria.nombre}</span>
                      <div className="w-full bg-gray-800 rounded-full h-1 mt-1">
                        <div
                          className={`h-1 rounded-full ${pct > 90 ? "bg-red-500" : pct > 70 ? "bg-yellow-500" : "bg-indigo-500"}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3 text-right text-gray-300">{formatCOP(item.monto)}</td>
                    <td className="py-3 text-right text-gray-300">{formatCOP(item.gastado)}</td>
                    <td className={`py-3 text-right font-medium ${over ? "text-red-400" : "text-green-400"}`}>
                      {over ? "-" : "+"}{formatCOP(Math.abs(dif))}
                    </td>
                    <td className={`py-3 text-right ${pct > 90 ? "text-red-400" : pct > 70 ? "text-yellow-400" : "text-gray-400"}`}>
                      {pct.toFixed(0)}%
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-gray-600 hover:text-red-400 transition-colors text-xs"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
