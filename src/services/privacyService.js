/**
 * Servicio de privacidad estricta para "Cuentas Claras en Familia".
 * 
 * Regla de oro:
 * Cada persona ve ÚNICAMENTE los movimientos en los que participa.
 * Nadie, incluida quien creó la familia, puede ver los movimientos
 * ni los saldos entre otras dos personas.
 */

/**
 * Determina si un usuario participa activamente en un movimiento.
 * Participa si:
 * 1. Es quien pagó (paidBy === userId).
 * 2. Es beneficiario en la división (splits contiene al userId con monto > 0).
 * 3. En abonos, si es quien abona o quien recibe el abono.
 */
export function userParticipatesInMovement(userId, movement) {
  if (!userId || !movement) return false;

  // Si pagó el movimiento
  if (movement.paidBy === userId) return true;

  // Si es un abono, verificar remitente o destinatario
  if (movement.type === "abono") {
    if (movement.recipientId === userId) return true;
  }

  // Si está en la lista de splits
  if (Array.isArray(movement.splits)) {
    const userSplit = movement.splits.find(s => s.userId === userId);
    if (userSplit && Number(userSplit.amount) > 0) {
      return true;
    }
  }

  // Si está en participants explícitos
  if (Array.isArray(movement.participants) && movement.participants.includes(userId)) {
    return true;
  }

  return false;
}

/**
 * Filtra la lista completa de movimientos dejando solo aquellos en los que el usuario participa.
 */
export function filterMovementsForUser(movements, currentUserId) {
  if (!Array.isArray(movements) || !currentUserId) return [];
  return movements.filter(m => userParticipatesInMovement(currentUserId, m));
}

/**
 * Obtiene solo los movimientos que involucran a DOS personas específicas (para la vista "Con una persona").
 */
export function filterMovementsBetweenPair(movements, userAId, userBId) {
  if (!Array.isArray(movements) || !userAId || !userBId) return [];

  return movements.filter(m => {
    // Ambos deben participar en el movimiento
    const aParticipates = userParticipatesInMovement(userAId, m);
    const bParticipates = userParticipatesInMovement(userBId, m);

    if (!aParticipates || !bParticipates) return false;

    // Verificar si hay interacción económica directa entre ambos en este movimiento
    if (m.type === "abono") {
      return (m.paidBy === userAId && m.recipientId === userBId) ||
             (m.paidBy === userBId && m.recipientId === userAId);
    }

    // En gasto compartido: uno pagó y el otro tiene parte asignada
    if (m.paidBy === userAId) {
      const bPart = (m.splits || []).find(s => s.userId === userBId);
      return bPart && bPart.amount > 0;
    }

    if (m.paidBy === userBId) {
      const aPart = (m.splits || []).find(s => s.userId === userAId);
      return aPart && aPart.amount > 0;
    }

    return false;
  });
}
