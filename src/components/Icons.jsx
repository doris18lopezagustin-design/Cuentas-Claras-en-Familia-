import React from "react";

const BaseIcon = ({ children, size = 20, className = "", style = {} }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
  >
    {children}
  </svg>
);

export const IconHome = (p) => (
  <BaseIcon {...p}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </BaseIcon>
);

export const IconPlus = (p) => (
  <BaseIcon {...p}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </BaseIcon>
);

export const IconCheckSquare = (p) => (
  <BaseIcon {...p}>
    <polyline points="9 11 12 14 22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </BaseIcon>
);

export const IconRepeat = (p) => (
  <BaseIcon {...p}>
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </BaseIcon>
);

export const IconScale = (p) => (
  <BaseIcon {...p}>
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="M7 21h10" />
    <path d="M12 3v18" />
    <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
  </BaseIcon>
);

export const IconUser = (p) => (
  <BaseIcon {...p}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </BaseIcon>
);

export const IconHandshake = (p) => (
  <BaseIcon {...p}>
    <path d="m11 17 2 2a1 1 0 0 0 1.4 0l4.3-4.3a1 1 0 0 0 0-1.4l-2.6-2.6a1 1 0 0 0-1.4 0L13 12" />
    <path d="m18 11 3.3-3.3a1 1 0 0 0 0-1.4L18 3" />
    <path d="m3 12 3.3 3.3a1 1 0 0 0 1.4 0L12 11" />
    <path d="M2 7l4-4" />
    <circle cx="12" cy="12" r="9" />
  </BaseIcon>
);

export const IconCoins = (p) => (
  <BaseIcon {...p}>
    <circle cx="8" cy="8" r="6" />
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
    <path d="M7 6h2v4H7z" />
  </BaseIcon>
);

export const IconWhatsApp = (p) => (
  <BaseIcon {...p}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    <path d="M10 9.5a3 3 0 0 0 4 4" />
  </BaseIcon>
);

export const IconArrowLeft = (p) => (
  <BaseIcon {...p}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </BaseIcon>
);

export const IconCheck = (p) => (
  <BaseIcon {...p}>
    <polyline points="20 6 9 17 4 12" />
  </BaseIcon>
);

export const IconX = (p) => (
  <BaseIcon {...p}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </BaseIcon>
);

export const IconSearch = (p) => (
  <BaseIcon {...p}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </BaseIcon>
);

export const IconFilter = (p) => (
  <BaseIcon {...p}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </BaseIcon>
);

export const IconSun = (p) => (
  <BaseIcon {...p}>
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </BaseIcon>
);

export const IconMoon = (p) => (
  <BaseIcon {...p}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </BaseIcon>
);

export const IconType = (p) => (
  <BaseIcon {...p}>
    <polyline points="4 7 4 4 20 4 20 7" />
    <line x1="9" y1="20" x2="15" y2="20" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </BaseIcon>
);

export const IconHelp = (p) => (
  <BaseIcon {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </BaseIcon>
);

export const IconShare = (p) => (
  <BaseIcon {...p}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </BaseIcon>
);

export const IconUndo = (p) => (
  <BaseIcon {...p}>
    <path d="M3 7v6h6" />
    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
  </BaseIcon>
);

// Categorías

export const IconCamera = (p) => (
  <BaseIcon {...p}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </BaseIcon>
);

export const IconTrash = (p) => (
  <BaseIcon {...p}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </BaseIcon>
);

export const IconHistory = (p) => (
  <BaseIcon {...p}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 14 14" />
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </BaseIcon>
);

export const IconImage = (p) => (
  <BaseIcon {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </BaseIcon>
);

export const CATEGORY_ICONS = {
  comida: (p) => (
    <BaseIcon {...p}>
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="14" y1="1" x2="14" y2="4" />
    </BaseIcon>
  ),
  gasolina: (p) => (
    <BaseIcon {...p}>
      <path d="M3 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18" />
      <path d="M15 10h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L19 5" />
      <path d="M3 11h12" />
      <circle cx="7.5" cy="7" r="1" />
    </BaseIcon>
  ),
  cuidado_personal: (p) => (
    <BaseIcon {...p}>
      <path d="M12 2v4" />
      <path d="M8 6h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
      <path d="M10 12h4" />
      <path d="M12 10v4" />
    </BaseIcon>
  ),
  compra_compartida: (p) => (
    <BaseIcon {...p}>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </BaseIcon>
  ),
  paquete: (p) => (
    <BaseIcon {...p}>
      <polyline points="16.5 9.4 7.5 4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </BaseIcon>
  ),
  plataformas: (p) => (
    <BaseIcon {...p}>
      <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
      <polyline points="17 2 12 7 7 2" />
    </BaseIcon>
  ),
  prestamo: (p) => (
    <BaseIcon {...p}>
      <circle cx="12" cy="12" r="10" />
      <path d="m16 8-8 8" />
      <path d="M8 8v8h8" />
    </BaseIcon>
  ),
  emergencia: (p) => (
    <BaseIcon {...p}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </BaseIcon>
  ),
  otro: (p) => (
    <BaseIcon {...p}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </BaseIcon>
  )
};

export const CATEGORIES_LIST = [
  { id: "comida", label: "Comida/gusto", icon: CATEGORY_ICONS.comida, emoji: "🍕" },
  { id: "gasolina", label: "Gasolina", icon: CATEGORY_ICONS.gasolina, emoji: "⛽" },
  { id: "cuidado_personal", label: "Cuidado personal", icon: CATEGORY_ICONS.cuidado_personal, emoji: "🧴" },
  { id: "compra_compartida", label: "Compra compartida", icon: CATEGORY_ICONS.compra_compartida, emoji: "🛒" },
  { id: "paquete", label: "Paquete", icon: CATEGORY_ICONS.paquete, emoji: "📦" },
  { id: "plataformas", label: "Plataformas", icon: CATEGORY_ICONS.plataformas, emoji: "📺" },
  { id: "prestamo", label: "Préstamo", icon: CATEGORY_ICONS.prestamo, emoji: "🤝" },
  { id: "emergencia", label: "Emergencia", icon: CATEGORY_ICONS.emergencia, emoji: "🚨" },
  { id: "otro", label: "Otro", icon: CATEGORY_ICONS.otro, emoji: "📝" }
];
