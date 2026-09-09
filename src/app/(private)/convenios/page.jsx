"use client";

import { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ConveniosPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [editId, setEditId] = useState(null);
  const [q, setQ] = useState("");

  const [form, setForm] = useState({
      tipo: "Convenio",
    codigo: "",
    nombre: "",
    descripcion: "",
    anio: "",
  });

  const resetForm = () => {
    setForm({
        tipo: "Convenio",
      codigo: "",
      nombre: "",
      descripcion: "",
      anio: "",
    });
    setEditId(null);
  };

  // cargar data
  const loadData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("convenios")
      .select("*")
      .order("creado_en", { ascending: false });

    if (error) {
      console.error("Error cargando convenios:", error);
      setMsg("Error cargando convenios: " + error.message);
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onChange = (e) =>
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!form.codigo || !form.nombre) {
      setMsg("Código y nombre son obligatorios.");
      return;
    }

    try {
      if (!editId) {
        // Evitar duplicados por código
        const { data: existing, error: selErr } = await supabase
          .from("convenios")
          .select("id")
          .eq("codigo", form.codigo)
          .maybeSingle();

        if (selErr) throw selErr;
        if (existing) {
          setMsg("⚠️ Ya existe un convenio/proyecto con ese código.");
          return;
        }

        const { data, error } = await supabase
  .from("convenios")
  .insert([
    {
      tipo: form.tipo,
      codigo: form.codigo,
      nombre: form.nombre,
      descripcion: form.descripcion || null,
      anio: form.anio ? Number(form.anio) : null,
    },
  ])
          .select();

        if (error) throw error;

        setMsg(`Convenio creado ✅ (${data?.[0]?.codigo || ""})`);
        resetForm();
        await loadData();
      } else {
        const { data, error } = await supabase
          .from("convenios")
          .update({
            tipo: form.tipo,
            codigo: form.codigo,
            nombre: form.nombre,
            descripcion: form.descripcion || null,
            anio: form.anio ? Number(form.anio) : null,
          })
          .eq("id", editId)
          .select()
          .single();

        if (error) throw error;
        if (!data) {
          setMsg("No se pudo actualizar (0 filas). Revisa políticas RLS.");
          return;
        }

        setMsg("Convenio actualizado ✅");
        resetForm();
        await loadData();
      }
    } catch (err) {
      console.error("Error en onSubmit:", err);
      setMsg("Error: " + (err?.message || String(err)));
    }
  };

  const onEdit = (c) => {
    setForm({
      tipo: c.tipo || "Convenio",
      codigo: c.codigo || "",
      nombre: c.nombre || "",
      descripcion: c.descripcion || "",
      anio: c.anio || "",
    });
    setEditId(c.id);
    setMsg("Editando convenio…");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = async (id) => {
    if (!confirm("¿Eliminar este convenio/proyecto?")) return;

    try {
      const { data, error } = await supabase
        .from("convenios")
        .delete()
        .eq("id", id)
        .select();

      if (error) throw error;

      if (!data?.length) {
        setMsg(
          "No se eliminó (0 filas). Puede que esté en uso en egresos/ingresos."
        );
        return;
      }

      setMsg("Convenio eliminado 🗑️");
      if (editId === id) resetForm();
      await loadData();
    } catch (err) {
      console.error("Error eliminando:", err);
      setMsg("Error eliminando: " + (err?.message || String(err)));
    }
  };

  // filtro en vivo
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const base = items
      .slice()
      .sort((a, b) =>
        (a.codigo || "").toLowerCase().localeCompare((b.codigo || "").toLowerCase())
      );

    if (!term) return base;

    return base.filter((c) => {
      const blob = [
        c.codigo,
        c.nombre,
        c.descripcion,
        c.anio,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(term);
    });
  }, [items, q]);

  return (
    <div className="bg-white min-h-screen">
      <main className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          Proyectos / Convenios
        </h1>

        {/* FORMULARIO */}
        <form
          onSubmit={onSubmit}
          className="grid md:grid-cols-4 gap-3 mb-6 border border-gray-200 rounded-2xl p-4"
        >
           <select
    name="tipo"
    value={form.tipo}
    onChange={onChange}
    className="border border-gray-300 p-2 rounded w-full"
  >
    <option value="Convenio">Convenio</option>
    <option value="Proyecto">Proyecto</option>
    <option value="Contrato">Contrato</option>
  </select>
          <input
            name="codigo"
            value={form.codigo}
            onChange={onChange}
            className="border border-gray-300 p-2 rounded w-full md:col-span-1"
            placeholder="Código (ej. 2975-2024) *"
          />
          <input
            name="nombre"
            value={form.nombre}
            onChange={onChange}
            className="border border-gray-300 p-2 rounded w-full md:col-span-2"
            placeholder="Nombre del proyecto / convenio *"
          />
          <input
            name="anio"
            value={form.anio}
            onChange={onChange}
            className="border border-gray-300 p-2 rounded w-full md:col-span-1"
            placeholder="Año (opcional)"
          />
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={onChange}
            className="border border-gray-300 p-2 rounded w-full md:col-span-4 min-h-[70px]"
            placeholder="Descripción breve (opcional)"
          />

          <div className="md:col-span-4 flex flex-wrap gap-3 items-center pt-1">
            <button className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700">
              {editId ? "Actualizar" : "Guardar"}
            </button>
            {editId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </button>
            )}
            {msg && (
              <span className="text-sm text-gray-600 whitespace-pre-line">
                {msg}
              </span>
            )}
          </div>
        </form>

        {/* BUSCADOR + CONTADOR */}
        <div className="mb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="relative w-full md:max-w-md">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-300 outline-none"
              placeholder="Buscar por código, nombre o descripción…"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔎</span>
          </div>
          <div className="text-sm text-gray-600">
            {filtered.length} de {items.length} convenios
          </div>
        </div>

        {/* LISTA EN LÍNEA */}
        {loading ? (
          <p className="text-sm text-gray-600">Cargando…</p>
        ) : filtered.length ? (
          <div className="rounded-2xl border border-gray-200 overflow-hidden">
            {/* Header desktop */}
            <div className="hidden md:grid grid-cols-12 bg-gray-50 text-xs font-semibold text-gray-600 px-4 py-2 border-b border-gray-200">
              <div className="col-span-3">Código</div>
              <div className="col-span-4">Nombre</div>
              <div className="col-span-3">Año</div>
              <div className="col-span-2 text-right">Acciones</div>
            </div>

            <ul className="divide-y divide-gray-100">
              {filtered.map((c) => (
                <li key={c.id} className="px-4 py-3">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4">
                    {/* Código */}
                    <div className="md:col-span-3">
                      <div className="font-medium text-gray-800">
                        {c.codigo}
                      </div>
                      <div className="text-sm text-gray-500">
                        {c.descripcion ? (
                          <span className="line-clamp-2">{c.descripcion}</span>
                        ) : (
                          <span className="text-gray-400">Sin descripción</span>
                        )}
                      </div>
                    </div>

                    {/* Nombre */}
                    <div className="md:col-span-4 text-sm text-gray-700">
                      <div className="font-semibold text-gray-900">
                        {c.nombre}
                      </div>
                    </div>

                    {/* Año */}
                    <div className="md:col-span-3 text-sm text-gray-700">
                      {c.anio ? (
                        <div>Año: {c.anio}</div>
                      ) : (
                        <div className="text-gray-400">Sin año</div>
                      )}
                      <div className="text-[11px] text-gray-400">
                        ID interno: {c.id}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="md:col-span-2 flex md:justify-end gap-2">
                      <button
                        onClick={() => onEdit(c)}
                        className="px-3 py-1 rounded-lg bg-teal-600 text-white text-sm hover:bg-teal-700"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onDelete(c.id)}
                        className="px-3 py-1 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            No hay convenios que coincidan con tu búsqueda.
          </p>
        )}
      </main>
    </div>
  );
}
