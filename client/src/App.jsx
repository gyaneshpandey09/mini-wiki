import { Routes, Route, Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { api } from './api.js';
import ArticlePage from './pages/ArticlePage.jsx';
import EditPage from './pages/EditPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import AllPages from './pages/AllPages.jsx';
import RecentChanges from './pages/RecentChanges.jsx';
import NewPage from './pages/NewPage.jsx';

export default function App() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const onSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const goRandom = async () => {
    const { slug } = await api.random();
    navigate(`/wiki/${encodeURIComponent(slug)}`);
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <Link to="/" className="logo">
          <div className="logo-globe">W</div>
          <div className="logo-text">MiniWiki</div>
          <div className="logo-tag">The Free Encyclopedia</div>
        </Link>
        <nav>
          <NavLink to="/wiki/Main_Page">Main page</NavLink>
          <NavLink to="/special/all">All pages</NavLink>
          <NavLink to="/special/recent">Recent changes</NavLink>
          <button className="linklike" onClick={goRandom}>Random article</button>
          <NavLink to="/special/new">Create a page</NavLink>
        </nav>
      </aside>

      <div className="main">
        <header className="topbar">
          <form onSubmit={onSearch} className="search">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search MiniWiki"
              aria-label="Search"
            />
            <button type="submit">Search</button>
          </form>
        </header>

        <main className="content">
          <Routes>
            <Route path="/" element={<ArticlePage slug="Main_Page" />} />
            <Route path="/wiki/:slug" element={<ArticlePage />} />
            <Route path="/wiki/:slug/edit" element={<EditPage />} />
            <Route path="/wiki/:slug/history" element={<HistoryPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/special/all" element={<AllPages />} />
            <Route path="/special/recent" element={<RecentChanges />} />
            <Route path="/special/new" element={<NewPage />} />
            <Route path="*" element={<p>Page not found.</p>} />
          </Routes>
        </main>

        <footer className="footer">
          Content is available under your own terms. Built with React &amp; Node.js.
        </footer>
      </div>
    </div>
  );
}
