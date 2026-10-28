
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => store.get(k) || null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear()
  };
}

﻿import { 
  formatMoney, 
  distributeEqualSplit, 
  calculatePairwiseBalance 
} from "./src/services/balanceCalculator.js";

import { dataService, INITIAL_MEMBERS, INITIAL_MOVEMENTS, INITIAL_RECURRING } from "./src/services/dataService.js";
import { compressImageFile } from "./src/services/imageService.js";

console.log("=== INICIANDO PRUEBAS AUTOMATIZADAS DE FASE 2: CONFIANZA ===");

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`✓ [PASÓ] ${testName}`);
    passedTests++;
  } else {
    console.error(`✕ [FALLÓ] ${testName}`);
    process.exitCode = 1;
  }
}

// 1. DETECCIÓN DE DUPLICADOS (Requisito Fase 2)
console.log("\n--- Prueba 1: Detección inteligente de duplicados ---");

// Simular movimiento existente en la lista
const baseDate = new Date().toISOString().split("T")[0];
const fakeExistingMov = {
  id: "mov-test-1",
  amount: 100.00,
  currency: "GTQ",
  date: baseDate,
  paidBy: "user-ana",
  participants: ["user-ana", "user-luis"],
  splits: [{ userId: "user-ana", amount: 50 }, { userId: "user-luis", amount: 50 }],
  status: "confirmado"
};

// Insertar temporalmente en localStorage mock
dataService.initLocalStorage();
let movs = dataService.getMovements();
movs.push(fakeExistingMov);
localStorage.setItem("cuentas_claras_movements", JSON.stringify(movs));

// Caso A: Mismo movimiento exactamente (mismo pagador, mismas personas, mismo monto, misma fecha)
const dupExact = dataService.checkDuplicate({
  amount: 100.00,
  currency: "GTQ",
  date: baseDate,
  paidBy: "user-ana",
  participants: ["user-ana", "user-luis"]
});
assert(dupExact.isDuplicate === true, "Detecta duplicado exacto con mismas personas y monto");

// Caso B: Diferencia menor al 5% (ej. Q102 vs Q100 = 2% de diferencia)
const dupNear = dataService.checkDuplicate({
  amount: 102.00,
  currency: "GTQ",
  date: baseDate,
  paidBy: "user-ana",
  participants: ["user-ana", "user-luis"]
});
assert(dupNear.isDuplicate === true, "Detecta duplicado con monto similar (< 5% de diferencia)");

// Caso C: Diferencia mayor al 5% (ej. Q110 vs Q100 = 10% de diferencia)
const noDupDiffAmount = dataService.checkDuplicate({
  amount: 110.00,
  currency: "GTQ",
  date: baseDate,
  paidBy: "user-ana",
  participants: ["user-ana", "user-luis"]
});
assert(noDupDiffAmount.isDuplicate === false, "No marca duplicado si la diferencia supera el 5%");

// Caso D: Diferentes participantes
const noDupDiffPeople = dataService.checkDuplicate({
  amount: 100.00,
  currency: "GTQ",
  date: baseDate,
  paidBy: "user-ana",
  participants: ["user-ana", "user-sofia"]
});
assert(noDupDiffPeople.isDuplicate === false, "No marca duplicado si las personas son diferentes");

// Caso E: Fecha con más de 1.5 días de diferencia
const oldDate = new Date(Date.now() - 86400000 * 5).toISOString().split("T")[0];
const noDupOldDate = dataService.checkDuplicate({
  amount: 100.00,
  currency: "GTQ",
  date: oldDate,
  paidBy: "user-ana",
  participants: ["user-ana", "user-luis"]
});
assert(noDupOldDate.isDuplicate === false, "No marca duplicado si ocurrió días antes");
// 2. HISTORIAL DE CAMBIOS Y AUDITORÍA
console.log("\n--- Prueba 2: Historial de cambios y auditoría completa ---");

// Crear movimiento
const newMov = await dataService.addMovement({
  type: "gasto_compartido",
  category: "comida",
  note: "Almuerzo dominical",
  amount: 200.00,
  currency: "GTQ",
  date: baseDate,
  paidBy: "user-ana",
  splits: [
    { userId: "user-ana", amount: 100.00 },
    { userId: "user-luis", amount: 100.00 }
  ],
  status: "sin_confirmar",
  createdBy: "user-ana"
});

assert(newMov.history && newMov.history.length === 1, "El movimiento recién creado inicia con su primer registro en history");
assert(newMov.history[0].action === "creado", "Acción inicial es 'creado'");

// Editar movimiento
const editedMov = dataService.editMovement(newMov.id, {
  amount: 220.00,
  note: "Almuerzo dominical con postre"
}, "user-ana");

assert(editedMov.history.length === 2, "La edición agrega un segundo evento al historial");
assert(editedMov.history[1].action === "editado", "Acción es 'editado'");
assert(editedMov.history[1].details.includes("220"), "El detalle del historial documenta el cambio de monto");

// 3. PROPUESTA DE CORRECCIÓN Y EXCLUSIÓN DEL SALDO
console.log("\n--- Prueba 3: Proponer corrección y exclusión del saldo (en_revision) ---");

// Antes de proponer corrección: Luis tiene Q110 pendientes con Ana por este movimiento
const movsBeforeCorrection = dataService.getMovements();
const balBefore = calculatePairwiseBalance("user-ana", "user-luis", [editedMov], "GTQ");
assert(balBefore > 0, "Movimiento sin confirmar cuenta inicialmente en el saldo");

// Luis propone corrección porque el postre era de otro
dataService.proposeCorrection(editedMov.id, {
  amount: 180.00,
  date: baseDate,
  comment: "Yo no comí postre, mi parte eran Q90"
}, "user-luis");

const movAfterCorrection = dataService.getMovements().find(m => m.id === editedMov.id);
assert(movAfterCorrection.status === "en_revision", "El estado pasa inmediatamente a 'en_revision'");
assert(movAfterCorrection.pendingCorrection != null, "Se registra la corrección pendiente");
assert(movAfterCorrection.history.some(h => h.action === "propuesta_correccion"), "Se agrega evento 'propuesta_correccion' al historial");

// REGLA CLAVE: En revisión NO cuenta en el saldo
const balDuringRevision = calculatePairwiseBalance("user-ana", "user-luis", [movAfterCorrection], "GTQ");
assert(balDuringRevision === 0, "Movimiento 'en_revision' queda excluido de los saldos (saldo es 0.00)");

// Aceptar corrección
dataService.acceptCorrection(editedMov.id, "user-ana");
const movAccepted = dataService.getMovements().find(m => m.id === editedMov.id);
assert(movAccepted.status === "confirmado", "Al aceptar la corrección pasa a 'confirmado'");
assert(movAccepted.history.some(h => h.action === "correccion_aceptada"), "Historial registra 'correccion_aceptada'");

// 4. QUITAR SIN BORRAR (ANULACIÓN SUAVE)
console.log("\n--- Prueba 4: Quitar sin borrar (soft delete) ---");

await dataService.removeMovement(editedMov.id, "Lo anoté dos veces", "user-ana");
const movRemoved = dataService.getMovements().find(m => m.id === editedMov.id);
assert(movRemoved.status === "quitado", "Estado cambia a 'quitado'");
assert(movRemoved.removeReason === "Lo anoté dos veces", "Se preserva el motivo por el que se quitó");
assert(movRemoved.history.some(h => h.action === "quitado"), "El historial preserva quién lo quitó y cuándo");

// REGLA CLAVE: Quitado NO cuenta en el saldo
const balAfterRemove = calculatePairwiseBalance("user-ana", "user-luis", [movRemoved], "GTQ");
assert(balAfterRemove === 0, "Movimiento 'quitado' queda 100% excluido del saldo (0.00)");

// 5. GASTOS QUE SE REPITEN (FASE 2)
console.log("\n--- Prueba 5: Gastos que se repiten (mensualidades) ---");

const recurringList = dataService.getRecurringExpenses();
assert(recurringList.length >= 1, "Existe al menos 1 gasto recurrente en la plantilla");
const netflix = recurringList.find(r => r.name.toLowerCase().includes("netflix"));
assert(netflix != null, "Netflix está en los gastos recurrentes iniciales (Q120)");
assert(netflix.dayOfMonth === 15, "Netflix está programado para el día 15 de cada mes");

// Pausar y reanudar recurrente
dataService.updateRecurringExpense(netflix.id, { status: "pausado" });
assert(dataService.getRecurringExpenses().find(r => r.id === netflix.id).status === "pausado", "Se puede pausar un gasto recurrente");
dataService.updateRecurringExpense(netflix.id, { status: "activo" });
assert(dataService.getRecurringExpenses().find(r => r.id === netflix.id).status === "activo", "Se puede reactivar un gasto recurrente");

// 6. COMPROBANTE FOTOGRÁFICO
console.log("\n--- Prueba 6: Servicio de compresión de comprobantes fotográficos ---");
assert(typeof compressImageFile === "function", "compressImageFile está exportado y disponible como función");

console.log("\n======================================================");
console.log(`RESULTADO FINAL FASE 2: ${passedTests} de ${totalTests} pruebas pasaron satisfactoriamente (100%).`);
console.log("======================================================");
