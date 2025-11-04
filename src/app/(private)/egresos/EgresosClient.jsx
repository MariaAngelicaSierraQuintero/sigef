"use client";

import { useEffect, useMemo, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function EgresosClient() {
  const supabase = createClientComponentClient();

  // convenios dinámicos
  const [convenios, setConvenios] = useState([]);

  // proveedor buscado por cédula
  const [cedula, setCedula] = useState("");
  const [proveedor, setProveedor] = useState(null);
  const [proveedorMsg, setProveedorMsg] = useState("");

  // estado del formulario de egreso
  const [form, setForm] = useState({
    convenio: "",
    concepto: "",
    descripcion: "",
    cantidad: 1,
    valor_unitario: 0,
    retencion_pct: 0,
    medio_pago: "Efectivo",
    cod_retencion: "",
  });

  // UI / feedback
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");

  // opciones UI
  const RETENCION_OPCIONES = [
    0, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7, 8, 9, 10,
  ];
  const MEDIOS_PAGO = ["Efectivo", "Transferencia"];

  // ---------------------------------
  // Helpers numéricos
  // ---------------------------------
  function parseMoney(input) {
    if (typeof input !== "string") return Number(input || 0);
    const s = input.trim().replace(/\./g, "").replace(/,/g, ".");
    const n = Number(s);
    return isNaN(n) ? 0 : n;
  }

  // subtotal bruto
  const subtotal = useMemo(() => {
    const cant = Number(form.cantidad || 0);
    const vu = Number(form.valor_unitario || 0);
    return cant * vu;
  }, [form.cantidad, form.valor_unitario]);

  // valor retenido (en plata)
  const retencionValor = useMemo(() => {
    const pct = Number(form.retencion_pct || 0) / 100;
    return subtotal * pct;
  }, [subtotal, form.retencion_pct]);

  // total neto a pagar
  const totalNeto = useMemo(() => {
    return subtotal - retencionValor;
  }, [subtotal, retencionValor]);

  // ---------------------------------
  // Cargar convenios al montar
  // ---------------------------------
  useEffect(() => {
    const fetchConvenios = async () => {
      const { data, error } = await supabase
        .from("convenios")
        .select("id, codigo, nombre")
        .order("codigo", { ascending: true });

      if (error) {
        console.error("Error cargando convenios:", error);
        setConvenios([]);
        return;
      }

      const lista = data || [];
      setConvenios(lista);

      // inicializar el select si está vacío
      if (lista.length > 0) {
        setForm((f) => ({
          ...f,
          convenio: f.convenio || lista[0].codigo + " — " + lista[0].nombre,
        }));
      }
    };

    fetchConvenios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------
  // Buscar proveedor por cédula
  // ---------------------------------
  async function cargarProveedor() {
    setProveedor(null);
    setProveedorMsg("");
    setMsg("");
    setPdfUrl("");

    if (!cedula?.trim()) {
      setProveedorMsg("Ingresa la cédula del proveedor.");
      return;
    }

    const { data, error } = await supabase
      .from("proveedores")
      .select(
        "id, cedula, nombres, apellidos, banco, tipo_cuenta, numero_cuenta, telefono"
      )
      .eq("cedula", cedula.trim())
      .maybeSingle();

    if (error) {
      console.error("Error buscando proveedor:", error);
      setProveedorMsg("Error consultando proveedor.");
      return;
    }

    if (!data) {
      setProveedorMsg("No existe un proveedor con esa cédula.");
      return;
    }

    setProveedor(data);

    // si tiene info bancaria → medio de pago "Transferencia" automáticamente
    if (data.banco || data.numero_cuenta) {
      setForm((f) => ({ ...f, medio_pago: "Transferencia" }));
    }
  }

  // ---------------------------------
  // Handlers de inputs
  // ---------------------------------
  function onChange(e) {
    const { name, value } = e.target;

    if (name === "valor_unitario") {
      setForm((f) => ({
        ...f,
        valor_unitario: parseMoney(value),
      }));
      return;
    }

    if (name === "cantidad") {
      setForm((f) => ({
        ...f,
        cantidad: Number(value || 0),
      }));
      return;
    }

    if (name === "retencion_pct") {
      setForm((f) => ({
        ...f,
        retencion_pct: Number(value || 0),
      }));
      return;
    }

    // convenio viene como "CODIGO — NOMBRE"
    if (name === "convenio") {
      setForm((f) => ({
        ...f,
        convenio: value,
      }));
      return;
    }

    setForm((f) => ({
      ...f,
      [name]: value,
    }));
  }

  // ---------------------------------
  // Guardar egreso
  // ---------------------------------
  async function onSubmit(e) {
    e.preventDefault();

    setGuardando(true);
    setMsg("");
    setPdfUrl("");

    try {
      // Validaciones rápidas
      if (!proveedor?.id) {
        throw new Error("Primero selecciona un proveedor válido por cédula.");
      }
      if (!form.concepto?.trim()) {
        throw new Error("El concepto es obligatorio.");
      }

      // Partimos el convenio visual "CODIGO — NOMBRE"
      // para guardar solo el CODIGO corto en la tabla egresos
      let convenioCodigo = form.convenio;
      if (convenioCodigo.includes("—")) {
        convenioCodigo = convenioCodigo.split("—")[0].trim();
      } else if (convenioCodigo.includes("-")) {
        // fallback si queda tipo "3065-2025 — ministerio cultura"
        convenioCodigo = convenioCodigo.split("-")[0].trim();
      }

      // Preparamos payload para insertar.
      // OJO: NO mandamos "consecutivo": Postgres lo pone solo
      const payload = {
        convenio: convenioCodigo,
        prestador_id: proveedor.id,
        prestador_cedula: proveedor.cedula,
        concepto: form.concepto,
        descripcion: form.descripcion || null,
        cantidad: Number(form.cantidad || 0),
        valor_unitario: Number(form.valor_unitario || 0),
        retencion: Number(form.retencion_pct || 0), // porcentaje (%)
        medio_pago: form.medio_pago,
        cod_retencion: form.cod_retencion || null,
        // anulado por defecto FALSE en DB
      };

      // Insertar en DB
      const { data: created, error: insErr } = await supabase
        .from("egresos")
        .insert([payload])
        .select("*")
        .single();

      if (insErr) {
        console.error("Error insertando egreso:", insErr);
        throw new Error("Error al guardar egreso: " + insErr.message);
      }

      // info del prestador para el PDF
      const prest = {
        id: proveedor.id,
        cedula: proveedor.cedula,
        nombres: proveedor.nombres,
        apellidos: proveedor.apellidos,
        banco: proveedor.banco,
        tipo_cuenta: proveedor.tipo_cuenta,
        numero_cuenta: proveedor.numero_cuenta,
        telefono: proveedor.telefono || "No registrado",
      };

      // ⚠ MUY IMPORTANTE:
      // Pasamos anulado:false explícitamente al generador de PDF,
      // para que el helper sepa (y no pinte marca roja).
      try {
        const { generarYSubirPDFEgreso } = await import("@/lib/pdf_egreso");
        const { url } = await generarYSubirPDFEgreso(
          { ...created, anulado: created.anulado ?? false },
          prest
        );
        setPdfUrl(url || "");
        setMsg(
          `Egreso guardado ✅ (Comprobante #${created.consecutivo})`
        );
      } catch (pdfErr) {
        console.error("Error generando PDF:", pdfErr);
        setPdfUrl("");
        setMsg(
          `Egreso guardado ✅ pero hubo error generando PDF: ${
            pdfErr?.message || pdfErr
          }`
        );
      }

      // limpiar formulario
      setForm((f) => ({
        ...f,
        concepto: "",
        descripcion: "",
        cantidad: 1,
        valor_unitario: 0,
        retencion_pct: 0,
        medio_pago: "Efectivo",
        cod_retencion: "",
      }));
      setCedula("");
      setProveedor(null);
    } catch (err) {
      console.error("Error general en onSubmit:", err);
      setMsg("Error guardando: " + (err?.message || String(err)));
    } finally {
      setGuardando(false);
    }
  }

  // ---------------------------------
  // UI
  // ---------------------------------
  return (
    <>
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">
        Egresos
      </h1>

      {/* BLOQUE PROVEEDOR */}
      <section className="border border-gray-300 rounded-xl p-4 mb-6 bg-white">
        <h2 className="font-medium text-gray-800 mb-3">Proveedor</h2>

        <div className="grid md:grid-cols-4 gap-3">
          {/* CÉDULA + BOTÓN */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Cédula
            </label>
            <div className="flex gap-2">
              <input
                className="border border-gray-300 p-2 rounded w-full"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                placeholder="Cédula"
              />
              <button
                type="button"
                onClick={cargarProveedor}
                className="px-3 py-2 rounded bg-teal-600 text-white hover:bg-teal-700"
              >
                Buscar
              </button>
            </div>
            {!!proveedorMsg && (
              <div className="text-xs text-red-500 mt-1">
                {proveedorMsg}
              </div>
            )}
          </div>

          {/* NOMBRES */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Nombres
            </label>
            <input
              className="border border-gray-300 p-2 rounded w-full bg-gray-50"
              value={proveedor?.nombres || ""}
              disabled
            />
          </div>

          {/* APELLIDOS */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Apellidos
            </label>
            <input
              className="border border-gray-300 p-2 rounded w-full bg-gray-50"
              value={proveedor?.apellidos || ""}
              disabled
            />
          </div>

          {/* TELÉFONO */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              className="border border-gray-300 p-2 rounded w-full bg-gray-50"
              value={proveedor?.telefono || ""}
              disabled
            />
          </div>
        </div>
      </section>

      {/* FORMULARIO EGRESO */}
      <form
        onSubmit={onSubmit}
        className="border border-gray-300 rounded-xl p-4 bg-white"
      >
        <h2 className="font-medium text-gray-800 mb-3">
          Egreso
        </h2>

        {/* CONVENIO */}
        <label className="block text-sm text-gray-700 mb-1">
          Convenio / Proyecto
        </label>
        <select
          className="border border-gray-300 p-2 rounded w-full mb-3"
          value={form.convenio}
          name="convenio"
          onChange={onChange}
        >
          {convenios.length === 0 ? (
            <option value="">(No hay convenios creados)</option>
          ) : (
            convenios.map((c) => (
              <option
                key={c.id}
                value={`${c.codigo} — ${c.nombre}`}
              >
                {c.codigo} — {c.nombre}
              </option>
            ))
          )}
        </select>

        {/* CONCEPTO + DESCRIPCIÓN */}
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Concepto
            </label>
            <input
              className="border border-gray-300 p-2 rounded w-full"
              value={form.concepto}
              name="concepto"
              onChange={onChange}
              placeholder="Ej: Pago de honorarios"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Proyecto / Observación
            </label>
            <input
              className="border border-gray-300 p-2 rounded w-full"
              value={form.descripcion}
              name="descripcion"
              onChange={onChange}
              placeholder="Detalle opcional (aparece en PDF)"
            />
          </div>
        </div>

        {/* CANTIDAD / VALOR UNITARIO / RETENCIÓN / MEDIO DE PAGO */}
        <div className="grid md:grid-cols-4 gap-3 mt-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Cantidad
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="border border-gray-300 p-2 rounded w-full"
              value={form.cantidad}
              name="cantidad"
              onChange={onChange}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Valor unitario
            </label>
            <input
              type="text"
              className="border border-gray-300 p-2 rounded w-full"
              value={form.valor_unitario?.toString() ?? ""}
              name="valor_unitario"
              onChange={onChange}
              placeholder="Ej: 1.500.000"
            />
            <div className="text-xs text-gray-500 mt-1">
              {`$ ${Number(
                form.valor_unitario || 0
              ).toLocaleString("es-CO")}`}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Retención (%)
            </label>
            <select
              className="border border-gray-300 p-2 rounded w-full"
              value={form.retencion_pct}
              name="retencion_pct"
              onChange={onChange}
            >
              {RETENCION_OPCIONES.map((v) => (
                <option key={v} value={v}>
                  {v === 1.5
                    ? "Retención en la fuente 1.5%"
                    : `${v}%`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Medio de pago
            </label>
            <select
              className="border border-gray-300 p-2 rounded w-full"
              value={form.medio_pago}
              name="medio_pago"
              onChange={onChange}
            >
              {MEDIOS_PAGO.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SI ES TRANSFERENCIA, MUESTRA INFO BANCARIA DEL PROVEEDOR */}
        {form.medio_pago === "Transferencia" && proveedor && (
          <div className="grid md:grid-cols-3 gap-3 mt-3">
            <input
              className="border border-gray-300 p-2 rounded bg-gray-50"
              disabled
              value={proveedor?.banco || ""}
              placeholder="Banco"
            />
            <input
              className="border border-gray-300 p-2 rounded bg-gray-50"
              disabled
              value={proveedor?.tipo_cuenta || ""}
              placeholder="Tipo de cuenta"
            />
            <input
              className="border border-gray-300 p-2 rounded bg-gray-50"
              disabled
              value={proveedor?.numero_cuenta || ""}
              placeholder="No. de cuenta"
            />
          </div>
        )}

        {/* CÓDIGO CONTABLE */}
        <div className="grid md:grid-cols-1 gap-3 mt-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Código contable (retención)
            </label>
            <input
              className="border border-gray-300 p-2 rounded w-full"
              value={form.cod_retencion}
              name="cod_retencion"
              onChange={onChange}
              placeholder="Ej: 23652501"
            />
          </div>
        </div>

        {/* RESUMEN DE VALORES */}
        <div className="grid md:grid-cols-3 gap-3 mt-4">
          <div className="p-3 border border-gray-200 rounded bg-gray-50">
            <div className="text-sm text-gray-500">
              Subtotal
            </div>
            <div className="text-lg font-mono">
              ${subtotal.toLocaleString("es-CO")}
            </div>
          </div>

          <div className="p-3 border border-gray-200 rounded bg-gray-50">
            <div className="text-sm text-gray-500">
              Retención
            </div>
            <div className="text-lg font-mono">
              {form.retencion_pct}% → $
              {retencionValor.toLocaleString("es-CO")}
            </div>
          </div>

          <div className="p-3 border border-gray-200 rounded bg-gray-50">
            <div className="text-sm text-gray-500">
              A pagar (neto)
            </div>
            <div className="text-lg font-mono">
              ${totalNeto.toLocaleString("es-CO")}
            </div>
          </div>
        </div>

        {/* BOTÓN GUARDAR + MENSAJES */}
        <div className="mt-4 flex flex-wrap gap-3 items-center">
          <button
            className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
            disabled={guardando}
          >
            {guardando
              ? "Guardando..."
              : "Guardar egreso y generar PDF"}
          </button>

          {!!msg && (
            <div className="text-sm flex items-center gap-3">
              <span className="text-gray-700">{msg}</span>
              {pdfUrl && (
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white"
                  title="Abrir PDF del comprobante"
                >
                  Abrir PDF
                </a>
              )}
            </div>
          )}
        </div>
      </form>
    </>
  );
}
