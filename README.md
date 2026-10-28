# ExpenseShare — Control Colaborativo de Gastos del Hogar

ExpenseShare es una aplicación web para el control de gastos del hogar basada en **asignación directa y colaborativa** (a diferencia de un reparto equitativo estático). Un administrador de hogar crea los gastos y los asigna a un miembro responsable, quien puede aceptar la responsabilidad, rechazarla justificando el motivo y sugiriendo a otro miembro, o solicitar ayuda abierta a todos los integrantes del hogar, dejando evidencia fotográfica de cada pago.

---

## 🎨 Apariencia y Diseño (Flat Design MD3 de Alto Contraste)

- **Bordes gruesos y definidos**: Todas las tarjetas, botones y campos poseen bordes nítidos de `2.5px - 3px` de alto contraste (sin gradientes ni efectos de desenfoque).
- **Sombras sólidas desplazadas (*hard offset shadows*)**: Elevación visual limpia (`box-shadow: 4px 4px 0px var(--border-color)`), con micro-animaciones al pulsar (`transform: translate(2px, 2px)`).
- **Fondo con Trama Pastel Dinámica**: Los fondos y grandes superficies emplean una textura/trama geométrica sutil en color pastel derivado del color de identificación del usuario logueado.
- **Tipografía**: Sans-serif redondeada de peso alto (*Plus Jakarta Sans* vía Google Fonts) con colores vibrantes en títulos principales.
- **Tema Claro y Oscuro**: Conmutador integrado que conserva la legibilidad y el contraste en ambos temas.
- **Insignias de Estado**:
  - 🟡 **Pendiente de aceptación**: Amarillo / Ámbar (`#F59E0B`).
  - 🔵 **En progreso**: Azul brillante (`#3B82F6`).
  - 🟠 **Parcialmente pagado**: Naranja (`#F97316`).
  - 🟢 **Pagado**: Verde esmeralda (`#10B981`).
  - 🔴 **Rechazado**: Rojo coral (`#EF4444`).
- **Navegación Adaptable (Responsive)**:
  - En **escritorio**: Barra lateral fija con selector de hogar superior, enlaces y perfil activo.
  - En **móvil**: Barra flotante inferior redondeada solo con iconos y cabecera superior compacta.
- **Iconos Vectoriales**: Iconos SVG homogéneos integrados en toda la aplicación.

---

## 🏛️ Arquitectura Desacoplada (3 Capas)

El código fuente está estructurado con estricta separación de responsabilidades y ampliamente comentado en español:

1. **Capa de Interfaz de Usuario (`src/components/`, `src/pages/`)**: Componentes reutilizables Flat MD3, tarjetas interactivas, modales y páginas completas (Dashboard, Hogares, Detalle del Hogar, Notificaciones, Perfil y Autenticación).
2. **Capa de Lógica de Negocio (`src/context/`)**:
   - `AuthContext.jsx`: Sesión, unicidad de handle, sugerencias automáticas y perfiles.
   - `HouseholdContext.jsx`: Hogar activo, cambio entre hogares y permisos de administración.
   - `NotificationContext.jsx`: Alertas en tiempo real, contador de no leídas y acciones directas.
   - `ThemeContext.jsx`: Modo claro/oscuro y generación matemática de colores pastel.
3. **Capa de Acceso a Datos (`src/services/`, `src/config/`)**:
   - `authService.js`: Firebase Auth, verificación de unicidad de handles en Firestore y sugerencias.
   - `householdService.js`: CRUD de hogares, miembros y búsqueda con autocompletado de handles.
   - `expenseService.js`: Creación de gastos, aceptación, rechazo con justificación, aportes con cálculo automático y solicitud de ayuda.
   - `storageService.js`: Subida de imágenes de comprobantes a Firebase Storage.
   - `notificationService.js`: Envío y lectura de notificaciones reactivas.

---

## 🚀 Cómo Ejecutar la Aplicación

### 1. Instalar Dependencias
Abre una terminal en este directorio y ejecuta:
```bash
npm install
```

### 2. Iniciar el Servidor de Desarrollo
```bash
npm run dev
```
La aplicación se abrirá en `http://localhost:3000`.

### 3. Configuración de Firebase (Emuladores Locales y Producción)
- **Modo Emulador / Demo Activo por Defecto**: La aplicación incluye detección automática de emuladores locales (`connectAuthEmulator`, `connectFirestoreEmulator`, `connectStorageEmulator`) y respaldo en memoria/local storage para que puedas interactuar inmediatamente con todos los flujos sin configuraciones complejas.
- **Para arrancar los emuladores oficiales de Firebase CLI** (opcional):
  ```bash
  firebase emulators:start
  ```
  Los puertos predeterminados configurados en `firebase.json` son:
  - Auth: `9099`
  - Firestore: `8080`
  - Storage: `9199`
  - Emulators UI: `4000`
- **Para conectar tu proyecto real de Firebase en producción**:
  Copia el archivo `.env.example` a `.env` e introduce las credenciales provistas por la consola de Firebase.

---

## 👥 Usuarios Demo Incluidos para Pruebas Inmediatas
Para facilitar la verificación y el testing de interacciones entre usuarios (invitaciones, rechazos, aportes conjuntos), en la barra lateral encontrarás un menú desplegable para alternar de inmediato entre:
1. **Carlos Administrador** (`@carlos_admin`): Administrador del departamento, creador de gastos.
2. **María López** (`@maria_l`): Miembro asignado al pago de servicios e internet.
3. **Juan Pérez** (`@juan_p`): Miembro asignado a la despensa y mantenimiento.

---

## 🛡️ Validaciones Implementadas
- Bloqueo de montos menores o iguales a cero ($0.00).
- Campos obligatorios señalizados con asterisco rojo y mensajes de error descriptivos.
- Justificación obligatoria para rechazar la responsabilidad de un gasto.
- Bloqueo de nuevos aportes sobre gastos que ya están en estado "Pagado".
- Comentario obligatorio al subir un comprobante de pago para explicar aportes parciales.
- Handles únicos con sugerencias automáticas en caso de duplicidad.
