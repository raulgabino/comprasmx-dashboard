"use client";

import { useState, useEffect, useRef } from "react";

interface ContractDetail {
  inst: string;
  tipoProc: string;
  tipoContrat: string;
  monto: number;
  proveedor: string;
  rfc: string;
  titulo: string;
  fechaFirma: string;
  url: string;
  anio: number;
}

export interface ProveedorResult {
  proveedor: string;
  rfc: string;
  montoTotal: number;
  totalContratos: number;
  instituciones: string[];
  anios: number[];
  estrat: string;
  contratos: ContractDetail[];
}

export function useProveedorSearch(query: string) {
  const [results, setResults] = useState<ProveedorResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const trimmed = query.trim();
    if (trimmed.length < 3) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/proveedores?q=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        setResults(data.results || []);
        setError(null);
      } catch {
        setError("Error al buscar proveedores");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  return { results, loading, error };
}
