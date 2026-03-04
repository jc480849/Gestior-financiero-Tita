"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";

interface Config {
  nombreUsuario: string;
  moneda: string;
  tasaRetornoEsperada: number;
  tasaInflacion: number;
  edadActual: number | null;
  edadRetiro: number | null;
  gastoMensualDeseado: number | null;
}

export default function ConfiguracionPage() {
  const [form, setForm] = useState<Config>({
    nombreUsuario: "",
    moneda: "COP",
    tasaRetornoEsperada: 0.07,
    tasaInflacion: 0.04,
    edadActual: null,
    edadRetiro: null,
    gastoMensualDeseado: null,
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/configuracion")
      .then((r) => r.json())
      .then((data) => { setForm(data); setLoading(false); });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/configuracion", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        tasaRetornoEsperada: parseFloat(String(form.tasaRetornoEsperada)),
        tasaInflacion: parseFloat(String(form.tasaInflacion)),
        edadActual: form.edadActual ? parseInt(String(form.edadActual)) : null,
        edadRetiro: form.edadRetiro ? parseInt(String(form.edadRetiro)) : null,
        gastoMensualDeseado: form.gastoMensualDeseado ? parseFloat(String(form.gastoMensualDeseado)) : null,
      }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function set(key: keyof Config, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  if (loading) return <div className="text-gray-500 text-sm">Cargando...</div>;

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold text-white mb-6">⚙️ Configuración</h1>

      <form onSubmit={handleSave} className="space-y-5">
        <Card>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Perfil</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Nombre</label>
              <input
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                value={form.nombreUsuario}
                onChange={(e) => set("nombreUsuario", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Moneda</label>
              <select
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                value={form.moneda}
                onChange={(e) => set("moneda", e.target.value)}
              >
                <option value="COP">COP — Peso colombiano</option>
                <option value="USD">USD — Dólar estadounidense</option>
                <option value="EUR">EUR — Euro</option>
                <option value="MXN">MXN — Peso mexicano</option>
              </select>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Parámetros financieros</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Tasa retorno esperada (anual)</label>
              <div className="relative">
                <input
                  type="number" step="0.001" min="0" max="1"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  value={form.tasaRetornoEsperada}
                  onChange={(e) => set("tasaRetornoEsperada", e.target.value)}
                />
                <span className="absolute right-3 top-2 text-xs text-gray-500">
                  {(Number(form.tasaRetornoEsperada) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Tasa inflación (anual)</label>
              <div className="relative">
                <input
                  type="number" step="0.001" min="0" max="1"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  value={form.tasaInflacion}
                  onChange={(e) => set("tasaInflacion", e.target.value)}
                />
                <span className="absolute right-3 top-2 text-xs text-gray-500">
                  {(Number(form.tasaInflacion) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Edad actual</label>
              <input
                type="number" min="0" max="120"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                value={form.edadActual ?? ""}
                onChange={(e) => set("edadActual", e.target.value)}
                placeholder="—"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Edad de retiro</label>
              <input
                type="number" min="0" max="120"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                value={form.edadRetiro ?? ""}
                onChange={(e) => set("edadRetiro", e.target.value)}
                placeholder="—"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Gasto mensual deseado en retiro</label>
              <input
                type="number" min="0"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                value={form.gastoMensualDeseado ?? ""}
                onChange={(e) => set("gastoMensualDeseado", e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
        </Card>

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
        >
          {saved ? "✅ Guardado" : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
