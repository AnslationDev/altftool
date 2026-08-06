// Animal Hub footer — the module's own chrome.
//
// A server component: the category columns are passed in from the layout,
// which resolves them through the service layer. Nothing is hardcoded here
// beyond the module's own standing links.

import Link from "next/link";
import { AhContainer } from "./AhLayout";

export function AnimalHubFooter({ categories = [], stats }) {
  return (
    <footer className="ah-footer">
      <AhContainer>
        <div className="ah-footer__top">
          <div className="ah-footer__brand">
            <span className="ah-footer__wordmark">
              Animal<span className="ah-header__wordmark-accent">Hub</span>
            </span>
            <p className="ah-footer__blurb">
              A researched encyclopedia of the living world — habitat, diet, behaviour,
              taxonomy and conservation status, one species at a time.
            </p>
            {stats ? (
              <p className="ah-footer__stat">
                {stats.animals} species · {stats.categories} groups
              </p>
            ) : null}
          </div>

          <nav className="ah-footer__nav" aria-label="Animal categories">
            <h2 className="ah-footer__heading">Browse</h2>
            <ul>
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link href={`/animalhub/${category.slug}`}>{category.name}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="ah-footer__nav" aria-label="About this project">
            <h2 className="ah-footer__heading">About</h2>
            <ul>
              <li>
                <Link href="/policypages/about">About AltFTool</Link>
              </li>
              <li>
                <Link href="/policypages/privacy">Privacy</Link>
              </li>
              <li>
                <Link href="/policypages/termsandconditions">Terms</Link>
              </li>
              <li>
                <Link href="/policypages/contact">Contact</Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="ah-footer__base">
          <p>Every profile cites its sources. Conservation status follows the IUCN Red List.</p>
          <Link href="/" className="ah-footer__product">
            An AltFTool product
          </Link>
        </div>
      </AhContainer>
    </footer>
  );
}
