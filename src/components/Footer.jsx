export default function Footer() {
  const TURQUESA = "#5CE1E6";

  return (
    <footer style={{ backgroundColor: TURQUESA }} className="mt-12 text-gray-900">
      {/* Contenido principal */}
      <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8">
        {/* Columna 1 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Fundación Construyendo Futuro por Santander
          </h2>
          <p className="text-sm mt-2 text-gray-800">
            “Uniendo manos y corazones para edificar un mañana lleno de oportunidades y esperanza en Santander.”
          </p>
          <div className="mt-3 space-y-1 text-sm text-gray-800">
            <div>Piedecuesta, Santander</div>
            <div>(+57) 317 4940090</div>
            <div>funconstrueyendofuturosan@gmail.com</div>
          </div>
        </div>

        {/* Columna 2 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Enlaces</h2>
          <ul className="mt-3 space-y-1 text-sm text-gray-800">
            <li><a href="/" className="hover:underline">Inicio</a></li>
            <li><a href="/conocenos" className="hover:underline">Conócenos</a></li>
            <li><a href="/ejecucion" className="hover:underline">Proyectos en Ejecución</a></li>
            <li><a href="/pasados" className="hover:underline">Proyectos Pasados</a></li>
            <li><a href="/convocatorias" className="hover:underline">Convocatorias</a></li>
            <li><a href="/contactenos" className="hover:underline">Contáctenos</a></li>
          </ul>
        </div>

        {/* Columna 3 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Síguenos</h2>
          <div className="mt-3">
            <a
              href="https://www.facebook.com/profile.php?id=100094017705513"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-900 hover:underline"
            >
              🌐 Facebook oficial
            </a>
          </div>
        </div>
      </div>

      {/* Línea inferior */}
      <div className="border-t border-white/60">
        <div className="max-w-6xl mx-auto px-4 py-3 text-xs text-gray-800 text-center">
          © {new Date().getFullYear()} Fundación Construyendo Futuro por Santander. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
