import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Nota } from "../../types";

export function imprimirPlanilla(notas: Nota[], fechaPdf: string, hoy: string) {
  const fecha = fechaPdf || hoy;
  const notasDia = notas.filter((nota) => nota.fecha === fecha);

  const pdf = new jsPDF({ orientation: "landscape" });

  autoTable(pdf, {
    theme: "grid",
    margin: { horizontal: 5, bottom: 13, top: 8 },
    bodyStyles: { lineColor: [0, 0, 0], valign: "middle" },
    alternateRowStyles: { fillColor: [234, 234, 234] },
    headStyles: {
      fillColor: [178, 178, 178],
      textColor: [0, 0, 0],
      fontSize: 8,
      cellPadding: 0,
      halign: "center",
      valign: "middle",
      lineColor: 50,
      lineWidth: 0.3,
    },
    columnStyles: {
      0: { halign: "center" },
      1: { halign: "center" },
      2: { halign: "center" },
      3: { halign: "center" },
      4: { halign: "center", fontStyle: "bold" },
      5: { halign: "center" },
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
  const centerPage = pdf.internal.pageSize.getWidth() / 2;

  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(8);

  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.text(`Página ${i} de ${pageCount}`, centerPage, 200, { align: "center" });
  }

  pdf.save(fecha);
}
