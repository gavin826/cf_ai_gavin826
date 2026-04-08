# Cloudflare AI Assignment

An AI-powered application built on Cloudflare Workers that demonstrates the core components of modern serverless computing with artificial intelligence integration.

---

#Features

# 1. AI Response (`/ai-test`)
- Calls Llama 3.3 AI model via Cloudflare Workers AI
- Generates intelligent responses to prompts
- Automatically saves responses to persistent memory storage
- Returns JSON response with AI-generated text

# 2. Memory Storage
- AI chat responses are automatically saved to persistent storage using Durable Objects
- Conversation history is retrieved and displayed on the home page
- Each message is permanently stored in Cloudflare's edge network

# 3. Web Interface
- Simple frontend UI in `public/index.html`
- Fetches messages from the backend
- Real-time display of responses

---

# Tech Stack

- Framework: Hono (lightweight web framework)
- Runtime: Cloudflare Workers
- Language: TypeScript
- AI Model: Llama 3.3 (via Cloudflare Workers AI)
- Storage: Durable Objects (persistent state)
- Package Manager: npm

---

# Prerequisites

- Node.js (v18+)
- npm or yarn
- A Cloudflare account (for deployment)
- Wrangler CLI (`npm install -g wrangler`)

---

# Installation

1. Clone or download this repository:
   ```bash
   cd cf-ai-my-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Authenticate with Cloudflare (for deployment):
   ```bash
   wrangler login
   ```

---

# Running Locally

Start the development server:
```bash
npm run dev
```

---

# API Endpoints

## Home
```
GET /
Response: "Cloudflare Assingment - AI"
```

## AI Chat
```
GET /ai-test
Response: JSON containing AI-generated response
Example:
{
  "response": "Cloudflare is a great company because...",
  "success": true
}
```

Note: AI responses are automatically saved to memory and displayed in the conversation history.

---

# Project Structure

```
cf-ai-my-app/
├── src/
│   └── index.ts           # Main worker code (routes & AI logic)
├── public/
│   └── index.html         # Frontend UI
├── package.json           # Dependencies & scripts
├── wrangler.jsonc         # Cloudflare configuration
├── tsconfig.json          # TypeScript settings
├── README.md              # This file
└── PROMPTS.md             # AI prompts used in the project
```

---


# Live Demo

Deploy to Cloudflare:
```bash
npm run deploy
```

The app will be live at: `https://cf-ai-my-app.gavinoconnor826.workers.dev`

---

# Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Workers AI Guide](https://developers.cloudflare.com/workers-ai/)
- [Hono Framework](https://hono.dev/)
- [Durable Objects Documentation](https://developers.cloudflare.com/workers/runtime-apis/durable-objects/)

---



