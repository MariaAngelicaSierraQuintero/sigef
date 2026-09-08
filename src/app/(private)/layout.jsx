// src/app/(private)/layout.jsx
import { redirect } from "next/navigation";
import PrivateHeader from '../../components/PrivateHeader';

import { getUserWithRole } from "@/lib/getUserWithRole";

export default async function PrivateLayout({ children }) {
  const { user, role, nombre, activo } = await getUserWithRole();

  // 1) si no tiene sesión -> login
  if (!user) {
    redirect("/auth");
  }

  // 2) si no tiene rol o está inactivo -> pantalla de bloqueo
  if (!role || !activo) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h1 className="text-2xl font-semibold text-red-600 mb-2">
          Acceso restringido 🚫
        </h1>
        <p className="text-gray-600">
          Tu cuenta no tiene permisos activos. Contacta a la ingeniera.
        </p>
      </div>
    );
  }

  // 3) todo bien -> render normal
  return (
    <>
      <PrivateHeader
        userEmail={user.email}
        userRole={role}
        userName={nombre}
      />
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </>
  );
}
