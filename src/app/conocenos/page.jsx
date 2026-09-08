import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Script from "next/script";

export const metadata = {
  title: "Conócenos — Fundación Construyendo Futuro por Santander",
  description:
    "Historia, misión, visión, valores, actividades y equipo de la Fundación Construyendo Futuro por Santander.",
};

export default function ConocenosPage() {
  return (
    <div className="bg-white text-gray-800 min-h-screen">
      <Header />

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-10 space-y-10">
        {/* HISTORIA */}
        <section className="rounded-2xl border border-gray-200 shadow-sm bg-white">
          <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8 items-center">
            {/* Texto */}
            <div className="flex flex-col justify-center">
              <h2 className="text-2xl font-bold mb-3 text-gray-900">Nuestra Historia</h2>
              <p className="text-gray-700 text-justify leading-relaxed">
                La Fundación Construyendo Futuro por Santander fue fundada en 2022 con el
                propósito de promover el desarrollo integral de la comunidad a través de la
                cultura y el arte. Desde nuestros inicios, trabajamos para crear espacios
                donde personas de todas las edades puedan aprender, crecer y expresar su
                creatividad.
              </p>
            </div>
            {/* Imagen única */}
            <div className="flex justify-center">
              <img
                src="/images/inicio.jpg"
                alt="Nuestra Historia"
                className="w-full max-w-md rounded-xl shadow"
              />
            </div>
          </div>
        </section>

        {/* MISIÓN (texto izq, imagen der) */}
        <section className="rounded-2xl border border-gray-200 shadow-sm bg-white">
          <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col justify-center">
              <h2 className="text-2xl font-bold mb-3 text-gray-900">Nuestra Misión</h2>
              <p className="text-gray-700 text-justify leading-relaxed">
                Fomentar el bienestar emocional, el desarrollo creativo y el fortalecimiento
                de la autoestima a través de programas educativos y culturales inclusivos.
              </p>
              <p className="text-gray-700 text-justify leading-relaxed mt-3">
                Creemos en el poder transformador del arte, la música y la danza, y estamos
                dedicados a proporcionar oportunidades accesibles para toda la comunidad.
              </p>
            </div>
            <div className="flex justify-center">
              <img
                src="/images/P6.jpg"
                alt="Nuestra Misión"
                className="w-full max-w-md rounded-xl shadow"
              />
            </div>
          </div>
        </section>

        {/* VISIÓN (imagen izq, texto der) */}
        <section className="rounded-2xl border border-gray-200 shadow-sm bg-white">
          <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8 items-center">
            <div className="flex justify-center order-2 md:order-1">
              <img
                src="/images/P10.jpg"
                alt="Nuestra Visión"
                className="w-full max-w-md rounded-xl shadow"
              />
            </div>
            <div className="flex flex-col justify-center order-1 md:order-2">
              <h2 className="text-2xl font-bold mb-3 text-gray-900">Nuestra Visión</h2>
              <p className="text-gray-700 text-justify leading-relaxed">
                Ser un referente cultural y educativo en Santander, con programas y talleres
                que empoderen a las personas y contribuyan al desarrollo sostenible de la
                comunidad.
              </p>
              <p className="text-gray-700 text-justify leading-relaxed mt-3">
                Aspiramos a un futuro más brillante y equitativo, donde el acceso a la
                educación artística y cultural sea un derecho universal.
              </p>
            </div>
          </div>
        </section>

        {/* VALORES (texto izq, imagen der) */}
        <section className="rounded-2xl border border-gray-200 shadow-sm bg-white">
          <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col justify-center">
              <h2 className="text-2xl font-bold mb-3 text-gray-900">Nuestros Valores</h2>
              <ul className="space-y-3 text-gray-700 leading-relaxed text-justify">
                <li>
                  <span className="font-semibold">Inclusión:</span> espacios abiertos a todos,
                  sin importar edad, género, origen o situación socioeconómica.
                </li>
                <li>
                  <span className="font-semibold">Creatividad:</span> innovación y expresión
                  artística como motor de desarrollo.
                </li>
                <li>
                  <span className="font-semibold">Compromiso:</span> mejora de la calidad de
                  vida mediante proyectos sostenibles y significativos.
                </li>
                <li>
                  <span className="font-semibold">Colaboración:</span> trabajo conjunto con
                  artistas, educadores y organizaciones locales.
                </li>
              </ul>
            </div>
            <div className="flex justify-center">
              <img
                src="/images/P5.jpg"
                alt="Nuestros Valores"
                className="w-full max-w-md rounded-xl shadow"
              />
            </div>
          </div>
        </section>

        {/* ¿QUÉ HACEMOS? (imagen izq, texto der) */}
        <section className="rounded-2xl border border-gray-200 shadow-sm bg-white">
          <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8 items-center">
            <div className="flex justify-center order-2 md:order-1">
              <img
                src="/images/P3.jpg"
                alt="Qué hacemos"
                className="w-full max-w-md rounded-xl shadow"
              />
            </div>
            <div className="flex flex-col justify-center order-1 md:order-2">
              <h2 className="text-2xl font-bold mb-3 text-gray-900">¿Qué hacemos?</h2>
              <p className="text-gray-700 text-justify leading-relaxed">
                Ofrecemos programas y talleres de música, danza, artesanía y actividades
                culturales. Promovemos el intercambio de ideas y la participación comunitaria,
                con especial enfoque en el bienestar de los adultos mayores.
              </p>
            </div>
          </div>
        </section>

        {/* EQUIPO (texto izq, imagen der) */}
        <section className="rounded-2xl border border-gray-200 shadow-sm bg-white">
          <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col justify-center">
              <h2 className="text-2xl font-bold mb-3 text-gray-900">Nuestro Equipo</h2>
              <p className="text-gray-700 text-justify leading-relaxed">
                Contamos con profesionales dedicados y apasionados por el arte y la educación.
                Colaboramos con artistas locales, educadores y voluntarios que comparten nuestra
                visión de un futuro más inclusivo y creativo.
              </p>
            </div>
            <div className="flex justify-center">
              <img
                src="/images/P11.jpg"
                alt="Equipo"
                className="w-full max-w-md rounded-xl shadow"
              />
            </div>
          </div>
        </section>

        {/* ÚNETE (imagen izq, texto der) */}
        <section className="rounded-2xl border border-gray-200 shadow-sm bg-white">
          <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8 items-center">
            <div className="flex justify-center order-2 md:order-1">
              <img
                src="/images/P18.jpg"
                alt="Únete a nosotros"
                className="w-full max-w-md rounded-xl shadow"
              />
            </div>
            <div className="flex flex-col justify-center order-1 md:order-2">
              <h2 className="text-2xl font-bold mb-3 text-gray-900">Únete a nosotros</h2>
              <p className="text-gray-700 text-justify leading-relaxed">
                Participa en nuestros programas, sé voluntario o colaborador. Tu apoyo es
                fundamental para continuar nuestra misión. ¡Juntos, construyamos un futuro
                lleno de oportunidades y esperanza!
              </p>
            </div>
          </div>
        </section>

        {/* REDES SOCIALES (Facebook Page Plugin) */}
        <section className="rounded-2xl border border-gray-200 shadow-sm bg-white">
          <Script
            id="fb-sdk"
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src="https://connect.facebook.net/es_LA/sdk.js#xfbml=1&version=v19.0"
          />
          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 text-center">Redes sociales</h2>
            <div className="flex justify-center">
              <div
                className="fb-page"
                data-href="https://www.facebook.com/profile.php?id=100094017705513"
                data-tabs="timeline"
                data-width="500"
                data-height=""
                data-small-header="false"
                data-adapt-container-width="true"
                data-hide-cover="false"
                data-show-facepile="true"
              >
                <blockquote
                  cite="https://www.facebook.com/profile.php?id=100094017705513"
                  className="fb-xfbml-parse-ignore"
                >
                  <a href="https://www.facebook.com/profile.php?id=100094017705513">
                    Fundación Construyendo Futuro por Santander
                  </a>
                </blockquote>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
