// src/lib/format.js

// Formatea valores como dinero COP sin decimales: 1500000 -> "$1.500.000"
export function fmtMoney(n) {
  const v = Number(n ?? 0);
  return v.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
}

// Función mejorada para convertir números a letras
export function numeroALetras(n) {
  const unidades = [
    "", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve",
  ];
  const decenas = [
    "", "diez", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa",
  ];
  const especiales = [
    "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve",
  ];
  const centenas = [
    "", "cien", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos",
  ];

  function convertirMenor1000(num) {
    if (num === 0) return "cero";
    let resultado = "";
    const c = Math.floor(num / 100);
    const d = Math.floor((num % 100) / 10);
    const u = num % 10;

    if (c > 0) {
      resultado += centenas[c];
      if (d > 0 || u > 0) resultado += " ";
    }
    if (d > 0) {
      if (d === 1 && u > 0 && u < 10) {
        resultado += especiales[u];
      } else {
        resultado += decenas[d];
        if (u > 0) resultado += " y " + unidades[u];
      }
    } else if (u > 0) {
      resultado += unidades[u];
    }
    return resultado;
  }

  const entero = Math.round(Number(n ?? 0));
  if (entero === 0) return "cero pesos";

  const millones = Math.floor(entero / 1000000);
  const miles = Math.floor((entero % 1000000) / 1000);
  const cientos = entero % 1000;

  let resultado = "";
  if (millones > 0) {
    resultado += convertirMenor1000(millones) + " millones";
    if (miles > 0 || cientos > 0) resultado += " ";
  }
  if (miles > 0) {
    resultado += convertirMenor1000(miles) + " mil";
    if (cientos > 0) resultado += " ";
  }
  if (cientos > 0) {
    resultado += convertirMenor1000(cientos);
  }

  return `${resultado.trim()} pesos`;
}