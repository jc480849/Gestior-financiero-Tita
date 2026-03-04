"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { TransactionRow } from "@/components/ui/TransactionRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { MonthPicker } from "@/components/ui/MonthPicker";
import { currentMes } from "@/lib/format";

interface Categoria { id: number; nombre: string; tipo: string; icono?: string; color?: string }
interface Cuenta { id: number; nombre: string }
interface MetodoPago { id: number; nombre: string }
interface Transaccion {
  id: number; tipo: string; descripcion: string; monto: number; fecha: string;
  categoria: Categoria; cuenta?: Cuenta; nota?: string;
}

const TIPOS = [
  { value: "", label: "Todos" },
  { value: "INGRESO", label: "Ingresos" },
  { value: "GASTO", label: "Gastos" },
  { value: "TRANSFERENCIA", label: "Transferencias" },
];

export default function TransaccionesPage() {
  const [mes, setMes] = useState(currentMes());
  const [tipo, setTipo] = useState("");
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [total, setTotal] = useState(0);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [metodos, setMetodos] = useState<MetodoPago[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    tipo: "GASTO", descripcion: "", monto: "", fecha: new Date().toISOString().split("T")[0],
    categoriaId: "", cuentaId: "", metodoPagoId: "", nota: "",
  });

  const fetchTransacciones = useCallback(async () => {
    const params = new URLSearchParams({ mes });
    if (tipo) params.set("tipo", tipo);
    const r = await fetch(`/api/transacciones?${params}`);
    const data = await r.json();
    setTransacciones(data.transacciones);
    setTotal(data.total);
  }, [mes, tipo]);

  useEffect(() => { fetchTransacciones(); }, [fetchTransacciones]);

  useEffect(() => {
    fetch("/api/categorias").then((r) => r.json()).then(setCategorias);
    fetch("/api/cuentas").then((r) => r.json()).then(setCuentas);
    fetch("/api/metodos-pago").then((r) => r.json()).then(setMetodos);
  }, []);

  const categoriasFiltered = categorias.filter(
    (c) => !form.tipo || c.tipo === form.tipo || c.tipo === "TRANSFERENCIA"
  );

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.descripcion || !form.monto || !form.categoriaId) return;
    await fetch("/api/transacciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ tipo: "GASTO", descripcion: "", monto: "", fecha: new Date().toISOString().split("T")[0], categoriaId: "", cuentaId: "", metodoPagoId: "", nota: "" });
    setShowForm(false);
    fetchTransacciones();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/transacciones?id=${id}`, { method: "DELETE" });
    fetchTransacciones();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-xl font-bold text-white">💳 Transacciones</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <MonthPicker value={mes} onChange={setMes} />
          <div className="flex gap-1">
            {TIPOS.map((t) => (
              <button
                key={t.value}
                onClick={() => setTipo(t.value)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  tipo === t.value ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            + Nueva
          </button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Nueva transacción</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <select
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
              value={form.tipo}
              onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value, categoriaId: "" }))}
            >
              <option value="GASTO">Gasto</option>
              <option value="INGRESO">Ingreso</option>
              <option value="TRANSFERENCIA">Transferencia</option>
            </select>
            <input
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white col-span-2 md:col-span-1"
              placeholder="Descripción"
              value={form.descripcion}
              onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
              required
            />
            <input
              type="number" min="0" step="any"
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
              placeholder="Monto"
              value={form.monto}
              onChange={(e) => setForm((p) => ({ ...p, monto: e.target.value }))}
              required
            />
            <input
              type="date"
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
              value={form.fecha}
              onChange={(e) => setForm((p) => ({ ...p, fecha: e.target.value }))}
            />
            <select
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
              value={form.categoriaId}
              onChange={(e) => setForm((p) => ({ ...p, categoriaId: e.target.value }))}
              required
            >
              <option value="">Categoría</option>
              {categoriasFiltered.map((c) => (
                <option key={c.id} value={c.id}>{c.icono} {c.nombre}</option>
              ))}
            </select>
            <select
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
              value={form.cuentaId}
              onChange={(e) => setForm((p) => ({ ...p, cuentaId: e.target.value }))}
            >
              <option value="">Cuenta (opcional)</option>
              {cuentas.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            <select
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
              value={form.metodoPagoId}
              onChange={(e) => setForm((p) => ({ ...p, metodoPagoId: e.target.value }))}
            >
              <option value="">Método de pago (opcional)</option>
              {metodos.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
            <input
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white col-span-2 md:col-span-1"
              placeholder="Nota (opcional)"
              value={form.nota}
              onChange={(e) => setForm((p) => ({ ...p, nota: e.target.value }))}
            />
            <div className="col-span-2 md:col-span-3 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Guardar
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-500">{total} transacciones</p>
        </div>
        {transacciones.length === 0 ? (
          <EmptyState icon="💳" title="Sin transacciones" description="Agrega tu primera transacción del mes" />
        ) : (
          transacciones.map((t) => (
            <TransactionRow
              key={t.id}
              id={t.id}
              tipo={t.tipo as "INGRESO" | "GASTO" | "TRANSFERENCIA"}
              descripcion={t.descripcion}
              monto={t.monto}
              fecha={t.fecha}
              categoriaNombre={t.categoria.nombre}
              categoriaIcono={t.categoria.icono}
              cuentaNombre={t.cuenta?.nombre}
              nota={t.nota}
              onDelete={handleDelete}
            />
          ))
        )}
      </Card>
    </div>
  );
}
