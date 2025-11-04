"use client";

import { useEffect, useMemo, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { buildIngresoPdf } from "@/lib/pdf/ingresoPdf";

const BUCKET_INGRESOS = "ingresos_pdf";

// -----------------------------------------
// utilidades
// -----------------------------------------

// Formateo amigable (COP)
function money(n) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));
}

// Sanitizar string para usarlo en nombre de carpeta / archivo
function sanitizeFilePart(s = "") {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "") // quita tildes
    .replace(/[^a-z0-9-_]+/g, "_") // todo lo raro -> _
    .replace(/_+/g, "_") // colapsar ___
    .replace(/^_+|_+$/g, "") // quitar _ al inicio/fin
    .slice(0, 50); // por si acaso
}

// -----------------------------------------
// componente principal
// -----------------------------------------
export default function IngresosClient() {
  // cliente supabase autenticado en el browser con la sesión actual
  const supabase = createClientComponentClient();

  const [loading, setLoading] = useState(false);

  const [convenios, setConvenios] = useState([]);

  const [form, setForm] = useState({
    convenio: "", // se llena cuando carguemos convenios
    entidadNombre: "",
    entidadNit: "",
    concepto: "",
    fechaIngreso: new Date().toISOString().slice(0, 10), // yyyy-mm-dd
    valorTotal: "",
    impuestoPct: "0",
    banco: "",
    cuenta: "",
    medioPago: "Transferencia",
    observaciones: "",
  });

  // -----------------------------------------
  // cargar convenios al montar
  // -----------------------------------------
  useEffect(() => {
    const fetchConvenios = async () => {
      const { data, error } = await supabase
        .from("convenios")
        .select("id, codigo, nombre")
        .order("codigo", { ascending: true });

      if (error) {
        console.error("Error cargando convenios en ingresos:", error);
        setConvenios([]);
        return;
      }

      const lista = data || [];
      setConvenios(lista);

      // si no hay convenio elegido todavía, usar el primero
      if (lista.length > 0) {
        const first = lista[0];
        setForm((f) => ({
          ...f,
          convenio: `${first.codigo} – ${first.nombre}`,
        }));
      }
    };

    fetchConvenios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -----------------------------------------
  // cálculos monetarios
  // -----------------------------------------
  const valorTotalNum = useMemo(
    () => Number(form.valorTotal || 0),
    [form.valorTotal]
  );

  const impuestoPctNum = useMemo(
    () => Number(form.impuestoPct || 0),
    [form.impuestoPct]
  );

  const impuestoValor = useMemo(() => {
    return Math.max(
      0,
      Math.round((valorTotalNum * impuestoPctNum) / 100)
    );
  }, [valorTotalNum, impuestoPctNum]);

  const valorConsignado = useMemo(() => {
    return Math.max(0, valorTotalNum - impuestoValor);
  }, [valorTotalNum, impuestoValor]);

  // -----------------------------------------
  // handlers de formulario
  // -----------------------------------------
  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function onChangeConvenio(e) {
    const value = e.target.value; // "<codigo> – <nombre>"
    setForm((f) => ({ ...f, convenio: value }));
  }

  function bumpImpuesto(delta) {
    setForm((f) => {
      const next = Math.max(
        0,
        Math.min(100, Number(f.impuestoPct || 0) + delta)
      );
      return { ...f, impuestoPct: String(next) };
    });
  }

  // -----------------------------------------
  // submit
  // -----------------------------------------
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      // 1) Insertar el registro en la tabla ingresos
     const { data, error: insErr } = await supabase
  .from("ingresos")
  .insert({
    convenio: form.convenio,
    entidad_nombre: form.entidadNombre,
    entidad_nit: form.entidadNit,
    concepto: form.concepto,
    fecha_ingreso: form.fechaIngreso,
    valor_total: valorTotalNum,
    impuesto_pct: impuestoPctNum,
    impuesto_valor: impuestoValor,
    valor_consignado: valorConsignado,
    banco: form.banco,
    cuenta: form.cuenta,
    medio_pago: form.medioPago,
    observaciones: form.observaciones,
  })
  .select("id, consecutivo")
  .single();


      if (insErr) throw insErr;

      const consecutivo = data?.consecutivo;
      if (!consecutivo) {
        throw new Error("No se obtuvo consecutivo del ingreso.");
      }

      // 2) Generar el PDF en memoria
     const pdfBlob = await buildIngresoPdf({
  consecutivo,
  convenio: form.convenio,
  entidadNombre: form.entidadNombre,
  entidadNit: form.entidadNit,
  concepto: form.concepto,
  fechaIngreso: form.fechaIngreso,
  valorTotal: valorTotalNum,
  impuestoPct: impuestoPctNum,
  impuestoValor,
  valorConsignado,
  banco: form.banco,
  cuenta: form.cuenta,
  medioPago: form.medioPago,
  observaciones: form.observaciones,
  anulado: false, // <--- NUEVO
});


      // 3) Construir nombre de archivo y carpeta seguros
      // carpeta: convenio sanitizado
      const safeConvenio = sanitizeFilePart(form.convenio); 
      // ejemplo: "3065-2025_ministerio_cultura"

      // archivo: entidad_sin_tildes_fecha_ingreso_X.pdf
      const safeEntidad = sanitizeFilePart(form.entidadNombre);
      const fechaCompacta = form.fechaIngreso.replaceAll("-", "");
      const safeFileName = `${safeEntidad}_${fechaCompacta}_ingreso_${consecutivo}.pdf`;
      // ejemplo: "ministerio_de_cultura_20251031_ingreso_12.pdf"

      const storageKey = `${safeConvenio}/${safeFileName}`;
      // ejemplo: "3065-2025_ministerio_cultura/ministerio_de_cultura_20251031_ingreso_12.pdf"

      // 4) Subir el PDF a storage
      const { error: upErr } = await supabase.storage
        .from(BUCKET_INGRESOS)
        .upload(storageKey, pdfBlob, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (upErr) throw upErr;

      // 5) Crear URL firmada temporal
      const { data: signed, error: signedErr } = await supabase.storage
        .from(BUCKET_INGRESOS)
        .createSignedUrl(storageKey, 60 * 10); // 10 minutos

      if (signedErr) {
        console.warn("PDF subido, pero no se pudo crear URL firmada", signedErr);
      }

      alert(`✅ Ingreso #${consecutivo} creado.`);

      if (signed?.signedUrl) {
        // abrir en nueva pestaña el PDF recién subido
        window.open(signed.signedUrl, "_blank");
      }

      // 6) Limpiar el formulario (dejamos convenio/fecha como estaban)
      setForm((f) => ({
        ...f,
        entidadNombre: "",
        entidadNit: "",
        concepto: "",
        valorTotal: "",
        impuestoPct: "0",
        banco: "",
        cuenta: "",
        observaciones: "",
      }));
    } catch (err) {
      console.error(err);
      alert(
        "❌ Error creando el ingreso: " +
          (err?.message || "Desconocido")
      );
    } finally {
      setLoading(false);
    }
  }

  // -----------------------------------------
  // UI
  // -----------------------------------------
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
    >
      {/* CONVENIO (select dinámico) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Convenio / Proyecto
        </label>
        <select
          name="convenio"
          value={form.convenio}
          onChange={onChangeConvenio}
          className="w-full rounded-md border-gray-300"
          required
        >
          {convenios.length === 0 ? (
            <option value="">
              (No hay convenios creados)
            </option>
          ) : (
            convenios.map((c) => (
              <option
                key={c.id}
                value={`${c.codigo} – ${c.nombre}`}
              >
                {c.codigo} – {c.nombre}
              </option>
            ))
          )}
        </select>
      </div>

      {/* ENTIDAD */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Entidad que envía el recurso
          </label>
          <input
            name="entidadNombre"
            value={form.entidadNombre}
            onChange={onChange}
            placeholder="Nombre de la entidad"
            className="w-full rounded-md border-gray-300"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            NIT / Cédula
          </label>
          <input
            name="entidadNit"
            value={form.entidadNit}
            onChange={onChange}
            className="w-full rounded-md border-gray-300"
            placeholder="Ej: 900123456"
          />
        </div>
      </div>

      {/* CONCEPTO + FECHA */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Concepto
          </label>
          <input
            name="concepto"
            value={form.concepto}
            onChange={onChange}
            placeholder="Motivo del ingreso"
            className="w-full rounded-md border-gray-300"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Fecha de ingreso a la cuenta
          </label>
          <input
            type="date"
            name="fechaIngreso"
            value={form.fechaIngreso}
            onChange={onChange}
            className="w-full rounded-md border-gray-300"
            required
          />
        </div>
      </div>

      {/* VALORES */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Valor total */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Valor total cobrado
          </label>
          <input
            type="number"
            name="valorTotal"
            value={form.valorTotal}
            onChange={onChange}
            className="w-full rounded-md border-gray-300"
            min="0"
            step="1000"
            required
          />
          <div className="text-xs text-gray-500 mt-1">
            {money(valorTotalNum)}
          </div>
        </div>

        {/* Impuesto (%) con +/- y edición manual */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Impuesto (%)
          </label>
          <div className="flex items-stretch gap-2">
            <button
              type="button"
              onClick={() => bumpImpuesto(-1)}
              className="px-3 rounded-md border border-gray-300 hover:bg-gray-50"
              title="Disminuir"
            >
              −
            </button>
            <input
              type="number"
              name="impuestoPct"
              value={form.impuestoPct}
              onChange={onChange}
              className="w-full rounded-md border-gray-300 text-center"
              min="0"
              max="100"
              step="0.5"
            />
            <button
              type="button"
              onClick={() => bumpImpuesto(1)}
              className="px-3 rounded-md border border-gray-300 hover:bg-gray-50"
              title="Aumentar"
            >
              +
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Calculado: {money(impuestoValor)}
          </div>
        </div>

        {/* Valor consignado (auto) */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Valor consignado
          </label>
          <input
            type="number"
            name="valorConsignado"
            value={valorConsignado}
            readOnly
            className="w-full rounded-md border-gray-300 bg-gray-50"
          />
          <div className="text-xs text-gray-500 mt-1">
            {money(valorConsignado)}
          </div>
        </div>
      </div>

      {/* PAGO */}
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Medio de pago
          </label>
          <select
            name="medioPago"
            value={form.medioPago}
            onChange={onChange}
            className="w-full rounded-md border-gray-300"
          >
            <option>Transferencia</option>
            <option>Consignación</option>
            <option>Efectivo</option>
            <option>Otro</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Banco
          </label>
          <input
            name="banco"
            value={form.banco}
            onChange={onChange}
            className="w-full rounded-md border-gray-300"
            placeholder="Ej: Bancolombia"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            No. de cuenta
          </label>
          <input
            name="cuenta"
            value={form.cuenta}
            onChange={onChange}
            className="w-full rounded-md border-gray-300"
            placeholder="Ej: 1234567890"
          />
        </div>
      </div>

      {/* OBSERVACIONES */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Observaciones
        </label>
        <textarea
          name="observaciones"
          value={form.observaciones}
          onChange={onChange}
          rows={3}
          className="w-full rounded-md border-gray-300"
          placeholder="Notas adicionales (opcional)"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center rounded-md bg-teal-600 px-5 py-2 text-white hover:bg-teal-500 disabled:opacity-60"
        >
          {loading ? "Guardando..." : "Guardar ingreso y generar PDF"}
        </button>
      </div>
    </form>
  );
}
