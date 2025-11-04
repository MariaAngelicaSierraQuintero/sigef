"use client";

import { useEffect, useMemo, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

/* =========================
   Buckets
   ========================= */
const BUCKET_EGRESOS = "egresos";
const BUCKET_INGRESOS = "ingresos_pdf";

/* =========================
   Rutas EGRESOS
   ========================= */
const egresoKeyForOrig = (convenio, consecutivo) =>
  `${convenio}/egreso_${consecutivo}.pdf`;
const egresoKeyForSign = (convenio, consecutivo) =>
  `firmados/${convenio}/egreso_${consecutivo}.pdf`;

/* =========================
   Rutas INGRESOS
   ========================= */
const folderFromConvenio = (convenio) =>
  String(convenio || "").split(" ")[0].trim();

const COMP_EXTS = ["pdf", "png", "jpg", "jpeg", "webp"];
const ingresoKeyForComp = (convenio, consecutivo, ext = "pdf") =>
  `comprobantes/${folderFromConvenio(convenio)}/ingreso_${consecutivo}.${ext}`;

/* =========================
   Helpers
   ========================= */
const filenameFor = (row, variant = "orig", ext = "pdf") => {
  const nom =
    row?.prestador_nombres?.replace?.(/\s+/g, "_")?.toLowerCase?.() ||
    "documento";
  const fecha = new Date().toISOString().slice(0, 10);
  const suf =
    variant === "firmado"
      ? "_firmado"
      : variant === "comprobante"
      ? "_comprobante"
      : "";
  return `${nom}_${fecha}_#${row.consecutivo}${suf}.${ext}`;
};

const Btn = ({ className = "", children, ...props }) => (
  <button
    className={`px-3 py-1.5 text-sm rounded-lg border transition
                focus:outline-none focus:ring-2 focus:ring-offset-1
                disabled:opacity-60 disabled:pointer-events-none ${className}`}
    {...props}
  >
    {children}
  </button>
);

const LinkBtn = ({ className = "", children, ...props }) => (
  <a
    className={`px-3 py-1.5 text-sm rounded-lg border inline-flex items-center
                transition focus:outline-none focus:ring-2 focus:ring-offset-1 ${className}`}
    {...props}
  >
    {children}
  </a>
);

const Spinner = () => (
  <svg className="animate-spin h-4 w-4 mr-2 inline" viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
      fill="none"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    ></path>
  </svg>
);

async function getSignedUrl(supabase, bucket, key, seconds = 600) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(key, seconds);
  if (error) return null;
  return data?.signedUrl ?? null;
}

async function existsAndSignedUrl(supabase, bucket, key) {
  return await getSignedUrl(supabase, bucket, key);
}

async function downloadFile(supabase, bucket, key, filename) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(key);
  if (error || !data) {
    alert("❌ Error al descargar archivo");
    return;
  }
  const blobUrl = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(blobUrl);
}

function extFromFile(file) {
  if (!file?.type) return "pdf";
  if (file.type === "application/pdf") return "pdf";
  if (file.type === "image/png") return "png";
  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/webp") return "webp";
  return "bin";
}

/**
 * Busca dentro de ingresos_pdf/<carpeta> un archivo que termine en `_ingreso_<consecutivo>.pdf`
 */
async function findIngresoOriginalUrlAndKey(supabase, convenio, consecutivo) {
  const folder = folderFromConvenio(convenio);

  const { data, error } = await supabase.storage
    .from(BUCKET_INGRESOS)
    .list(folder);

  if (error || !Array.isArray(data)) return { url: null, key: null };

  const tail = `_ingreso_${consecutivo}.pdf`;
  const match = data.find((f) =>
    f?.name?.toLowerCase?.().endsWith(tail)
  );
  if (!match) return { url: null, key: null };

  const key = `${folder}/${match.name}`;
  const url = await getSignedUrl(supabase, BUCKET_INGRESOS, key);
  return { url, key };
}

/* =========================
   Componente principal
   ========================= */
export default function ComprobantesClient({ initialData, userRole }) {
  const supabase = createClientComponentClient();

  // permisos
  const puedeSubir =
    userRole === "coordinador" ||
    userRole === "contadora" ||
    userRole === "administrador";

  const puedeAnular =
    userRole === "coordinador" ||
    userRole === "contadora" ||
    userRole === "administrador";

  // estado
  const [rows, setRows] = useState(initialData || []);
  const [filter, setFilter] = useState("");

  const [origMap, setOrigMap] = useState({});
  const [signMap, setSignMap] = useState({});
  const [incomeOrigKeyByRow, setIncomeOrigKeyByRow] = useState({});

  const [loading, setLoading] = useState(false);
  const [uploadingKey, setUploadingKey] = useState(null);

  // filtrar por buscador
  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        String(r.consecutivo).includes(q) ||
        (r.convenio || "").toLowerCase().includes(q) ||
        (r.concepto || "").toLowerCase().includes(q) ||
        (r.prestador_cedula || "").toLowerCase().includes(q) ||
        (r.tipo || "").toLowerCase().includes(q)
    );
  }, [rows, filter]);

  // agrupados por convenio
  const grupos = useMemo(() => {
    const m = new Map();
    for (const r of filtered) {
      if (!m.has(r.convenio)) m.set(r.convenio, []);
      m.get(r.convenio).push(r);
    }
    return Array.from(m.entries());
  }, [filtered]);

  // cargar urls firmadas de storage para cada fila
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);

      const nextOrig = {};
      const nextSign = {};
      const nextIncomeKeys = {};

      for (const r of filtered) {
        if (r.tipo === "egreso") {
          // egreso original / firmado
          const oKey = egresoKeyForOrig(r.convenio, r.consecutivo);
          const sKey = egresoKeyForSign(r.convenio, r.consecutivo);

          nextOrig[`${BUCKET_EGRESOS}|${oKey}`] =
            await existsAndSignedUrl(supabase, BUCKET_EGRESOS, oKey);

          nextSign[`${BUCKET_EGRESOS}|${sKey}`] =
            await existsAndSignedUrl(supabase, BUCKET_EGRESOS, sKey);

          if (cancelled) return;
        } else {
          // ingreso
          const { url: oUrl, key: oKey } = await findIngresoOriginalUrlAndKey(
            supabase,
            r.convenio,
            r.consecutivo
          );

          if (oKey) {
            nextOrig[`${BUCKET_INGRESOS}|${oKey}`] = oUrl;
            nextIncomeKeys[`${folderFromConvenio(r.convenio)}|${r.consecutivo}`] =
              oKey;
          }

          // comprobante (recibo banco / consignación)
          for (const ext of COMP_EXTS) {
            const cKey = ingresoKeyForComp(r.convenio, r.consecutivo, ext);
            const cUrl = await existsAndSignedUrl(
              supabase,
              BUCKET_INGRESOS,
              cKey
            );
            if (cUrl) {
              nextSign[`${BUCKET_INGRESOS}|${cKey}`] = cUrl;
              break;
            }
          }
          if (cancelled) return;
        }
      }

      if (!cancelled) {
        setOrigMap(nextOrig);
        setSignMap(nextSign);
        setIncomeOrigKeyByRow(nextIncomeKeys);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [filtered, supabase]);

  // subir PDF firmado (egreso)
  const onUploadSignedEgreso = async (file, convenio, consecutivo) => {
    if (!puedeSubir) {
      alert("No tienes permiso para subir archivos.");
      return;
    }

    const key = egresoKeyForSign(convenio, consecutivo);
    const full = `${BUCKET_EGRESOS}|${key}`;
    setUploadingKey(full);
    setSignMap((m) => ({ ...m, [full]: null }));

    const { error } = await supabase.storage
      .from(BUCKET_EGRESOS)
      .upload(key, file, {
        upsert: true,
        contentType: "application/pdf",
      });
    if (error) {
      alert("❌ No se pudo subir el PDF firmado: " + error.message);
      setUploadingKey(null);
      return;
    }
    const url = await getSignedUrl(supabase, BUCKET_EGRESOS, key);
    setSignMap((m) => ({ ...m, [full]: url }));
    setUploadingKey(null);
  };

  // subir comprobante (ingreso)
  const onUploadComprobanteIngreso = async (file, convenio, consecutivo) => {
    if (!puedeSubir) {
      alert("No tienes permiso para subir archivos.");
      return;
    }

    const ext = extFromFile(file);
    const key = ingresoKeyForComp(convenio, consecutivo, ext);
    const full = `${BUCKET_INGRESOS}|${key}`;
    setUploadingKey(full);
    setSignMap((m) => ({ ...m, [full]: null }));

    const { error } = await supabase.storage
      .from(BUCKET_INGRESOS)
      .upload(key, file, {
        upsert: true,
        contentType: file.type || undefined,
      });
    if (error) {
      alert("❌ No se pudo subir el comprobante: " + error.message);
      setUploadingKey(null);
      return;
    }
    const url = await getSignedUrl(supabase, BUCKET_INGRESOS, key);
    setSignMap((m) => ({ ...m, [full]: url }));
    setUploadingKey(null);
  };

  // ============================
  //  ANULAR Y REGENERAR PDF
  // ============================
  const onAnularComprobante = async (row) => {
    if (!puedeAnular) {
      alert("No tienes permiso para anular.");
      return;
    }

    if (row.anulado) {
      alert("Este comprobante ya está ANULADO.");
      return;
    }

    const seguro = window.confirm(
      `⚠ Vas a marcar como ANULADO el ${row.tipo} #${row.consecutivo}. Esto NO borra archivos ni el registro. ¿Continuar?`
    );
    if (!seguro) return;

    const tabla = row.tipo === "egreso" ? "egresos" : "ingresos";

    // 1. marcar anulado en la BD
    const { data: updatedRows, error } = await supabase
      .from(tabla)
      .update({ anulado: true })
      .eq("id", row.id)
      .select("*")
      .limit(1);

    if (error) {
      alert("❌ No se pudo anular: " + error.message);
      return;
    }

    const updated = updatedRows?.[0] || { ...row, anulado: true };

    // 2. regenerar PDF solo para egresos (por ahora)
    if (row.tipo === "egreso") {
      try {
        const { generarYSubirPDFEgreso } = await import("@/lib/pdf_egreso");

        // necesitamos datos del proveedor para el PDF
        // buscamos rápido al proveedor usando prestador_cedula
        let prestador = {
          cedula: row.prestador_cedula || "",
          nombres: row.prestador_nombres || "",
          apellidos: row.prestador_apellidos || "",
          banco: row.banco || "",
          tipo_cuenta: row.tipo_cuenta || "",
          numero_cuenta: row.numero_cuenta || "",
          telefono: row.telefono || "",
        };

        // si no tenemos info bancaria en row, intentamos leer de proveedores
        if (!prestador.numero_cuenta || !prestador.banco) {
          const { data: provData } = await supabase
            .from("proveedores")
            .select(
              "cedula, nombres, apellidos, banco, tipo_cuenta, numero_cuenta, telefono"
            )
            .eq("cedula", row.prestador_cedula || "")
            .maybeSingle();

          if (provData) {
            prestador = {
              cedula: provData.cedula || prestador.cedula,
              nombres: provData.nombres || prestador.nombres,
              apellidos: provData.apellidos || prestador.apellidos,
              banco: provData.banco || prestador.banco,
              tipo_cuenta: provData.tipo_cuenta || prestador.tipo_cuenta,
              numero_cuenta:
                provData.numero_cuenta || prestador.numero_cuenta,
              telefono: provData.telefono || prestador.telefono,
            };
          }
        }

        // regenerar con anulado:true para que pinte el sello rojo
        await generarYSubirPDFEgreso(
          { ...updated, anulado: true },
          prestador
        );
      } catch (regenErr) {
        console.error("Error regenerando PDF anulado:", regenErr);
        // seguimos aunque falle PDF
      }
    }

    // 3. reflejar en UI
    setRows((old) =>
      old.map((r) =>
        r.id === row.id ? { ...r, anulado: true } : r
      )
    );

    alert("✅ Marcado como ANULADO y PDF actualizado.");
  };

  return (
    <div className="space-y-6">
      {/* buscador */}
      <input
        className="w-full max-w-xl px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-300 outline-none"
        placeholder="Buscar por nombre, cédula, convenio, número o tipo..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      {grupos.length === 0 && (
        <p className="text-gray-600">
          No hay comprobantes registrados.
        </p>
      )}

      {grupos.map(([convenio, items]) => (
        <section
          key={convenio}
          className="border border-gray-200 rounded-2xl overflow-hidden"
        >
          <header className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">
              Convenio: <span className="font-mono">{convenio}</span>
            </h2>
          </header>

          <div className="divide-y divide-gray-100">
            {items.map((r) => {
              const isEgreso = r.tipo === "egreso";

              let urlOrig = null;
              let urlFirmOrComp = null;
              let oKey = null;

              if (isEgreso) {
                const ok = egresoKeyForOrig(r.convenio, r.consecutivo);
                const sk = egresoKeyForSign(r.convenio, r.consecutivo);

                urlOrig = origMap[`${BUCKET_EGRESOS}|${ok}`] || null;
                urlFirmOrComp = signMap[`${BUCKET_EGRESOS}|${sk}`] || null;
                oKey = ok;
              } else {
                const folder = folderFromConvenio(r.convenio);
                const storedKey =
                  incomeOrigKeyByRow[`${folder}|${r.consecutivo}`] || null;
                if (storedKey) {
                  oKey = storedKey;
                  urlOrig =
                    origMap[`${BUCKET_INGRESOS}|${storedKey}`] || null;
                }

                for (const ext of COMP_EXTS) {
                  const full = `${BUCKET_INGRESOS}|${ingresoKeyForComp(
                    r.convenio,
                    r.consecutivo,
                    ext
                  )}`;
                  if (signMap[full]) {
                    urlFirmOrComp = signMap[full];
                    break;
                  }
                }
              }

              const isUploading = isEgreso
                ? uploadingKey ===
                  `${BUCKET_EGRESOS}|${egresoKeyForSign(
                    r.convenio,
                    r.consecutivo
                  )}`
                : uploadingKey?.startsWith?.(
                    `${BUCKET_INGRESOS}|comprobantes/${folderFromConvenio(
                      r.convenio
                    )}/ingreso_${r.consecutivo}`
                  );

              return (
                <div
                  key={`${r.tipo || "x"}-${r.id ?? `${r.convenio ?? "?"}-${r.consecutivo ?? "?"}`}`}
                  className="px-4 py-3 flex flex-col md:flex-row md:items-center gap-3 md:gap-6"
                >
                  {/* ================== info ================== */}
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 flex flex-wrap items-center gap-2">
                      <span>
                        {isEgreso ? "Egreso" : "Ingreso"}{" "}
                        <span className="font-mono">
                          #{r.consecutivo}
                        </span>
                      </span>

                      <span className="text-gray-400">·</span>

                      <span>
                        Convenio{" "}
                        <span className="font-mono">
                          {r.convenio}
                        </span>
                      </span>

                      {r.anulado && (
                        <span className="text-red-600 font-bold uppercase tracking-wide text-xs border border-red-600 rounded px-2 py-0.5">
                          ANULADO
                        </span>
                      )}
                    </div>

                    <div className="text-gray-800">
                      {r.concepto || "—"} · C.C.{" "}
                      {r.prestador_cedula || "—"}
                    </div>
                  </div>

                  {/* ================== acciones ================== */}
                  <div className="flex flex-wrap items-center gap-2 md:justify-end">
                    {/* Ver / Descargar ORIGINAL */}
                    {urlOrig ? (
                      <>
                        <LinkBtn
                          href={urlOrig}
                          target="_blank"
                          rel="noreferrer"
                          className="border-gray-300 hover:bg-gray-50"
                          title={
                            isEgreso
                              ? "Abrir PDF sin firma"
                              : "Abrir PDF del ingreso"
                          }
                        >
                          {isEgreso
                            ? "Ver (sin firma)"
                            : "Ver (PDF)"}
                        </LinkBtn>

                        <Btn
                          onClick={() => {
                            if (!oKey) {
                              alert(
                                "No se encontró la ruta del PDF para descargar."
                              );
                              return;
                            }
                            downloadFile(
                              supabase,
                              isEgreso
                                ? BUCKET_EGRESOS
                                : BUCKET_INGRESOS,
                              oKey,
                              filenameFor(r, "orig", "pdf")
                            );
                          }}
                          className="border-gray-300 hover:bg-gray-50"
                        >
                          {isEgreso
                            ? "Descargar (sin firma)"
                            : "Descargar (PDF)"}
                        </Btn>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400">
                        {isEgreso
                          ? "No sin firma"
                          : "Sin PDF de ingreso"}
                      </span>
                    )}

                    {/* Ver / Descargar FIRMADO o COMPROBANTE */}
                    {urlFirmOrComp ? (
                      <>
                        <LinkBtn
                          href={urlFirmOrComp}
                          target="_blank"
                          rel="noreferrer"
                          className="border-teal-600 bg-teal-600 text-white hover:bg-teal-500"
                          title={
                            isEgreso
                              ? "Abrir PDF firmado"
                              : "Abrir comprobante del ingreso"
                          }
                        >
                          {isEgreso
                            ? "Ver firmado"
                            : "Ver comprobante"}
                        </LinkBtn>

                        <Btn
                          onClick={async () => {
                            if (isEgreso) {
                              const sk = egresoKeyForSign(
                                r.convenio,
                                r.consecutivo
                              );
                              await downloadFile(
                                supabase,
                                BUCKET_EGRESOS,
                                sk,
                                filenameFor(
                                  r,
                                  "firmado",
                                  "pdf"
                                )
                              );
                            } else {
                              for (const ext of COMP_EXTS) {
                                const k = ingresoKeyForComp(
                                  r.convenio,
                                  r.consecutivo,
                                  ext
                                );
                                const ok =
                                  await existsAndSignedUrl(
                                    supabase,
                                    BUCKET_INGRESOS,
                                    k
                                  );
                                if (ok) {
                                  await downloadFile(
                                    supabase,
                                    BUCKET_INGRESOS,
                                    k,
                                    filenameFor(
                                      r,
                                      "comprobante",
                                      ext
                                    )
                                  );
                                  break;
                                }
                              }
                            }
                          }}
                          className="border-gray-300 hover:bg-gray-50"
                        >
                          {isEgreso
                            ? "Descargar firmado"
                            : "Descargar comprobante"}
                        </Btn>
                      </>
                    ) : (
                      puedeSubir && (
                        <label
                          className={`cursor-pointer ${
                            isUploading ? "opacity-70" : ""
                          }`}
                          title={
                            isEgreso
                              ? "Subir PDF firmado"
                              : "Subir comprobante (imagen o PDF)"
                          }
                        >
                          <input
                            type="file"
                            accept={
                              isEgreso
                                ? "application/pdf"
                                : "application/pdf,image/*"
                            }
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              if (isEgreso) {
                                if (
                                  f.type !== "application/pdf"
                                ) {
                                  alert(
                                    "El firmado de egreso debe ser PDF."
                                  );
                                  e.currentTarget.value = "";
                                  return;
                                }
                                onUploadSignedEgreso(
                                  f,
                                  r.convenio,
                                  r.consecutivo
                                );
                              } else {
                                onUploadComprobanteIngreso(
                                  f,
                                  r.convenio,
                                  r.consecutivo
                                );
                              }
                              e.currentTarget.value = "";
                            }}
                            disabled={!!isUploading}
                          />
                          <span className="inline-flex items-center px-3 py-1.5 text-sm rounded-lg border border-teal-600 bg-teal-600 text-white hover:bg-teal-500">
                            {isUploading ? (
                              <>
                                <Spinner /> Subiendo…
                              </>
                            ) : isEgreso ? (
                              "Subir firmado"
                            ) : (
                              "Subir comprobante"
                            )}
                          </span>
                        </label>
                      )
                    )}

                    {/* Botón ANULAR */}
                    {puedeAnular && !r.anulado && (
                      <Btn
                        onClick={() => onAnularComprobante(r)}
                        className="border-red-600 text-red-600 hover:bg-red-50"
                      >
                        Anular
                      </Btn>
                    )}

                    {r.anulado && (
                      <Btn
                        disabled
                        className="border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed"
                        title="Ya está anulado"
                      >
                        Anulado
                      </Btn>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {loading && (
            <div className="px-4 py-2 text-sm text-gray-500 bg-white border-t border-gray-200">
              Cargando archivos…
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
