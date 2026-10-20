import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

export default function RecentChanges() {
  const [list, setList] = useState(null);
  useEffect(() => { api.recent().then(setList); }, []);
  if (!list) return <p>Loading…</p>;
  return (
    <>
      <h1 className="title">Recent changes</h1>
      <ul className="history">
        {list.map((a) => (
          <li key={a.slug}>
            <span className="muted">{new Date(a.updatedAt).toLocaleString()}</span> —{' '}
            <Link to={`/wiki/${encodeURIComponent(a.slug)}`}>{a.title}</Link>{' '}
            (<Link to={`/wiki/${encodeURIComponent(a.slug)}/history`}>hist</Link>)
          </li>
        ))}
      </ul>
    </>
  );
}
