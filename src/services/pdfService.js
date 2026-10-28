import { jsPDF } from "jspdf";
import { formatMoney } from "./balanceCalculator.js";

export function generateCuadrePDF(cuadre, userA, userB, movements, membersMap) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Encabezado
  doc.setFillColor(13, 148, 136); // Teal #0D9488
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Cuentas Claras en Familia", 15, y);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Cuadre de Cuentas por Periodo", 15, y + 6);

  y = 38;

  // Caja de Información General
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(15, y, pageWidth - 30, 32, 3, 3, "FD");

  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Participantes:", 20, y + 8);
  doc.setFont("helvetica", "normal");
  doc.text(`${userA.name} y ${userB.name}`, 50, y + 8);

  doc.setFont("helvetica", "bold");
  doc.text("Periodo:", 20, y + 15);
  doc.setFont("helvetica", "normal");
  doc.text(`Del ${cuadre.startDate} al ${cuadre.endDate}`, 50, y + 15);

  doc.setFont("helvetica", "bold");
  doc.text("Estado del cuadre:", 20, y + 22);
  if (cuadre.status === "cerrado") {
    doc.setTextColor(22, 101, 52);
    doc.setFont("helvetica", "bold");
    doc.text("✓ CERRADO DE MUTUO ACUERDO", 55, y + 22);
  } else {
    doc.setTextColor(180, 83, 9);
    doc.setFont("helvetica", "bold");
    doc.text("⏳ ESPERANDO ACUERDO", 55, y + 22);
  }

  y += 40;

  // Saldos Iniciales
  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Saldo inicial del periodo:", 15, y);
  doc.setFont("helvetica", "normal");
  const initGTQ = formatMoney(cuadre.initialBalanceGTQ || 0, "GTQ");
  const initUSD = formatMoney(cuadre.initialBalanceUSD || 0, "USD");
  doc.text(`${initGTQ}  |  ${initUSD}`, 65, y);

  y += 8;

  // Tabla de Movimientos
  doc.setDrawColor(13, 148, 136);
  doc.setLineWidth(0.5);
  doc.line(15, y, pageWidth - 15, y);
  y += 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text("Fecha", 16, y);
  doc.text("Concepto / Nota", 42, y);
  doc.text("Pagó", 115, y);
  doc.text("Monto", 155, y);
  doc.text("Estado", 178, y);

  y += 3;
  doc.setDrawColor(226, 232, 240);
  doc.line(15, y, pageWidth - 15, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);

  const periodMovements = (movements || []).filter(m => {
    return cuadre.movementIds && cuadre.movementIds.includes(m.id);
  });

  for (const m of periodMovements) {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    const payer = membersMap[m.paidBy]?.name || "Alguien";
    const statusText = m.status === "confirmado" ? "Confirmado" : (m.status === "en_revision" ? "En revisión" : "Sin conf.");
    const formattedAmount = formatMoney(m.amount, m.currency);

    doc.setTextColor(51, 65, 85);
    doc.text(m.date || "", 16, y);
    doc.text((m.note || m.type).substring(0, 36), 42, y);
    doc.text(payer.substring(0, 18), 115, y);
    doc.text(formattedAmount, 155, y);
    doc.text(statusText, 178, y);

    y += 5.5;
  }

  y += 4;
  doc.setDrawColor(203, 213, 225);
  doc.line(15, y, pageWidth - 15, y);
  y += 8;

  // Resumen de Saldos Finales
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(15, y, pageWidth - 30, 26, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Saldo final del cuadre:", 20, y + 8);

  const finalGTQ = formatMoney(cuadre.finalBalanceGTQ || 0, "GTQ");
  const finalUSD = formatMoney(cuadre.finalBalanceUSD || 0, "USD");

  doc.setFontSize(12);
  doc.setTextColor(13, 148, 136);
  doc.text(`En Quetzales: ${finalGTQ}`, 20, y + 16);
  doc.text(`En Dólares: ${finalUSD}`, 105, y + 16);

  y += 34;

  // Constancia de Mutuo Acuerdo
  if (cuadre.status === "cerrado") {
    doc.setFillColor(236, 253, 245);
    doc.setDrawColor(167, 243, 208);
    doc.roundedRect(15, y, pageWidth - 30, 24, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(6, 95, 70);
    doc.text("✓ Constancia de Mutuo Acuerdo", 20, y + 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(
      `Cerrado y ratificado el ${new Date(cuadre.closedAt || Date.now()).toLocaleDateString("es-GT")}. ` +
      `Ambas personas revisaron este periodo y están de acuerdo. Los movimientos son inmutables.`,
      20,
      y + 14,
      { maxWidth: pageWidth - 40 }
    );
  }

  // Descarga automática en navegador
  const fileName = `Cuadre_${userA.name}_${userB.name}_${cuadre.startDate}_${cuadre.endDate}.pdf`;
  doc.save(fileName);
}
