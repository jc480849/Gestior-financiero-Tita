"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCOP, formatDate } from "@/lib/format";
import { TIPO_ACTIVO_LABEL, TIPO_META_LABEL } from "@/lib/constants";

interface Activo { id: number; nombre: string; tipo: string; valorActual: number; createdAt: string }
interface Meta { id: number; nombre: string; tipo: string; montoMeta: number; montoActual: number; fechaMeta?: string }

export default function ActivosPage() {
  const [activos, setActivos] = useState<Activo[]>([]);
  const [metas, setMetas] = useState<Meta[]>([]);
  const [totalDeuda, setTotalDeuda] = useState(0);
  const [showActivoForm, setShowActivoForm] = useState(false);
  const [showMetaForm, setShowMetaForm] = useState(false);
  const [editActivo, setEditActivo] = useState<{ id: number; valor: string } | null>(null);
  const [activoForm, setActivoForm] = useState({ nombre: "", tipo: "INVERSION", valorActual: "" });
  const [metaForm, setMetaForm] = useState({ nombre: "", tipo: "AHORRO", montoMeta: "", montoActual: "", fechaMeta: "" });

  const fetchAll = useCallback(async () => {
    const [a, m, d] = await Promise.all([
      fetch("/api/activos").then((r) => r.json()),
      fetch("/api/metas").then((r) => r.json()),
      fetch("/api/deudas").then((r) => r.json()),
    ]);
    setActivos(a);
    setMetas(m);
    setTotalDeuda(d.reduce((s: number, d: { montoActual: number }) => s + d.montoActual, 0));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function handleAddActivo(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/activos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(activoForm) });
    setActivoForm({ nombre: "", tipo: "INVERSION", valorActual: "" });
    setShowActivoForm(false);
    fetchAll();
  }

  async function handleUpdateActivo(e: React.FormEvent) {
    e.preventDefault();
    if (!editActivo) return;
    await fetch(`/api/activos?id=${editActivo.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ valorActual: editActivo.valor }) });
    setEditActivo(null);
    fetchAll();
  }

  async function handleDeleteActivo(id: number) {
    await fetch(`/api/activos?id=${id}`, { method: "DELETE" });
    fetchAll();
  }

  async function handleAddMeta(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/metas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(metaForm) });
    setMetaForm({ nombre: "", tipo: "AHORRO", montoMeta: "", montoActual: "", fechaMeta: "" });
    setShowMetaForm(false);
    fetchAll();
  }

  async function handleDeleteMeta(id: number) {
    await fetch(`/api/metas?id=${id}`, { method: "DELETE" });
    fetchAll();
  }

  const totalActivos = activos.reduce((s, a) => s + a.valorActual, 0);
  const patrimonioNeto = totalActivos - totalDeuda;

  const porTipo = activos.reduce((acc, a) => {
    acc[a.tipo] = (acc[a.tipo] ?? 0) + a.valorActual;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-6">💎 Activos & Metas</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total activos" value={totalActivos} icon="📦" color="blue" />
        <StatCard label="Total deudas" value={totalDeuda} icon="💳" color="red" />
        <StatCard label="Patrimonio neto" value={patrimonioNeto} icon="💎" color={patrimonioNeto >= 0 ? "green" : "red"} />
      </div>

      {/* Activos */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-300">Activos</h2>
          <button onClick={() => setShowActivoForm(!showActivoForm)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg text-xs font-medium">
            + Agregar
          </button>
        </div>

        {showActivoForm && (
          <Card className="mb-3">
            <form onSubmit={handleAddActivo} className="flex gap-3 flex-wrap items-end">
              <input className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white flex-1" placeholder="Nombre" value={activoForm.nombre} onChange={(e) => setActivoForm((p) => ({ ...p, nombre: e.target.value }))} required />
              <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" value={activoForm.tipo} onChange={(e) => setActivoForm((p) => ({ ...p, tipo: e.target.value }))}>
                {Object.entries(TIPO_ACTIVO_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <input type="number" min="0" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white w-36" placeholder="Valor" value={activoForm.valorActual} onChange={(e) => setActivoForm((p) => ({ ...p, valorActual: e.target.value }))} required />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm">Guardar</button>
              <button type="button" onClick={() => setShowActivoForm(false)} className="text-gray-400 hover:text-white text-sm">Cancelar</button>
            </form>
          </Card>
        )}

        {editActivo && (
          <Card className="mb-3 border-indigo-800">
            <form onSubmit={handleUpdateActivo} className="flex gap-3 items-end">
              <span className="text-sm text-gray-400">Actualizar valor:</span>
              <input type="number" min="0" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white w-36" value={editActivo.valor} onChange={(e) => setEditActivo((p) => p ? { ...p, valor: e.target.value } : null)} required />
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm">OK</button>
              <button type="button" onClick={() => setEditActivo(null)} className="text-gray-400 hover:text-white text-sm">✕</button>
            </form>
          </Card>
        )}

        <Card>
          {activos.length === 0 ? (
            <EmptyState icon="💎" title="Sin activos registrados" description="Agrega efectivo, inversiones, bienes raíces, etc." />
          ) : (
            <>
              {activos.map((a) => {
                const pctTotal = totalActivos > 0 ? (a.valorActual / totalActivos) * 100 : 0;
                return (
                  <div key={a.id} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-100">{a.nombre}</p>
                      <p className="text-xs text-gray-500">{TIPO_ACTIVO_LABEL[a.tipo]} · {pctTotal.toFixed(1)}% del total</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-blue-400">{formatCOP(a.valorActual)}</span>
                      <button onClick={() => setEditActivo({ id: a.id, valor: String(a.valorActual) })} className="text-xs text-gray-500 hover:text-indigo-400">✏️</button>
                      <button onClick={() => handleDeleteActivo(a.id)} className="text-gray-600 hover:text-red-400 text-sm">✕</button>
                    </div>
                  </div>
                );
              })}
              <div className="pt-3 border-t border-gray-700 mt-2">
                {Object.entries(porTipo).map(([tipo, val]) => (
                  <div key={tipo} className="flex justify-between text-xs text-gray-500 py-0.5">
                    <span>{TIPO_ACTIVO_LABEL[tipo]}</span>
                    <span>{formatCOP(val)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Metas */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-300">Metas financieras</h2>
          <button onClick={() => setShowMetaForm(!showMetaForm)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg text-xs font-medium">
            + Agregar meta
          </button>
        </div>

        {showMetaForm && (
          <Card className="mb-3">
            <form onSubmit={handleAddMeta} className="grid grid-cols-2 gap-3">
              <input className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white col-span-2" placeholder="Nombre de la meta" value={metaForm.nombre} onChange={(e) => setMetaForm((p) => ({ ...p, nombre: e.target.value }))} required />
              <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" value={metaForm.tipo} onChange={(e) => setMetaForm((p) => ({ ...p, tipo: e.target.value }))}>
                {Object.entries(TIPO_META_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <input type="number" min="0" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" placeholder="Meta ($)" value={metaForm.montoMeta} onChange={(e) => setMetaForm((p) => ({ ...p, montoMeta: e.target.value }))} required />
              <input type="number" min="0" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" placeholder="Acumulado ($)" value={metaForm.montoActual} onChange={(e) => setMetaForm((p) => ({ ...p, montoActual: e.target.value }))} />
              <input type="date" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" value={metaForm.fechaMeta} onChange={(e) => setMetaForm((p) => ({ ...p, fechaMeta: e.target.value }))} />
              <div className="col-span-2 flex gap-2 justify-end">
                <button type="button" onClick={() => setShowMetaForm(false)} className="text-gray-400 hover:text-white text-sm px-3 py-2">Cancelar</button>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm">Guardar</button>
              </div>
            </form>
          </Card>
        )}

        <Card>
          {metas.length === 0 ? (
            <EmptyState icon="🎯" title="Sin metas" description="Define tus objetivos financieros" />
          ) : (
            metas.map((m) => {
              const pct = m.montoMeta > 0 ? Math.min((m.montoActual / m.montoMeta) * 100, 100) : 0;
              return (
                <div key={m.id} className="py-3 border-b border-gray-800 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="text-sm font-medium text-gray-100">{m.nombre}</span>
                      <span className="ml-2 text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">{TIPO_META_LABEL[m.tipo]}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">{formatCOP(m.montoActual)} / {formatCOP(m.montoMeta)}</span>
                      <button onClick={() => handleDeleteMeta(m.id)} className="text-gray-600 hover:text-red-400 text-sm">✕</button>
                    </div>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${pct >= 100 ? "bg-green-500" : "bg-indigo-500"}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-0.5">
                    <span>{pct.toFixed(0)}% completado</span>
                    {m.fechaMeta && <span>Meta: {formatDate(m.fechaMeta)}</span>}
                  </div>
                </div>
              );
            })
          )}
        </Card>
      </div>
    </div>
  );
}
