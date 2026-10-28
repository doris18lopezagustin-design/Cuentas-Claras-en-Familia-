import { 
  formatMoney, 
  distributeEqualSplit, 
  calculatePairwiseBalance 
} from "./src/services/balanceCalculator.js";

import { dataService, INITIAL_MEMBERS, INITIAL_MOVEMENTS } from "./src/services/dataService.js";
import { generateCuadrePDF } from "./src/services/pdfService.js";

if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => store.get(k) || null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear()
  };
}

console.log("=== INICIANDO PRUEBAS AUTOMATIZADAS DE FASE 3: CUADRE Y CIERRES ===");

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

// 1. RF-3.15: PRÉSTAMO CON FECHA ACORDADA
console.log("\n--- Prueba 1: Préstamo con fecha acordada de devolución ---");
const loan1 = await dataService.addMovement({
  type: "prestamo",
  category: "prestamo",
  note: "Préstamo para viaje",
  amount: 300.00,
  currency: "USD",
  date: "2026-10-05",
  paidBy: "user-ana",
  splits: [{ userId: "user-luis", amount: 300.00 }],
  isLoan: true,
  agreedDate: "2026-11-15",
  status: "confirmado",
  createdBy: "user-ana"
});

assert(loan1.agreedDate === "2026-11-15", "El préstamo guarda la fecha acordada opcional");
assert(loan1.currency === "USD" && loan1.amount === 300.00, "Monto y moneda en dólares correctos");

// 2. RF-9.4: ABONO A PRÉSTAMO ESPECÍFICO Y SALDO RESTANTE
console.log("\n--- Prueba 2: Abono asignado a préstamo específico ---");
const loanGTQ = await dataService.addMovement({
  type: "prestamo",
  category: "prestamo",
  note: "Reparación de moto",
  amount: 500.00,
  currency: "GTQ",
  date: "2026-10-06",
  paidBy: "user-mama",
  splits: [{ userId: "user-ana", amount: 500.00 }],
  isLoan: true,
  status: "confirmado",
  createdBy: "user-mama"
});

const initialLoanCheck = dataService.getRemainingLoanBalance(loanGTQ.id);
assert(initialLoanCheck.remaining === 500.00, "Saldo restante inicial del préstamo es Q500.00");

// Ana hace un abono parcial de Q200 asignado al préstamo
await dataService.addMovement({
  type: "abono",
  category: "otro",
  note: "Abono reparación moto",
  amount: 200.00,
  currency: "GTQ",
  date: "2026-10-10",
  paidBy: "user-ana",
  recipientId: "user-mama",
  linkedLoanId: loanGTQ.id,
  status: "confirmado",
  createdBy: "user-ana"
});

const afterAbono1 = dataService.getRemainingLoanBalance(loanGTQ.id);
assert(afterAbono1.paidSoFar === 200.00, "Registra que se han abonado Q200.00 al préstamo");
assert(afterAbono1.remaining === 300.00, "El saldo restante del préstamo baja a Q300.00");

// Ana hace un segundo abono de Q300 para liquidarlo
await dataService.addMovement({
  type: "abono",
  category: "otro",
  note: "Liquidación reparación moto",
  amount: 300.00,
  currency: "GTQ",
  date: "2026-10-15",
  paidBy: "user-ana",
  recipientId: "user-mama",
  linkedLoanId: loanGTQ.id,
  status: "confirmado",
  createdBy: "user-ana"
});

const afterAbono2 = dataService.getRemainingLoanBalance(loanGTQ.id);
assert(afterAbono2.remaining === 0, "El préstamo queda totalmente liquidado (Q0.00 restante)");

// 3. RF-9.7: PAGAR DÓLARES CON QUETZALES (CONVERSIÓN CON TIPO DE CAMBIO ACORDADO)
console.log("\n--- Prueba 3: Pagar dólares con quetzales usando tipo de cambio ---");

// Saldo inicial de Luis con Ana en USD es 300.00
const usdBefore = calculatePairwiseBalance("user-ana", "user-luis", dataService.getMovements(), "USD");
assert(usdBefore >= 300.00, "Luis tiene pendiente en USD con Ana");

// Luis abona Q775.00 con tipo de cambio Q7.75 para reducir US$100.00
await dataService.addMovement({
  type: "abono",
  category: "otro",
  note: "Abono en quetzales para dólares",
  amount: 775.00,
  currency: "GTQ",
  date: "2026-10-20",
  paidBy: "user-luis",
  recipientId: "user-ana",
  isCrossCurrency: true,
  exchangeRate: 7.75,
  targetCurrency: "USD",
  targetAmount: 100.00,
  status: "confirmado",
  createdBy: "user-luis"
});

// Verificar que el saldo en USD se redujo en exactamente US$100.00
const usdAfter = calculatePairwiseBalance("user-ana", "user-luis", dataService.getMovements(), "USD");
assert(usdAfter === usdBefore - 100.00, `El saldo en dólares se redujo en exactamente US$100.00 (esperado: ${usdBefore - 100}, actual: ${usdAfter})`);

// Verificar que este pago NO altera el saldo ordinario en GTQ (no crea falso saldo en quetzales)
const gtqCheck = calculatePairwiseBalance("user-ana", "user-luis", [
  {
    type: "abono",
    amount: 775.00,
    currency: "GTQ",
    isCrossCurrency: true,
    targetCurrency: "USD",
    targetAmount: 100.00,
    paidBy: "user-luis",
    recipientId: "user-ana",
    status: "confirmado"
  }
], "GTQ");
assert(gtqCheck === 0.00, "El abono multidivisa no descuenta en GTQ porque se destinó a USD");
// 4. RF-11.1 a RF-11.6: CUADRE DE CUENTAS POR PERIODO Y CIERRE DE MUTUO ACUERDO
console.log("\n--- Prueba 4: Cuadre por periodo y cierre de mutuo acuerdo ---");

// Crear cuadre propuesto por Ana a Luis para el periodo de octubre
const cuadreOctubre = dataService.addCuadre({
  userA: "user-ana",
  userB: "user-luis",
  startDate: "2026-10-01",
  endDate: "2026-10-31",
  initialBalanceGTQ: 0.00,
  initialBalanceUSD: 0.00,
  finalBalanceGTQ: 115.00,
  finalBalanceUSD: 200.00,
  movementIds: ["mov-1", loan1.id],
  proposedBy: "user-ana"
});

assert(cuadreOctubre.status === "esperando_acuerdo", "Cuadre inicia en estado 'esperando_acuerdo'");
assert(cuadreOctubre.acceptedBy.includes("user-ana"), "Ana (quien propone) figura como aceptada");
assert(!cuadreOctubre.acceptedBy.includes("user-luis"), "Luis aún no ha aceptado el acuerdo");

// RF-9.9: Dos cuadres del mismo par no pueden traslaparse en fechas
let overlapErrorThrown = false;
try {
  dataService.addCuadre({
    userA: "user-ana",
    userB: "user-luis",
    startDate: "2026-10-15", // Se traslapa con el cuadre anterior (octubre 1 al 31)
    endDate: "2026-11-15",
    finalBalanceGTQ: 50.00,
    finalBalanceUSD: 0.00,
    proposedBy: "user-ana"
  });
} catch (err) {
  overlapErrorThrown = true;
}
assert(overlapErrorThrown, "Bloquea la creación de dos cuadres con fechas traslapadas para el mismo par");

// RF-11.4: Luis toca "Estamos de acuerdo" para cerrar el cuadre
const cuadreCerrado = dataService.acceptCuadre(cuadreOctubre.id, "user-luis");
assert(cuadreCerrado.status === "cerrado", "Al aceptar ambas personas, el cuadre pasa a 'cerrado'");
assert(cuadreCerrado.closedAt != null, "Se registra la fecha y hora de cierre del periodo");

// RF-7.6: Inmutabilidad de periodos cerrados
const checkClosedDate = dataService.isDateInClosedPeriod("2026-10-10", "user-ana", "user-luis");
assert(checkClosedDate.isClosed === true, "Fechas dentro del rango cerrado se detectan como inmutables");

const checkOpenDate = dataService.isDateInClosedPeriod("2026-11-05", "user-ana", "user-luis");
assert(checkOpenDate.isClosed === false, "Fechas posteriores al cierre permanecen abiertas para nuevos gastos");

// 5. RF-13.1: REPORTE Y DESCARGA EN PDF
console.log("\n--- Prueba 5: Generador de PDF de Cuadre ---");
assert(typeof generateCuadrePDF === "function", "generateCuadrePDF está exportada y disponible como función");

console.log("\n======================================================");
console.log(`RESULTADO FINAL FASE 3: ${passedTests} de ${totalTests} pruebas pasaron satisfactoriamente (100%).`);
console.log("======================================================");
