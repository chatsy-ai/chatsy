/**
 * Chatsy - Embeddable AI Chat Widget
 * https://chatsy.ai
 *
 * @version {version}
 */

import { VERSION, IS_BROWSER, DEFAULTS } from './lib/constants.js';
import { deepMerge, log, logWarn } from './lib/utils.js';
import { createButton, updateButtonIcon } from './lib/button.js';
import { createIframe, postToIframe } from './lib/iframe.js';
import { emit, onMessage } from './lib/events.js';

// Unique instance counter
let instanceCounter = 0;

class Chatsy {
  constructor(agentId, options = {}) {
    if (!agentId || typeof agentId !== 'string') {
      throw new Error('Chatsy: agentId is required as the first argument');
    }

    this._agentId = agentId;
    this._options = deepMerge(DEFAULTS, options);
    this._button_ = this._options.settings.button;
    this._instanceId = `chatsy-${++instanceCounter}`;

    // Auto-collect parent page context (NPM widget runs on customer's page)
    if (IS_BROWSER) {
      this._options.context = deepMerge({
        page: {
          url: window.location.href,
          referrer: document.referrer,
          title: document.title,
        },
      }, this._options.context);
    }
    this._isOpen = false;
    this._ready = false;
    this._messages = [];
    this._listeners = {};
    this._button = null;
    this._iframe = null;
    this._overlay = null;
    this._pendingSend = null;

    log(`Initializing instance ${this._instanceId}`, { agentId, options: this._options });

    // Bind event helpers to this instance
    this._onMessage = onMessage.bind(null, this);
    this._emit = emit.bind(null, this);

    // Browser-only: listen for postMessages and create button
    if (IS_BROWSER) {
      window.addEventListener('message', this._onMessage);

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => createButton(this));
      } else {
        createButton(this);
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
      createIframe(this);
    }

    this._isOpen = true;
    this._iframe.style.display = 'block';
    this._overlay.style.display = 'block';

    // Animate in
    requestAnimationFrame(() => {
      this._iframe.style.opacity = '1';
      this._iframe.style.transform = 'scale(1)';
      this._overlay.style.opacity = '1';
    });

    // Update button icon to close
    updateButtonIcon(this, true);

    emit(this, 'open');
  }

  close() {
    if (!this._isOpen) {
      return;
    }

    log('Closing chat');
    this._isOpen = false;

    // Animate out
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
    updateButtonIcon(this, false);

    // Notify iframe
    postToIframe(this, 'chatsy:close', {});

    emit(this, 'close');
  }

  toggle() {
    if (this._isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  setUser(user) {
    this._options.user = user || {};

    // If iframe is ready, push the update immediately
    if (this._ready) {
      postToIframe(this, 'chatsy:update', { user: this._options.user });
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
      postToIframe(this, 'chatsy:send', { message });
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
