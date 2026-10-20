import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, titleFromSlug } from '../api.js';
import { renderWiki } from '../markdown.js';
import Tabs from './Tabs.jsx';

export default function EditPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .get(slug)
      .then((a) => { setContent(a.content); setExists(true); })
      .catch(() => { setContent(''); setExists(false); })
      .finally(() => setLoading(false));
  }, [slug]);

  const onSave = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.save(slug, content, summary);
      navigate(`/wiki/${encodeURIComponent(res.slug)}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const onDelete = async () => {
    if (!confirm(`Delete "${titleFromSlug(slug)}"? This cannot be undone.`)) return;
    await api.remove(slug);
    navigate('/special/all');
  };

  if (loading) return <p>Loading…</p>;

  return (
    <>
      <Tabs slug={slug} />
      <h1 className="title">{exists ? 'Editing' : 'Creating'} {titleFromSlug(slug)}</h1>
      <p className="hint">
        Use Markdown for formatting. Link to other articles with <code>[[Article Title]]</code> or{' '}
        <code>[[Article Title|link text]]</code>.
      </p>
      <form onSubmit={onSave} className="editor">
        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={22} autoFocus />
        <input
          className="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Summary (briefly describe your changes)"
        />
        {error && <p className="error">{error}</p>}
        <div className="editor-actions">
          <button type="submit" className="primary">Publish changes</button>
          <button type="button" onClick={() => setPreview((p) => !p)}>
            {preview ? 'Hide preview' : 'Show preview'}
          </button>
          <button type="button" onClick={() => navigate(-1)}>Cancel</button>
          {exists && <button type="button" className="danger" onClick={onDelete}>Delete page</button>}
        </div>
      </form>
      {preview && (
        <div className="preview">
          <div className="preview-label">Preview</div>
          <div className="article-body" dangerouslySetInnerHTML={{ __html: renderWiki(content) }} />
        </div>
      )}
    </>
  );
}
