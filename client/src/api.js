async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || res.statusText);
    err.status = res.status;
    throw err;
  }
  return data;
}

const enc = encodeURIComponent;

export const api = {
  list: () => request('/api/articles'),
  recent: () => request('/api/recent'),
  random: () => request('/api/random'),
  search: (q) => request(`/api/search?q=${enc(q)}`),
  get: (slug) => request(`/api/articles/${enc(slug)}`),
  history: (slug) => request(`/api/articles/${enc(slug)}/history`),
  save: (slug, content, summary) =>
    request(`/api/articles/${enc(slug)}`, {
      method: 'PUT',
      body: JSON.stringify({ content, summary }),
    }),
  remove: (slug) => request(`/api/articles/${enc(slug)}`, { method: 'DELETE' }),
};

export const slugify = (title) => title.trim().replace(/\s+/g, '_');
export const titleFromSlug = (slug) => slug.replace(/_/g, ' ');
