"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction } from "./actions/login";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-50"
    >
      {pending ? "Entrando..." : "Entrar"}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(loginAction, { error: null });

  return (
<div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#E0F7F9" }}>
      <div className="w-full max-w-md bg-white border border-gray-200 shadow-xl rounded-2xl p-6 md:p-7">
        <div className="flex items-center gap-3 mb-4">
          <img
            src="/images/logo_fundacion.jpg"
            alt="Logo"
            className="h-10 w-10 rounded-md object-cover"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Iniciar sesión</h1>
            <p className="text-sm text-gray-500">
              Fundación Construyendo Futuro por Santander
            </p>
          </div>
        </div>

        {state?.error && state.error !== "NEXT_REDIRECT" && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5CE1E6]"
              placeholder="tucorreo@dominio.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5CE1E6]"
              placeholder="••••••••"
            />
          </div>

          <SubmitButton />
        </form>
      </div>
    </div>
  );
}
