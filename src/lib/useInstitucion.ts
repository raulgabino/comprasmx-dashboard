"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { SummaryData, InstitucionIndexEntry } from "./types";

export function useInstitucionesIndex() {
  const [instituciones, setInstituciones] = useState<InstitucionIndexEntry[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/instituciones-index.json")
      .then((r) => r.json())
      .then((d) => {
        setInstituciones(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { instituciones, loading };
}

export function useInstitucion() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("inst") || "";
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/data/summary-inst-${slug}.json`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setData(null); setLoading(false); });
  }, [slug]);

  return { data: slug ? data : null, loading, slug };
}
