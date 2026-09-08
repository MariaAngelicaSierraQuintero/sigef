"use client";
import { useEffect, useState } from "react";

// Soporta nombres de archivo con espacios (taller 3.jpg, etc.)
function encodePath(p) {
  const parts = p.split("/").map((seg, i, arr) =>
    i === arr.length - 1 ? encodeURIComponent(seg) : seg
  );
  return parts.join("/");
}

const photos = [
  "/images/P19.jpg",
  "/images/P18.jpg",
  "/images/P17.jpg",
  "/images/P16.jpg",
  "/images/taller 3.jpg",
  "/images/taller 4.jpg",
  "/images/taller 3.1.jpg",
].map(encodePath);

export default function PasadosSlideshow() {
  const [idx, setIdx] = useState(0);

  const prev = () => setIdx((v) => (v - 1 + photos.length) % photos.length);
  const next = () => setIdx((v) => (v + 1) % photos.length);

  useEffect(() => {
    const t = setInterval(next, 8000); // auto cada 8s
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative max-w-3xl mx-auto select-none">
      <img
        src={photos[idx]}
        alt={`Foto ${idx + 1}`}
        className="w-full h-[300px] md:h-[420px] object-cover rounded-xl shadow"
      />

      {/* Flechas */}
      <button
        aria-label="foto anterior"
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-3 py-2 rounded-md hover:bg-black/60"
      >
        ‹
      </button>
      <button
        aria-label="foto siguiente"
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-3 py-2 rounded-md hover:bg-black/60"
      >
        ›
      </button>

      {/* Puntos */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {photos.map((_, i) => (
          <button
            key={i}
            aria-label={`ir a la foto ${i + 1}`}
            onClick={() => setIdx(i)}
            className={`h-3 w-3 rounded-full transition ${
              idx === i ? "bg-gray-700" : "bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
