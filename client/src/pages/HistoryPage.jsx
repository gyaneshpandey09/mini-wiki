import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, titleFromSlug } from '../api.js';
import Tabs from './Tabs.jsx';

export default function HistoryPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.history(slug).then(setData).catch(setError);
  }, [slug]);

  if (error) return <p className="error">No history: {error.message}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <>
      <Tabs slug={slug} />
      <h1 className="title">{titleFromSlug(slug)}: Revision history</h1>
      <ul className="history">
        {data.revisions.map((r, i) => (
          <li key={i}>
            <button className="linklike" onClick={() => setOpen(open === i ? null : i)}>
              {new Date(r.timestamp).toLocaleString()}
            </button>{' '}
            <span className="muted">({r.content.length} bytes)</span> — <em>{r.summary}</em>
            {i === 0 && <span className="badge">current</span>}
            {open === i && <pre className="revision">{r.content}</pre>}
          </li>
        ))}
      </ul>
    </>
  );
}
