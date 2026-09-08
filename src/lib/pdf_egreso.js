import jsPDF from "jspdf"; // Librería para generar documentos PDF
import autoTable from "jspdf-autotable"; // Extensión de jsPDF para crear tablas de forma automática
import { format } from "date-fns"; // Función para formatear fechas
import { es } from "date-fns/locale"; // Localización para fechas en español
import { ORG } from "./org"; // Config de la organización
import { numeroALetras, fmtMoney } from "./format"; // Utilidades formato
import { supabase } from "./supabaseClient"; // Cliente Supabase

// Lista de convenios conocidos (esto lo dejé igual)
const CONVENIOS = [
  { codigo: "2975-2024", nombre: "Ministerio de Cultura" },
  { codigo: "2019-2023", nombre: "Ministerio de las Culturas, Artes y Saberes" },
];

/**
 * Genera el PDF del egreso y lo sube a Storage.
 * @param {Object} egreso - fila de egresos (id, consecutivo, convenio, cantidad, valor_unitario, retencion, medio_pago, cod_retencion, anulado, etc.)
 * @param {Object} prestador - fila de proveedores (cedula, nombres, apellidos, banco, tipo_cuenta, numero_cuenta, telefono)
 * @returns {Object} { url } URL pública del PDF en storage
 */
export async function generarYSubirPDFEgreso(egreso, prestador) {
  console.log("Datos recibidos para PDF:", { egreso, prestador });

  // ===============================
  // 1) Preparar datos
  // ===============================
  const fecha = format(
    new Date(egreso.fecha || Date.now()),
    "PPP",
    { locale: es }
  );

  const cantidad = Number(egreso.cantidad || 0);
  const vlrUnit = Number(egreso.valor_unitario || 0);
  const retPct = Number(egreso.retencion || 0);

  const valorBruto = cantidad * vlrUnit;
  const valorRetencion = Math.round((retPct / 100) * valorBruto);
  const valorNeto = valorBruto - valorRetencion;

  const nombrePrestador = `${prestador?.nombres || ""} ${prestador?.apellidos || ""}`.trim();

  const cuentaTxt =
    egreso.medio_pago === "transferencia"
      ? `${prestador?.banco || "-"} · ${prestador?.tipo_cuenta || "-"} · ${
          prestador?.numero_cuenta || "-"
        }`
      : "EFECTIVO";

  // Match del convenio
  const convMatch =
    CONVENIOS.find(
      (c) =>
        String(c.codigo) === String(egreso.convenio) ||
        `${c.codigo} – ${c.nombre}` === String(egreso.convenio)
    ) || null;

  const convenioTxt = convMatch
    ? `${convMatch.codigo} – ${convMatch.nombre}`
    : String(egreso.convenio || "-");

  // ===============================
  // 2) Crear PDF
  // ===============================
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Logo
  try {
    const logoResponse = await fetch(ORG.logoPath);
    if (!logoResponse.ok) throw new Error("Logo fetch failed");
    const logo = await logoResponse.blob();
    const reader = await new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = rej;
      fr.readAsDataURL(logo);
    });
    doc.addImage(reader, "PNG", 40, 65, 70, 70);
  } catch (e) {
    console.warn("Error cargando logo:", e.message);
  }

  // Encabezado entidad
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(ORG.nombre, pageWidth / 2, 65, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`NIT: ${ORG.nit}`, pageWidth / 2, 135, { align: "center" });
  doc.text(
    `${ORG.ciudad} – Tel: ${ORG.telefono}`,
    pageWidth / 2,
    155,
    { align: "center" }
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    `Comprobante de Egreso No. ${egreso.consecutivo}`,
    pageWidth - 40,
    175,
    { align: "right" }
  );
  doc.text(`Fecha: ${fecha}`, pageWidth - 40, 195, {
    align: "right",
  });

  // Cuadro Proveedor
  const proveedorY = 215;
  autoTable(doc, {
    startY: proveedorY,
    body: [
      ["Proveedor", nombrePrestador],
      ["Cédula", prestador?.cedula || "-"],
      ["Teléfono", prestador?.telefono || "No registrado"],
      ["Convenio", convenioTxt],
    ],
    theme: "grid",
    styles: {
      fontSize: 10,
      cellPadding: 5,
      halign: "left",
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
    },
    columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 400 } },
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] },
  });

  // Cuadro Concepto / Observación
  const conceptoY = doc.lastAutoTable.finalY + 20;
  autoTable(doc, {
    startY: conceptoY,
    body: [
      ["Concepto", egreso.concepto || "-"],
      ["Observación", egreso.descripcion || "-"],
    ],
    theme: "grid",
    styles: {
      fontSize: 10,
      cellPadding: 5,
      halign: "left",
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
    },
    columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 400 } },
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] },
  });

  // Suma en letras
  const sumaLetrasY = doc.lastAutoTable.finalY + 20;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.text(
    `LA SUMA DE (EN LETRAS): ${numeroALetras(valorNeto)}`,
    40,
    sumaLetrasY
  );

  // Tabla contable
  const tablaContableY = sumaLetrasY + 20;
  const tablaContable = [
    [
      "28150510",
      `VALORES RECIBIDOS PARA TERCEROS ${convenioTxt} diseño y manejo de redes sociales`,
      "",
      fmtMoney(valorBruto),
      "",
    ],
    [
      egreso.cod_retencion || "",
      `RETENCIÓN ${retPct}%`,
      fmtMoney(valorRetencion),
      "",
      fmtMoney(valorRetencion),
    ],
    [
      egreso.medio_pago === "efectivo" ? "1105" : "1110",
      egreso.medio_pago
        ? egreso.medio_pago.toUpperCase()
        : "",
      fmtMoney(valorNeto),
      "",
      fmtMoney(valorNeto),
    ],
    [
      "",
      "Suma iguales:",
      "",
      fmtMoney(valorBruto),
      fmtMoney(valorBruto),
    ],
  ];

  autoTable(doc, {
    startY: tablaContableY,
    head: [["CÓDIGOS", "CUENTAS", "PARCIALES", "DÉBITOS", "CRÉDITOS"]],
    body: tablaContable,
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 5,
      overflow: "linebreak",
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
    },
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 200 },
      2: { cellWidth: 80 },
      3: { cellWidth: 80 },
      4: { cellWidth: 80 },
    },
  });

  // Tabla firmas / cuenta
  const yDetalles = doc.lastAutoTable.finalY + 20;
  const firmaTabla = [
    [
      {
        content: "DATOS",
        colSpan: 2,
        styles: {
          halign: "center",
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
        },
      },
      {
        content: "Firma beneficiario",
        colSpan: 2,
        rowSpan: 2,
        styles: {
          halign: "center",
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
        },
      },
    ],
    ["numero de cuenta", prestador?.numero_cuenta || ""],
    ["banco", prestador?.banco || "", "Beneficiario", nombrePrestador],
    ["tipo de cuenta", prestador?.tipo_cuenta || "", "CC.o nit", prestador?.cedula || "-"],
    ["PREPARÓ: AA", "REVISÓ: FAS", "APROBÓ: APQ", "CONTABILIZÓ: APQ"],
  ];

  autoTable(doc, {
    startY: yDetalles,
    body: firmaTabla,
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 5,
      halign: "left",
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 100 },
      2: { cellWidth: 100 },
      3: { cellWidth: 100 },
    },
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] },
  });

  // ===============================
  // 2.5) WATERMARK "ANULADO"
  // ===============================
  if (egreso.anulado === true) {
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: 0.15 }));
    doc.setTextColor(255, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(90);

    // rotar el texto en diagonal
    doc.text("ANULADO", pageWidth / 2, pageHeight / 2, {
      angle: -30,
      align: "center",
    });

    doc.restoreGraphicsState();
  }

  // ===============================
  // 3) Subir PDF a Supabase
  // ===============================
  try {
    const pdfBlob = doc.output("blob");
    const fileName = `egreso_${egreso.consecutivo}.pdf`;

    // carpeta por convenio. Si el convenio viene complejo, úsalo tal cual como antes
    const path = `${egreso.convenio || "general"}/${fileName}`;

    const { error: upErr } = await supabase.storage
      .from("egresos")
      .upload(path, pdfBlob, {
        upsert: true,
        contentType: "application/pdf",
      });
    if (upErr) throw upErr;

    const { data: pub } = supabase.storage
      .from("egresos")
      .getPublicUrl(path);
    const url = pub?.publicUrl;

    await supabase
      .from("egresos")
      .update({ pdf_url: url })
      .eq("id", egreso.id);

    console.log("PDF subido exitosamente:", url);
    return { url };
  } catch (e) {
    console.error("Error subiendo PDF:", e.message);
    throw e;
  }
}
