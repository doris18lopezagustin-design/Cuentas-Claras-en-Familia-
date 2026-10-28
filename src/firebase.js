import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const env = typeof import.meta !== "undefined" ? import.meta.env || {} : {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyAyGResX1gyzorCwxK8RIKqTEZDqLHjtW8",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "cuentas-claras-familia.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "cuentas-claras-familia",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "cuentas-claras-familia.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456"
};

// Inicialización de Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Conexión a Emuladores locales de Firebase
const useEmulators = env.VITE_USE_EMULATORS === "true";

if (typeof window !== "undefined" && (useEmulators || (window.location.hostname === "localhost" && env.VITE_USE_EMULATORS !== "false"))) {
  try {
    if (!auth._emulatorConfig) {
      connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    }
    if (!db._settingsFrozen) {
      connectFirestoreEmulator(db, "localhost", 8080);
    }
    connectStorageEmulator(storage, "localhost", 9199);
    console.info(" Conectado a emuladores locales de Firebase (Auth: 9099, Firestore: 8080, Storage: 9199)");
  } catch (err) {
    console.warn("Aviso al conectar emuladores de Firebase:", err.message);
  }
}
