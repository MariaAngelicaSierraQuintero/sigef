import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PasadosSlideshow from "@/components/PasadosSlideshow";

export const metadata = {
  title: "Proyectos Pasados — Fundación Construyendo Futuro por Santander",
  description:
    "Adulto Mayor Activo 2023 — resumen del proyecto, galería de fotos y video.",
};

export default function PasadosPage() {
  return (
    <div className="bg-white text-gray-800 min-h-screen">
      <Header />

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-10 space-y-10">
        {/* Encabezado */}
        <section className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Adulto Mayor Activo 2023
          </h1>
          <h2 className="mt-2 text-lg text-gray-700">
            Convenio 2019–2023 entre el Ministerio de las Culturas, las Artes y
            los Saberes y la Fundación Construyendo Futuro por Santander
          </h2>
        </section>

        {/* Intro texto */}
        <section className="rounded-2xl border border-gray-200 shadow-sm bg-white">
          <div className="p-6 md:p-8">
            <p className="text-gray-700 text-justify leading-relaxed">
              ADULTO MAYOR ACTIVO PIEDECUESTA 2023 es un proyecto que nace de la
              necesidad de espacios de formación y participación para las
              personas mayores del municipio. Buscamos fortalecer sus capacidades
              físicas y mentales, y mejorar su autoestima al reconocer que, pese
              a la edad, siguen aportando a la cultura y a la comunidad.
            </p>
          </div>
        </section>

        {/* Carrusel */}
        <section className="rounded-2xl border border-gray-200 shadow-sm bg-white">
          <div className="p-6 md:p-8">
            <PasadosSlideshow />
          </div>
        </section>

        {/* Más texto */}
        <section className="rounded-2xl border border-gray-200 shadow-sm bg-white">
          <div className="p-6 md:p-8 space-y-4">
            <p className="text-gray-700 text-justify leading-relaxed">
              Los adultos mayores de Piedecuesta tienen mucho que decir sobre la
              cultura local, pero a menudo carecen de espacios para compartir y
              validar sus saberes. Por ello, generamos ambientes de participación
              donde reconstruyen y socializan ese conocimiento, fortaleciendo su
              memoria y dejando un registro que trascienda.
            </p>
            <p className="text-gray-700 text-justify leading-relaxed">
              El proyecto se dirige a mayores de 50 años con talleres de
              formación y actividades terapéuticas que incentivan la relajación y
              la reflexión. También promovemos la reconstrucción y difusión de
              saberes ancestrales, contribuyendo a la memoria de largo plazo y a
              la prevención de enfermedades neurodegenerativas.
            </p>
          </div>
        </section>

        {/* Video */}
        <section className="rounded-2xl border border-gray-200 shadow-sm bg-white">
          <div className="p-6 md:p-8 text-center">
            <video
              controls
              className="mx-auto rounded-lg shadow w-full max-w-3xl"
            >
              <source src="/images/video-.mp4" type="video/mp4" />
              Tu navegador no soporta la reproducción de video.
            </video>
            <p className="mt-3 text-gray-600 text-sm md:text-base">
              Así trabajamos en cada uno de los talleres, con compromiso,
              dedicación y la compañía de profesionales que garantizan un
              excelente proceso de formación.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
