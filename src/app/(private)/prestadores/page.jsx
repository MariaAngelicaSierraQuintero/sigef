"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// util chiquito para resaltar coincidencias
function Highlight({ text = "", query = "" }) {
  if (!query) return <>{text}</>;
  const q = query.trim();
  const parts = String(text).split(new RegExp(`(${q})`, "ig"));
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === q.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 px-0.5 rounded">
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

export default function PrestadoresPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    cedula: "",
    nombres: "",
    apellidos: "",
    correo: "",
    telefono: "",
    direccion: "",
    banco: "",
    tipo_cuenta: "",
    numero_cuenta: "",
  });

  // búsqueda (con pequeño debounce)
  const [query, setQuery] = useState("");
  const [qLive, setQLive] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setQuery(qLive), 200);
    return () => clearTimeout(t);
  }, [qLive]);

  const resetForm = () => {
    setForm({
      cedula: "",
      nombres: "",
      apellidos: "",
      correo: "",
      telefono: "",
      direccion: "",
      banco: "",
      tipo_cuenta: "",
      numero_cuenta: "",
    });
    setEditId(null);
  };

  const loadData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("proveedores")
      .select("*")
      .order("creado_en", { ascending: false });
    if (error) {
      console.error("Error cargando datos:", error);
      setMsg("Error cargando prestadores: " + error.message);
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!form.cedula || !form.nombres || !form.apellidos) {
      setMsg("Cédula, nombres y apellidos son obligatorios.");
      return;
    }

    try {
      if (!editId) {
        const { data: existing, error: selErr } = await supabase
          .from("proveedores")
          .select("id")
          .eq("cedula", form.cedula)
          .maybeSingle();
        if (selErr) throw selErr;
        if (existing) {
          setMsg("⚠️ La cédula ya está registrada. No se puede duplicar.");
          return;
        }

        const { data, error } = await supabase
          .from("proveedores")
          .insert([form])
          .select();
        if (error) throw error;

        setMsg(`Prestador creado ✅ (${data?.[0]?.nombres || ""})`);
        resetForm();
        await loadData();
      } else {
        const { data, error } = await supabase
          .from("proveedores")
          .update({
            cedula: form.cedula,
            nombres: form.nombres,
            apellidos: form.apellidos,
            correo: form.correo || null,
            telefono: form.telefono || null,
            direccion: form.direccion || null,
            banco: form.banco || null,
            tipo_cuenta: form.tipo_cuenta || null,
            numero_cuenta: form.numero_cuenta || null,
          })
          .eq("id", editId)
          .select()
          .single();

        if (error) throw error;
        if (!data) {
          setMsg("No se pudo actualizar (0 filas). Revisa políticas RLS.");
          return;
        }

        setMsg("Prestador actualizado ✅");
        resetForm();
        await loadData();
      }
    } catch (err) {
      console.error("Error en onSubmit:", err);
      setMsg("Error: " + (err?.message || String(err)));
    }
  };

  const onEdit = (p) => {
    setForm({
      cedula: p.cedula || "",
      nombres: p.nombres || "",
      apellidos: p.apellidos || "",
      correo: p.correo || "",
      telefono: p.telefono || "",
      direccion: p.direccion || "",
      banco: p.banco || "",
      tipo_cuenta: p.tipo_cuenta || "",
      numero_cuenta: p.numero_cuenta || "",
    });
    setEditId(p.id);
    setMsg("Editando registro…");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = async (id) => {
    if (!confirm("¿Eliminar este prestador?")) return;

    try {
      const { data, error } = await supabase
        .from("proveedores")
        .delete()
        .eq("id", id)
        .select();

      if (error) throw error;

      if (!data?.length) {
        setMsg("No se eliminó (0 filas). Puede ser RLS o tiene egresos asociados.");
        return;
      }

      setMsg("Prestador eliminado 🗑️");
      if (editId === id) resetForm();
      await loadData();
    } catch (err) {
      console.error("Error eliminando:", err);
      setMsg("Error eliminando: " + (err?.message || String(err)));
    }
  };

  // Filtrado y orden
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = [...items];
    if (!q) {
      // orden alfabético por nombres/apellidos
      return base.sort((a, b) =>
        `${a.nombres ?? ""} ${a.apellidos ?? ""}`.localeCompare(
          `${b.nombres ?? ""} ${b.apellidos ?? ""}`,
          "es",
          { sensitivity: "base" }
        )
      );
    }
    return base
      .filter((p) => {
        const hay = [
          p.cedula,
          p.nombres,
          p.apellidos,
          p.correo,
          p.telefono,
        ]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q));
        return hay;
      })
      .sort((a, b) =>
        `${a.nombres ?? ""} ${a.apellidos ?? ""}`.localeCompare(
          `${b.nombres ?? ""} ${b.apellidos ?? ""}`,
          "es",
          { sensitivity: "base" }
        )
      );
  }, [items, query]);

  return (
    <div className="bg-white min-h-screen">
      <main className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Prestadores</h1>

        {/* Formulario */}
        <form
          onSubmit={onSubmit}
          className="grid md:grid-cols-3 gap-3 mb-6 border border-gray-200 rounded-2xl p-4"
        >
          <input name="cedula" value={form.cedula} onChange={onChange} className="border border-gray-300 p-2 rounded w-full" placeholder="Cédula *" />
          <input name="nombres" value={form.nombres} onChange={onChange} className="border border-gray-300 p-2 rounded w-full" placeholder="Nombres *" />
          <input name="apellidos" value={form.apellidos} onChange={onChange} className="border border-gray-300 p-2 rounded w-full" placeholder="Apellidos *" />
          <input name="correo" value={form.correo} onChange={onChange} className="border border-gray-300 p-2 rounded w-full" placeholder="Correo" />
          <input name="telefono" value={form.telefono} onChange={onChange} className="border border-gray-300 p-2 rounded w-full" placeholder="Teléfono" />
          <input name="direccion" value={form.direccion} onChange={onChange} className="border border-gray-300 p-2 rounded w-full" placeholder="Dirección" />
          <input name="banco" value={form.banco} onChange={onChange} className="border border-gray-300 p-2 rounded w-full" placeholder="Banco (opcional)" />
          <input name="tipo_cuenta" value={form.tipo_cuenta} onChange={onChange} className="border border-gray-300 p-2 rounded w-full" placeholder="Tipo de cuenta (opcional)" />
          <input name="numero_cuenta" value={form.numero_cuenta} onChange={onChange} className="border border-gray-300 p-2 rounded w-full" placeholder="Número de cuenta (opcional)" />

          <div className="md:col-span-3 flex gap-3 items-center pt-1">
            <button className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700">
              {editId ? "Actualizar" : "Guardar"}
            </button>
            {editId && (
              <button type="button" onClick={resetForm} className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100">
                Cancelar
              </button>
            )}
            {msg && <span className="text-sm text-gray-600">{msg}</span>}
          </div>
        </form>

        {/* Barra de búsqueda y contador */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <input
            value={qLive}
            onChange={(e) => setQLive(e.target.value)}
            placeholder="Buscar por nombre, apellido, cédula, correo o teléfono…"
            className="w-full sm:max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-300 outline-none"
          />
          <div className="text-sm text-gray-600">
            {loading ? "Cargando…" : `${filtered.length} resultado(s)`}
          </div>
        </div>

        {/* Lista en línea (una debajo de otra) */}
        {loading ? (
          <p className="text-sm text-gray-600">Cargando…</p>
        ) : filtered.length ? (
          <ul className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden bg-white">
            {filtered.map((p) => {
              const alias =
                (p.nombres?.[0] || "") + (p.apellidos?.[0] || "");
              return (
                <li
                  key={p.id}
                  className="px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 hover:bg-gray-50 transition"
                >
                  {/* avatar */}
                  <div className="flex items-center gap-3 sm:w-1/3">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-teal-600 text-white grid place-items-center font-semibold">
                      {alias.toUpperCase() || "?"}
                    </div>
                    <div className="leading-tight">
                      <div className="font-medium text-gray-900">
                        <Highlight
                          text={`${p.nombres ?? ""} ${p.apellidos ?? ""}`.trim()}
                          query={query}
                        />
                      </div>
                      <div className="text-xs text-gray-500">
                        C.C. <Highlight text={p.cedula ?? "-"} query={query} />
                      </div>
                    </div>
                  </div>

                  {/* info */}
                  <div className="text-sm text-gray-600 sm:flex-1">
                    <div>
                      <Highlight text={p.correo || "sin correo"} query={query} />
                      {" · "}
                      <Highlight text={p.telefono || "sin teléfono"} query={query} />
                    </div>
                    {(p.banco || p.tipo_cuenta || p.numero_cuenta) && (
                      <div className="mt-1">
                        Banco: {p.banco || "-"} · {p.tipo_cuenta || "-"} ·{" "}
                        {p.numero_cuenta || "-"}
                      </div>
                    )}
                  </div>

                  {/* acciones */}
                  <div className="flex gap-2 sm:justify-end">
                    <button
                      onClick={() => onEdit(p)}
                      className="px-3 py-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete(p.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-gray-600">No hay prestadores que coincidan.</p>
        )}
      </main>
    </div>
  );
}
