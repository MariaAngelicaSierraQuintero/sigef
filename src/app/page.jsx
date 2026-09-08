import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Fundación Construyendo Futuro por Santander",
  description:
    "Organización sin ánimo de lucro que impulsa proyectos culturales y sociales en Santander.",
};

export default function HomePage() {
  return (
    <div className="bg-white text-gray-800 min-h-screen">
      {/* Encabezado global */}
      <Header />

      {/* HERO con imagen de fondo y botón "Conócenos" */}
      <section
        className="relative h-[85vh] md:h-[92vh] mb-8 flex items-center justify-center text-center overflow-hidden"
        style={{
          backgroundImage: "url('/images/inicio.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-3xl px-4">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white">
            ¡Fundación Construyendo Futuro por Santander!
          </h1>

          <div className="mt-6">
            <a
              href="#conocenos"
              className="inline-flex items-center justify-center rounded-lg px-6 py-2.5 text-white border border-white/70 hover:bg-white hover:text-gray-900 transition"
            >
              Conócenos
            </a>
          </div>
        </div>
      </section>

      {/* ABOUT 1 */}
      <section id="conocenos" className="max-w-6xl mx-auto px-4 mb-10">
        <div className="flex flex-col md:flex-row items-start gap-8 md:gap-12">
          <div className="md:w-1/2">
            <img
              src="/images/P12.jpg"
              alt="Actividades de la fundación"
              className="w-full h-auto rounded-2xl shadow"
            />
          </div>

          <div className="md:w-1/2 text-[17px] leading-relaxed">
            <p className="text-2xl font-bold text-gray-900 mb-3 border-b-2 border-[#5CE1E6] pb-1">
              La Fundación Construyendo Futuro por Santander
            </p>
            <p className="text-justify">
              Es una organización sin ánimo de lucro dedicada a la promoción del
              desarrollo integral de la comunidad a través de proyectos y
              talleres que brindan oportunidades de aprendizaje y crecimiento
              personal. Estamos dedicados a construir un futuro más brillante y
              equitativo para todos apoyando el potencial de cada individuo.
            </p>
            <p className="mt-3 text-justify">
              Nuestros proyectos y talleres están diseñados para ser inclusivos
              y accesibles para todos. Desde clases de música y danza hasta
              talleres de artesanía y actividades culturales, nuestro objetivo
              es crear un espacio donde las personas puedan descubrir y
              desarrollar sus talentos, explorar nuevas pasiones y encontrar
              comunidad en un ambiente de apoyo y respeto mutuo.
            </p>
          </div>
        </div>
      </section>

      {/* ABOUT 2 */}
      <section className="max-w-6xl mx-auto px-4 mb-12">
        <div className="flex flex-col md:flex-row items-start gap-8 md:gap-12">
          <div className="md:w-1/2 text-[17px] leading-relaxed order-2 md:order-1">
            <p className="text-2xl font-bold text-gray-900 mb-3 border-b-2 border-[#5CE1E6] pb-1">
              Nuestra fundación
            </p>
            <p className="text-justify">
              Se enfoca en ofrecer programas educativos y culturales diseñados
              para empoderar a personas de todas las edades y trasfondos
              socioeconómicos. Creemos firmemente en el poder transformador del
              arte, la música y la danza como herramientas para fomentar el
              bienestar emocional, el desarrollo creativo y el fortalecimiento
              de la autoestima.
            </p>
            <p className="mt-3 text-justify">
              Creemos en el potencial de cada individuo para alcanzar sus metas
              y contribuir al bienestar colectivo. Trabajamos por un futuro más
              brillante y equitativo donde cada persona tenga la oportunidad de
              aprender, crecer y prosperar. ¡Únete a nosotros!
            </p>
          </div>

          <div className="md:w-1/2 order-1 md:order-2">
            <img
              src="/images/P13.jpg"
              alt="Procesos culturales y educativos"
              className="w-full h-auto rounded-2xl shadow"
            />
          </div>
        </div>
      </section>

      {/* TRES COLUMNAS (Sobre, Proyectos, Participa) */}
      <section className="max-w-6xl mx-auto px-4 mb-16">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Columna 1 */}
          <article className="rounded-2xl bg-gray-50 border border-gray-200 p-5 shadow-sm text-center">
            <h2 className="text-xl font-semibold mb-3">SOBRE NOSOTROS</h2>
            <img
              src="/images/taller 5.jpg"
              alt="Taller 5"
              className="w-full h-44 object-cover rounded-lg mb-3"
            />
            <p className="text-[17px] text-justify">
              En la fundación entendemos que la cultura y el arte son
              fundamentales para el desarrollo humano y social. Diseñamos
              programas que enseñan técnicas artísticas y promueven valores como
              la empatía, la cooperación y la resiliencia.
            </p>
            <a
              href="/conocenos"
              className="inline-block mt-4 rounded-md px-5 py-2 bg-[#5CE1E6] hover:bg-[#50c7cd] text-black"
            >
              SABER MÁS
            </a>
          </article>

          {/* Columna 2 */}
          <article className="rounded-2xl bg-gray-50 border border-gray-200 p-5 shadow-sm text-center">
            <h2 className="text-xl font-semibold mb-3">NUESTROS PROYECTOS</h2>
            <img
              src="/images/taller 2.jpg"
              alt="Taller 2"
              className="w-full h-44 object-cover rounded-lg mb-3"
            />
            <p className="text-[17px] text-justify">
              “Adulto mayor activo: paz y reconciliación” nace de la necesidad
              de espacios de formación y participación. Buscamos fortalecer
              capacidades, autoestima e integración comunitaria.
            </p>
            <a
              href="/ejecucion"
              className="inline-block mt-4 rounded-md px-5 py-2 bg-[#5CE1E6] hover:bg-[#50c7cd] text-black"
            >
              SABER MÁS
            </a>
          </article>

          {/* Columna 3 */}
          <article className="rounded-2xl bg-gray-50 border border-gray-200 p-5 shadow-sm text-center">
            <h2 className="text-xl font-semibold mb-3">PARTICIPA</h2>
            <img
              src="/images/taller 3.jpg"
              alt="Taller 3"
              className="w-full h-44 object-cover rounded-lg mb-3"
            />
            <p className="text-[17px] text-justify">
              Implementamos un proceso simple y accesible para inscripciones de
              adultos mayores en nuestros talleres. Queremos acercar estos
              espacios de aprendizaje y recreación a toda la comunidad.
            </p>
            <a
              href="/convocatorias"
              className="inline-block mt-4 rounded-md px-5 py-2 bg-[#5CE1E6] hover:bg-[#50c7cd] text-black"
            >
              Más información
            </a>
          </article>
        </div>
      </section>

      {/* Zona personal (CTA a Login) */}
      <section className="max-w-6xl mx-auto px-4 mb-20">
        <div className="rounded-2xl border border-gray-200 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-5">
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-bold">Zona del personal</h2>
            <p className="text-gray-600 mt-1">
              Accede al módulo interno para registrar prestadores y generar egresos en PDF.
            </p>
          </div>
          <a
            href="/auth"
            className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 bg-blue-600 text-white hover:bg-blue-700"
          >
            Iniciar sesión
          </a>
        </div>
      </section>

      {/* Pie de página global */}
      <Footer />
    </div>
  );
}
