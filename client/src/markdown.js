import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { slugify } from './api.js';

// Converts [[Page Title]] or [[Page Title|label]] into wiki links,
// marking links to missing pages in red like Wikipedia does.
export function renderWiki(content, existingSlugs = new Set()) {
  const withLinks = content.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, target, label) => {
    const slug = slugify(target);
    const cls = existingSlugs.has(slug) ? 'wikilink' : 'wikilink new';
    return `<a class="${cls}" href="/wiki/${encodeURIComponent(slug)}">${label || target}</a>`;
  });
  return DOMPurify.sanitize(marked.parse(withLinks));
}

// Build a table of contents from h2/h3 headings
export function extractHeadings(content) {
  return [...content.matchAll(/^(#{2,3})\s+(.+)$/gm)].map(([, hashes, text]) => ({
    level: hashes.length,
    text: text.trim(),
  }));
}
