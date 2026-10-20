# MiniWiki

A small Wikipedia-style wiki built with React (Vite) and Node.js (Express).

## Run

```bash
npm run install:all   # install server + client deps

# Development (two terminals)
npm run server        # API on http://localhost:3001
npm run client        # UI on http://localhost:5173 (proxies /api)

# Production (single server)
npm start             # builds the client, serves everything on http://localhost:3001
```

Articles are stored in `server/data/articles.json`, which is created with sample pages on first run.

## Features
- Markdown articles with `[[Wiki Links]]` (links to missing pages show in red)
- Create, edit (with live preview), delete
- Revision history, recent changes, all pages, random article
- Full-text search
