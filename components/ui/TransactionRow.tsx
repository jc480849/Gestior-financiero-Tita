import { formatCOP, formatDate } from "@/lib/format";

interface TransactionRowProps {
  id: number;
  tipo: "INGRESO" | "GASTO" | "TRANSFERENCIA";
  descripcion: string;
  monto: number;
  fecha: string | Date;
  categoriaNombre: string;
  categoriaIcono?: string | null;
  cuentaNombre?: string | null;
  nota?: string | null;
  onDelete?: (id: number) => void;
}

export function TransactionRow({
  id,
  tipo,
  descripcion,
  monto,
  fecha,
  categoriaNombre,
  categoriaIcono,
  cuentaNombre,
  onDelete,
}: TransactionRowProps) {
  const isIngreso = tipo === "INGRESO";
  const isTransferencia = tipo === "TRANSFERENCIA";

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-xl flex-shrink-0">{categoriaIcono ?? (isIngreso ? "💰" : "💸")}</span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-100 truncate">{descripcion}</p>
          <p className="text-xs text-gray-500">
            {categoriaNombre}
            {cuentaNombre && ` · ${cuentaNombre}`}
            {" · "}
            {formatDate(fecha)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span
          className={`text-sm font-semibold ${
            isIngreso ? "text-green-400" : isTransferencia ? "text-blue-400" : "text-red-400"
          }`}
        >
          {isIngreso ? "+" : isTransferencia ? "↔" : "-"}
          {formatCOP(monto)}
        </span>
        {onDelete && (
          <button
            onClick={() => onDelete(id)}
            className="text-gray-600 hover:text-red-400 transition-colors text-sm"
            title="Eliminar"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
