import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Proyectos en Ejecución — Fundación Construyendo Futuro por Santander",
  description:
    "Proyecto Adulto Mayor Activo 2025 — talleres culturales, arte y recreación en Piedecuesta, Santander.",
};

export default function EjecucionPage() {
  return (
    <div className="bg-white text-gray-800 min-h-screen">
      <Header />

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-10 space-y-10">
        {/* Título principal */}
        <section className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Adulto Mayor Activo 2025
          </h1>
          <p className="mt-3 text-gray-700 leading-relaxed text-justify md:text-center">
            El proyecto se realiza en el municipio de Piedecuesta, Santander, un territorio con
            una significativa población de adultos mayores. De sus más de 200.000 habitantes,
            cerca del 10% pertenece a este grupo, considerado en condición de vulnerabilidad.
          </p>
        </section>

        {/* Primera sección */}
        <section className="rounded-2xl border border-gray-200 shadow-sm bg-white">
          <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col justify-center">
              <p className="text-gray-700 text-justify leading-relaxed">
                A través de este programa, buscamos ofrecer espacios de esparcimiento cultural
                para esta población, mediante talleres de arte, música, danza y cine. Queremos
                fomentar la integración, la recreación y el bienestar emocional de nuestros adultos
                mayores, reduciendo riesgos sociales y fortaleciendo su participación comunitaria.
              </p>
            </div>
            <div className="flex justify-center">
              <img
                src="/images/P9.jpg"
                alt="Talleres de arte para adultos mayores"
                className="w-full max-w-md rounded-xl shadow"
              />
            </div>
          </div>
        </section>

        {/* Segunda sección */}
        <section className="rounded-2xl border border-gray-200 shadow-sm bg-white">
          <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8 items-center">
            <div className="flex justify-center order-2 md:order-1">
              <img
                src="/images/P20.jpg"
                alt="Actividades culturales"
                className="w-full max-w-md rounded-xl shadow"
              />
            </div>
            <div className="flex flex-col justify-center order-1 md:order-2">
              <p className="text-gray-700 text-justify leading-relaxed">
                Se capacitará a adultos mayores de 55 años en adelante en talleres de dáctilo
                pintura, artes plásticas, danza típica santandereana, cine clásico y música
                tradicional. La mayoría de los participantes pertenecen a estratos 1 y 2 y
                provienen tanto de zonas urbanas como rurales del municipio.
              </p>
            </div>
          </div>
        </section>

        {/* Imagen del póster */}
        <section className="rounded-2xl border border-gray-200 shadow-sm bg-white">
          <div className="p-6 md:p-8 text-center">
            <img
              src="/images/Los invitamos.jpg"
              alt="Póster Adulto Mayor Activo"
              className="mx-auto w-1/3 rounded-xl shadow"
            />
          </div>
        </section>

        {/* Sección de inscripción */}
        <section className="rounded-2xl border border-gray-200 shadow-sm bg-white">
          <div className="p-6 md:p-8 text-center space-y-6">
            <p className="text-gray-700 leading-relaxed text-justify md:text-center">
              Para facilitar la participación, hemos diseñado un proceso de inscripción simple y
              accesible. Nuestro objetivo es acercar estos espacios de aprendizaje y recreación a
              toda la comunidad. También ofrecemos asistencia telefónica para quienes tengan
              dificultades tecnológicas, garantizando apoyo personalizado durante la inscripción.
            </p>

            <div className="flex justify-center gap-6 mt-4">
              <a href="/convocatorias">
                <button className="bg-[#5CE1E6] hover:bg-[#4cc8cc] text-white px-6 py-3 rounded-lg font-medium text-lg transition">
                  Más información
                </button>
              </a>
              <a href="/contactenos">
                <button className="bg-[#5CE1E6] hover:bg-[#4cc8cc] text-white px-6 py-3 rounded-lg font-medium text-lg transition">
                  Contáctenos
                </button>
              </a>
            </div>
          </div>
        </section>

        {/* Video */}
        <section className="rounded-2xl border border-gray-200 shadow-sm bg-white text-center p-8">
          <video
            controls
            className="mx-auto rounded-lg shadow w-full max-w-3xl"
          >
            <source src="/images/vide.mp4" type="video/mp4" />
            Tu navegador no soporta la reproducción de video.
          </video>
          <p className="mt-3 text-gray-600 text-lg">Visítanos en nuestra página de Facebook</p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
