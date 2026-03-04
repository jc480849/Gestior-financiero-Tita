"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCOP, formatDate } from "@/lib/format";
import { TIPO_DEUDA_LABEL } from "@/lib/constants";

interface PagoDeuda { id: number; monto: number; fecha: string; nota?: string }
interface Deuda {
  id: number; nombre: string; tipo: string;
  montoOriginal: number; montoActual: number;
  tasaInteres: number; cuotaMensual?: number;
  fechaInicio: string; fechaVencimiento?: string;
  estrategia: string; pagos: PagoDeuda[];
}

export default function DeudasPage() {
  const [deudas, setDeudas] = useState<Deuda[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [pagoForm, setPagoForm] = useState<{ deudaId: number | null; monto: string; fecha: string; nota: string }>({
    deudaId: null, monto: "", fecha: new Date().toISOString().split("T")[0], nota: "",
  });
  const [form, setForm] = useState({
    nombre: "", tipo: "DEUDA_PROPIA", montoOriginal: "", montoActual: "",
    tasaInteres: "", cuotaMensual: "", fechaInicio: new Date().toISOString().split("T")[0],
    fechaVencimiento: "", estrategia: "AVALANCHE",
  });

  const fetchDeudas = useCallback(async () => {
    const r = await fetch("/api/deudas");
    setDeudas(await r.json());
  }, []);

  useEffect(() => { fetchDeudas(); }, [fetchDeudas]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/deudas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm({ nombre: "", tipo: "DEUDA_PROPIA", montoOriginal: "", montoActual: "", tasaInteres: "", cuotaMensual: "", fechaInicio: new Date().toISOString().split("T")[0], fechaVencimiento: "", estrategia: "AVALANCHE" });
    fetchDeudas();
  }

  async function handlePago(e: React.FormEvent) {
    e.preventDefault();
    if (!pagoForm.deudaId) return;
    await fetch(`/api/deudas/${pagoForm.deudaId}/pagos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ monto: pagoForm.monto, fecha: pagoForm.fecha, nota: pagoForm.nota }),
    });
    setPagoForm({ deudaId: null, monto: "", fecha: new Date().toISOString().split("T")[0], nota: "" });
    fetchDeudas();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/deudas?id=${id}`, { method: "DELETE" });
    fetchDeudas();
  }

  const totalDeuda = deudas.reduce((s, d) => s + d.montoActual, 0);
  const cuotaTotal = deudas.reduce((s, d) => s + (d.cuotaMensual ?? 0), 0);
  const deudaMasCara = deudas.reduce((max, d) => d.tasaInteres > (max?.tasaInteres ?? -1) ? d : max, null as Deuda | null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">🏦 Deudas</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
        >
          + Agregar deuda
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total deuda" value={totalDeuda} icon="💳" color="red" />
        <StatCard label="Cuota mensual" value={cuotaTotal} icon="📅" color="yellow" />
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <span>🔥</span>
            <span className="text-xs text-gray-400 uppercase tracking-wide">Más cara</span>
          </div>
          {deudaMasCara ? (
            <>
              <p className="text-sm font-bold text-orange-400 truncate">{deudaMasCara.nombre}</p>
              <p className="text-xs text-gray-500 mt-0.5">{deudaMasCara.tasaInteres}% tasa</p>
            </>
          ) : (
            <p className="text-sm text-gray-500">—</p>
          )}
        </div>
      </div>

      {showForm && (
        <Card className="mb-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Nueva deuda</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-2 gap-3">
            <input className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white col-span-2" placeholder="Nombre" value={form.nombre} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} required />
            <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" value={form.tipo} onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value }))}>
              <option value="DEUDA_PROPIA">Deuda propia</option>
              <option value="DEUDA_AJENA">Deuda de tercero</option>
            </select>
            <input type="number" min="0" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" placeholder="Monto original" value={form.montoOriginal} onChange={(e) => setForm((p) => ({ ...p, montoOriginal: e.target.value }))} required />
            <input type="number" min="0" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" placeholder="Saldo actual" value={form.montoActual} onChange={(e) => setForm((p) => ({ ...p, montoActual: e.target.value }))} />
            <input type="number" min="0" step="0.01" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" placeholder="Tasa interés % anual" value={form.tasaInteres} onChange={(e) => setForm((p) => ({ ...p, tasaInteres: e.target.value }))} />
            <input type="number" min="0" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" placeholder="Cuota mensual" value={form.cuotaMensual} onChange={(e) => setForm((p) => ({ ...p, cuotaMensual: e.target.value }))} />
            <input type="date" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" value={form.fechaInicio} onChange={(e) => setForm((p) => ({ ...p, fechaInicio: e.target.value }))} />
            <input type="date" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" placeholder="Fecha vencimiento" value={form.fechaVencimiento} onChange={(e) => setForm((p) => ({ ...p, fechaVencimiento: e.target.value }))} />
            <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" value={form.estrategia} onChange={(e) => setForm((p) => ({ ...p, estrategia: e.target.value }))}>
              <option value="AVALANCHE">Avalanche (mayor tasa primero)</option>
              <option value="SNOWBALL">Snowball (menor saldo primero)</option>
            </select>
            <div className="col-span-2 flex gap-2 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white text-sm px-3 py-2">Cancelar</button>
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Guardar</button>
            </div>
          </form>
        </Card>
      )}

      {pagoForm.deudaId && (
        <Card className="mb-5 border-indigo-800">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">
            Registrar pago — {deudas.find((d) => d.id === pagoForm.deudaId)?.nombre}
          </h2>
          <form onSubmit={handlePago} className="flex gap-3 flex-wrap">
            <input type="number" min="0" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white w-36" placeholder="Monto" value={pagoForm.monto} onChange={(e) => setPagoForm((p) => ({ ...p, monto: e.target.value }))} required />
            <input type="date" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" value={pagoForm.fecha} onChange={(e) => setPagoForm((p) => ({ ...p, fecha: e.target.value }))} />
            <input className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white flex-1" placeholder="Nota" value={pagoForm.nota} onChange={(e) => setPagoForm((p) => ({ ...p, nota: e.target.value }))} />
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Registrar</button>
            <button type="button" onClick={() => setPagoForm((p) => ({ ...p, deudaId: null }))} className="text-gray-400 hover:text-white text-sm px-2 py-2">✕</button>
          </form>
        </Card>
      )}

      {deudas.length === 0 ? (
        <Card><EmptyState icon="🎉" title="Sin deudas registradas" description="¡Excelente! Agrega deudas para hacer seguimiento" /></Card>
      ) : (
        <div className="space-y-3">
          {deudas.map((d) => {
            const pct = d.montoOriginal > 0 ? ((d.montoOriginal - d.montoActual) / d.montoOriginal) * 100 : 0;
            return (
              <Card key={d.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-white">{d.nombre}</p>
                      <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">{TIPO_DEUDA_LABEL[d.tipo]}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {d.tasaInteres}% anual
                      {d.cuotaMensual ? ` · Cuota: ${formatCOP(d.cuotaMensual)}/mes` : ""}
                      {" · "}Desde {formatDate(d.fechaInicio)}
                    </p>
                    <div className="w-full bg-gray-800 rounded-full h-1.5 mb-1">
                      <div className="h-1.5 rounded-full bg-green-500" style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Pagado: {formatCOP(d.montoOriginal - d.montoActual)} ({pct.toFixed(0)}%)</span>
                      <span className="text-red-400 font-medium">Saldo: {formatCOP(d.montoActual)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => setPagoForm({ deudaId: d.id, monto: "", fecha: new Date().toISOString().split("T")[0], nota: "" })}
                      className="text-xs bg-green-600/20 text-green-400 hover:bg-green-600/40 px-2 py-1 rounded"
                    >
                      Pago
                    </button>
                    <button onClick={() => handleDelete(d.id)} className="text-gray-600 hover:text-red-400 text-sm">✕</button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
