import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

export default function AllPages() {
  const [list, setList] = useState(null);
  useEffect(() => { api.list().then(setList); }, []);
  if (!list) return <p>Loading…</p>;
  return (
    <>
      <h1 className="title">All pages</h1>
      <ul className="columns">
        {list.map((a) => (
          <li key={a.slug}><Link to={`/wiki/${encodeURIComponent(a.slug)}`}>{a.title}</Link></li>
        ))}
      </ul>
    </>
  );
}
