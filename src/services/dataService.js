/**
 * Servicio central de datos para "Cuentas Claras en Familia".
 * Fase 1 + Fase 2: Confianza, Duplicados, Comprobantes, Historial y Gastos Repetidos.
 */
import { db } from "../firebase.js";
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc 
} from "firebase/firestore";

// Miembros de prueba de la familia inicial (5 personas: Mamá, Ana, Luis, Sofía y Carla)
export const INITIAL_MEMBERS = [
  {
    id: "user-mama",
    name: "Mamá",
    fullName: "María Agustín",
    pin: "1234",
    email: "mama@cuentasclaras.gt",
    avatar: "👩",
    color: "#4338CA",
    simpleMode: true,
    fontSize: "large",
    phone: "502555501"
  },
  {
    id: "user-ana",
    name: "Ana",
    fullName: "Ana Agustín",
    pin: "1234",
    email: "ana@cuentasclaras.gt",
    avatar: "👧",
    color: "#059669",
    simpleMode: false,
    fontSize: "normal",
    phone: "502555502"
  },
  {
    id: "user-luis",
    name: "Luis",
    fullName: "Luis Agustín",
    pin: "1234",
    email: "luis@cuentasclaras.gt",
    avatar: "👨",
    color: "#2563EB",
    simpleMode: false,
    fontSize: "normal",
    phone: "502555503"
  },
  {
    id: "user-sofia",
    name: "Sofía",
    fullName: "Sofía Agustín",
    pin: "1234",
    email: "sofia@cuentasclaras.gt",
    avatar: "👩‍🦰",
    color: "#D97706",
    simpleMode: false,
    fontSize: "normal",
    phone: "502555504"
  },
  {
    id: "user-carla",
    name: "Carla",
    fullName: "Carla Agustín",
    pin: "1234",
    email: "carla@cuentasclaras.gt",
    avatar: "👧‍🦱",
    color: "#9333EA",
    simpleMode: false,
    fontSize: "normal",
    phone: "502555505"
  }
];

export const INITIAL_FAMILY = {
  id: "fam-garcia",
  name: "Familia Agustín",
  inviteCode: "AGUSTIN789",
  createdAt: "2026-10-01T12:00:00.000Z",
  members: INITIAL_MEMBERS,
  memberIds: INITIAL_MEMBERS.map(m => m.id)
};

const today = new Date();
const formatDate = (daysAgo) => {
  const d = new Date(today);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
};

// Los 7 movimientos iniciales del requerimiento con historial de cambios incorporado
export const INITIAL_MOVEMENTS = [
  {
    id: "mov-1",
    familyId: "fam-garcia",
    type: "gasto_compartido",
    category: "comida",
    note: "Pizza",
    amount: 120.00,
    currency: "GTQ",
    date: formatDate(0),
    paidBy: "user-ana",
    splits: [
      { userId: "user-ana", amount: 40.00 },
      { userId: "user-luis", amount: 40.00 },
      { userId: "user-sofia", amount: 40.00 }
    ],
    participants: ["user-ana", "user-luis", "user-sofia"],
    status: "confirmado",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    createdBy: "user-ana",
    history: [
      { action: "creado", userId: "user-ana", timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), details: "Anotó pizza de Q120 entre Ana, Luis y Sofía" },
      { action: "confirmado", userId: "user-luis", timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(), details: "Confirmó su parte de Q40" }
    ]
  },
  {
    id: "mov-2",
    familyId: "fam-garcia",
    type: "gasto_compartido",
    category: "cuidado_personal",
    note: "Shampoo",
    amount: 50.00,
    currency: "GTQ",
    date: formatDate(1),
    paidBy: "user-luis",
    splits: [
      { userId: "user-luis", amount: 25.00 },
      { userId: "user-sofia", amount: 25.00 }
    ],
    participants: ["user-luis", "user-sofia"],
    status: "confirmado",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    createdBy: "user-luis",
    history: [
      { action: "creado", userId: "user-luis", timestamp: new Date(Date.now() - 86400000).toISOString(), details: "Anotó shampoo de Q50 entre Luis y Sofía" }
    ]
  },
  {
    id: "mov-3",
    familyId: "fam-garcia",
    type: "pago_por_otro",
    category: "gasolina",
    note: "Gasolina moto de Ana",
    amount: 60.00,
    currency: "GTQ",
    date: formatDate(2),
    paidBy: "user-sofia",
    splits: [
      { userId: "user-ana", amount: 60.00 }
    ],
    participants: ["user-sofia", "user-ana"],
    status: "confirmado",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    createdBy: "user-sofia",
    history: [
      { action: "creado", userId: "user-sofia", timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), details: "Pagó Q60 de gasolina de la moto de Ana" }
    ]
  },
  {
    id: "mov-4",
    familyId: "fam-garcia",
    type: "pago_por_otro",
    category: "paquete",
    note: "Paquete contra entrega de Luis",
    amount: 200.00,
    currency: "GTQ",
    date: formatDate(3),
    paidBy: "user-mama",
    splits: [
      { userId: "user-luis", amount: 200.00 }
    ],
    participants: ["user-mama", "user-luis"],
    status: "confirmado",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    createdBy: "user-mama",
    history: [
      { action: "creado", userId: "user-mama", timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), details: "Pagó Q200 del paquete contra entrega de Luis" }
    ]
  },
  {
    id: "mov-5",
    familyId: "fam-garcia",
    type: "gasto_compartido",
    category: "compra_compartida",
    note: "Pasta dental 2x1",
    amount: 30.00,
    currency: "GTQ",
    date: formatDate(4),
    paidBy: "user-ana",
    splits: [
      { userId: "user-ana", amount: 15.00 },
      { userId: "user-luis", amount: 15.00 }
    ],
    participants: ["user-ana", "user-luis"],
    status: "confirmado",
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    createdBy: "user-ana",
    history: [
      { action: "creado", userId: "user-ana", timestamp: new Date(Date.now() - 86400000 * 4).toISOString(), details: "Anotó pasta dental 2x1 de Q30" }
    ]
  },
  {
    id: "mov-6",
    familyId: "fam-garcia",
    type: "prestamo",
    category: "prestamo",
    note: "Préstamo para viaje",
    amount: 300.00,
    currency: "USD",
    isLoan: true,
    date: formatDate(5),
    paidBy: "user-ana",
    splits: [
      { userId: "user-luis", amount: 300.00 }
    ],
    participants: ["user-ana", "user-luis"],
    status: "confirmado",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    createdBy: "user-ana",
    history: [
      { action: "creado", userId: "user-ana", timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), details: "Prestó US$300 a Luis para su viaje" }
    ]
  },
  {
    id: "mov-7",
    familyId: "fam-garcia",
    type: "gasto_compartido",
    category: "plataformas",
    note: "Netflix · mensual",
    amount: 120.00,
    currency: "GTQ",
    date: formatDate(6),
    paidBy: "user-ana",
    splits: [
      { userId: "user-ana", amount: 60.00 },
      { userId: "user-luis", amount: 60.00 }
    ],
    participants: ["user-ana", "user-luis"],
    status: "confirmado",
    isRecurringInstance: true,
    recurringId: "rec-netflix",
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    createdBy: "user-ana",
    history: [
      { action: "creado", userId: "user-ana", timestamp: new Date(Date.now() - 86400000 * 6).toISOString(), details: "Generado automáticamente por gasto mensual de Netflix" }
    ]
  }
];

// Gastos recurrentes iniciales (Fase 2)
export const INITIAL_RECURRING = [
  {
    id: "rec-netflix",
    familyId: "fam-garcia",
    name: "Netflix",
    category: "plataformas",
    amount: 120.00,
    currency: "GTQ",
    dayOfMonth: 15, // Día 15 de cada mes
    paidBy: "user-ana",
    participants: ["user-ana", "user-luis"],
    splits: [
      { userId: "user-ana", amount: 60.00 },
      { userId: "user-luis", amount: 60.00 }
    ],
    alternatePayer: false, // Turnos alternos
    status: "activo", // activo | pausado | terminado
    lastGeneratedMonth: new Date().toISOString().substring(0, 7), // AAAA-MM
    createdAt: "2026-09-01T00:00:00.000Z"
  }
];

const STORAGE_KEYS = {
  FAMILY: "cuentas_claras_family",
  MOVEMENTS: "cuentas_claras_movements",
  RECURRING: "cuentas_claras_recurring",
  ACTIVE_USER_ID: "cuentas_claras_active_user_id",
  CUADRES: "cuentas_claras_cuadres"
};

function cleanFirestoreDoc(obj) {
  if (!obj) return {};
  return JSON.parse(JSON.stringify(obj));
}

class DataService {
  constructor() {
    this.listeners = new Set();
    this.initLocalStorage();
  }

  initLocalStorage() {
    if (typeof window === "undefined") return;

    if (!localStorage.getItem(STORAGE_KEYS.FAMILY)) {
      localStorage.setItem(STORAGE_KEYS.FAMILY, JSON.stringify(INITIAL_FAMILY));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MOVEMENTS)) {
      localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(INITIAL_MOVEMENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RECURRING)) {
      localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(INITIAL_RECURRING));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CUADRES)) {
      localStorage.setItem(STORAGE_KEYS.CUADRES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID)) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, "user-mama");
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (err) {
        console.error("Error in data listener:", err);
      }
    }
  }

  getFamily() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAMILY);
      return data ? JSON.parse(data) : INITIAL_FAMILY;
    } catch {
      return INITIAL_FAMILY;
    }
  }

  getMovements() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
      return data ? JSON.parse(data) : INITIAL_MOVEMENTS;
    } catch {
      return INITIAL_MOVEMENTS;
    }
  }

  getRecurringExpenses() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECURRING);
      return data ? JSON.parse(data) : INITIAL_RECURRING;
    } catch {
      return INITIAL_RECURRING;
    }
  }

  getActiveUserId() {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID) || "user-mama";
  }

  setActiveUserId(userId) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, userId);
    this.notify();
  }

  /**
   * DETECCIÓN DE DUPLICADOS (Requisito Fase 2)
   * Si ya existe un movimiento con las mismas personas, monto igual o diferencia < 5%,
   * y misma fecha o un día de diferencia.
   */
  checkDuplicate(newMov) {
    const movements = this.getMovements();
    const newAmount = Number(newMov.amount) || 0;
    if (newAmount <= 0) return { isDuplicate: false };

    // No marcar como duplicado si es un gasto recurrente de un mes anterior
    if (newMov.isRecurringInstance) return { isDuplicate: false };

    const newDateObj = new Date(newMov.date + "T12:00:00");
    const newParticipantSet = new Set(newMov.participants || []);
    if (newMov.paidBy) newParticipantSet.add(newMov.paidBy);

    for (const m of movements) {
      // Ignorar quitados
      if (m.status === "quitado") continue;
      // Moneda debe coincidir
      if (m.currency !== newMov.currency) continue;

      // Participantes deben coincidir exactamente
      const existingParticipantSet = new Set(m.participants || []);
      if (m.paidBy) existingParticipantSet.add(m.paidBy);
      if (newParticipantSet.size !== existingParticipantSet.size) continue;
      let samePeople = true;
      for (const p of newParticipantSet) {
        if (!existingParticipantSet.has(p)) {
          samePeople = false;
          break;
        }
      }
      if (!samePeople) continue;

      // Monto igual o con diferencia menor al 5%
      const existingAmount = Number(m.amount) || 0;
      const diffAmount = Math.abs(existingAmount - newAmount);
      const isAmountSimilar = (diffAmount / newAmount) <= 0.05;
      if (!isAmountSimilar) continue;

      // Misma fecha o un día de diferencia
      const existingDateObj = new Date(m.date + "T12:00:00");
      const diffDays = Math.abs(newDateObj - existingDateObj) / (1000 * 60 * 60 * 24);
      if (diffDays <= 1.5) {
        return {
          isDuplicate: true,
          duplicateMovement: m
        };
      }
    }

    return { isDuplicate: false };
  }

  /**
   * Agregar un nuevo movimiento de manera INMEDIATA y reactiva (sin bloqueos de red).
   */
  async addMovement(movementData) {
    const movements = this.getMovements();
    const nowIso = new Date().toISOString();

    const newMovement = {
      id: "mov-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      status: movementData.status || "sin_confirmar",
      createdAt: nowIso,
      history: [
        {
          action: "creado",
          userId: movementData.createdBy || this.getActiveUserId(),
          timestamp: nowIso,
          details: `Anotó ${movementData.note || "movimiento"} por ${movementData.currency === "USD" ? "US$" : "Q"}${movementData.amount}`
        }
      ],
      ...movementData
    };

    // Asegurar participantes únicos
    const participants = new Set();
    if (newMovement.paidBy) participants.add(newMovement.paidBy);
    if (newMovement.recipientId) participants.add(newMovement.recipientId);
    if (Array.isArray(newMovement.splits)) {
      for (const s of newMovement.splits) {
        if (s.userId && s.amount > 0) participants.add(s.userId);
      }
    }
    newMovement.participants = Array.from(participants);

    // Guardado local instantáneo
    movements.unshift(newMovement);
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));

    // Si es un gasto que se repite, registrar también la plantilla recurrente
    if (movementData.isRecurring) {
      this.addRecurringExpense({
        name: movementData.note,
        category: movementData.category,
        amount: movementData.amount,
        currency: movementData.currency,
        dayOfMonth: parseInt(movementData.recurringDay || newMovement.date.split("-")[2]),
        paidBy: movementData.paidBy,
        splits: movementData.splits,
        alternatePayer: !!movementData.alternatePayer,
        status: "activo"
      });
    }

    // Notificar inmediatamente a la UI para actualización en 0 milisegundos
    this.notify();

    // Sincronización en segundo plano con Firestore (no bloquea al usuario)
    if (db) {
      setDoc(doc(db, "movements", newMovement.id), newMovement)
        .catch(err => console.warn("Firestore sync background:", err.message));
    }

    return newMovement;
  }

  /**
   * Editar un movimiento existente con registro en el Historial de Cambios.
   */
  editMovement(movementId, updates, editorUserId) {
    const movements = this.getMovements();
    const target = movements.find(m => m.id === movementId);
    if (!target) return null;

    const changes = [];
    if (updates.note && updates.note !== target.note) {
      changes.push(`Nota cambiada de "${target.note}" a "${updates.note}"`);
    }
    if (updates.amount && Number(updates.amount) !== Number(target.amount)) {
      changes.push(`Monto cambiado de ${target.amount} a ${updates.amount}`);
    }
    if (updates.date && updates.date !== target.date) {
      changes.push(`Fecha cambiada de ${target.date} a ${updates.date}`);
    }

    const nowIso = new Date().toISOString();
    const historyEntry = {
      action: "editado",
      userId: editorUserId,
      timestamp: nowIso,
      details: changes.join("; ") || "Modificó los detalles del movimiento"
    };

    target.history = target.history || [];
    target.history.push(historyEntry);

    // Al editar un movimiento ya confirmado, vuelve a quedar "sin confirmar"
    target.status = "sin_confirmar";
    Object.assign(target, updates);

    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
    this.notify();

    if (db) {
      updateDoc(doc(db, "movements", movementId), cleanFirestoreDoc(target))
        .catch(err => console.warn("Firestore edit update:", err.message));
    }

    return target;
  }

  /**
   * Proponer corrección (pasa a "en revisión" y deja de contar en el saldo).
   */
  proposeCorrection(movementId, proposalData, proposerUserId) {
    const movements = this.getMovements();
    const target = movements.find(m => m.id === movementId);
    if (!target) return null;

    const nowIso = new Date().toISOString();
    target.status = "en_revision";
    target.pendingCorrection = {
      proposedBy: proposerUserId,
      amount: proposalData.amount,
      splits: proposalData.splits || target.splits || [],
      date: proposalData.date || target.date || "",
      comment: proposalData.comment || "",
      createdAt: nowIso
    };

    target.history = target.history || [];
    target.history.push({
      action: "propuesta_correccion",
      userId: proposerUserId,
      timestamp: nowIso,
      details: proposalData.comment ? `Propuso corrección: "${proposalData.comment}"` : "Propuso una corrección en el monto o división"
    });

    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
    this.notify();

    if (db) {
      updateDoc(doc(db, "movements", movementId), cleanFirestoreDoc(target))
        .catch(err => console.warn("Firestore propose update:", err.message));
    }

    return target;
  }

  /**
   * Aceptar propuesta de corrección.
   */
  acceptCorrection(movementId, accepterUserId) {
    const movements = this.getMovements();
    const target = movements.find(m => m.id === movementId);
    if (!target || !target.pendingCorrection) return null;

    const prop = target.pendingCorrection;
    if (prop.amount) target.amount = Number(prop.amount);
    if (prop.splits) target.splits = prop.splits;
    if (prop.date) target.date = prop.date;

    const nowIso = new Date().toISOString();
    target.status = "confirmado";
    target.confirmedBy = accepterUserId;
    target.confirmedAt = nowIso;
    target.pendingCorrection = null;

    target.history = target.history || [];
    target.history.push({
      action: "correccion_aceptada",
      userId: accepterUserId,
      timestamp: nowIso,
      details: "Aceptó la propuesta de corrección. El movimiento quedó confirmado."
    });

    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
    this.notify();

    if (db) {
      updateDoc(doc(db, "movements", movementId), target)
        .catch(err => console.warn("Firestore accept update:", err.message));
    }

    return target;
  }

  /**
   * Quitar un movimiento (anulación suave, no se borra de la BD).
   */
  async removeMovement(movementId, reason, currentUserId) {
    const movements = this.getMovements();
    const target = movements.find(m => m.id === movementId);
    if (!target) return null;

    const nowIso = new Date().toISOString();
    target.status = "quitado";
    target.removedBy = currentUserId;
    target.removeReason = reason;
    target.removedAt = nowIso;

    target.history = target.history || [];
    target.history.push({
      action: "quitado",
      userId: currentUserId,
      timestamp: nowIso,
      details: `Quitó el movimiento. Motivo: "${reason}"`
    });

    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
    this.notify();

    if (db) {
      updateDoc(doc(db, "movements", movementId), {
        status: "quitado",
        removedBy: currentUserId,
        removeReason: reason,
        removedAt: nowIso,
        history: target.history
      }).catch(err => console.warn("Firestore remove:", err.message));
    }

    return target;
  }

  /**
   * Deshacer un movimiento recién guardado.
   */
  undoMovement(movementId) {
    let movements = this.getMovements();
    movements = movements.filter(m => m.id !== movementId);
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
    this.notify();
  }

  /**
   * GASTOS QUE SE REPITEN (Fase 2)
   */
  addRecurringExpense(data) {
    const list = this.getRecurringExpenses();
    const newRec = {
      id: "rec-" + Date.now(),
      familyId: "fam-garcia",
      status: "activo",
      createdAt: new Date().toISOString(),
      lastGeneratedMonth: new Date().toISOString().substring(0, 7),
      ...data
    };
    list.push(newRec);
    localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(list));
    this.notify();
    return newRec;
  }

  updateRecurringExpense(id, updates) {
    const list = this.getRecurringExpenses();
    const idx = list.findIndex(r => r.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(list));
      this.notify();
      return list[idx];
    }
    return null;
  }

  /**
   * Generador automático de gastos recurrentes al abrir la app.
   */
  checkAndGenerateRecurringMovements() {
    const recurringList = this.getRecurringExpenses();
    const currentMonthKey = new Date().toISOString().substring(0, 7); // "2026-10"
    const currentDay = new Date().getDate();
    let generatedCount = 0;

    for (const rec of recurringList) {
      if (rec.status !== "activo") continue;

      // Si ya se generó para este mes, saltar
      if (rec.lastGeneratedMonth === currentMonthKey) continue;

      // ¿Ya llegó el día del mes?
      // Manejar meses cortos (ej. día 31 en febrero o abril)
      const daysInCurrentMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
      const targetDay = Math.min(rec.dayOfMonth, daysInCurrentMonth);

      if (currentDay >= targetDay) {
        // Generar el movimiento mensual
        const monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
        const monthLabel = monthNames[new Date().getMonth()];
        const targetDate = `${currentMonthKey}-${String(targetDay).padStart(2, "0")}`;

        // Turnos alternos (si está configurado)
        let payer = rec.paidBy;
        if (rec.alternatePayer && Array.isArray(rec.participants) && rec.participants.length > 1) {
          const currentIndex = rec.participants.indexOf(rec.paidBy);
          const nextIndex = (currentIndex + 1) % rec.participants.length;
          payer = rec.participants[nextIndex];
          rec.paidBy = payer; // Guardar el nuevo pagador para el siguiente turno
        }

        this.addMovement({
          type: "gasto_compartido",
          category: rec.category || "plataformas",
          note: `${rec.name} · ${monthLabel}`,
          amount: rec.amount,
          currency: rec.currency,
          date: targetDate,
          paidBy: payer,
          splits: rec.splits,
          participants: rec.participants,
          isRecurringInstance: true,
          recurringId: rec.id,
          status: "sin_confirmar"
        });

        rec.lastGeneratedMonth = currentMonthKey;
        generatedCount++;
      }
    }

    if (generatedCount > 0) {
      localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(recurringList));
      this.notify();
    }
  }

  updateMember(userId, updates) {
    const family = this.getFamily();
    const memberIndex = family.members.findIndex(m => m.id === userId);
    if (memberIndex !== -1) {
      family.members[memberIndex] = {
        ...family.members[memberIndex],
        ...updates
      };
      localStorage.setItem(STORAGE_KEYS.FAMILY, JSON.stringify(family));
      this.notify();
      return family.members[memberIndex];
    }
    return null;
  }

  joinFamilyByCode(inviteCode, user) {
    const family = this.getFamily();
    if (family.inviteCode.toUpperCase() === inviteCode.trim().toUpperCase()) {
      const exists = family.members.find(m => m.id === user.id || m.email === user.email);
      if (!exists) {
        const newMember = {
          id: user.id || "user-" + Date.now(),
          name: user.name || "Nuevo Miembro",
          fullName: user.fullName || user.name,
          email: user.email || "",
          avatar: user.avatar || "😊",
          color: user.color || "#059669",
          simpleMode: false,
          fontSize: "normal"
        };
        family.members.push(newMember);
        family.memberIds = family.members.map(m => m.id);
        localStorage.setItem(STORAGE_KEYS.FAMILY, JSON.stringify(family));
        this.notify();
        return { success: true, family, member: newMember };
      }
      return { success: true, family, member: exists };
    }
    return { success: false, message: "El código de invitación no coincide." };
  }

  
  // ==========================================
  // FASE 3: CUADRES, PRÉSTAMOS Y CONVERSIONES
  // ==========================================

  getCuadres() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUADRES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveCuadres(cuadres) {
    localStorage.setItem(STORAGE_KEYS.CUADRES, JSON.stringify(cuadres));
    this.notify();
  }

  getCuadresBetween(userAId, userBId) {
    const list = this.getCuadres();
    return list.filter(c => 
      (c.userA === userAId && c.userB === userBId) ||
      (c.userA === userBId && c.userB === userAId)
    );
  }

  getLastClosedCuadre(userAId, userBId) {
    const list = this.getCuadresBetween(userAId, userBId)
      .filter(c => c.status === "cerrado")
      .sort((a, b) => (b.endDate || "").localeCompare(a.endDate || ""));
    return list[0] || null;
  }

  isDateInClosedPeriod(dateStr, userAId, userBId) {
    if (!dateStr || !userAId || !userBId) return { isClosed: false };
    const closedCuadres = this.getCuadresBetween(userAId, userBId).filter(c => c.status === "cerrado");
    for (const c of closedCuadres) {
      if (dateStr >= c.startDate && dateStr <= c.endDate) {
        return { isClosed: true, cuadre: c };
      }
    }
    return { isClosed: false };
  }

  addCuadre(cuadreData) {
    const list = this.getCuadres();
    const nowIso = new Date().toISOString();

    // RF-9.9: Dos cuadres del mismo par no pueden traslaparse en fechas
    const existing = this.getCuadresBetween(cuadreData.userA, cuadreData.userB);
    const hasOverlap = existing.some(c => {
      return (cuadreData.startDate <= c.endDate && cuadreData.endDate >= c.startDate);
    });
    if (hasOverlap) {
      throw new Error("Ya existe un cuadre registrado que se traslapa con estas fechas.");
    }

    const newCuadre = {
      id: "cuadre-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      status: "esperando_acuerdo",
      createdAt: nowIso,
      acceptedBy: [cuadreData.proposedBy || this.getActiveUserId()],
      closedAt: null,
      ...cuadreData
    };

    list.unshift(newCuadre);
    this.saveCuadres(list);
    return newCuadre;
  }

  acceptCuadre(cuadreId, userId) {
    const list = this.getCuadres();
    const target = list.find(c => c.id === cuadreId);
    if (!target) return null;

    target.acceptedBy = target.acceptedBy || [];
    if (!target.acceptedBy.includes(userId)) {
      target.acceptedBy.push(userId);
    }

    // RF-11.4: Queda cerrado solo cuando ambas personas tocan "Estamos de acuerdo"
    if (target.acceptedBy.includes(target.userA) && target.acceptedBy.includes(target.userB)) {
      target.status = "cerrado";
      target.closedAt = new Date().toISOString();

      // RF-11.5: Los "sin confirmar" dentro del periodo se consideran aceptados/confirmados
      const movements = this.getMovements();
      let updated = false;
      for (const m of movements) {
        if (m.date >= target.startDate && m.date <= target.endDate) {
          const isBetween = (m.paidBy === target.userA && (m.splits || []).some(s => s.userId === target.userB)) ||
                            (m.paidBy === target.userB && (m.splits || []).some(s => s.userId === target.userA)) ||
                            (m.type === "abono" && ((m.paidBy === target.userA && m.recipientId === target.userB) || (m.paidBy === target.userB && m.recipientId === target.userA)));
          if (isBetween && m.status === "sin_confirmar") {
            m.status = "confirmado";
            m.confirmedAt = target.closedAt;
            m.confirmedBy = "cierre_cuadre";
            m.history = m.history || [];
            m.history.push({
              action: "confirmado_por_cuadre",
              userId: userId,
              timestamp: target.closedAt,
              details: `Confirmado automáticamente al cerrar el cuadre (${target.startDate} al ${target.endDate})`
            });
            updated = true;
          }
        }
      }
      if (updated) {
        localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
      }
    }

    this.saveCuadres(list);
    return target;
  }

  // RF-9.4: Préstamos activos y saldo restante
  getActiveLoansBetween(userAId, userBId) {
    const movements = this.getMovements();
    const loans = movements.filter(m => {
      if (m.status === "quitado") return false;
      if (m.type !== "prestamo" && m.category !== "prestamo" && !m.isLoan) return false;
      const isAtoB = m.paidBy === userAId && (m.splits || []).some(s => s.userId === userBId);
      const isBtoA = m.paidBy === userBId && (m.splits || []).some(s => s.userId === userAId);
      return isAtoB || isBtoA;
    });

    return loans.map(loan => {
      const remaining = this.getRemainingLoanBalance(loan.id);
      return {
        ...loan,
        remainingAmount: remaining.remaining,
        paidSoFar: remaining.paidSoFar,
        isFullyPaid: remaining.remaining <= 0
      };
    });
  }

  getRemainingLoanBalance(loanId) {
    const movements = this.getMovements();
    const loan = movements.find(m => m.id === loanId);
    if (!loan) return { original: 0, paidSoFar: 0, remaining: 0 };

    const linkedAbonos = movements.filter(m => 
      m.type === "abono" && 
      m.linkedLoanId === loanId && 
      m.status !== "quitado"
    );

    const paidSoFar = linkedAbonos.reduce((acc, a) => {
      const amt = (a.isCrossCurrency && a.targetAmount) ? Number(a.targetAmount) : Number(a.amount);
      return acc + (amt || 0);
    }, 0);

    const remaining = Math.max(0, Math.round((Number(loan.amount) - paidSoFar) * 100) / 100);
    return {
      original: Number(loan.amount),
      paidSoFar: Math.round(paidSoFar * 100) / 100,
      remaining
    };
  }

  resetToInitialData() {
    localStorage.setItem(STORAGE_KEYS.FAMILY, JSON.stringify(INITIAL_FAMILY));
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(INITIAL_MOVEMENTS));
    localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(INITIAL_RECURRING));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, "user-mama");
    this.notify();
  }
}

export const dataService = new DataService();
