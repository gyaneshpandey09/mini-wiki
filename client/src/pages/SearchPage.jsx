import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, slugify } from '../api.js';

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const [results, setResults] = useState(null);

  useEffect(() => {
    setResults(null);
    api.search(q).then(setResults);
  }, [q]);

  const exactSlug = slugify(q);
  const hasExact = results?.some((r) => r.slug === exactSlug);

  return (
    <>
      <h1 className="title">Search results</h1>
      {results && !hasExact && q && (
        <p>
          Create the page <Link className="wikilink new" to={`/wiki/${encodeURIComponent(exactSlug)}/edit`}>"{q}"</Link> on this wiki.
        </p>
      )}
      {!results ? (
        <p>Searching…</p>
      ) : results.length === 0 ? (
        <p>There were no results matching the query.</p>
      ) : (
        <ul className="results">
          {results.map((r) => (
            <li key={r.slug}>
              <Link to={`/wiki/${encodeURIComponent(r.slug)}`}>{r.title}</Link>
              <div className="snippet">…{r.snippet}…</div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
