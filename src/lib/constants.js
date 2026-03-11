export const VERSION = '{version}';
export const IS_BROWSER = typeof window !== 'undefined' && typeof document !== 'undefined';

export const DEFAULTS = {
  settings: {
    button: {
      backgroundColor: '#297bf7',
      textColor: '#FFFFFF',
      position: 'bottom-right',
      type: 'round',
      icon: 'default',
    },
  },
  endUserId: '',
  apiUrl: 'https://chatsy.ai',
};

// Chat button SVG icon variations
export const ICONS = {
  // Default: double-bubble Chatsy icon (original branding)
  default: (color) => `<svg viewBox="0 0 700 700" width="28" height="28" fill="${color}" style="pointer-events:none">
    <path d="M62.75 600.75V606c0 19.25 10.75 36.5 28.25 45 7 3.5 14.5 5 22 5 10.75 0 21.75-3.5 30.75-10.75l19.75-15.25c23-18.25 51.75-28 81-28h135.25c28.75 0 53.75-16.25 66.5-40-19.75-10.5-41.75-16.25-64-16.25H202.25c-78.75 0-142.75-63.75-142.75-142V252.25C25.5 259.75 0 290 0 326.25v200.5c0 37.25 27.25 68.25 62.75 74z"/>
    <path d="M607.5 44H202c-51 0-92.5 41.25-92.5 92v267.75c0 50.75 41.5 92 92.75 92H382.25c41 0 81.25 13.75 113.25 39l40 31.25c9 7.25 19.75 10.75 30.75 10.75 7.25 0 14.75-1.75 21.75-5 17.5-8.5 28.25-25.75 28.25-45v-31.5c47-4.25 83.75-43.75 83.75-91.5V136C700 85.25 658.5 44 607.5 44zM504.75 347.75H304.75c-13.75 0-25-11.25-25-25s11.25-25 25-25h200c14 0 25 11 25 25s-11 25-25 25zm0-105.25H304.75c-13.75 0-25-11.25-25-25.25s11.25-25 25-25h200c14 0 25 11.25 25 25s-11 25.25-25 25.25z"/>
  </svg>`,

  // Material: outlined chat bubble with dots
  material: (color) => `<svg viewBox="0 0 24 24" width="28" height="28" fill="${color}" style="pointer-events:none">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
    <path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/>
  </svg>`,

  // Rounded: solid filled chat bubble
  rounded: (color) => `<svg viewBox="0 0 24 24" width="28" height="28" fill="${color}" style="pointer-events:none">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2z"/>
  </svg>`,
};

// Close icon SVG (X)
export const CLOSE_ICON = (color) => `<svg viewBox="0 0 24 24" width="24" height="24" fill="${color}" style="pointer-events:none">
  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
</svg>`;
