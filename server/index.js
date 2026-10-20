import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, 'data', 'articles.json');
const CLIENT_DIST = path.join(__dirname, '..', 'client', 'dist');
const PORT = process.env.PORT || 3001;

// --- Storage -------------------------------------------------------------

const SEED = [
  {
    title: 'Main Page',
    content:
      '# Welcome to MiniWiki\n\nMiniWiki is a small encyclopedia that **anyone can edit**.\n\n' +
      'Articles are written in Markdown. Link to other articles with double brackets, like [[React]] or [[Node.js]].\n\n' +
      'Linking to a page that does not exist yet, such as [[Quantum Computing]], lets you create it.',
  },
  {
    title: 'React',
    content:
      '**React** is a JavaScript library for building user interfaces, maintained by Meta.\n\n' +
      '## Overview\n\nReact lets developers compose UIs from small, reusable *components*. ' +
      'It is often paired with a backend such as [[Node.js]].\n\n## See also\n\n- [[Node.js]]\n- [[Main Page]]',
  },
  {
    title: 'Node.js',
    content:
      '**Node.js** is a JavaScript runtime built on the V8 engine that runs JavaScript outside the browser.\n\n' +
      '## Uses\n\n- Web servers (e.g. Express)\n- Command-line tools\n- Build tooling for front-ends like [[React]]',
  },
];

export const slugify = (title) => title.trim().replace(/\s+/g, '_');

function load() {
  if (!fs.existsSync(DATA_FILE)) {
    const now = new Date().toISOString();
    const db = {};
    for (const a of SEED) {
      db[slugify(a.title)] = {
        title: a.title,
        content: a.content,
        updatedAt: now,
        revisions: [{ content: a.content, summary: 'Initial version', timestamp: now }],
      };
    }
    save(db);
    return db;
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function save(db) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DATA_FILE);
}

const db = load();
const summaryOf = (slug, a) => ({ slug, title: a.title, updatedAt: a.updatedAt });

// --- API -----------------------------------------------------------------

const app = express();
app.use(express.json({ limit: '1mb' }));

app.get('/api/articles', (req, res) => {
  const list = Object.entries(db)
    .map(([slug, a]) => summaryOf(slug, a))
    .sort((a, b) => a.title.localeCompare(b.title));
  res.json(list);
});

app.get('/api/recent', (req, res) => {
  const list = Object.entries(db)
    .map(([slug, a]) => summaryOf(slug, a))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 10);
  res.json(list);
});

app.get('/api/random', (req, res) => {
  const slugs = Object.keys(db);
  if (!slugs.length) return res.status(404).json({ error: 'No articles' });
  res.json({ slug: slugs[Math.floor(Math.random() * slugs.length)] });
});

app.get('/api/search', (req, res) => {
  const q = String(req.query.q || '').trim().toLowerCase();
  if (!q) return res.json([]);
  const results = [];
  for (const [slug, a] of Object.entries(db)) {
    const inTitle = a.title.toLowerCase().includes(q);
    const idx = a.content.toLowerCase().indexOf(q);
    if (!inTitle && idx === -1) continue;
    const start = Math.max(0, idx - 60);
    const snippet = idx === -1 ? a.content.slice(0, 120) : a.content.slice(start, idx + q.length + 60);
    results.push({ ...summaryOf(slug, a), snippet, score: inTitle ? 2 : 1 });
  }
  results.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  res.json(results);
});

app.get('/api/articles/:slug', (req, res) => {
  const a = db[req.params.slug];
  if (!a) return res.status(404).json({ error: 'Not found' });
  res.json({ slug: req.params.slug, title: a.title, content: a.content, updatedAt: a.updatedAt });
});

app.get('/api/articles/:slug/history', (req, res) => {
  const a = db[req.params.slug];
  if (!a) return res.status(404).json({ error: 'Not found' });
  res.json({ title: a.title, revisions: [...a.revisions].reverse() });
});

app.put('/api/articles/:slug', (req, res) => {
  const { content, summary } = req.body || {};
  if (typeof content !== 'string' || !content.trim()) {
    return res.status(400).json({ error: 'Content is required' });
  }
  const slug = slugify(req.params.slug);
  if (!slug) return res.status(400).json({ error: 'Invalid title' });
  const now = new Date().toISOString();
  const existing = db[slug];
  const article = existing || { title: slug.replace(/_/g, ' '), revisions: [] };
  article.content = content;
  article.updatedAt = now;
  article.revisions.push({
    content,
    summary: String(summary || '').slice(0, 200) || (existing ? 'Edited' : 'Created page'),
    timestamp: now,
  });
  db[slug] = article;
  save(db);
  res.status(existing ? 200 : 201).json({ slug, title: article.title });
});

app.delete('/api/articles/:slug', (req, res) => {
  if (!db[req.params.slug]) return res.status(404).json({ error: 'Not found' });
  delete db[req.params.slug];
  save(db);
  res.status(204).end();
});

// Serve the built React app in production
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(CLIENT_DIST, 'index.html')));
}

app.listen(PORT, () => console.log(`MiniWiki API running on http://localhost:${PORT}`));
