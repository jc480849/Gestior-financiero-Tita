"use client";

import { useState, useEffect, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const CATEGORIAS_GASTO = [
  "Alimentacion",
  "Transporte",
  "Entretenimiento",
  "Salud",
  "Ropa",
  "Hogar",
  "Educacion",
  "Otros",
];

const CATEGORIAS_INGRESO = [
  "Salario",
  "Freelance",
  "Negocio",
  "Inversiones",
  "Regalo",
  "Otros",
];

const COLORES = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
  "#f97316",
  "#64748b",
];

interface Movimiento {
  id: number;
  descripcion: string;
  monto: number;
  categoria: string;
  fecha: string;
}

function getSemanaActual() {
  const now = new Date();
  const year = now.getFullYear();
  const start = new Date(year, 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const week = Math.ceil((diff / oneWeek + start.getDay() / 7));
  return `${year}-W${String(week).padStart(2, "0")}`;
}

export default function Home() {
  const [nombre, setNombre] = useState<string | null>(null);
  const [nombreInput, setNombreInput] = useState("");
  const [tab, setTab] = useState<"gastos" | "ingresos">("gastos");
  const [gastos, setGastos] = useState<Movimiento[]>([]);
  const [ingresos, setIngresos] = useState<Movimiento[]>([]);
  const [presupuesto, setPresupuesto] = useState<number | null>(null);
  const [semana, setSemana] = useState(getSemanaActual());
  const [formGasto, setFormGasto] = useState({
    descripcion: "",
    monto: "",
    categoria: "Alimentacion",
    fecha: new Date().toISOString().split("T")[0],
  });
  const [formIngreso, setFormIngreso] = useState({
    descripcion: "",
    monto: "",
    categoria: "Salario",
    fecha: new Date().toISOString().split("T")[0],
  });
  const [presupuestoInput, setPresupuestoInput] = useState("");
  const [editandoPresupuesto, setEditandoPresupuesto] = useState(false);

  const cargarDatos = useCallback(async () => {
    const [gastosRes, ingresosRes, presupuestoRes] = await Promise.all([
      fetch(`/api/gastos?semana=${semana}`),
      fetch(`/api/ingresos?semana=${semana}`),
      fetch(`/api/presupuesto?semana=${semana}`),
    ]);
    const gastosData = await gastosRes.json();
    const ingresosData = await ingresosRes.json();
    const presupuestoData = await presupuestoRes.json();
    setGastos(gastosData);
    setIngresos(ingresosData);
    setPresupuesto(presupuestoData?.monto ?? null);
    setPresupuestoInput(presupuestoData?.monto?.toString() ?? "");
  }, [semana]);

  useEffect(() => {
    const guardado = localStorage.getItem("nombre");
    if (guardado) setNombre(guardado);
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const guardarNombre = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreInput.trim()) return;
    localStorage.setItem("nombre", nombreInput.trim());
    setNombre(nombreInput.trim());
  };

  const agregarGasto = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/gastos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formGasto),
    });
    setFormGasto({ descripcion: "", monto: "", categoria: "Alimentacion", fecha: new Date().toISOString().split("T")[0] });
    cargarDatos();
  };

  const agregarIngreso = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/ingresos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formIngreso),
    });
    setFormIngreso({ descripcion: "", monto: "", categoria: "Salario", fecha: new Date().toISOString().split("T")[0] });
    cargarDatos();
  };

  const eliminarGasto = async (id: number) => {
    await fetch(`/api/gastos?id=${id}`, { method: "DELETE" });
    cargarDatos();
  };

  const eliminarIngreso = async (id: number) => {
    await fetch(`/api/ingresos?id=${id}`, { method: "DELETE" });
    cargarDatos();
  };

  const guardarPresupuesto = async () => {
    await fetch("/api/presupuesto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ semana, monto: presupuestoInput }),
    });
    setEditandoPresupuesto(false);
    cargarDatos();
  };

  const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0);
  const totalIngresos = ingresos.reduce((sum, i) => sum + i.monto, 0);
  const balance = totalIngresos - totalGastos;
  const restante = presupuesto !== null ? presupuesto - totalGastos : null;
  const porcentaje = presupuesto ? Math.min((totalGastos / presupuesto) * 100, 100) : 0;

  const datosPorCategoriaGasto = CATEGORIAS_GASTO.map((cat) => ({
    name: cat,
    value: gastos.filter((g) => g.categoria === cat).reduce((s, g) => s + g.monto, 0),
  })).filter((d) => d.value > 0);

  const datosPorCategoriaIngreso = CATEGORIAS_INGRESO.map((cat) => ({
    name: cat,
    value: ingresos.filter((i) => i.categoria === cat).reduce((s, i) => s + i.monto, 0),
  })).filter((d) => d.value > 0);

  if (nombre === null) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold text-indigo-400 mb-2">Gestor Financiero</h1>
          <p className="text-gray-400 mb-6">¿Cómo te llamas?</p>
          <form onSubmit={guardarNombre} className="space-y-4">
            <input
              type="text"
              placeholder="Tu nombre"
              value={nombreInput}
              onChange={(e) => setNombreInput(e.target.value)}
              autoFocus
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center text-lg"
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Entrar
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-indigo-400">
              Gestor Financiero
              <span className="text-white font-normal"> — {nombre}</span>
            </h1>
            <p className="text-gray-400 mt-1">Organiza tus finanzas semanales</p>
          </div>
          <button
            onClick={() => { localStorage.removeItem("nombre"); setNombre(null); setNombreInput(""); }}
            className="text-gray-500 hover:text-gray-300 text-xs"
          >
            cambiar nombre
          </button>
        </div>

        {/* Selector de semana */}
        <div className="flex items-center gap-3 mb-6">
          <label className="text-gray-400 text-sm">Semana:</label>
          <input
            type="week"
            value={semana}
            onChange={(e) => setSemana(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Tarjetas resumen */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Ingresos</p>
            <p className="text-2xl font-bold text-green-400">${totalIngresos.toLocaleString("es-CO")}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Gastos</p>
            <p className="text-2xl font-bold text-red-400">${totalGastos.toLocaleString("es-CO")}</p>
          </div>
          <div className={`rounded-xl p-5 border ${balance < 0 ? "bg-red-900/30 border-red-700" : "bg-gray-800 border-gray-700"}`}>
            <p className="text-gray-400 text-sm mb-1">Balance</p>
            <p className={`text-2xl font-bold ${balance < 0 ? "text-red-400" : "text-white"}`}>
              ${balance.toLocaleString("es-CO")}
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Presupuesto</p>
            {editandoPresupuesto ? (
              <div className="flex gap-1 mt-1">
                <input
                  type="number"
                  value={presupuestoInput}
                  onChange={(e) => setPresupuestoInput(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white w-24 text-sm"
                  placeholder="Monto"
                />
                <button onClick={guardarPresupuesto} className="bg-indigo-600 hover:bg-indigo-700 px-2 py-1 rounded text-xs">OK</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-white">
                  {presupuesto !== null ? `$${presupuesto.toLocaleString("es-CO")}` : "—"}
                </p>
                <button onClick={() => setEditandoPresupuesto(true)} className="text-indigo-400 hover:text-indigo-300 text-xs">editar</button>
              </div>
            )}
          </div>
        </div>

        {/* Barra de presupuesto */}
        {presupuesto !== null && (
          <div className="mb-6 bg-gray-800 rounded-xl p-5 border border-gray-700">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Uso del presupuesto</span>
              <span>{porcentaje.toFixed(0)}% — disponible: <span className={restante! < 0 ? "text-red-400" : "text-green-400"}>${restante!.toLocaleString("es-CO")}</span></span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${porcentaje >= 90 ? "bg-red-500" : porcentaje >= 70 ? "bg-yellow-500" : "bg-indigo-500"}`}
                style={{ width: `${porcentaje}%` }}
              />
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-800 rounded-xl p-1 w-fit border border-gray-700">
          <button
            onClick={() => setTab("gastos")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "gastos" ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"}`}
          >
            Gastos
          </button>
          <button
            onClick={() => setTab("ingresos")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "ingresos" ? "bg-green-600 text-white" : "text-gray-400 hover:text-white"}`}
          >
            Ingresos
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario */}
          {tab === "gastos" ? (
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <h2 className="text-lg font-semibold mb-4">Nuevo gasto</h2>
              <form onSubmit={agregarGasto} className="space-y-3">
                <input type="text" placeholder="Descripcion" value={formGasto.descripcion}
                  onChange={(e) => setFormGasto({ ...formGasto, descripcion: e.target.value })} required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500" />
                <input type="number" placeholder="Monto" value={formGasto.monto}
                  onChange={(e) => setFormGasto({ ...formGasto, monto: e.target.value })} required min="0" step="any"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500" />
                <select value={formGasto.categoria} onChange={(e) => setFormGasto({ ...formGasto, categoria: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                  {CATEGORIAS_GASTO.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="date" value={formGasto.fecha} onChange={(e) => setFormGasto({ ...formGasto, fecha: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-colors">
                  Agregar gasto
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <h2 className="text-lg font-semibold mb-4">Nuevo ingreso</h2>
              <form onSubmit={agregarIngreso} className="space-y-3">
                <input type="text" placeholder="Descripcion" value={formIngreso.descripcion}
                  onChange={(e) => setFormIngreso({ ...formIngreso, descripcion: e.target.value })} required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500" />
                <input type="number" placeholder="Monto" value={formIngreso.monto}
                  onChange={(e) => setFormIngreso({ ...formIngreso, monto: e.target.value })} required min="0" step="any"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500" />
                <select value={formIngreso.categoria} onChange={(e) => setFormIngreso({ ...formIngreso, categoria: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500">
                  {CATEGORIAS_INGRESO.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="date" value={formIngreso.fecha} onChange={(e) => setFormIngreso({ ...formIngreso, fecha: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
                <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-colors">
                  Agregar ingreso
                </button>
              </form>
            </div>
          )}

          {/* Grafica */}
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4">
              {tab === "gastos" ? "Gastos por categoría" : "Ingresos por categoría"}
            </h2>
            {(tab === "gastos" ? datosPorCategoriaGasto : datosPorCategoriaIngreso).length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={tab === "gastos" ? datosPorCategoriaGasto : datosPorCategoriaIngreso}
                    dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                  >
                    {(tab === "gastos" ? datosPorCategoriaGasto : datosPorCategoriaIngreso).map((_, i) => (
                      <Cell key={i} fill={COLORES[i % COLORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `$${v.toLocaleString("es-CO")}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-500">
                Sin {tab === "gastos" ? "gastos" : "ingresos"} esta semana
              </div>
            )}
          </div>
        </div>

        {/* Lista */}
        <div className="mt-8 bg-gray-800 rounded-xl p-5 border border-gray-700">
          {tab === "gastos" ? (
            <>
              <h2 className="text-lg font-semibold mb-4">Gastos de la semana ({gastos.length})</h2>
              {gastos.length === 0 ? (
                <p className="text-gray-500 text-center py-6">No hay gastos registrados esta semana</p>
              ) : (
                <div className="space-y-2">
                  {gastos.map((g) => (
                    <div key={g.id} className="flex items-center justify-between bg-gray-700 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs bg-red-600/30 text-red-300 px-2 py-1 rounded">{g.categoria}</span>
                        <div>
                          <p className="text-sm font-medium">{g.descripcion}</p>
                          <p className="text-xs text-gray-400">{new Date(g.fecha).toLocaleDateString("es-CO")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-red-400">-${g.monto.toLocaleString("es-CO")}</span>
                        <button onClick={() => eliminarGasto(g.id)} className="text-gray-500 hover:text-red-400 text-xs">eliminar</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold mb-4">Ingresos de la semana ({ingresos.length})</h2>
              {ingresos.length === 0 ? (
                <p className="text-gray-500 text-center py-6">No hay ingresos registrados esta semana</p>
              ) : (
                <div className="space-y-2">
                  {ingresos.map((i) => (
                    <div key={i.id} className="flex items-center justify-between bg-gray-700 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs bg-green-600/30 text-green-300 px-2 py-1 rounded">{i.categoria}</span>
                        <div>
                          <p className="text-sm font-medium">{i.descripcion}</p>
                          <p className="text-xs text-gray-400">{new Date(i.fecha).toLocaleDateString("es-CO")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-green-400">+${i.monto.toLocaleString("es-CO")}</span>
                        <button onClick={() => eliminarIngreso(i.id)} className="text-gray-500 hover:text-red-400 text-xs">eliminar</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </main>
  );
}
