/**
 * Chatsy - Embeddable AI Chat Widget
 * https://chatsy.ai
 *
 * @version {version}
 */

const VERSION = '{version}';
const IS_BROWSER = typeof window !== 'undefined' && typeof document !== 'undefined';
const DEFAULTS = {
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
const ICONS = {
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
const CLOSE_ICON = (color) => `<svg viewBox="0 0 24 24" width="24" height="24" fill="${color}" style="pointer-events:none">
  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
</svg>`;

// Logging
const log = (...args) => console.log('[Chatsy:widget]', ...args);
const logWarn = (...args) => console.warn('[Chatsy:widget]', ...args);
const logError = (...args) => console.error('[Chatsy:widget]', ...args);

// Deep merge utility
function deepMerge(target, source) {
  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])
      && target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])
    ) {
      output[key] = deepMerge(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
}

// Unique instance counter
let instanceCounter = 0;

class Chatsy {
  constructor(agentId, options = {}) {
    if (!agentId || typeof agentId !== 'string') {
      throw new Error('Chatsy: agentId is required as the first argument');
    }

    this._agentId = agentId;
    this._options = deepMerge(DEFAULTS, options);
    this._button_= this._options.settings.button;
    this._instanceId = `chatsy-${++instanceCounter}`;
    this._isOpen = false;
    this._ready = false;
    this._messages = [];
    this._listeners = {};
    this._button = null;
    this._iframe = null;
    this._overlay = null;
    this._pendingSend = null;

    log(`Initializing instance ${this._instanceId}`, { agentId, options: this._options });

    // Browser-only: bind message handler and create button
    if (IS_BROWSER) {
      this._onMessage = this._onMessage.bind(this);
      window.addEventListener('message', this._onMessage);

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this._createButton());
      } else {
        this._createButton();
      }
    } else {
      logWarn('Non-browser environment detected, skipping DOM setup');
    }
  }

  // Public API

  open() {
    if (this._isOpen) {
      return;
    }

    log('Opening chat');

    // Lazy-create iframe on first open
    if (!this._iframe) {
      this._createIframe();
    }

    this._isOpen = true;
    this._iframe.style.display = 'block';
    this._overlay.style.display = 'block';

    // Animate in (legacy: scale from origin + opacity)
    requestAnimationFrame(() => {
      this._iframe.style.opacity = '1';
      this._iframe.style.transform = 'scale(1)';
      this._overlay.style.opacity = '1';
    });

    // Update button icon to close
    this._updateButtonIcon(true);

    this._emit('open');
  }

  close() {
    if (!this._isOpen) {
      return;
    }

    log('Closing chat');
    this._isOpen = false;

    // Animate out (legacy: scale to 0 + opacity)
    this._iframe.style.opacity = '0';
    this._iframe.style.transform = 'scale(0)';
    this._overlay.style.opacity = '0';

    setTimeout(() => {
      if (!this._isOpen && this._iframe) {
        this._iframe.style.display = 'none';
        this._overlay.style.display = 'none';
      }
    }, 250);

    // Update button icon to chat
    this._updateButtonIcon(false);

    // Notify iframe
    this._postToIframe('chatsy:close', {});

    this._emit('close');
  }

  toggle() {
    if (this._isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  send(message) {
    if (!message || typeof message !== 'string') {
      return;
    }

    // Open if not already
    if (!this._isOpen) {
      this.open();
    }

    // If iframe is ready, send now; otherwise queue
    if (this._ready) {
      log('Sending message to iframe:', message);
      this._postToIframe('chatsy:send', { message });
    } else {
      log('Iframe not ready, queuing message:', message);
      this._pendingSend = message;
    }
  }

  getMessages() {
    return [...this._messages];
  }

  on(event, callback) {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    this._listeners[event].push(callback);
    return this;
  }

  destroy() {
    log(`Destroying instance ${this._instanceId}`);

    if (IS_BROWSER) {
      window.removeEventListener('message', this._onMessage);
    }

    if (this._button) {
      this._button.remove();
    }
    if (this._iframe) {
      this._iframe.remove();
    }
    if (this._overlay) {
      this._overlay.remove();
    }

    this._button = null;
    this._iframe = null;
    this._overlay = null;
    this._listeners = {};
    this._messages = [];
  }

  // Private methods

  _emit(event, data) {
    const listeners = this._listeners[event] || [];
    if (listeners.length) {
      log(`Emitting "${event}" to ${listeners.length} listener(s)`);
    }
    listeners.forEach(cb => {
      try { cb(data); } catch (e) { logError(`Event "${event}" handler error:`, e); }
    });
  }

  _onMessage(event) {
    const data = event.data;
    if (!data || typeof data.type !== 'string' || !data.type.startsWith('chatsy:')) {
      return;
    }

    // Origin validation (skip for localhost in dev)
    const expectedOrigin = new URL(this._options.apiUrl).origin;
    if (event.origin !== expectedOrigin && !event.origin.startsWith('http://localhost')) {
      return;
    }

    const payload = data.payload || {};

    log(`Received postMessage: ${data.type}`, payload);

    switch (data.type) {
      case 'chatsy:ready':
        this._ready = true;
        log('Iframe ready, sending init config');
        // Send init config to iframe
        this._postToIframe('chatsy:init', {
          agentId: this._agentId,
          endUserId: this._options.endUserId,
          settings: this._options.settings,
        });
        this._emit('ready');

        // Send any queued message
        if (this._pendingSend) {
          log('Flushing queued message:', this._pendingSend);
          this._postToIframe('chatsy:send', { message: this._pendingSend });
          this._pendingSend = null;
        }
        break;

      case 'chatsy:message':
        if (payload.message) {
          this._messages.push(payload.message);
        }
        if (payload.messages) {
          this._messages = payload.messages;
        }
        log('Received message from iframe:', payload.message?.content);
        this._emit('message', payload.message);
        break;

      case 'chatsy:state':
        log('State update:', payload.state);
        if (payload.state === 'error') {
          logError('Error from iframe:', payload.error);
          this._emit('error', payload.error);
        }
        break;
    }
  }

  _postToIframe(type, payload) {
    if (!this._iframe || !this._iframe.contentWindow) {
      return;
    }

    this._iframe.contentWindow.postMessage(
      { type, instanceId: this._instanceId, payload },
      this._options.apiUrl,
    );
  }

  _createButton() {
    const isLeft = this._button_.position === 'bottom-left';

    // Inject keyframes animation once
    if (!document.getElementById('chatsy-keyframes')) {
      const style = document.createElement('style');
      style.id = 'chatsy-keyframes';
      style.textContent = `
        @keyframes chatsy-bounce-in {
          0% { opacity: 0; transform: translateY(40px); }
          1% { opacity: 0; }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(10px); }
          80% { opacity: 1; transform: translateY(-5px); }
          100% { transform: translateY(0); }
        }
      `;
      document.head.appendChild(style);
    }

    // Button
    const btn = document.createElement('div');
    btn.id = this._instanceId + '-btn';
    btn.setAttribute('role', 'button');
    btn.setAttribute('aria-label', 'Open chat');
    btn.setAttribute('tabindex', '0');

    Object.assign(btn.style, {
      position: 'fixed',
      bottom: '20px',
      [isLeft ? 'left' : 'right']: '20px',
      width: '60px',
      height: '60px',
      borderRadius: this._button_.type === 'round' ? '50%' : '12px',
      backgroundColor: this._button_.backgroundColor,
      color: this._button_.textColor,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.16)',
      zIndex: '2147483646',
      transition: 'transform 167ms cubic-bezier(0.33, 0, 0, 1)',
      transformOrigin: 'center center',
      animation: 'chatsy-bounce-in 1.5s cubic-bezier(0.4, 0.1, 0.2, 1)',
    });

    btn.innerHTML = this._chatIcon();

    // Hover: scale up
    btn.addEventListener('mouseenter', () => {
      btn.style.transition = 'transform 250ms cubic-bezier(0.33, 0, 0, 1)';
      btn.style.transform = 'scale(1.1)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform 167ms cubic-bezier(0.33, 0, 0, 1)';
      btn.style.transform = 'scale(1)';
    });

    // Click: scale down
    btn.addEventListener('mousedown', () => {
      btn.style.transition = 'transform 134ms cubic-bezier(0.45, 0, 0.2, 1)';
      btn.style.transform = 'scale(0.85)';
    });
    btn.addEventListener('mouseup', () => {
      btn.style.transition = 'transform 250ms cubic-bezier(0.33, 0, 0, 1)';
      btn.style.transform = 'scale(1.1)';
    });

    // Click
    btn.addEventListener('click', () => this.toggle());

    // Keyboard support
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggle();
      }
    });

    document.body.appendChild(btn);
    this._button = btn;
    log('Button created', { position: this._button_.position, type: this._button_.type, icon: this._button_.icon });
  }

  _createIframe() {
    const isLeft = this._button_.position === 'bottom-left';
    const isMobile = window.innerWidth <= 480;

    // Overlay for mobile
    const overlay = document.createElement('div');
    overlay.id = this._instanceId + '-overlay';
    Object.assign(overlay.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      zIndex: '2147483646',
      display: 'none',
      opacity: '0',
      transition: 'opacity 0.25s ease',
    });
    overlay.addEventListener('click', () => this.close());
    document.body.appendChild(overlay);
    this._overlay = overlay;

    // Iframe
    const params = new URLSearchParams({
      agentId: this._agentId,
      endUserId: this._options.endUserId || '',
      settings: JSON.stringify(this._options.settings),
    });

    const iframe = document.createElement('iframe');
    iframe.id = this._instanceId + '-iframe';
    iframe.src = `${this._options.apiUrl}/chat/embed?${params.toString()}`;
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');
    iframe.setAttribute('allow', 'clipboard-write');

    Object.assign(iframe.style, {
      position: 'fixed',
      bottom: isMobile ? '0' : '84px',
      [isLeft ? 'left' : 'right']: isMobile ? '0' : '20px',
      width: isMobile ? '100%' : '400px',
      height: isMobile ? '100%' : `min(704px, calc(100% - 104px))`,
      maxHeight: isMobile ? '100vh' : '704px',
      border: 'none',
      borderRadius: isMobile ? '0' : '16px',
      boxShadow: '0 5px 40px rgba(0, 0, 0, 0.16)',
      zIndex: '2147483647',
      display: 'none',
      opacity: '0',
      transform: 'scale(0)',
      transformOrigin: `${isLeft ? 'left' : 'right'} bottom`,
      transition: 'transform 300ms cubic-bezier(0, 1.2, 1, 1), opacity 83ms ease-out',
      overflow: 'hidden',
    });

    document.body.appendChild(iframe);
    this._iframe = iframe;
    log('Iframe created', { src: iframe.src, mobile: isMobile });
  }

  _updateButtonIcon(isClose) {
    if (!this._button) {
      return;
    }
    this._button.innerHTML = isClose ? this._closeIcon() : this._chatIcon();
    this._button.setAttribute('aria-label', isClose ? 'Close chat' : 'Open chat');
  }

  _chatIcon() {
    const iconFn = ICONS[this._button_.icon] || ICONS.default;
    return iconFn(this._button_.textColor);
  }

  _closeIcon() {
    return CLOSE_ICON(this._button_.textColor);
  }
}

// Static version
Chatsy.version = VERSION;

// Track auto-initialized instances
Chatsy._instances = [];

// Auto-init from script tags (for CDN/UMD usage)
function autoInit() {
  const scripts = document.querySelectorAll('script[data-agent-id]');
  log(`Auto-init: found ${scripts.length} script tag(s) with data-agent-id`);

  scripts.forEach((script) => {
    const agentId = script.getAttribute('data-agent-id');
    if (!agentId) {
      return;
    }

    const instance = new Chatsy(agentId, {
      settings: {
        button: {
          backgroundColor: script.getAttribute('data-button-background-color') || undefined,
          textColor: script.getAttribute('data-button-text-color') || undefined,
          position: script.getAttribute('data-button-position') || undefined,
          type: script.getAttribute('data-button-type') || undefined,
          icon: script.getAttribute('data-button-icon') || undefined,
        },
      },
      endUserId: script.getAttribute('data-end-user-id') || undefined,
      apiUrl: script.getAttribute('data-api-url') || undefined,
    });

    Chatsy._instances.push(instance);
  });
}

// Browser environment
if (typeof window !== 'undefined') {
  window.Chatsy = Chatsy;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }
}

export default Chatsy;
export { Chatsy };
