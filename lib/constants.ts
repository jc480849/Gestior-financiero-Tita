export const CHART_COLORS = [
  "#6366f1", "#f97316", "#22c55e", "#ef4444", "#3b82f6",
  "#ec4899", "#f59e0b", "#14b8a6", "#8b5cf6", "#84cc16",
  "#06b6d4", "#a855f7", "#64748b",
];

export const TIPO_MOVIMIENTO_LABEL: Record<string, string> = {
  INGRESO: "Ingreso",
  GASTO: "Gasto",
  TRANSFERENCIA: "Transferencia",
};

export const TIPO_CUENTA_LABEL: Record<string, string> = {
  EFECTIVO: "Efectivo",
  AHORRO: "Ahorro",
  CORRIENTE: "Corriente",
  INVERSION: "Inversión",
  CREDITO: "Crédito",
};

export const TIPO_DEUDA_LABEL: Record<string, string> = {
  DEUDA_PROPIA: "Deuda propia",
  DEUDA_AJENA: "Deuda de tercero",
};

export const TIPO_ACTIVO_LABEL: Record<string, string> = {
  EFECTIVO: "Efectivo",
  INVERSION: "Inversión",
  BIEN_RAIZ: "Bien raíz",
  VEHICULO: "Vehículo",
  NEGOCIO: "Negocio",
  OTRO: "Otro",
};

export const TIPO_META_LABEL: Record<string, string> = {
  AHORRO: "Ahorro",
  RETIRO: "Retiro",
  EMERGENCIA: "Emergencia",
  VIAJE: "Viaje",
  OTRO: "Otro",
};

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/transacciones", label: "Transacciones", icon: "💳" },
  { href: "/presupuesto", label: "Presupuesto", icon: "📋" },
  { href: "/deudas", label: "Deudas", icon: "🏦" },
  { href: "/activos", label: "Activos", icon: "💎" },
  { href: "/analisis", label: "Análisis", icon: "📈" },
  { href: "/proyecciones", label: "Proyecciones", icon: "🔭" },
  { href: "/configuracion", label: "Configuración", icon: "⚙️" },
];
