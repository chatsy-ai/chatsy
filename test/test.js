const pkg = require('../package.json');
const assert = require('assert');

describe(`${pkg.name} v${pkg.version}`, () => {
  const Chatsy = require('../dist/index.js').Chatsy || require('../dist/index.js').default || require('../dist/index.js');

  // ── Constructor ──────────────────────────────────────────────────────
  describe('constructor', () => {
    it('should throw if agentId is missing', () => {
      assert.throws(() => new Chatsy(), /agentId is required/);
    });

    it('should throw if agentId is not a string', () => {
      assert.throws(() => new Chatsy(123), /agentId is required/);
    });

    it('should throw if agentId is empty string', () => {
      assert.throws(() => new Chatsy(''), /agentId is required/);
    });

    it('should throw if agentId is null', () => {
      assert.throws(() => new Chatsy(null), /agentId is required/);
    });

    it('should create an instance with valid agentId', () => {
      const chat = new Chatsy('test-agent');
      assert.ok(chat);
      assert.strictEqual(chat._agentId, 'test-agent');
    });

    it('should apply default options', () => {
      const chat = new Chatsy('test-agent');
      assert.strictEqual(chat._options.settings.button.backgroundColor, '#297bf7');
      assert.strictEqual(chat._options.settings.button.textColor, '#FFFFFF');
      assert.strictEqual(chat._options.settings.button.position, 'bottom-right');
      assert.strictEqual(chat._options.settings.button.type, 'round');
      assert.deepStrictEqual(chat._options.user, {});
      assert.deepStrictEqual(chat._options.context, {});
    });

    it('should override options', () => {
      const chat = new Chatsy('test-agent', {
        settings: { button: { backgroundColor: '#FF0000', position: 'bottom-left' } },
        user: { id: 'user-42' },
      });
      assert.strictEqual(chat._options.settings.button.backgroundColor, '#FF0000');
      assert.strictEqual(chat._options.settings.button.position, 'bottom-left');
      assert.strictEqual(chat._options.user.id, 'user-42');
    });

    it('should keep defaults for options not overridden', () => {
      const chat = new Chatsy('test-agent', { settings: { button: { backgroundColor: '#FF0000' } } });
      assert.strictEqual(chat._options.settings.button.textColor, '#FFFFFF');
      assert.strictEqual(chat._options.settings.button.position, 'bottom-right');
      assert.deepStrictEqual(chat._options.user, {});
    });

    it('should assign unique instance IDs', () => {
      const a = new Chatsy('agent-a');
      const b = new Chatsy('agent-b');
      assert.notStrictEqual(a._instanceId, b._instanceId);
    });

    it('should initialize internal state', () => {
      const chat = new Chatsy('test-agent');
      assert.strictEqual(chat._isOpen, false);
      assert.strictEqual(chat._ready, false);
      assert.deepStrictEqual(chat._messages, []);
      assert.deepStrictEqual(chat._listeners, {});
      assert.strictEqual(chat._button, null);
      assert.strictEqual(chat._iframe, null);
      assert.strictEqual(chat._overlay, null);
      assert.strictEqual(chat._pendingSend, null);
    });
  });

  // ── Event System ─────────────────────────────────────────────────────
  describe('event system', () => {
    it('should register and fire event listeners', () => {
      const chat = new Chatsy('test-agent');
      let called = false;
      chat.on('test', () => { called = true; });
      chat._emit('test');
      assert.strictEqual(called, true);
    });

    it('should pass data to event listeners', () => {
      const chat = new Chatsy('test-agent');
      let received = null;
      chat.on('test', (data) => { received = data; });
      chat._emit('test', { foo: 'bar' });
      assert.deepStrictEqual(received, { foo: 'bar' });
    });

    it('should support multiple listeners on same event', () => {
      const chat = new Chatsy('test-agent');
      let count = 0;
      chat.on('test', () => { count++; });
      chat.on('test', () => { count++; });
      chat._emit('test');
      assert.strictEqual(count, 2);
    });

    it('should not fire listeners for other events', () => {
      const chat = new Chatsy('test-agent');
      let called = false;
      chat.on('other', () => { called = true; });
      chat._emit('test');
      assert.strictEqual(called, false);
    });

    it('should return instance for chaining', () => {
      const chat = new Chatsy('test-agent');
      const result = chat.on('test', () => {});
      assert.strictEqual(result, chat);
    });

    it('should handle listener errors without crashing', () => {
      const chat = new Chatsy('test-agent');
      let secondCalled = false;

      chat.on('test', () => { throw new Error('boom'); });
      chat.on('test', () => { secondCalled = true; });
      chat._emit('test');

      assert.strictEqual(secondCalled, true);
    });

    it('should not fire events after destroy', () => {
      const chat = new Chatsy('test-agent');
      let called = false;
      chat.on('test', () => { called = true; });
      chat.destroy();
      chat._emit('test');
      assert.strictEqual(called, false);
    });
  });

  // ── Messages ─────────────────────────────────────────────────────────
  describe('getMessages', () => {
    it('should return empty array initially', () => {
      const chat = new Chatsy('test-agent');
      assert.deepStrictEqual(chat.getMessages(), []);
    });

    it('should return a copy, not the internal array', () => {
      const chat = new Chatsy('test-agent');
      const msgs = chat.getMessages();
      msgs.push({ role: 'user', content: 'hack' });
      assert.deepStrictEqual(chat.getMessages(), []);
    });

    it('should reflect messages added via _onMessage', () => {
      const chat = new Chatsy('test-agent');
      // Simulate a chatsy:message postMessage
      chat._onMessage({
        data: { type: 'chatsy:message', payload: { message: { role: 'assistant', content: 'Hi' } } },
        origin: 'https://chatsy.ai',
      });
      const msgs = chat.getMessages();
      assert.strictEqual(msgs.length, 1);
      assert.strictEqual(msgs[0].content, 'Hi');
      assert.strictEqual(msgs[0].role, 'assistant');
    });

    it('should replace messages when payload has messages array', () => {
      const chat = new Chatsy('test-agent');
      // Add initial message
      chat._onMessage({
        data: { type: 'chatsy:message', payload: { message: { role: 'assistant', content: 'first' } } },
        origin: 'https://chatsy.ai',
      });
      // Replace with full array
      chat._onMessage({
        data: { type: 'chatsy:message', payload: { messages: [
          { role: 'user', content: 'hi' },
          { role: 'assistant', content: 'hello' },
        ] } },
        origin: 'https://chatsy.ai',
      });
      assert.strictEqual(chat.getMessages().length, 2);
    });
  });

  // ── _onMessage (postMessage handler) ─────────────────────────────────
  describe('_onMessage', () => {
    it('should ignore messages without chatsy: prefix', () => {
      const chat = new Chatsy('test-agent');
      let called = false;
      chat.on('ready', () => { called = true; });
      chat._onMessage({
        data: { type: 'other:ready', payload: {} },
        origin: 'https://chatsy.ai',
      });
      assert.strictEqual(called, false);
    });

    it('should ignore messages with invalid data', () => {
      const chat = new Chatsy('test-agent');
      // Should not throw
      chat._onMessage({ data: null, origin: 'https://chatsy.ai' });
      chat._onMessage({ data: 'string', origin: 'https://chatsy.ai' });
      chat._onMessage({ data: { type: 123 }, origin: 'https://chatsy.ai' });
    });

    it('should reject messages from wrong origin', () => {
      const chat = new Chatsy('test-agent');
      let called = false;
      chat.on('ready', () => { called = true; });
      chat._onMessage({
        data: { type: 'chatsy:ready', payload: {} },
        origin: 'https://evil.com',
      });
      assert.strictEqual(called, false);
    });

    it('should allow messages from matching origin', () => {
      const chat = new Chatsy('test-agent');
      let called = false;
      chat.on('ready', () => { called = true; });
      chat._onMessage({
        data: { type: 'chatsy:ready', payload: {} },
        origin: 'https://chatsy.ai',
      });
      assert.strictEqual(called, true);
    });

    it('should allow messages from localhost in dev', () => {
      const chat = new Chatsy('test-agent');
      let called = false;
      chat.on('ready', () => { called = true; });
      chat._onMessage({
        data: { type: 'chatsy:ready', payload: {} },
        origin: 'http://localhost:4000',
      });
      assert.strictEqual(called, true);
    });

    it('should handle chatsy:ready and set _ready flag', () => {
      const chat = new Chatsy('test-agent');
      assert.strictEqual(chat._ready, false);
      chat._onMessage({
        data: { type: 'chatsy:ready', payload: {} },
        origin: 'https://chatsy.ai',
      });
      assert.strictEqual(chat._ready, true);
    });

    it('should emit message event on chatsy:message', () => {
      const chat = new Chatsy('test-agent');
      let received = null;
      chat.on('message', (msg) => { received = msg; });
      chat._onMessage({
        data: { type: 'chatsy:message', payload: { message: { role: 'assistant', content: 'Hey' } } },
        origin: 'https://chatsy.ai',
      });
      assert.deepStrictEqual(received, { role: 'assistant', content: 'Hey' });
    });

    it('should emit error event on chatsy:state error', () => {
      const chat = new Chatsy('test-agent');
      let received = null;
      chat.on('error', (err) => { received = err; });
      chat._onMessage({
        data: { type: 'chatsy:state', payload: { state: 'error', error: 'Something broke' } },
        origin: 'https://chatsy.ai',
      });
      assert.strictEqual(received, 'Something broke');
    });

    it('should not emit error for non-error state', () => {
      const chat = new Chatsy('test-agent');
      let called = false;
      chat.on('error', () => { called = true; });
      chat._onMessage({
        data: { type: 'chatsy:state', payload: { state: 'loading' } },
        origin: 'https://chatsy.ai',
      });
      assert.strictEqual(called, false);
    });

    it('should handle missing payload gracefully', () => {
      const chat = new Chatsy('test-agent');
      // Should not throw
      chat._onMessage({
        data: { type: 'chatsy:ready' },
        origin: 'https://chatsy.ai',
      });
      assert.strictEqual(chat._ready, true);
    });
  });

  // ── send() ───────────────────────────────────────────────────────────
  describe('send', () => {
    it('should queue message if not ready', () => {
      const chat = new Chatsy('test-agent');
      // Pretend already open so send() doesn't call open() -> _createIframe() which needs DOM
      chat._isOpen = true;
      chat.send('hello');
      assert.strictEqual(chat._pendingSend, 'hello');
    });

    it('should ignore non-string messages', () => {
      const chat = new Chatsy('test-agent');
      chat._isOpen = true;
      chat.send(null);
      chat.send(123);
      chat.send('');
      assert.strictEqual(chat._pendingSend, null);
    });

    it('should flush pending message on chatsy:ready', () => {
      const chat = new Chatsy('test-agent');
      chat._isOpen = true;
      chat.send('queued message');
      assert.strictEqual(chat._pendingSend, 'queued message');

      // Simulate ready — _postToIframe is a no-op without a real iframe, but pending should clear
      chat._onMessage({
        data: { type: 'chatsy:ready', payload: {} },
        origin: 'https://chatsy.ai',
      });
      assert.strictEqual(chat._pendingSend, null);
    });
  });

  // ── destroy() ────────────────────────────────────────────────────────
  describe('destroy', () => {
    it('should clear all internal state', () => {
      const chat = new Chatsy('test-agent');
      chat.on('test', () => {});
      chat._messages.push({ role: 'user', content: 'hi' });
      chat.destroy();

      assert.strictEqual(chat._button, null);
      assert.strictEqual(chat._iframe, null);
      assert.strictEqual(chat._overlay, null);
      assert.deepStrictEqual(chat._listeners, {});
      assert.deepStrictEqual(chat._messages, []);
    });

    it('should be safe to call multiple times', () => {
      const chat = new Chatsy('test-agent');
      chat.destroy();
      chat.destroy();
      assert.strictEqual(chat._button, null);
    });
  });

  // ── Static properties ────────────────────────────────────────────────
  describe('static', () => {
    it('should have version matching package.json', () => {
      assert.strictEqual(typeof Chatsy.version, 'string');
      assert.strictEqual(Chatsy.version, pkg.version);
    });

    it('should have _instances array', () => {
      assert.ok(Array.isArray(Chatsy._instances));
    });
  });

  // ── Multiple instances ───────────────────────────────────────────────
  describe('multiple instances', () => {
    it('should maintain independent state', () => {
      const a = new Chatsy('agent-a', { settings: { button: { backgroundColor: '#FF0000' } } });
      const b = new Chatsy('agent-b', { settings: { button: { backgroundColor: '#00FF00' } } });

      a._messages.push({ role: 'user', content: 'from a' });

      assert.strictEqual(a._agentId, 'agent-a');
      assert.strictEqual(b._agentId, 'agent-b');
      assert.strictEqual(a._options.settings.button.backgroundColor, '#FF0000');
      assert.strictEqual(b._options.settings.button.backgroundColor, '#00FF00');
      assert.strictEqual(a.getMessages().length, 1);
      assert.strictEqual(b.getMessages().length, 0);
    });

    it('should have independent event listeners', () => {
      const a = new Chatsy('agent-a');
      const b = new Chatsy('agent-b');
      let aCalled = false;
      let bCalled = false;

      a.on('test', () => { aCalled = true; });
      b.on('test', () => { bCalled = true; });

      a._emit('test');
      assert.strictEqual(aCalled, true);
      assert.strictEqual(bCalled, false);
    });

    it('should independently handle postMessages', () => {
      const a = new Chatsy('agent-a');
      const b = new Chatsy('agent-b');

      a._onMessage({
        data: { type: 'chatsy:message', payload: { message: { role: 'assistant', content: 'for a' } } },
        origin: 'https://chatsy.ai',
      });

      assert.strictEqual(a.getMessages().length, 1);
      assert.strictEqual(b.getMessages().length, 0);
    });
  });

  // ── Origin validation ────────────────────────────────────────────────
  describe('origin validation', () => {
    it('should accept custom _embedUrl origin', () => {
      const chat = new Chatsy('test-agent', { _embedUrl: 'https://custom.example.com' });
      let called = false;
      chat.on('ready', () => { called = true; });
      chat._onMessage({
        data: { type: 'chatsy:ready', payload: {} },
        origin: 'https://custom.example.com',
      });
      assert.strictEqual(called, true);
    });

    it('should reject non-matching custom origin', () => {
      const chat = new Chatsy('test-agent', { _embedUrl: 'https://custom.example.com' });
      let called = false;
      chat.on('ready', () => { called = true; });
      chat._onMessage({
        data: { type: 'chatsy:ready', payload: {} },
        origin: 'https://chatsy.ai',
      });
      assert.strictEqual(called, false);
    });

    it('should always allow localhost regardless of _embedUrl', () => {
      const chat = new Chatsy('test-agent', { _embedUrl: 'https://custom.example.com' });
      let called = false;
      chat.on('ready', () => { called = true; });
      chat._onMessage({
        data: { type: 'chatsy:ready', payload: {} },
        origin: 'http://localhost:3000',
      });
      assert.strictEqual(called, true);
    });
  });
});
