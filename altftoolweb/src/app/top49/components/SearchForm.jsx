'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

/**
 * Search entry point. Used on the landing hero and at the top of /top49/search.
 * Submitting navigates to the search route so results are server-rendered and
 * the query stays shareable in the URL.
 */
export default function SearchForm({
  defaultValue = '',
  placeholder = 'Search films, phones, destinations, athletes…',
  autoFocus = false,
  cta = 'Search',
  id = 't49-search',
}) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  function onSubmit(event) {
    event.preventDefault();
    const q = value.trim();
    router.push(q ? `/top49/search?q=${encodeURIComponent(q)}` : '/top49/search');
  }

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      style={{ display: 'flex', flexWrap: 'wrap', gap: 12, width: '100%', maxWidth: 620 }}
    >
      <label htmlFor={id} className="t49-sr">
        Search Top 49
      </label>
      <div className="t49-field" style={{ flex: '1 1 260px' }}>
        <span className="t49-field__icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.2-3.2" strokeLinecap="round" />
          </svg>
        </span>
        <input
          id={id}
          name="q"
          type="search"
          className="t49-input"
          placeholder={placeholder}
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
        />
      </div>
      <button type="submit" className="t49-btn t49-btn--primary">
        {cta}
      </button>
    </form>
  );
}
