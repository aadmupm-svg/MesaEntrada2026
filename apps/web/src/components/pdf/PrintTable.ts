import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Nota } from "../../types";

const AZUL = [19, 60, 120] as const;
async function cargarLogo(): Promise<string | null> {
  try {
    const resp = await fetch("/logoMuni.png");
    if (!resp.ok) return null;
    const blob = await resp.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function imprimirPlanilla(notas: Nota[], fechaPdf: string, hoy: string) {
  const fecha = fechaPdf || hoy;
  const notasDia = notas.filter((nota) => nota.fecha === fecha);
  const logo = await cargarLogo();

  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const ancho = pdf.internal.pageSize.getWidth();
  const centro = ancho / 2;

  if (logo) {
    pdf.addImage(logo, "PNG", 10, 8, 15, 21);
  }

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(AZUL[0], AZUL[1], AZUL[2]);
  pdf.text("MESA DE ENTRADA Y SALIDAS", centro, 13, { align: "center" });

  pdf.setFontSize(12);
  pdf.text(`Resumen de movimientos del día ${fecha}`, centro, 20, { align: "center" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(80, 80, 80);
  pdf.text(
    `Total de notas: ${notasDia.length}    -    Generado el ${hoy}`,
    centro,
    26.5,
    { align: "center" }
  );

  pdf.setDrawColor(AZUL[0], AZUL[1], AZUL[2]);
  pdf.setLineWidth(0.6);
  pdf.line(8, 31, ancho - 8, 31);

  autoTable(pdf, {
    startY: 35,
    theme: "grid",
    margin: { horizontal: 8, bottom: 13 },
    styles: {
      fontSize: 8,
      cellPadding: 1.4,
      lineColor: [170, 170, 170],
      lineWidth: 0.2,
      valign: "middle",
      overflow: "linebreak",
      textColor: [30, 30, 30],
    },
    alternateRowStyles: { fillColor: [240, 244, 250] },
    headStyles: {
      fillColor: [19, 60, 120],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      cellPadding: 1.8,
      halign: "center",
      valign: "middle",
      fontStyle: "bold",
      lineColor: [19, 60, 120],
      lineWidth: 0.3,
    },
    columnStyles: {
      0: { halign: "center" },
      1: { halign: "center" },
      2: { halign: "center" },
      3: { halign: "center" },
      4: { halign: "center", fontStyle: "bold" },
      5: { halign: "center" },
      7: { fontStyle: "italic" },
      8: { halign: "center" },
    },
    head: [["Tipo", "Nº Nota", "Letra", "Fojas", "Fecha", "Hora", "Firmante", "Extracto", "Destino"]],
    body: notasDia.map((nota) => [
      nota.tipo,
      nota.numero,
      nota.letra,
      nota.fojas,
      nota.fecha,
      nota.hora,
      nota.firmante,
      nota.extracto,
      nota.para,
    ]),
  });

  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Página ${i} de ${pageCount}`, centro, 200, { align: "center" });
  }

  const url = pdf.output("bloburl").toString();
  window.open(url, "_blank");
}
