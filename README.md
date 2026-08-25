# DataYar — داده‌یار

**AI-powered discovery engine for datasets & code repositories.**

Search once, get verified results from **Hugging Face, GitHub, OpenML, and Kaggle** — ranked by an AI quality score, with license analysis, executive summaries, comparison matrices, and a built-in technical consultant that tells you how to actually load and use each dataset.

🔗 **Live:** https://dadehyar.vercel.app

---

## Features

- **Multi-source search** — parallel retrieval across 4 platforms with RRF fusion ranking
- **AI summaries** — executive summary, top recommendation, and related queries for every search
- **License safety** — every result classified as commercial-ready / research-only / needs review
- **Compare mode** — side-by-side matrix of up to N datasets
- **AI consultant chat** — ask "how do I load this?", "can I use it commercially?", "what GPU do I need?" grounded strictly in real metadata
- **Zero-hallucination fallback** — if no LLM key is configured, a deterministic engine still produces summaries from verified platform data
- **Bookmarks & export** — save results and export reports as JSON/Markdown/CSV

---

## Quick Start

```bash
git clone https://github.com/Elcapunnn/DataSet-SearchAgent.git
cd DataSet-SearchAgent
npm install
cp .env.example .env   # then add your key (see below)
npm run dev            # http://localhost:3000
```

The app **works without any API key** (deterministic mode). Add a key to unlock AI-generated summaries and the consultant chat.

---

## API Keys (all have free tiers)

Keys are **server-side only** — they are never exposed to the browser.

The app tries providers in this order:
**Mistral → NVIDIA NIM → OpenRouter → Groq → Gemini → deterministic fallback**
(any or all can be configured; it skips missing ones)

| Provider | Get key at | Free tier | Env vars |
|---|---|---|---|
| **Mistral** ⭐ recommended | [console.mistral.ai/api-keys](https://console.mistral.ai/api-keys) | ~1B tokens/month, no card (SMS verification) | `MISTRAL_API_KEY`, `MISTRAL_MODEL` |
| **NVIDIA NIM** | [build.nvidia.com](https://build.nvidia.com) | ~40 req/min, no card | `NVIDIA_API_KEY`, `NVIDIA_MODEL` |
| **OpenRouter** | [openrouter.ai/keys](https://openrouter.ai/keys) | 50 req/day free models | `OPENROUTER_API_KEY`, `OPENROUTER_MODEL` |
| **Groq** | [console.groq.com/keys](https://console.groq.com/keys) | 30 req/min (blocked on some networks/datacenter IPs) | `GROQ_API_KEY`, `GROQ_MODEL` |
| **Gemini** | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | ~1,500 req/day | `GEMINI_API_KEY` |

### Add keys locally

Create a `.env` file in the project root (copy from `.env.example`):

```env
MISTRAL_API_KEY=your-key-here
MISTRAL_MODEL=mistral-small-latest
```

### Add keys on Vercel

**Project → Settings → Environment Variables** → add the same variables → **Redeploy**.
Never commit `.env` — it is git-ignored.

---

## Deployment

Already configured for Vercel (`api/` serverless functions + `vercel.json`):

```bash
# push to GitHub and import at vercel.com/new — that's it
```

Build: `npm run build` (Vite frontend + bundled Express server)

---

## Tech Stack

React 19 · Vite · Tailwind CSS 4 · Express · TypeScript · Lucide icons

**Architecture:** `src/` React SPA · `server.ts` Express API (search, compare, ai-chat) · `server/` connectors + ranking engine · `api/` Vercel serverless entry

---

## License

MIT — developed by [Elcapunnn](https://github.com/Elcapunnn)
