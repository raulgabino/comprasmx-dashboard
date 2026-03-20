export const CHART_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#14b8a6", "#a855f7",
  "#6366f1", "#84cc16", "#e11d48", "#0ea5e9", "#d946ef",
  "#22c55e", "#eab308", "#7c3aed", "#f43f5e", "#2dd4bf",
];

export const TIPO_PROC_COLORS: Record<string, string> = {
  "Licitación Pública": "#10b981",
  "Adjudicación Directa": "#ef4444",
  "Invitación a 3 Personas": "#f59e0b",
  "Entre Entes Públicos": "#8b5cf6",
  "Otro": "#6b7280",
};

export const YEARS = [2023, 2024, 2025, 2026] as const;
export type Year = (typeof YEARS)[number] | "todos";

export const YEAR_FILE_MAP: Record<number, string> = {
  2023: "datos_contratos_2023.json",
  2024: "datos_contratos_2024.json",
  2025: "datos_contratos_2025.json",
  2026: "datos_contratos.json",
};
