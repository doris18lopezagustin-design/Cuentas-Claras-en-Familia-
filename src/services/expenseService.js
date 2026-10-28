import { db } from "../firebase";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";

const INITIAL_EXPENSES = [
  {
    id: "exp-1",
    title: "Servicio de Internet Fibra Óptica",
    amount: 350.00,
    paidAmount: 0.00,
    category: "Servicios",
    createdBy: "@carlos_admin",
    assignedTo: "@maria_l",
    status: "pendiente", // pendiente, en_progreso, parcial, pagado, rechazado
    description: "Factura mensual de telecomunicaciones correspondiente al mes en curso.",
    rejectionReason: null,
    helpRequested: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "exp-2",
    title: "Despensa y Artículos de Limpieza",
    amount: 850.50,
    paidAmount: 400.00,
    category: "Supermercado",
    createdBy: "@carlos_admin",
    assignedTo: "@juan_p",
    status: "parcial",
    description: "Compras generales en el supermercado para el mantenimiento del hogar.",
    rejectionReason: null,
    helpRequested: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "exp-3",
    title: "Energía Eléctrica",
    amount: 420.00,
    paidAmount: 420.00,
    category: "Servicios",
    createdBy: "@carlos_admin",
    assignedTo: "@carlos_admin",
    status: "pagado",
    description: "Recibo de luz cancelado con comprobante electrónico bancario.",
    rejectionReason: null,
    helpRequested: false,
    createdAt: new Date().toISOString()
  }
];

export const expenseService = {
  async fetchExpenses() {
    try {
      const q = query(collection(db, "expenses"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      }
    } catch (err) {
      console.warn("Firestore fetch error o modo demo:", err.message);
    }
    // Fallback a localStorage o iniciales
    const saved = localStorage.getItem("expenseshare_expenses");
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  },

  async addExpense(expenseData) {
    const newExpense = {
      ...expenseData,
      paidAmount: 0.00,
      status: "pendiente",
      rejectionReason: null,
      helpRequested: false,
      createdAt: new Date().toISOString()
    };

    try {
      const docRef = await addDoc(collection(db, "expenses"), {
        ...newExpense,
        serverTime: serverTimestamp()
      });
      return { id: docRef.id, ...newExpense };
    } catch (err) {
      console.warn("Guardando localmente por:", err.message);
      newExpense.id = "exp-" + Date.now();
      return newExpense;
    }
  },

  async acceptExpense(expenseId) {
    try {
      await updateDoc(doc(db, "expenses", expenseId), { status: "en_progreso" });
    } catch (err) {
      console.warn(err);
    }
  },

  async rejectExpense(expenseId, reason, suggestedMember) {
    try {
      await updateDoc(doc(db, "expenses", expenseId), { 
        status: "rechazado",
        rejectionReason: reason,
        suggestedMember: suggestedMember || null
      });
    } catch (err) {
      console.warn(err);
    }
  },

  async addContribution(expense, amount, comment) {
    const newPaid = Number(expense.paidAmount) + Number(amount);
    const newStatus = newPaid >= Number(expense.amount) ? "pagado" : "parcial";
    try {
      await updateDoc(doc(db, "expenses", expense.id), {
        paidAmount: Math.min(newPaid, expense.amount),
        status: newStatus
      });
    } catch (err) {
      console.warn(err);
    }
    return { newPaid: Math.min(newPaid, expense.amount), newStatus };
  },

  async requestHelp(expenseId) {
    try {
      await updateDoc(doc(db, "expenses", expenseId), { helpRequested: true });
    } catch (err) {
      console.warn(err);
    }
  }
};
