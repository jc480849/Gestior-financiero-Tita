import { Card } from "./Card";
import { formatCOP } from "@/lib/format";

interface StatCardProps {
  label: string;
  value: number;
  icon?: string;
  color?: "green" | "red" | "blue" | "purple" | "yellow" | "default";
  format?: "currency" | "number" | "percent";
  subtitle?: string;
}

const colorClasses = {
  green: "text-green-400",
  red: "text-red-400",
  blue: "text-blue-400",
  purple: "text-purple-400",
  yellow: "text-yellow-400",
  default: "text-white",
};

export function StatCard({ label, value, icon, color = "default", format = "currency", subtitle }: StatCardProps) {
  let display: string;
  if (format === "currency") {
    display = formatCOP(value);
  } else if (format === "percent") {
    display = `${value.toFixed(1)}%`;
  } else {
    display = value.toLocaleString("es-CO");
  }

  return (
    <Card>
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-lg">{icon}</span>}
        <span className="text-xs text-gray-400 uppercase tracking-wide">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${colorClasses[color]}`}>{display}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </Card>
  );
}
