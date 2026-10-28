import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { dataService } from "./services/dataService";

// Componentes
import { Sidebar } from "./components/Sidebar";
import { BottomNav } from "./components/BottomNav";
import { FamilyMemberSwitcher } from "./components/FamilyMemberSwitcher";
import { AnotarModal } from "./components/AnotarModal";
import { AbonoModal } from "./components/AbonoModal";
import { MovementDetailModal } from "./components/MovementDetailModal";
import { CorrectionModal } from "./components/CorrectionModal";
import { CuadreModal } from "./components/CuadreModal";
import { FamilyInviteModal } from "./components/FamilyInviteModal";
import { UndoToast } from "./components/UndoToast";

// Páginas
import { DashboardPage } from "./pages/DashboardPage";
import { PersonaDetailPage } from "./pages/PersonaDetailPage";
import { ReviewPage } from "./pages/ReviewPage";
import { RecurringExpensesPage } from "./pages/RecurringExpensesPage";
import { CuadresPage } from "./pages/CuadresPage";
import { AccountPage } from "./pages/AccountPage";
import { AuthPage } from "./pages/AuthPage";

const MainLayout = () => {
  const { currentUser, members, membersMap } = useAuth();
  
  // Lista de movimientos en vivo
  const [movements, setMovements] = useState(() => dataService.getMovements());

  // Suscribirse a cambios en datos
  useEffect(() => {
    const unsub = dataService.subscribe(() => {
      setMovements(dataService.getMovements());
    });
    return unsub;
  }, []);

  // Navegación
  const [currentTab, setCurrentTab] = useState("inicio"); // inicio | persona_detail | por_revisar | gastos_repetidos | cuadres | mi_cuenta
  const [selectedPersona, setSelectedPersona] = useState(null);

  // Modales
  const [isAnotarOpen, setIsAnotarOpen] = useState(false);
  const [targetMemberForAnotar, setTargetMemberForAnotar] = useState(null);
  const [isAbonoOpen, setIsAbonoOpen] = useState(false);
  const [targetMemberForAbono, setTargetMemberForAbono] = useState(null);
  const [abonoInitialCurrency, setAbonoInitialCurrency] = useState("GTQ");
  const [isQuedarAMano, setIsQuedarAMano] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [selectedMovementForDetail, setSelectedMovementForDetail] = useState(null);
  const [selectedMovementForCorrection, setSelectedMovementForCorrection] = useState(null);
  const [isCuadreModalOpen, setIsCuadreModalOpen] = useState(false);
  const [targetMemberForCuadre, setTargetMemberForCuadre] = useState(null);
  const [selectedCuadreToInspect, setSelectedCuadreToInspect] = useState(null);

  // Toast de Deshacer (10 segundos)
  const [lastSavedMovement, setLastSavedMovement] = useState(null);

  if (!currentUser) {
    return <AuthPage />;
  }

  // Contador de cosas por revisar para este usuario
  const pendingReviewCount = movements.filter(m => 
    m.status === "sin_confirmar" && 
    m.createdBy !== currentUser.id &&
    (m.paidBy === currentUser.id || (m.splits || []).some(s => s.userId === currentUser.id))
  ).length;

  // Manejo de guardar movimiento
  const handleSaveMovement = async (movData) => {
    const saved = await dataService.addMovement(movData);
    setIsAnotarOpen(false);
    setTargetMemberForAnotar(null);
    setLastSavedMovement(saved);
  };

  // Manejo de guardar abono
  const handleSaveAbono = async (abonoData) => {
    const saved = await dataService.addMovement(abonoData);
    setIsAbonoOpen(false);
    setTargetMemberForAbono(null);
    setLastSavedMovement(saved);
  };

  // Manejo de quitar movimiento
  const handleRemoveMovement = async (movId, reason) => {
    await dataService.removeMovement(movId, reason, currentUser.id);
  };

  // Manejo de confirmación
  const handleConfirmMovement = (movId) => {
    const currentMovs = dataService.getMovements();
    const target = currentMovs.find(m => m.id === movId);
    if (target) {
      target.status = "confirmado";
      target.confirmedBy = currentUser.id;
      target.confirmedAt = new Date().toISOString();
      localStorage.setItem("cuentas_claras_movements", JSON.stringify(currentMovs));
      dataService.notify();
    }
  };

  const handleConfirmAll = (movIds) => {
    const currentMovs = dataService.getMovements();
    for (const mov of currentMovs) {
      if (movIds.includes(mov.id)) {
        mov.status = "confirmado";
        mov.confirmedBy = currentUser.id;
        mov.confirmedAt = new Date().toISOString();
      }
    }
    localStorage.setItem("cuentas_claras_movements", JSON.stringify(currentMovs));
    dataService.notify();
  };

  // Abrir modal de corrección
  const handleCorrectMovement = (movIdOrMov) => {
    const currentMovs = dataService.getMovements();
    const id = typeof movIdOrMov === "string" ? movIdOrMov : movIdOrMov?.id;
    const target = currentMovs.find(m => m.id === id);
    if (target) {
      setSelectedMovementForCorrection(target);
    }
  };

  const handleProposeCorrection = (movementId, proposalData) => {
    dataService.proposeCorrection(movementId, proposalData, currentUser.id);
    setSelectedMovementForCorrection(null);
  };

  const handleAcceptCorrection = (movementId) => {
    dataService.acceptCorrection(movementId, currentUser.id);
  };

  
  // Manejo de Cuadres (Fase 3)
  const handleOpenCuadre = (member = null) => {
    const target = member || members.find(m => m.id !== currentUser.id) || members[0];
    setTargetMemberForCuadre(target);
    setSelectedCuadreToInspect(null);
    setIsCuadreModalOpen(true);
  };

  const handleInspectCuadre = (cuadre) => {
    const otherId = cuadre.userA === currentUser.id ? cuadre.userB : cuadre.userA;
    setTargetMemberForCuadre(membersMap[otherId] || { id: otherId, name: "Familiar" });
    setSelectedCuadreToInspect(cuadre);
    setIsCuadreModalOpen(true);
  };

  const handleCreateCuadre = (cuadreData) => {
    return dataService.addCuadre(cuadreData);
  };

  const handleAcceptCuadre = (cuadreId) => {
    return dataService.acceptCuadre(cuadreId, currentUser.id);
  };

  // Abrir Anotar rápido
  const handleOpenAnotar = (preselectedMember = null) => {
    setTargetMemberForAnotar(preselectedMember);
    setIsAnotarOpen(true);
  };

  // Abrir Abono
  const handleOpenAbono = (member, curr = "GTQ") => {
    setTargetMemberForAbono(member);
    setAbonoInitialCurrency(curr);
    setIsQuedarAMano(false);
    setIsAbonoOpen(true);
  };

  // Abrir Quedar a Mano
  const handleOpenQuedarAMano = (member, balGTQ, balUSD) => {
    setTargetMemberForAbono(member);
    setAbonoInitialCurrency(balGTQ !== 0 ? "GTQ" : "USD");
    setIsQuedarAMano(true);
    setIsAbonoOpen(true);
  };

  // Navegar a la vista de una persona
  const handleSelectMember = (member) => {
    setSelectedPersona(member);
    setCurrentTab("persona_detail");
  };
  return (
    <div className="app-container">
      {/* Barra de Pruebas de Persona Activa (visible arriba) */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 60 }}>
        <FamilyMemberSwitcher />
      </div>

      <div style={{ display: "flex", width: "100%", marginTop: "44px" }}>
        {/* Barra Lateral en Computadora */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            if (tab !== "persona_detail") setSelectedPersona(null);
          }}
          onOpenAnotar={() => handleOpenAnotar()}
          pendingReviewCount={pendingReviewCount}
        />

        {/* Contenido Principal */}
        <main className="main-content">
          {currentTab === "inicio" && (
            <DashboardPage
              movements={movements}
              onSelectMember={handleSelectMember}
              onOpenAnotar={() => handleOpenAnotar()}
              onGoToReview={() => setCurrentTab("por_revisar")}
              onSelectMovement={(mov) => setSelectedMovementForDetail(mov)}
            />
          )}

          {currentTab === "persona_detail" && selectedPersona && (
            <PersonaDetailPage
              otherMember={selectedPersona}
              movements={movements}
              onBack={() => {
                setCurrentTab("inicio");
                setSelectedPersona(null);
              }}
              onOpenAnotarWithMember={(m) => handleOpenAnotar(m)}
              onOpenAbono={handleOpenAbono}
              onOpenQuedarAMano={handleOpenQuedarAMano}
              onOpenCuadre={handleOpenCuadre}
              onSelectMovement={(mov) => setSelectedMovementForDetail(mov)}
            />
          )}

          {currentTab === "por_revisar" && (
            <ReviewPage
              movements={movements}
              onConfirmMovement={handleConfirmMovement}
              onConfirmAll={handleConfirmAll}
              onCorrectMovement={handleCorrectMovement}
            />
          )}

          {/* FASE 2: GASTOS QUE SE REPITEN */}
          {currentTab === "gastos_repetidos" && (
            <RecurringExpensesPage onOpenAnotar={() => handleOpenAnotar()} />
          )}

          {/* FASE 3: CUADRES DE CUENTAS POR PERIODO */}
          {currentTab === "cuadres" && (
            <CuadresPage
              onOpenNewCuadre={() => handleOpenCuadre()}
              onInspectCuadre={handleInspectCuadre}
              movements={movements}
            />
          )}

          {currentTab === "mi_cuenta" && (
            <AccountPage onOpenInviteModal={() => setIsInviteOpen(true)} />
          )}
        </main>
      </div>

      {/* Barra Inferior en Celular */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== "persona_detail") setSelectedPersona(null);
        }}
        onOpenAnotar={() => handleOpenAnotar()}
        pendingReviewCount={pendingReviewCount}
      />

      {/* Modales */}
      <AnotarModal
        isOpen={isAnotarOpen}
        onClose={() => {
          setIsAnotarOpen(false);
          setTargetMemberForAnotar(null);
        }}
        onSave={handleSaveMovement}
        currentUser={currentUser}
        members={members}
        preselectedOtherUser={targetMemberForAnotar}
      />

      {targetMemberForAbono && (
        <AbonoModal
          isOpen={isAbonoOpen}
          onClose={() => {
            setIsAbonoOpen(false);
            setTargetMemberForAbono(null);
          }}
          onSave={handleSaveAbono}
          currentUser={currentUser}
          otherUser={targetMemberForAbono}
          initialCurrency={abonoInitialCurrency}
          isQuedarAMano={isQuedarAMano}
          currentBalanceGTQ={0}
          currentBalanceUSD={0}
        />
      )}

      {/* FASE 2: DETALLE DEL MOVIMIENTO CON FOTO, HISTORIAL Y CORRECCIONES */}
      <MovementDetailModal
        movement={selectedMovementForDetail}
        isOpen={!!selectedMovementForDetail}
        onClose={() => setSelectedMovementForDetail(null)}
        onRemove={handleRemoveMovement}
        onOpenCorrection={handleCorrectMovement}
        onAcceptCorrection={handleAcceptCorrection}
        currentUser={currentUser}
        membersMap={membersMap}
      />

      {/* FASE 2: MODAL DE PROPUESTA DE CORRECCIÓN */}
      <CorrectionModal
        movement={selectedMovementForCorrection}
        isOpen={!!selectedMovementForCorrection}
        onClose={() => setSelectedMovementForCorrection(null)}
        onPropose={handleProposeCorrection}
        membersMap={membersMap}
        currentUser={currentUser}
      />

      
      {/* FASE 3: MODAL DE CUADRE Y PDF */}
      <CuadreModal
        isOpen={isCuadreModalOpen}
        onClose={() => {
          setIsCuadreModalOpen(false);
          setSelectedCuadreToInspect(null);
        }}
        userA={currentUser}
        userB={targetMemberForCuadre}
        movements={movements}
        membersMap={membersMap}
        onCuadreCreated={handleCreateCuadre}
        onCuadreAccepted={handleAcceptCuadre}
        existingCuadre={selectedCuadreToInspect}
      />

      <FamilyInviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />

      {/* Toast de Deshacer durante 10 segundos */}
      <UndoToast
        movement={lastSavedMovement}
        onUndo={(id) => {
          dataService.undoMovement(id);
          setLastSavedMovement(null);
        }}
        onDismiss={() => setLastSavedMovement(null)}
      />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
