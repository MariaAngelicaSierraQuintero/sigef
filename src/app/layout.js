// src/app/layout.js
import "./globals.css";

export const metadata = {
  title: "SIGEF - Fundación Construyendo Futuro por Santander",
  description: "Sistema interno de gestión de ingresos y egresos",
    icons: {
    icon: "/favicon.ico", 
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
