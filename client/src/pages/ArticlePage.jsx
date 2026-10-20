import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api, titleFromSlug } from '../api.js';
import { renderWiki, extractHeadings } from '../markdown.js';
import Tabs from './Tabs.jsx';

export default function ArticlePage({ slug: fixedSlug }) {
  const params = useParams();
  const slug = fixedSlug || params.slug;
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [slugs, setSlugs] = useState(new Set());
  const [error, setError] = useState(null);

  useEffect(() => {
    setArticle(null);
    setError(null);
    Promise.all([api.get(slug), api.list()])
      .then(([a, list]) => {
        setArticle(a);
        setSlugs(new Set(list.map((x) => x.slug)));
      })
      .catch((e) => setError(e));
  }, [slug]);

  const html = useMemo(() => (article ? renderWiki(article.content, slugs) : ''), [article, slugs]);
  const headings = useMemo(() => (article ? extractHeadings(article.content) : []), [article]);

  // Intercept clicks on internal links so they use client-side routing
  const onClick = (e) => {
    const a = e.target.closest('a');
    if (a && a.getAttribute('href')?.startsWith('/')) {
      e.preventDefault();
      navigate(a.getAttribute('href'));
    }
  };

  if (error?.status === 404) {
    return (
      <>
        <Tabs slug={slug} />
        <h1 className="title">{titleFromSlug(slug)}</h1>
        <div className="notice">
          MiniWiki does not have an article with this exact name.{' '}
          <Link to={`/wiki/${encodeURIComponent(slug)}/edit`}>Start the {titleFromSlug(slug)} article</Link>.
        </div>
      </>
    );
  }
  if (error) return <p className="error">Error: {error.message}</p>;
  if (!article) return <p>Loading…</p>;

  return (
    <>
      <Tabs slug={slug} />
      <h1 className="title">{article.title}</h1>
      <div className="subtitle">From MiniWiki, the free encyclopedia</div>
      {headings.length >= 2 && (
        <div className="toc">
          <div className="toc-title">Contents</div>
          <ol>
            {headings.map((h, i) => (
              <li key={i} className={`toc-l${h.level}`}>{h.text}</li>
            ))}
          </ol>
        </div>
      )}
      <article className="article-body" onClick={onClick} dangerouslySetInnerHTML={{ __html: html }} />
      <div className="lastmod">
        This page was last edited on {new Date(article.updatedAt).toLocaleString()}.
      </div>
    </>
  );
}
