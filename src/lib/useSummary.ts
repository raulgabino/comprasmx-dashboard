"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { SummaryData } from "./types";

export function useSummary() {
  const searchParams = useSearchParams();
  const anio = searchParams.get("anio") || "todos";
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/data/summary-${anio}.json`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [anio]);

  return { data, loading, anio };
}
