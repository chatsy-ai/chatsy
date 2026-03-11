<p align="center">
  <a href="https://chatsy.ai">
    <img src="https://cdn.itwcreativeworks.com/assets/chatsy/images/socials/chatsy-brandmark-square-black-1024x1024.png" width="100px">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/github/package-json/v/chatsy-ai/chatsy.svg">
  <img src="https://img.shields.io/bundlephobia/min/chatsy.svg">
  <img src="https://img.shields.io/npm/dm/chatsy.svg">
  <img src="https://img.shields.io/node/v/chatsy.svg">
  <img src="https://img.shields.io/github/license/chatsy-ai/chatsy.svg">
  <br>
  <br>
  <a href="https://chatsy.ai">Site</a> | <a href="https://www.npmjs.com/package/chatsy">NPM Module</a> | <a href="https://github.com/chatsy-ai/chatsy">GitHub Repo</a>
  <br>
  <br>
  <strong>Chatsy</strong> is an embeddable AI chatbot widget. Add intelligent customer support to any website with one line of code.
</p>

## Quick Start

### 1. Create an Agent

Go to [chatsy.ai/dashboard/agents/new](https://chatsy.ai/dashboard/agents/new) to create your AI agent. Configure your brand info, knowledge base, response style, and welcome message. Copy the **Agent ID** when you're done.

### 2. Add to Your Website

**Script tag** (no build tools needed):

```html
<script
  src="https://cdn.jsdelivr.net/npm/chatsy@latest/dist/chatsy.min.js"
  data-agent-id="YOUR_AGENT_ID"
></script>
```

A chat button appears in the bottom-right corner. Click it to open the chat.

**NPM** (for React, Vue, Next.js, etc.):

```
npm install chatsy
```

```js
import Chatsy from 'chatsy';

const chat = new Chatsy('YOUR_AGENT_ID');
```

## Configuration

### Script Tag Attributes

| Attribute | Default | Description |
|-----------|---------|-------------|
| `data-agent-id` | *required* | Your agent ID from the dashboard |
| `data-button-background-color` | `#297bf7` | Button background color |
| `data-button-text-color` | `#FFFFFF` | Button icon color |
| `data-button-position` | `bottom-right` | `bottom-right` or `bottom-left` |
| `data-button-type` | `round` | Button shape: `round` or `square` |
| `data-button-icon` | `default` | Icon style: `default`, `material`, or `rounded` |

> **Note:** User data (`user`, `context`) is not supported via script tag attributes. Use the JavaScript API with `setUser()` for dynamic user identification.

### JavaScript Options

```js
const chat = new Chatsy('YOUR_AGENT_ID', {
  settings: {
    button: {
      backgroundColor: '#297bf7', // Button background color
      textColor: '#FFFFFF',       // Button icon color
      position: 'bottom-right',   // 'bottom-right' or 'bottom-left'
      type: 'round',              // 'round' or 'square'
      icon: 'default',            // 'default', 'material', or 'rounded'
    },
  },
  user: {
    id: 'user-123',               // Unique user ID
    firstName: 'Jane',            // First name (avatar initials, sent to AI)
    lastName: 'Smith',            // Last name (avatar initials, sent to AI)
    email: 'jane@example.com',    // Sent to AI as context
    photoURL: 'https://...',      // Profile picture URL (replaces initials avatar)
    // ...any other scalar fields are sent to the AI
  },
  context: {
    // page.url, page.referrer, page.title are auto-collected
    tags: ['vip', 'enterprise'],  // Labels for filtering conversations
    metadata: { planId: 'pro' },  // Arbitrary key/values (scalars only)
  },
});
```

## API

### Methods

| Method | Description |
|--------|-------------|
| `chat.open()` | Open the chat window |
| `chat.close()` | Close the chat window |
| `chat.toggle()` | Toggle open/close |
| `chat.send('Hello!')` | Send a message programmatically |
| `chat.setUser({ id, firstName, ... })` | Update user identity (e.g., after auth state change) |
| `chat.getMessages()` | Get all messages as an array |
| `chat.destroy()` | Remove the widget from the page |

### Events

```js
chat.on('ready', () => { /* Widget loaded */ });
chat.on('open', () => { /* Chat opened */ });
chat.on('close', () => { /* Chat closed */ });
chat.on('message', (msg) => { /* New message received */ });
chat.on('error', (err) => { /* Error occurred */ });
```

### Multiple Instances

Each instance is independent, so you can run multiple widgets on the same page:

```js
const support = new Chatsy('support-agent-id');
const sales = new Chatsy('sales-agent-id', {
  settings: { button: { position: 'bottom-left', backgroundColor: '#10B981' } },
});
```

## How It Works

1. A floating chat button is injected into your page (a regular DOM element, not an iframe)
2. Clicking it lazily creates an iframe with the chat interface (no impact on initial page load)
3. Messages are sent to your AI agent via the Chatsy API
4. The agent responds based on your configured knowledge base, brand info, and instructions

## Agent Configuration

Configure your agent at [chatsy.ai/dashboard](https://chatsy.ai/dashboard):

| Setting | What It Does |
|---------|-------------|
| **Brand info** | Company name, website, phone, description |
| **Knowledge base** | Products, services, and additional context the agent should know |
| **Processes** | Cancellation, refund, return, and shipping policies |
| **Response style** | Tone (professional, friendly, casual) and custom instructions |
| **Welcome message** | First message visitors see when opening chat |
| **AI model** | Standard (GPT-4o Mini) or Advanced (GPT-4o) |

## Development

```bash
npm start        # Watch mode - rebuilds on file changes
npm run build    # One-time build (ESM, CJS, UMD)
npm test         # Run tests
```

### Build Outputs

| File | Format | Use Case |
|------|--------|----------|
| `dist/index.mjs` | ESM | `import` in modern bundlers (webpack, Vite, etc.) |
| `dist/index.js` | CJS | `require()` in Node.js |
| `dist/chatsy.min.js` | IIFE (minified) | `<script>` tag / CDN |

### Local Testing

Open `test/browser.html` in your browser to test the widget locally.

## License

MIT
