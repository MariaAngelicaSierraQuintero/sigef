"use client";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  const TURQUESA = "#5CE1E6";

  return (
    <header className="bg-white border-b border-gray-200">
      {/* FILA SUPERIOR */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo izquierda */}
        <div className="flex items-center gap-3">
          <img
            src="/images/logo_fundacion.jpg"
            alt="Logo Fundación"
            className="h-24 w-24 object-cover"
          />
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 whitespace-nowrap">
            Fundación Construyendo Futuro para Santander
          </h1>
        </div>

        {/* Logos derecha */}
        <div className="flex items-center gap-3">
          <img
            src="/images/LOGOMINCULTURA.png"
            alt="Ministerio de las Culturas"
            className="h-10 w-auto"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        </div>
      </div>

      {/* FILA INFERIOR */}
      <div style={{ backgroundColor: TURQUESA }}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between py-3 text-lg font-medium text-gray-900">
          <nav className="flex flex-wrap gap-8">
            <Link href="/" className="hover:opacity-80">
              Inicio
            </Link>
            <Link href="/conocenos" className="hover:opacity-80">
              Conócenos
            </Link>
            <Link href="/ejecucion" className="hover:opacity-80">
              Proyectos en ejecución
            </Link>
            <Link href="/pasados" className="hover:opacity-80">
              Proyectos pasados
            </Link>
            <Link href="/convocatorias" className="hover:opacity-80">
              Convocatorias
            </Link>
            <Link href="/contactenos" className="hover:opacity-80">
              Contáctenos
            </Link>
          </nav>

          <Link
            href="/auth"
            className="rounded-full px-5 py-1.5 bg-white text-gray-900 border border-gray-300 hover:bg-gray-50"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </header>
  );
}

