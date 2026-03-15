import { API_URL, VERSION } from './constants.js';
import { log, logError } from './utils.js';
import { postToIframe } from './iframe.js';

export function emit(instance, event, data) {
  const listeners = instance._listeners[event] || [];
  if (listeners.length) {
    log(`Emitting "${event}" to ${listeners.length} listener(s)`);
  }
  listeners.forEach(cb => {
    try { cb(data); } catch (e) { logError(`Event "${event}" handler error:`, e); }
  });
}

export function onMessage(instance, event) {
  const data = event.data;
  if (!data || typeof data.type !== 'string' || !data.type.startsWith('chatsy:')) {
    return;
  }

  // Origin validation (skip for localhost in dev)
  const expectedOrigin = new URL(instance._options._embedUrl || API_URL).origin;
  if (event.origin !== expectedOrigin && !event.origin.startsWith('http://localhost')) {
    return;
  }

  const payload = data.payload || {};

  log(`Received postMessage: ${data.type}`, payload);

  switch (data.type) {
    case 'chatsy:ready':
      instance._ready = true;
      log('Iframe ready, sending init config');
      // Send init config to iframe
      postToIframe(instance, 'chatsy:init', {
        agentId: instance._agentId,
        version: VERSION,
        settings: instance._options.settings,
        user: instance._options.user,
        context: instance._options.context,
      });
      emit(instance, 'ready');

      // Send any queued message
      if (instance._pendingSend) {
        log('Flushing queued message:', instance._pendingSend);
        postToIframe(instance, 'chatsy:send', { message: instance._pendingSend });
        instance._pendingSend = null;
      }
      break;

    case 'chatsy:message':
      if (payload.message) {
        instance._messages.push(payload.message);
      }
      if (payload.messages) {
        instance._messages = payload.messages;
      }
      log('Received message from iframe:', payload.message?.content);
      emit(instance, 'message', payload.message);
      break;

    case 'chatsy:close':
      log('Close requested by embed');
      instance.close();
      break;

    case 'chatsy:state':
      log('State update:', payload.state);
      if (payload.state === 'error') {
        logError('Error from iframe:', payload.error);
        emit(instance, 'error', payload.error);
      }
      break;
  }
}
