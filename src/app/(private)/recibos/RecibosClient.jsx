"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const BUCKET_ING = "ingresos_pdf";

// Buscar en carpeta del convenio el pdf que termina con _ingreso_{consecutivo}.pdf
async function findIngresoPdf(convenio, consecutivo) {
  // Lista la carpeta del convenio
  const { data: files, error } = await supabase.storage
    .from(BUCKET_ING)
    .list(convenio, { limit: 1000 });

  if (error || !files?.length) return null;
  const suffix = `_ingreso_${consecutivo}.pdf`;
  const match = files.find((f) => f.name.endsWith(suffix));
  if (!match) return null;

  const fullKey = `${convenio}/${match.name}`;
  const { data: signed } = await supabase.storage
    .from(BUCKET_ING)
    .createSignedUrl(fullKey, 60 * 10);

  return signed?.signedUrl ?? null;
}

export default function RecibosClient({ initialData }) {
  const [rows, setRows] = useState(initialData || []);
  const [urlMap, setUrlMap] = useState({});
  const [loading, setLoading] = useState(false);

  const grupos = useMemo(() => {
    const m = new Map();
    for (const r of rows) {
      if (!m.has(r.convenio)) m.set(r.convenio, []);
      m.get(r.convenio).push(r);
    }
    return Array.from(m.entries());
  }, [rows]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const next = {};
      for (const r of rows) {
        const url = await findIngresoPdf(r.convenio, r.consecutivo);
        if (cancelled) return;
        next[`${r.convenio}#${r.consecutivo}`] = url;
      }
      setUrlMap(next);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [rows]);

  return (
    <div className="space-y-8">
      {grupos.length === 0 && <p className="text-gray-600">No hay ingresos registrados.</p>}

      {grupos.map(([convenio, items]) => (
        <section key={convenio} className="border border-gray-200 rounded-2xl overflow-hidden">
          <header className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h2 className="font-semibold text-gray-800">
              Convenio: <span className="font-mono">{convenio}</span>
            </h2>
          </header>

          <div className="divide-y divide-gray-100">
            {items.map((r) => {
              const k = `${r.convenio}#${r.consecutivo}`;
              const url = urlMap[k];

              return (
                <div key={r.id} className="px-4 py-3 flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                  <div className="flex-1">
                    <div className="text-sm text-gray-500">
                      Recibo <span className="font-mono">#{r.consecutivo}</span> · {r.fecha_ingreso}
                    </div>
                    <div className="text-gray-800">
                      {r.concepto || "—"} · {r.entidad_nombre || "—"} {r.entidad_nit ? `(${r.entidad_nit})` : ""}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {url ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-500 text-sm"
                        title="Abrir PDF"
                      >
                        Descargar
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">PDF no encontrado</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {loading && (
            <div className="px-4 py-2 text-sm text-gray-500 bg-white border-t border-gray-200">
              Cargando recibos…
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
