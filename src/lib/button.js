import { ICONS, CLOSE_ICON } from './constants.js';
import { log } from './utils.js';

export function createButton(instance) {
  const btn_ = instance._button_;
  const isLeft = btn_.position === 'bottom-left';

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
  btn.id = instance._instanceId + '-btn';
  btn.setAttribute('role', 'button');
  btn.setAttribute('aria-label', 'Open chat');
  btn.setAttribute('tabindex', '0');

  Object.assign(btn.style, {
    position: 'fixed',
    bottom: '20px',
    [isLeft ? 'left' : 'right']: '20px',
    width: '60px',
    height: '60px',
    borderRadius: btn_.type === 'round' ? '50%' : '12px',
    backgroundColor: btn_.backgroundColor,
    color: btn_.textColor,
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

  btn.innerHTML = chatIcon(btn_);

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
  btn.addEventListener('click', () => instance.toggle());

  // Keyboard support
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      instance.toggle();
    }
  });

  document.body.appendChild(btn);
  instance._button = btn;
  log('Button created', { position: btn_.position, type: btn_.type, icon: btn_.icon });
}

export function updateButtonIcon(instance, isClose) {
  if (!instance._button) {
    return;
  }
  const btn_ = instance._button_;
  instance._button.innerHTML = isClose ? closeIcon(btn_) : chatIcon(btn_);
  instance._button.setAttribute('aria-label', isClose ? 'Close chat' : 'Open chat');
}

export function chatIcon(btn_) {
  const iconFn = ICONS[btn_.icon] || ICONS.default;
  return iconFn(btn_.textColor);
}

export function closeIcon(btn_) {
  return CLOSE_ICON(btn_.textColor);
}
