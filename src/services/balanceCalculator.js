/**
 * Lógica de negocio y cálculo de saldos para "Cuentas Claras en Familia".
 * 
 * Reglas fundamentales:
 * 1. Todos los movimientos se manejan con 2 decimales exactos.
 * 2. Al dividir en partes iguales, los centavos sobrantes los absorbe quien pagó.
 *    Si quien pagó no está en la división, se le asignan al primer beneficiario.
 * 3. Quetzales y Dólares se manejan en saldos separados, sin conversiones automáticas.
 * 4. Cuentan en el saldo: "sin_confirmar", "confirmado" y "visto_sin_respuesta".
 *    NO cuentan: "en_revision" ni "quitado".
 * 5. Todo saldo se expresa en frases cotidianas y cálidas:
 *    - "Luis tiene Q85 pendientes contigo" (a tu favor)
 *    - "Tienes Q40 pendientes con Sofía" (tienes pendiente)
 *    - "Con Ana están a mano 🤝" (saldo en cero)
 *    NUNCA usar palabras como deuda, cobro, deudor ni moroso.
 */

// Formateador de moneda en estándar guatemalteco (Q1,250.00 y US$300.00)
export function formatMoney(amount, currency = "GTQ") {
  const num = Math.abs(Number(amount) || 0);
  const formatted = num.toLocaleString("es-GT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  if (currency === "USD") {
    return `US$${formatted}`;
  }
  return `Q${formatted}`;
}

// Redondeo seguro a dos decimales
export function round2(num) {
  return Math.round((Number(num) + Number.EPSILON) * 100) / 100;
}

/**
 * Divide un monto total en partes iguales respetando la regla de absorción de centavos sobrantes.
 * @param {number} totalAmount - Monto total a dividir.
 * @param {string} paidById - ID de la persona que pagó.
 * @param {Array<string>} beneficiaryIds - Lista de IDs de las personas beneficiarias.
 * @returns {Array<{ userId: string, amount: number }>}
 */
export function distributeEqualSplit(totalAmount, paidById, beneficiaryIds) {
  if (!beneficiaryIds || beneficiaryIds.length === 0) return [];
  
  const totalCents = Math.round(Number(totalAmount) * 100);
  const count = beneficiaryIds.length;
  const baseCents = Math.floor(totalCents / count);
  let remainder = totalCents - (baseCents * count); // Centavos que sobran (ej. 1 centavo)

  // ¿Quién absorbe el centavo?
  // Quien pagó si está en la lista; si no está, el primer beneficiario.
  const payerIndex = beneficiaryIds.indexOf(paidById);
  const luckyIndex = payerIndex !== -1 ? payerIndex : 0;

  return beneficiaryIds.map((userId, index) => {
    let cents = baseCents;
    if (remainder > 0 && index === luckyIndex) {
      cents += remainder;
      remainder = 0;
    }
    return {
      userId,
      amount: round2(cents / 100)
    };
  });
}

/**
 * Determina si un movimiento es válido para contar en el saldo.
 */
export function countsInBalance(movement) {
  if (!movement) return false;
  const status = movement.status || "sin_confirmar";
  return status === "sin_confirmar" || status === "confirmado" || status === "visto_sin_respuesta";
}

/**
 * Calcula el saldo neto par a par entre userA y userB para una moneda específica.
 * Saldo positivo (+) significa que userB tiene pendiente con userA (a favor de userA).
 * Saldo negativo (-) significa que userA tiene pendiente con userB (userA tiene pendiente).
 * 
 * @param {string} userAId - ID del usuario actual (o persona A)
 * @param {string} userBId - ID de la otra persona (persona B)
 * @param {Array} movements - Lista de movimientos
 * @param {string} currency - "GTQ" o "USD"
 * @param {number} startingBalance - Saldo inicial del último cuadre cerrado (opcional)
 */
export function calculatePairwiseBalance(userAId, userBId, movements, currency = "GTQ", startingBalance = 0) {
  let netBalance = Number(startingBalance) || 0;

  // Filtrar movimientos activos de esta moneda donde ambos participan
  const relevantMovements = (movements || []).filter(m => {
    if (!countsInBalance(m)) return false;

    // FASE 3: Si es abono multidivisa (ej. pagar dólares con quetzales)
    if (m.type === "abono" && m.isCrossCurrency) {
      if (m.targetCurrency !== currency) return false;
      const isAtoB = m.paidBy === userAId && m.recipientId === userBId;
      const isBtoA = m.paidBy === userBId && m.recipientId === userAId;
      return isAtoB || isBtoA;
    }

    if (m.currency !== currency) return false;
    
    // Debe haber interacción directa entre A y B
    const isPayerA = m.paidBy === userAId;
    const isPayerB = m.paidBy === userBId;
    
    // Verificar si A o B están en los splits
    const bSplit = (m.splits || []).find(s => s.userId === userBId);
    const aSplit = (m.splits || []).find(s => s.userId === userAId);
    
    // Es relevante si A pagó y B se beneficia, o B pagó y A se beneficia
    if (isPayerA && bSplit && bSplit.amount > 0) return true;
    if (isPayerB && aSplit && aSplit.amount > 0) return true;
    
    // O si es un abono directo entre ambos
    if (m.type === "abono") {
      if (m.paidBy === userAId && m.recipientId === userBId) return true;
      if (m.paidBy === userBId && m.recipientId === userAId) return true;
    }
    
    return false;
  });

  for (const m of relevantMovements) {
    if (m.type === "abono") {
      const effectiveAmt = (m.isCrossCurrency && m.targetAmount) ? Number(m.targetAmount) : (Number(m.amount) || 0);
      // Un abono de B hacia A reduce lo que B tenía pendiente con A
      if (m.paidBy === userBId && m.recipientId === userAId) {
        netBalance -= effectiveAmt;
      }
      // Un abono de A hacia B reduce lo que A tenía pendiente con B
      else if (m.paidBy === userAId && m.recipientId === userBId) {
        netBalance += effectiveAmt;
      }
    } else {
      // Gasto compartido, préstamo o pago por otro
      if (m.paidBy === userAId) {
        // A pagó y B usó una parte -> B queda con esa parte pendiente con A (+ para A)
        const bShare = (m.splits || []).find(s => s.userId === userBId);
        if (bShare) {
          netBalance += Number(bShare.amount) || 0;
        }
      } else if (m.paidBy === userBId) {
        // B pagó y A usó una parte -> A queda con esa parte pendiente con B (- para A)
        const aShare = (m.splits || []).find(s => s.userId === userAId);
        if (aShare) {
          netBalance -= Number(aShare.amount) || 0;
        }
      }
    }
  }

  return round2(netBalance);
}

/**
 * Devuelve el saldo par a par completo en Quetzales y Dólares con sus frases naturales.
 */
export function getPairwiseSummary(currentUserId, otherMember, movements) {
  const balanceGTQ = calculatePairwiseBalance(currentUserId, otherMember.id, movements, "GTQ");
  const balanceUSD = calculatePairwiseBalance(currentUserId, otherMember.id, movements, "USD");

  const name = otherMember.name || "Familiar";

  // Generar frase natural para GTQ
  let phraseGTQ = "";
  let statusGTQ = "a_mano"; // "a_favor", "pendiente", "a_mano"
  if (balanceGTQ > 0) {
    phraseGTQ = `${name} tiene ${formatMoney(balanceGTQ, "GTQ")} pendientes contigo`;
    statusGTQ = "a_favor";
  } else if (balanceGTQ < 0) {
    phraseGTQ = `Tienes ${formatMoney(Math.abs(balanceGTQ), "GTQ")} pendientes con ${name}`;
    statusGTQ = "pendiente";
  } else {
    phraseGTQ = `Con ${name} están a mano 🤝`;
    statusGTQ = "a_mano";
  }

  // Frase natural para USD (solo si hay saldo o movimientos en USD)
  let phraseUSD = "";
  let statusUSD = "a_mano";
  if (balanceUSD > 0) {
    phraseUSD = `${name} tiene ${formatMoney(balanceUSD, "USD")} pendientes contigo`;
    statusUSD = "a_favor";
  } else if (balanceUSD < 0) {
    phraseUSD = `Tienes ${formatMoney(Math.abs(balanceUSD), "USD")} pendientes con ${name}`;
    statusUSD = "pendiente";
  } else {
    phraseUSD = `Con ${name} están a mano en dólares 🤝`;
    statusUSD = "a_mano";
  }

  // ¿Hay actividad en dólares?
  const hasUSDActivity = movements.some(m => 
    m.currency === "USD" && 
    (m.paidBy === otherMember.id || (m.splits || []).some(s => s.userId === otherMember.id))
  );

  return {
    otherMember,
    balanceGTQ,
    balanceUSD,
    phraseGTQ,
    phraseUSD,
    statusGTQ,
    statusUSD,
    hasUSDActivity: hasUSDActivity || balanceUSD !== 0
  };
}

/**
 * Calcula los totales globales para el encabezado del Inicio:
 * "En total tienes Q__ a tu favor y Q__ pendientes"
 */
export function calculateOverallTotals(currentUserId, otherMembers, movements) {
  let totalFavorGTQ = 0;
  let totalPendienteGTQ = 0;
  let totalFavorUSD = 0;
  let totalPendienteUSD = 0;

  for (const member of otherMembers) {
    const balGTQ = calculatePairwiseBalance(currentUserId, member.id, movements, "GTQ");
    const balUSD = calculatePairwiseBalance(currentUserId, member.id, movements, "USD");

    if (balGTQ > 0) totalFavorGTQ += balGTQ;
    else if (balGTQ < 0) totalPendienteGTQ += Math.abs(balGTQ);

    if (balUSD > 0) totalFavorUSD += balUSD;
    else if (balUSD < 0) totalPendienteUSD += Math.abs(balUSD);
  }

  return {
    favorGTQ: round2(totalFavorGTQ),
    pendienteGTQ: round2(totalPendienteGTQ),
    favorUSD: round2(totalFavorUSD),
    pendienteUSD: round2(totalPendienteUSD),
    hasUSD: totalFavorUSD > 0 || totalPendienteUSD > 0
  };
}

/**
 * Genera el resumen en lenguaje natural antes de guardar un movimiento.
 * Ejemplo real: "Pagaste Q120 de pizza. Luis y Sofía quedan con Q40 pendientes cada uno contigo."
 */
export function generateMovementSummaryText(data, currentUserId, membersMap) {
  const { amount, currency = "GTQ", paidBy, note, splits, type } = data;
  const payerName = membersMap[paidBy]?.name || "Alguien";
  const formattedTotal = formatMoney(amount, currency);
  const cleanNote = note ? ` de ${note.trim().toLowerCase()}` : "";

  // Caso Abono
  if (type === "abono") {
    const recipientName = membersMap[data.recipientId]?.name || "alguien";
    if (paidBy === currentUserId) {
      return `Registraste un abono de ${formattedTotal} a ${recipientName}.`;
    } else {
      return `${payerName} te hizo un abono de ${formattedTotal}.`;
    }
  }

  // Caso Pago o Gasto
  const isPayerMe = paidBy === currentUserId;
  const beneficiaries = (splits || []).filter(s => s.amount > 0);
  const otherBeneficiaries = beneficiaries.filter(s => s.userId !== paidBy);

  if (otherBeneficiaries.length === 0) {
    // Pagó solo para sí mismo (raro, pero posible)
    return isPayerMe
      ? `Anotaste ${formattedTotal}${cleanNote} para ti.`
      : `${payerName} pagó ${formattedTotal}${cleanNote} para sí mismo.`;
  }

  // ¿Todos los demás tienen la misma parte?
  const firstAmount = otherBeneficiaries[0].amount;
  const allSameAmount = otherBeneficiaries.every(b => b.amount === firstAmount);

  const namesList = otherBeneficiaries
    .map(b => (b.userId === currentUserId ? "tú" : membersMap[b.userId]?.name || "alguien"))
    .join(" y ");

  if (isPayerMe) {
    if (allSameAmount) {
      if (otherBeneficiaries.length === 1) {
        return `Pagaste ${formattedTotal}${cleanNote}. ${namesList} queda con ${formatMoney(firstAmount, currency)} pendientes contigo.`;
      } else {
        return `Pagaste ${formattedTotal}${cleanNote}. ${namesList} quedan con ${formatMoney(firstAmount, currency)} pendientes cada uno contigo.`;
      }
    } else {
      const details = otherBeneficiaries
        .map(b => `${membersMap[b.userId]?.name || "alguien"} con ${formatMoney(b.amount, currency)}`)
        .join(", ");
      return `Pagaste ${formattedTotal}${cleanNote}. Pendientes contigo: ${details}.`;
    }
  } else {
    // Pagó otra persona
    const myShare = beneficiaries.find(b => b.userId === currentUserId);
    if (myShare) {
      return `${payerName} pagó ${formattedTotal}${cleanNote}. Quedas con ${formatMoney(myShare.amount, currency)} pendientes con ${payerName}.`;
    } else {
      return `${payerName} pagó ${formattedTotal}${cleanNote} para ${namesList}.`;
    }
  }
}
