'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '@altftool/ui';

const LINKS = [
  { href: '/top49/categories', label: 'Categories' },
  { href: '/top49/compare', label: 'Compare' },
  { href: '/top49/how-we-rank', label: 'How we rank' },
];

/**
 * Route-level sub-navigation. Sits below the global AltFTool header as the
 * second row of the two-row nav pattern: brand on the left, links and the
 * persistent primary action on the right.
 */
export default function SubNav() {
  const pathname = usePathname() || '';

  return (
    <nav className="t49-subnav" aria-label="Top 49">
      <div className="t49-wrap">
        <div className="t49-subnav__inner">
          <Link href="/top49" className="t49-subnav__brand">
            <span>Top<b>49</b></span>
            <span className="t49-subnav__by">by</span>
            <BrandLogo size="sm" decorative />
          </Link>

          <div className="t49-subnav__links">
            {LINKS.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="t49-subnav__link"
                  aria-current={active ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/top49/search"
              className="t49-btn t49-btn--primary t49-btn--sm"
              style={{ marginLeft: 8 }}
            >
              Search
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
