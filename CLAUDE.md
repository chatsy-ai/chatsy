# Chatsy NPM Package (`chatsy`)

## Overview
Embeddable AI chatbot widget distributed via npm and CDN. This package is a **lightweight client** — it renders a floating chat button and opens an iframe pointing to the chat page hosted on `chatsy-website`. All API calls happen inside the iframe, not in this package.

## Architecture

### How it works
1. Developer adds the package to their site (npm import or `<script>` tag)
2. Package creates a floating chat button (pure DOM, no iframe)
3. On first click, an iframe is lazy-created pointing to `https://chatsy.ai/chat/embed?agentId=xxx`
4. The iframe (served by `chatsy-website`) handles all chat UI, API calls, and conversation state
5. Widget and iframe communicate via `postMessage`

### Relationship to other repos
- **chatsy-website**: Hosts the `/chat/embed` page that runs inside this package's iframe. The widget and embed page are tightly coupled via the postMessage protocol.
- **chatsy-backend**: The embed page (not this package) calls backend API endpoints like `POST /agents/{id}/chat`.

### PostMessage Protocol
All messages use format: `{ type: 'chatsy:xxx', instanceId, payload }`

| Direction | Type | Purpose |
|-----------|------|---------|
| Embed -> Widget | `chatsy:ready` | Iframe loaded, ready for config |
| Widget -> Embed | `chatsy:init` | Send agentId, endUserId, settings config |
| Widget -> Embed | `chatsy:send` | Programmatic message send |
| Widget -> Embed | `chatsy:close` | Chat was closed |
| Embed -> Widget | `chatsy:message` | New message received from AI |
| Embed -> Widget | `chatsy:state` | State changes (errors, etc.) |

## Project Structure
```
src/index.js          # Single source file — Chatsy class + auto-init
build.js              # esbuild config — produces 3 builds
dist/
  index.mjs           # ESM build (npm/webpack)
  index.js            # CJS build (require())
  chatsy.min.js       # UMD/IIFE build (CDN <script> tag)
test/
  test.js             # Mocha unit tests
  browser.html        # Browser test harness
```

## Build System
- **Tool**: esbuild via `build.js`
- **3 outputs**: ESM (`index.mjs`), CJS (`index.js`), UMD minified (`chatsy.min.js`)
- **Version injection**: `{version}` placeholder in source is replaced with `package.json` version at build time
- `npm run start` — watch mode
- `npm run build` — production build
- `npm run test` — build + mocha tests

## Key Concepts

### Chatsy Class API
```js
const chat = new Chatsy('agent-id', {
  settings: {
    button: {
      backgroundColor: '#297bf7',
      textColor: '#FFFFFF',
      position: 'bottom-right',  // 'bottom-right' | 'bottom-left'
      type: 'round',             // 'round' | 'square'
      icon: 'default',           // 'default' | 'material' | 'rounded'
    },
  },
  endUserId: '',
  apiUrl: 'https://chatsy.ai',
});
chat.open() / chat.close() / chat.toggle()
chat.send(message)
chat.getMessages()
chat.on('open' | 'close' | 'message' | 'error' | 'ready', callback)
chat.destroy()
```

### CDN Auto-init
The UMD build auto-initializes from `<script>` tags with `data-agent-id`:
```html
<script src="https://cdn.jsdelivr.net/npm/chatsy@latest/dist/chatsy.min.js" data-agent-id="xxx"></script>
```

### Button & Iframe
- Button: regular DOM `<div>`, fixed position, z-index `2147483646`, bounce-in animation
- Iframe: lazy-created on first `open()`, z-index `2147483647`, scale animation, full-screen on mobile (<=480px)
- Overlay: semi-transparent backdrop on mobile, click-to-close

### Icon Options
`settings.button.icon`: `'default'` (Chatsy branding), `'material'` (outlined bubble), `'rounded'` (solid bubble)

### Logging
All console output prefixed with `[Chatsy:widget]`.

## Conventions
- No runtime dependencies — zero external imports
- All DOM manipulation uses inline styles for CSS isolation (no stylesheets)
- Multiple instances supported on the same page via `instanceId`
- Origin validation on postMessage (skips localhost for dev)
- `apiUrl` defaults to `https://chatsy.ai`, override with `http://localhost:4000` for local dev
