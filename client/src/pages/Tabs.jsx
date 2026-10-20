import { NavLink } from 'react-router-dom';

export default function Tabs({ slug }) {
  const base = `/wiki/${encodeURIComponent(slug)}`;
  return (
    <div className="tabs">
      <div className="tabs-left">
        <NavLink end to={base}>Article</NavLink>
      </div>
      <div className="tabs-right">
        <NavLink end to={base}>Read</NavLink>
        <NavLink to={`${base}/edit`}>Edit</NavLink>
        <NavLink to={`${base}/history`}>View history</NavLink>
      </div>
    </div>
  );
}
