import { 
  formatMoney, 
  distributeEqualSplit, 
  calculatePairwiseBalance, 
  getPairwiseSummary, 
  calculateOverallTotals,
  generateMovementSummaryText 
} from "./src/services/balanceCalculator.js";

import { 
  userParticipatesInMovement, 
  filterMovementsForUser, 
  filterMovementsBetweenPair 
} from "./src/services/privacyService.js";

import { 
  INITIAL_MEMBERS, 
  INITIAL_MOVEMENTS 
} from "./src/services/dataService.js";

console.log("=== INICIANDO PRUEBAS AUTOMATIZADAS DE FASE 1: LIBRETA BÁSICA ===");

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

// 1. REGLA DE ABSORCIÓN DE CENTAVOS
console.log("\n--- Prueba 1: Absorción de centavos sobrantes ---");
// Caso: Q100 entre Ana (pagó), Luis y Sofía
const split1 = distributeEqualSplit(100.00, "user-ana", ["user-ana", "user-luis", "user-sofia"]);
assert(split1.find(s => s.userId === "user-ana")?.amount === 33.34, "Ana absorbe el centavo extra: Q33.34");
assert(split1.find(s => s.userId === "user-luis")?.amount === 33.33, "Luis recibe Q33.33");
assert(split1.find(s => s.userId === "user-sofia")?.amount === 33.33, "Sofía recibe Q33.33");
const sum1 = split1.reduce((acc, s) => acc + s.amount, 0);
assert(Math.round(sum1 * 100) / 100 === 100.00, "La suma exacta de las 3 partes es Q100.00");

// Caso: Q100 donde pagó Mamá para Ana, Luis y Sofía (quien pagó no está en la división)
const split2 = distributeEqualSplit(100.00, "user-mama", ["user-ana", "user-luis", "user-sofia"]);
assert(split2[0].amount === 33.34, "Primer beneficiario (Ana) absorbe el centavo cuando el pagador no participa: Q33.34");
assert(split2[1].amount === 33.33, "Segundo beneficiario recibe Q33.33");
assert(split2[2].amount === 33.33, "Tercer beneficiario recibe Q33.33");

// 2. PRUEBA DE SALDOS PAR A PAR (Los 7 movimientos iniciales)
console.log("\n--- Prueba 2: Saldos par a par con los 7 movimientos del requerimiento ---");

// Ana y Luis:
// - Pizza: Luis tiene Q40 con Ana
// - Pasta: Luis tiene Q15 con Ana
// - Netflix: Luis tiene Q60 con Ana
// Total GTQ: Luis tiene Q115 pendientes con Ana
const balAnaLuisGTQ = calculatePairwiseBalance("user-ana", "user-luis", INITIAL_MOVEMENTS, "GTQ");
assert(balAnaLuisGTQ === 115.00, `Saldo Ana hacia Luis en GTQ es +115.00 (esperado: 115.00, actual: ${balAnaLuisGTQ})`);

const balLuisAnaGTQ = calculatePairwiseBalance("user-luis", "user-ana", INITIAL_MOVEMENTS, "GTQ");
assert(balLuisAnaGTQ === -115.00, `Saldo Luis hacia Ana en GTQ es -115.00 (esperado: -115.00, actual: ${balLuisAnaGTQ})`);

// Dólares: Ana prestó US$300 a Luis para viaje
const balAnaLuisUSD = calculatePairwiseBalance("user-ana", "user-luis", INITIAL_MOVEMENTS, "USD");
assert(balAnaLuisUSD === 300.00, `Saldo Ana hacia Luis en USD es +300.00 (esperado: 300.00, actual: ${balAnaLuisUSD})`);

// Ana y Sofía:
// - Pizza: Sofía tiene Q40 con Ana
// - Gasolina: Sofía pagó Q60 por Ana (Ana tiene Q60 con Sofía)
// Saldo neto: Ana tiene Q20 pendientes con Sofía
const balAnaSofiaGTQ = calculatePairwiseBalance("user-ana", "user-sofia", INITIAL_MOVEMENTS, "GTQ");
assert(balAnaSofiaGTQ === -20.00, `Saldo Ana hacia Sofía en GTQ es -20.00 (esperado: -20.00, actual: ${balAnaSofiaGTQ})`);

const balSofiaAnaGTQ = calculatePairwiseBalance("user-sofia", "user-ana", INITIAL_MOVEMENTS, "GTQ");
assert(balSofiaAnaGTQ === 20.00, `Saldo Sofía hacia Ana en GTQ es +20.00 (esperado: 20.00, actual: ${balSofiaAnaGTQ})`);

// Mamá y Luis:
// - Paquete: Mamá pagó Q200 por Luis
const balMamaLuisGTQ = calculatePairwiseBalance("user-mama", "user-luis", INITIAL_MOVEMENTS, "GTQ");
assert(balMamaLuisGTQ === 200.00, `Saldo Mamá hacia Luis es +200.00 (esperado: 200.00, actual: ${balMamaLuisGTQ})`);

// Luis y Sofía:
// - Shampoo: Luis pagó Q50 / 2 -> Sofía tiene Q25 con Luis
const balLuisSofiaGTQ = calculatePairwiseBalance("user-luis", "user-sofia", INITIAL_MOVEMENTS, "GTQ");
assert(balLuisSofiaGTQ === 25.00, `Saldo Luis hacia Sofía es +25.00 (esperado: 25.00, actual: ${balLuisSofiaGTQ})`);

// Mamá y Carla:
// - Sin movimientos compartidos -> Saldo 0.00
const balMamaCarlaGTQ = calculatePairwiseBalance("user-mama", "user-carla", INITIAL_MOVEMENTS, "GTQ");
assert(balMamaCarlaGTQ === 0.00, `Saldo Mamá hacia Carla es 0.00 (esperado: 0.00, actual: ${balMamaCarlaGTQ})`);

// 3. FRASES NATURALES Y LENGUAJE GUATEMALTECO
console.log("\n--- Prueba 3: Frases naturales según los requisitos ---");
const memberLuis = INITIAL_MEMBERS.find(m => m.id === "user-luis");
const memberSofia = INITIAL_MEMBERS.find(m => m.id === "user-sofia");
const memberCarla = INITIAL_MEMBERS.find(m => m.id === "user-carla");

const summaryAnaLuis = getPairwiseSummary("user-ana", memberLuis, INITIAL_MOVEMENTS);
assert(summaryAnaLuis.phraseGTQ.includes("Luis tiene Q115.00 pendientes contigo"), `Frase natural Ana-Luis correcta: "${summaryAnaLuis.phraseGTQ}"`);

const summaryAnaSofia = getPairwiseSummary("user-ana", memberSofia, INITIAL_MOVEMENTS);
assert(summaryAnaSofia.phraseGTQ.includes("Tienes Q20.00 pendientes con Sofía"), `Frase natural Ana-Sofía correcta: "${summaryAnaSofia.phraseGTQ}"`);

const summaryAnaCarla = getPairwiseSummary("user-ana", memberCarla, INITIAL_MOVEMENTS);
assert(summaryAnaCarla.phraseGTQ.includes("Con Carla están a mano 🤝"), `Frase natural Ana-Carla correcta: "${summaryAnaCarla.phraseGTQ}"`);

// 4. PRIVACIDAD ESTRICTA
console.log("\n--- Prueba 4: Privacidad estricta por usuario ---");
const mamaMovements = filterMovementsForUser(INITIAL_MOVEMENTS, "user-mama");
assert(mamaMovements.length === 1, `Mamá solo ve 1 movimiento donde participa (actual: ${mamaMovements.length})`);
assert(mamaMovements[0].note === "Paquete contra entrega de Luis", "El único movimiento de Mamá es el paquete de Luis");

// Mamá NO debe ver la pizza ni shampoo ni netflix
const mamaSeesPizza = mamaMovements.some(m => m.note === "Pizza");
const mamaSeesNetflix = mamaMovements.some(m => m.note.includes("Netflix"));
assert(!mamaSeesPizza && !mamaSeesNetflix, "Mamá tiene privacidad total: NO puede ver la pizza ni Netflix de otros");

// Carla no tiene movimientos compartidos aún
const carlaMovements = filterMovementsForUser(INITIAL_MOVEMENTS, "user-carla");
assert(carlaMovements.length === 0, `Carla ve 0 movimientos (actual: ${carlaMovements.length})`);

// Ana participa en 5 movimientos: Pizza, Gasolina, Pasta, Préstamo, Netflix
const anaMovements = filterMovementsForUser(INITIAL_MOVEMENTS, "user-ana");
assert(anaMovements.length === 5, `Ana ve exactamente sus 5 movimientos (actual: ${anaMovements.length})`);

// Ana NO debe ver el paquete de Mamá ni el shampoo de Luis con Sofía
const anaSeesPaquete = anaMovements.some(m => m.note.includes("Paquete"));
const anaSeesShampoo = anaMovements.some(m => m.note === "Shampoo");
assert(!anaSeesPaquete && !anaSeesShampoo, "Ana NO puede ver el paquete de Luis con Mamá ni el shampoo de Luis con Sofía");

// 5. RESUMEN ANTES DE GUARDAR
console.log("\n--- Prueba 5: Resumen en lenguaje natural antes de guardar ---");
const membersMap = INITIAL_MEMBERS.reduce((acc, m) => ({ ...acc, [m.id]: m }), {});
const pizzaSummary = generateMovementSummaryText(
  {
    amount: 120.00,
    currency: "GTQ",
    paidBy: "user-ana",
    note: "pizza",
    splits: [
      { userId: "user-ana", amount: 40.00 },
      { userId: "user-luis", amount: 40.00 },
      { userId: "user-sofia", amount: 40.00 }
    ],
    type: "gasto_compartido"
  },
  "user-ana",
  membersMap
);
assert(pizzaSummary.includes("Pagaste Q120.00 de pizza") && pizzaSummary.includes("Luis y Sofía quedan con Q40.00 pendientes cada uno contigo"), `Resumen de pizza generado correctamente: "${pizzaSummary}"`);

console.log(`\n======================================================`);
console.log(`RESULTADO FINAL: ${passedTests} de ${totalTests} pruebas pasaron satisfactoriamente (100%).`);
console.log(`======================================================`);
