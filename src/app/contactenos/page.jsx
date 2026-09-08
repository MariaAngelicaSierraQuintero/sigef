import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Contáctenos — Fundación Construyendo Futuro por Santander",
  description:
    "Datos de contacto oficiales de la Fundación Construyendo Futuro por Santander: dirección, teléfono, correo y redes sociales.",
};

export default function ContactenosPage() {
  return (
    <div className="bg-white text-gray-800 min-h-screen">
      <Header />

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-16 space-y-10">
        {/* Encabezado */}
        <section className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Contáctenos
          </h1>
          <p className="mt-3 text-gray-600">
            Estamos aquí para atender sus consultas y colaboraciones.
          </p>
        </section>

        {/* Tarjetas de información */}
        <section className="grid md:grid-cols-2 gap-6">
          {/* Dirección */}
          <div className="bg-[#E0F7F9] border border-gray-200 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
            <span className="text-[#008C94] text-3xl">
              <i className="fas fa-map-marker-alt"></i>
            </span>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Dirección</h2>
              <p className="text-gray-700">Piedecuesta, Santander</p>
            </div>
          </div>

          {/* Teléfono */}
          <div className="bg-[#E0F7F9] border border-gray-200 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
            <span className="text-[#008C94] text-3xl">
              <i className="fas fa-phone-alt"></i>
            </span>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Teléfono</h2>
              <p className="text-gray-700">(+57) 317 494 0090</p>
            </div>
          </div>

          {/* Correo */}
          <div className="bg-[#E0F7F9] border border-gray-200 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
            <span className="text-[#008C94] text-3xl">
              <i className="fas fa-envelope"></i>
            </span>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Correo electrónico</h2>
              <p className="text-gray-700 break-words">
                funconstrueyendofuturosan@gmail.com
              </p>
            </div>
          </div>

          {/* Redes sociales */}
          <div className="bg-[#E0F7F9] border border-gray-200 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
            <span className="text-[#008C94] text-3xl">
              <i className="fab fa-facebook"></i>
            </span>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Facebook</h2>
              <a
                href="https://www.facebook.com/profile.php?id=100094017705513"
                target="_blank"
                rel="noreferrer"
                className="text-[#008C94] hover:underline"
              >
                Fundación Construyendo Futuro por Santander
              </a>
            </div>
          </div>
        </section>

        {/* Frase institucional */}
        <section className="text-center mt-12">
          <p className="text-lg text-gray-700 italic">
            “Uniendo manos y corazones para edificar un mañana lleno de oportunidades
            y esperanza en Santander.”
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
