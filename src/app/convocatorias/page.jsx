import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Convocatorias — Fundación Construyendo Futuro por Santander",
};

export default function ConvocatoriasPage() {
  return (
    <div className="bg-white min-h-screen text-gray-800">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Convocatorias</h1>

        <div className="rounded-2xl border border-gray-200 overflow-hidden bg-gray-50">
          {/* Póster: usa la imagen que prefieras */}
          <img
            src="/images/Los invitamos.jpg"
            alt="Convocatoria a talleres"
            className="w-full h-auto"
          />
        </div>

        {/* si quieres dejar un pequeño texto legal o fecha: */}
        <p className="text-sm text-gray-500 mt-3">
          Para más información, comunícate con nosotros: funconstrueyendofuturosan@gmail.com
        </p>
      </main>

      <Footer />
    </div>
  );
}
