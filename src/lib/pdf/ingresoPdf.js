import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ORG } from "@/lib/org";
import { numeroALetras, fmtMoney } from "@/lib/format";

/** Carga imagen como dataURL */
async function loadImageAsDataURL(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok)
    throw new Error(`No se pudo cargar el logo: ${res.status}`);
  const blob = await res.blob();
  return await new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(blob);
  });
}

/** Detectar formato imagen para jsPDF */
function guessFormatForJsPDF(path = "") {
  const p = path.toLowerCase();
  if (p.endsWith(".jpg") || p.endsWith(".jpeg")) return "JPEG";
  return "PNG"; // por defecto
}

/**
 * Construye el PDF del comprobante de ingreso.
 * Recibe el objeto "ing", que puede incluir ing.anulado === true
 * Devuelve un Blob listo para subir/descargar.
 */
export async function buildIngresoPdf(ing) {
  const fecha = format(
    new Date(ing.fechaIngreso || Date.now()),
    "PPP",
    { locale: es }
  );

  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1) Logo
  try {
    const dataURL = await loadImageAsDataURL(ORG.logoPath);
    const fmt = guessFormatForJsPDF(ORG.logoPath);
    doc.addImage(dataURL, fmt, 40, 65, 70, 70);
  } catch (e) {
    console.warn("Logo no cargado:", e?.message || e);
  }

  // 2) Encabezado
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(ORG.nombre, pageWidth / 2, 65, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`NIT: ${ORG.nit}`, pageWidth / 2, 135, {
    align: "center",
  });
  doc.text(
    `${ORG.ciudad} – Tel: ${ORG.telefono}`,
    pageWidth / 2,
    155,
    { align: "center" }
  );

  doc.setFontSize(10);
  doc.text(
    `Comprobante de Ingreso No. ${ing.consecutivo}`,
    pageWidth - 40,
    175,
    { align: "right" }
  );
  doc.text(`Fecha: ${fecha}`, pageWidth - 40, 195, {
    align: "right",
  });

  // 3) Entidad / Convenio
  const startY = 215;
  autoTable(doc, {
    startY,
    body: [
      ["Entidad que transfiere", ing.entidadNombre || "-"],
      ["NIT / Cédula", ing.entidadNit || "-"],
      ["Convenio", ing.convenio || "-"],
    ],
    theme: "grid",
    styles: {
      fontSize: 10,
      cellPadding: 5,
      halign: "left",
    },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { cellWidth: 400 },
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
    },
  });

  // 4) Concepto / Medio de pago
  const conceptoY = doc.lastAutoTable.finalY + 15;
  autoTable(doc, {
    startY: conceptoY,
    body: [
      ["Concepto", ing.concepto || "-"],
      ["Medio de pago", ing.medioPago || "-"],
      [
        "Banco / Cuenta",
        `${ing.banco || "-"} / ${ing.cuenta || "-"}`,
      ],
    ],
    theme: "grid",
    styles: {
      fontSize: 10,
      cellPadding: 5,
      halign: "left",
    },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { cellWidth: 400 },
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
    },
  });

  // 5) Totales
  const totY = doc.lastAutoTable.finalY + 15;
  autoTable(doc, {
    startY: totY,
    head: [["Detalle", "Valor"]],
    body: [
      [
        "Valor total cobrado",
        fmtMoney(ing.valorTotal),
      ],
      [
        `Impuesto (${ing.impuestoPct || 0}%)`,
        fmtMoney(ing.impuestoValor || 0),
      ],
      [
        "Valor consignado",
        fmtMoney(ing.valorConsignado || 0),
      ],
    ],
    theme: "grid",
    styles: {
      fontSize: 10,
      cellPadding: 6,
      halign: "left",
    },
    columnStyles: {
      0: { cellWidth: 250 },
      1: { cellWidth: 120, halign: "right" },
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
    },
  });

  // 6) En letras
  const letrasY = doc.lastAutoTable.finalY + 15;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.text(
    `VALOR CONSIGNADO EN LETRAS: ${numeroALetras(
      Number(ing.valorConsignado || 0)
    )}`,
    40,
    letrasY
  );

  // 7) Observaciones
  if (ing.observaciones?.trim()) {
    autoTable(doc, {
      startY: letrasY + 15,
      body: [
        ["Observaciones", ing.observaciones],
      ],
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 5,
        halign: "left",
      },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 400 },
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
      },
    });
  }

  // 8) WATERMARK "ANULADO"
  if (ing.anulado === true) {
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: 0.15 }));
    doc.setTextColor(255, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(90);

    doc.text("ANULADO", pageWidth / 2, pageHeight / 2, {
      angle: -30,
      align: "center",
    });

    doc.restoreGraphicsState();
  }

  // 9) Entregar blob listo para subir a Storage (lo subes igual que ya lo haces)
  return doc.output("blob");
}
