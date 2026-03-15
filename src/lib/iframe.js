import { API_URL, VERSION } from './constants.js';
import { log } from './utils.js';

export function createIframe(instance) {
  const btn_ = instance._button_;
  const isLeft = btn_.position === 'bottom-left';
  const isMobile = window.innerWidth <= 480;

  // Overlay for mobile
  const overlay = document.createElement('div');
  overlay.id = instance._instanceId + '-overlay';
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
  overlay.addEventListener('click', () => instance.close());
  document.body.appendChild(overlay);
  instance._overlay = overlay;

  // Iframe
  const baseUrl = instance._options._embedUrl || API_URL;
  const url = new URL('/chat/embed', baseUrl);
  url.searchParams.set('agentId', instance._agentId);
  url.searchParams.set('version', VERSION);
  url.searchParams.set('settings', JSON.stringify(instance._options.settings));
  url.searchParams.set('user', JSON.stringify(instance._options.user));
  url.searchParams.set('context', JSON.stringify(instance._options.context));

  const iframe = document.createElement('iframe');
  iframe.id = instance._instanceId + '-iframe';
  iframe.src = url.toString();
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
  instance._iframe = iframe;
  log('Iframe created', { src: iframe.src, mobile: isMobile });
}

export function postToIframe(instance, type, payload) {
  if (!instance._iframe || !instance._iframe.contentWindow) {
    return;
  }

  const targetOrigin = instance._options._embedUrl || API_URL;
  instance._iframe.contentWindow.postMessage(
    { type, instanceId: instance._instanceId, payload },
    targetOrigin,
  );
}
