import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { slugify } from '../api.js';

export default function NewPage() {
  const [title, setTitle] = useState('');
  const navigate = useNavigate();
  const onSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) navigate(`/wiki/${encodeURIComponent(slugify(title))}/edit`);
  };
  return (
    <>
      <h1 className="title">Create a new page</h1>
      <form onSubmit={onSubmit} className="newpage">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Article title" autoFocus />
        <button type="submit" className="primary">Create</button>
      </form>
    </>
  );
}
