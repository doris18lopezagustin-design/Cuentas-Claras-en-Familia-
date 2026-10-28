import React, { createContext, useContext, useState, useEffect } from "react";
import { dataService, INITIAL_MEMBERS } from "../services/dataService";
import { auth, googleProvider } from "../firebase.js";
import { signInWithPopup, signOut } from "firebase/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [family, setFamily] = useState(() => dataService.getFamily());
  const [activeUserId, setActiveUserId] = useState(() => dataService.getActiveUserId());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Suscribirse a cambios en el servicio de datos
    const unsubscribe = dataService.subscribe(() => {
      setFamily(dataService.getFamily());
      setActiveUserId(dataService.getActiveUserId());
    });
    return unsubscribe;
  }, []);

  const members = family?.members || INITIAL_MEMBERS;
  const currentUser = members.find(m => m.id === activeUserId) || members[0];

  // Cambiar de familiar activo (ideal para probar los saldos y privacidad par a par)
  const switchMember = (memberId) => {
    dataService.setActiveUserId(memberId);
    setActiveUserId(memberId);
  };

  // Actualizar preferencias o perfil del usuario actual
  const updateCurrentUser = (updates) => {
    if (!currentUser) return;
    const updated = dataService.updateMember(currentUser.id, updates);
    return updated;
  };

  // Alternar modo sencillo
  const toggleSimpleMode = () => {
    if (!currentUser) return;
    updateCurrentUser({ simpleMode: !currentUser.simpleMode });
  };

  // Iniciar con Google (o fallback)
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        // Enlazar o crear miembro
        const newMember = {
          id: res.user.uid,
          name: res.user.displayName ? res.user.displayName.split(" ")[0] : "Usuario",
          fullName: res.user.displayName || "Usuario",
          email: res.user.email,
          avatar: "🧑",
          color: "#0D9488",
          simpleMode: false,
          fontSize: "normal"
        };
        // Agregar si no existe
        const exists = members.find(m => m.email === res.user.email || m.id === res.user.uid);
        if (!exists) {
          family.members.push(newMember);
          dataService.updateMember(newMember.id, newMember);
        }
        switchMember(exists ? exists.id : newMember.id);
      }
    } catch (err) {
      console.warn("Inicio con Google:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Iniciar con correo (código simulado/enlace)
  const loginWithEmailCode = (email, name = "Familiar") => {
    const existing = members.find(m => m.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      switchMember(existing.id);
      return existing;
    }
    const newMember = {
      id: "user-" + Date.now(),
      name: name.split(" ")[0],
      fullName: name,
      email: email,
      avatar: "😊",
      color: "#059669",
      simpleMode: false,
      fontSize: "normal"
    };
    family.members.push(newMember);
    dataService.updateMember(newMember.id, newMember);
    switchMember(newMember.id);
    return newMember;
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      // Ignorar si no está autenticado en firebase
    }
    // Restablecer a Mamá
    switchMember("user-mama");
  };

  const joinFamilyByCode = (inviteCode) => {
    return dataService.joinFamilyByCode(inviteCode, currentUser);
  };

  const resetAllData = () => {
    dataService.resetToInitialData();
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentFamily: family,
        members,
        membersMap: members.reduce((acc, m) => ({ ...acc, [m.id]: m }), {}),
        switchMember,
        updateCurrentUser,
        toggleSimpleMode,
        loginWithGoogle,
        loginWithEmailCode,
        logout,
        joinFamilyByCode,
        resetAllData,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
