"use client";

import { useState } from "react";
import type { OutlierRecord } from "@/lib/types";
import { formatMXN } from "@/lib/formatters";

interface DataQualityNotesProps {
  notes: string[];
  outliers: OutlierRecord[];
  registrosExcluidos: number;
}

export default function DataQualityNotes({ notes, outliers, registrosExcluidos }: DataQualityNotesProps) {
  const [open, setOpen] = useState(false);

  if (notes.length === 0 && outliers.length === 0) return null;

  const confirmedOutliers = outliers.filter((o) => o.tipo === "error_confirmado");
  const reviewOutliers = outliers.filter((o) => o.tipo === "revisar");

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 text-sm text-gray-400 hover:text-gray-200 transition-colors"
      >
        <span className="flex items-center gap-2">
          <span className="text-yellow-500">&#9888;</span>
          Notas de calidad de datos
          {registrosExcluidos > 0 && (
            <span className="text-xs bg-yellow-900/40 text-yellow-400 px-2 py-0.5 rounded-full">
              {registrosExcluidos} registro{registrosExcluidos > 1 ? "s" : ""} excluido{registrosExcluidos > 1 ? "s" : ""} por anomalía
            </span>
          )}
        </span>
        <span className={`transition-transform ${open ? "rotate-180" : ""}`}>&#9660;</span>
      </button>

      {open && (
        <div className="px-5 pb-4 space-y-4 border-t border-gray-800">
          {/* General notes */}
          {notes.length > 0 && (
            <div className="pt-3">
              <ul className="space-y-1">
                {notes.map((n, i) => (
                  <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                    <span className="text-gray-600 mt-0.5">&#8226;</span>
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Confirmed outliers */}
          {confirmedOutliers.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-red-400 uppercase tracking-wider mb-2">
                Anomalías confirmadas (excluidas del análisis)
              </h4>
              {confirmedOutliers.map((o, i) => (
                <div key={i} className="bg-red-900/10 border border-red-900/30 rounded-lg p-3 mb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-200">{o.proveedor}</p>
                      <p className="text-xs text-gray-500">{o.inst} &middot; {o.rfc} &middot; {o.estrat}</p>
                    </div>
                    <p className="text-sm font-mono text-red-400">{formatMXN(o.monto)}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{o.nota}</p>
                </div>
              ))}
            </div>
          )}

          {/* Review outliers */}
          {reviewOutliers.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-yellow-400 uppercase tracking-wider mb-2">
                Contratos con montos atípicos (incluidos, pendientes de revisión)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-500 border-b border-gray-800">
                      <th className="text-left py-1.5 px-2">Proveedor</th>
                      <th className="text-left py-1.5 px-2">Inst</th>
                      <th className="text-left py-1.5 px-2">Estrat.</th>
                      <th className="text-right py-1.5 px-2">Monto</th>
                      <th className="text-left py-1.5 px-2">Nota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviewOutliers.map((o, i) => (
                      <tr key={i} className="border-b border-gray-800/50">
                        <td className="py-1.5 px-2 text-gray-300 max-w-[200px] truncate">{o.proveedor}</td>
                        <td className="py-1.5 px-2 text-gray-400">{o.inst}</td>
                        <td className="py-1.5 px-2 text-gray-400">{o.estrat}</td>
                        <td className="py-1.5 px-2 text-right text-yellow-400 font-mono">{formatMXN(o.monto)}</td>
                        <td className="py-1.5 px-2 text-gray-500 max-w-[200px] truncate">{o.nota}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
