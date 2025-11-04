"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Qué puede ver cada rol en el menú
const ROLE_PERMISSIONS = {
  coordinador: {
    prestadores: true,
    egresos: true,
    ingresos: true,
    comprobantes: true,
    convenios: true,
    panel: true,
    rolesAdmin: false,
  },
  contadora: {
    prestadores: false,
    egresos: true,
    ingresos: true,
    comprobantes: true,
    convenios: false,
    panel: true,
    rolesAdmin: false,
  },
  administrador: {
    prestadores: true,
    egresos: true,
    ingresos: true,
    comprobantes: true,
    convenios: false,
    panel: true,
    rolesAdmin: false,
  },
  ingeniera: {
    prestadores: true,
    egresos: false,
    ingresos: false,
    comprobantes: true,
    convenios: true,
    panel: true,
    // 👇 ya NO puede ver administrador de roles
    rolesAdmin: false,
  },
};

export default function PrivateHeader({ userEmail, userRole, userName }) {
  const pathname = usePathname();

  // (prefetch opcional, lo dejamos vacío)
  useEffect(() => {}, []);

  // safety: si no llega rol por alguna razón
  const permisos = ROLE_PERMISSIONS[userRole] || {};

  // construimos dinámicamente el menú según permisos
  const NAV = [
    permisos.prestadores && { href: "/prestadores", label: "Proovedores" },
    permisos.egresos && { href: "/egresos", label: "Crear egreso" },
    permisos.comprobantes && { href: "/comprobantes", label: "Comprobantes" },
    permisos.ingresos && { href: "/ingresos", label: "Ingresos" },
    permisos.convenios && { href: "/convenios", label: "Convenios" },
    permisos.panel && { href: "/dashboard", label: "Panel" },
    //  ya no agregamos NAV para rolesAdmin en ningún caso
  ].filter(Boolean);

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-slate-200">
      {/* ======== fila superior ======== */}
      <div className="max-w-7xl mx-auto flex items-start gap-4 py-3 px-6 flex-wrap">
        {/* bloque marca lado izquierdo */}
        <div className="flex items-start gap-4">
          {/* LOGO IZQUIERDA IGUAL QUE EN LA PARTE PÚBLICA */}
          {/* pon aquí el mismo logo redondo multicolor que se ve en la cabecera pública.
             suponiendo que lo tienes en /public/images/logo_fundacion.png
             cámbialo al nombre real del asset. */}
          <Image
            src="/images/logo_fundacion.jpg"
            alt="Fundación Construyendo Futuro para Santander"
            width={64}
            height={64}
            className="object-contain rounded-full bg-white"
          />

          <div className="leading-tight">
            <div className="text-lg font-bold text-slate-900">
              Fundación Construyendo Futuro para Santander
            </div>

            {/* subtítulo / logos aliados tipo MinCultura */}
            <div className="flex items-center gap-3 flex-wrap mt-1">
              {/* Logo Colombia Potencia de la Vida */}
              <Image
                src="/images/LOGOMINCULTURA.png"
                alt="Colombia Potencia de la Vida / Ministerio de las Culturas"
                width={110}
                height={40}
                className="object-contain"
              />

              {/* info del usuario logueado */}
              <div className="text-xs text-slate-600 leading-tight">
                <div className="font-medium text-slate-800">
                  {userName || "Usuario"}
                </div>
                <div className="text-slate-500">
                  {userEmail || "sin correo"}{" "}
                  {" · "}
                  <span className="italic text-slate-700">{userRole}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* botón cerrar sesión a la derecha */}
        <div className="ml-auto">
          <button
            type="button"
            onClick={() => {
              // redirige al login /auth
              window.location.href = "/auth";
            }}
            className="rounded-full bg-white border px-4 py-2 text-slate-800 hover:bg-slate-50 shadow-sm whitespace-nowrap"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* ======== fila inferior: nav ======== */}
      <nav className="bg-[#94e4e6] border-t border-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 overflow-x-auto">
          <ul className="flex gap-6 py-3 text-slate-800 text-sm font-medium whitespace-nowrap">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`px-2 py-2 inline-block hover:underline ${
                      active ? "font-semibold text-slate-900" : ""
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </header>
  );
}
