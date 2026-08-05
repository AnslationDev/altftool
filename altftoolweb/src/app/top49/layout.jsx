import './top49.css';
import SubNav from './components/SubNav.jsx';
import { totals } from './lib/data.js';

export const metadata = {
  title: {
    default: 'Top 49 — the best of everything, ranked',
    template: '%s | Top 49',
  },
  description: `${totals.categories} categories, ${totals.lists} curated lists and ${totals.items.toLocaleString('en-US')} ranked entries. Every pick scored out of 100 against published criteria.`,
  robots: { index: false, follow: true },
};

/**
 * Route shell for /top49.
 *
 * The global AltFTool header and footer still render around this — the sub-nav
 * below is the second row of the two-row navigation pattern, not a replacement
 * for site chrome.
 */
export default function Top49Layout({ children }) {
  return (
    <div className="t49">
      <SubNav />
      <div className="border-y border-warning/40 bg-warning-soft px-4 py-3 text-sm text-warning-text" role="note">
        <p className="mx-auto max-w-7xl">
          Preview data: all rankings, scores, votes, refresh labels, methodology, testing and editorial-process statements in Top 49 are illustrative demo content, not live measurements or documented reviews.
        </p>
      </div>
      {children}
    </div>
  );
}
