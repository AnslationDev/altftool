import Link from 'next/link';
import T49Image from './T49Image.jsx';
import { RankBadge, Score, TrendBadge, Meter, TagRow } from './primitives.jsx';
import { sizes } from '../lib/images.js';
import { compactNumber, formatValue, padRank } from '../lib/format.js';

/* ── Category card ───────────────────────────────────────────────────────── */

export function CategoryCard({ category, priority = false }) {
  return (
    <Link href={`/top49/${category.slug}`} className="t49-card">
      <T49Image
        id={category.image}
        name={category.name}
        alt=""
        ratio="16-10"
        sizes={sizes.card4}
        width={640}
        priority={priority}
      >
        <span className="t49-media__scrim" aria-hidden="true" />
        <span className="t49-media__corner t49-media__corner--tr">
          {category.isTrending ? <span className="t49-badge t49-badge--primary">Trending</span> : null}
        </span>
        <div className="t49-media__overlay">
          <h3 className="t49-tagline" style={{ color: 'var(--on-media)' }}>
            {category.name}
          </h3>
          <p
            className="t49-fine"
            style={{ color: 'color-mix(in srgb, var(--on-media) 82%, transparent)', marginTop: 4 }}
          >
            {category.listCount} {category.listCount === 1 ? 'list' : 'lists'} ·{' '}
            {category.itemCount} ranked
          </p>
        </div>
      </T49Image>
      <div className="t49-card__body t49-card__body--tight">
        <p className="t49-caption t49-muted t49-clamp-2">{category.tagline}</p>
      </div>
    </Link>
  );
}

/** Dense variant used in the full 49-category grid. */
export function CategoryTile({ category }) {
  return (
    <Link
      href={`/top49/${category.slug}`}
      className="t49-card"
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 }}
    >
      <T49Image
        id={category.image}
        name={category.name}
        alt=""
        ratio="1-1"
        sizes={sizes.thumb}
        width={160}
        rounded
        className="t49-media--rounded"
      />
      <span style={{ minWidth: 0, flex: 1 }}>
        <span className="t49-body-strong t49-clamp-1" style={{ display: 'block' }}>
          {category.name}
        </span>
        <span className="t49-fine t49-faint" style={{ display: 'block', marginTop: 2 }}>
          {category.listCount} {category.listCount === 1 ? 'list' : 'lists'}
        </span>
      </span>
    </Link>
  );
}

/* ── List card ───────────────────────────────────────────────────────────── */

export function ListCard({ list, categoryName, priority = false, variant = 'default' }) {
  const href = `/top49/${list.categorySlug}/${list.slug}`;
  return (
    <Link
      href={href}
      className="t49-card"
      style={variant === 'rail' ? { width: 320 } : undefined}
    >
      <T49Image
        id={list.image}
        name={list.title}
        alt=""
        ratio="16-9"
        sizes={variant === 'rail' ? sizes.rail : sizes.card3}
        width={720}
        priority={priority}
      >
        <span className="t49-media__scrim t49-media__scrim--even" aria-hidden="true" />
        <span className="t49-media__corner t49-media__corner--tl">
          <span className="t49-badge t49-badge--glass">{list.itemCount} ranked</span>
        </span>
        {list.isTrending ? (
          <span className="t49-media__corner t49-media__corner--tr">
            <span className="t49-badge t49-badge--primary">Trending</span>
          </span>
        ) : null}
      </T49Image>
      <div className="t49-card__body">
        {categoryName ? <p className="t49-eyebrow">{categoryName}</p> : null}
        <h3 className="t49-display-sm t49-clamp-2">{list.title}</h3>
        <p className="t49-caption t49-muted t49-clamp-2">{list.tagline}</p>
      </div>
      <div className="t49-card__foot">
        <span className="t49-fine t49-faint t49-num">
          {compactNumber(list.totalVotes)} votes
        </span>
        <span className="t49-fine t49-faint" style={{ textTransform: 'capitalize' }}>
          {list.updateFrequency}
        </span>
      </div>
    </Link>
  );
}

/* ── Item card ───────────────────────────────────────────────────────────── */

export function ItemCard({ item, ranking, priority = false, showScore = true }) {
  return (
    <Link href={`/top49/item/${item.slug}`} className="t49-card">
      <T49Image
        id={item.image}
        name={item.name}
        alt={item.imageAlt || ''}
        ratio="4-3"
        sizes={sizes.card4}
        width={640}
        priority={priority}
      >
        <span className="t49-media__corner t49-media__corner--tl">
          <RankBadge rank={ranking.rank} glass />
        </span>
        {ranking.isEditorsPick ? (
          <span className="t49-media__corner t49-media__corner--tr">
            <span className="t49-badge t49-badge--primary">Editor’s pick</span>
          </span>
        ) : null}
      </T49Image>
      <div className="t49-card__body t49-card__body--tight">
        <h3 className="t49-body-strong t49-clamp-1">{item.name}</h3>
        {item.subtitle ? (
          <p className="t49-fine t49-faint t49-clamp-1">{item.subtitle}</p>
        ) : null}
        <p className="t49-caption t49-muted t49-clamp-2" style={{ marginTop: 2 }}>
          {item.summary}
        </p>
      </div>
      {showScore ? (
        <div className="t49-card__foot">
          <Score value={ranking.score} />
          <TrendBadge rank={ranking.rank} previousRank={ranking.previousRank} />
        </div>
      ) : null}
    </Link>
  );
}

/* ── Podium ──────────────────────────────────────────────────────────────── */

/**
 * Podium card — used for the top three of a list.
 *
 * All three are structurally identical so they always render at the same size;
 * first place is distinguished by the primary rank role and accent rule
 * rather than by a different footprint. The title sits in the card body rather
 * than over the photograph, so a long name can never clip against the image.
 */
export function PodiumCard({ item, ranking, featured = false }) {
  return (
    <Link
      href={`/top49/item/${item.slug}`}
      className={`t49-card t49-podium__card${featured ? ' is-first' : ''}`}
    >
      <T49Image
        id={item.image}
        name={item.name}
        alt={item.imageAlt || ''}
        ratio="4-3"
        sizes={sizes.card3}
        width={720}
        priority={featured}
      >
        <span className="t49-media__corner t49-media__corner--tl">
          <RankBadge rank={ranking.rank} />
        </span>
        {ranking.isEditorsPick ? (
          <span className="t49-media__corner t49-media__corner--tr">
            <span className="t49-badge t49-badge--glass">Editor’s pick</span>
          </span>
        ) : null}
      </T49Image>

      <div className="t49-card__body">
        <h3 className="t49-tagline t49-clamp-2">{item.name}</h3>
        {item.subtitle ? (
          <p className="t49-fine t49-faint t49-clamp-1">{item.subtitle}</p>
        ) : null}
        <p className="t49-caption t49-muted t49-clamp-3 t49-podium__summary">{item.summary}</p>

        <div className="t49-podium__score">
          <Score value={ranking.score} />
          <TrendBadge rank={ranking.rank} previousRank={ranking.previousRank} />
        </div>
        <Meter value={ranking.score} label={`${item.name} scores ${ranking.score} out of 100`} />
      </div>
    </Link>
  );
}

/* ── Ranked row (list view) ──────────────────────────────────────────────── */

/**
 * A single row of a ranked list.
 *
 * Rows live inside one bordered container separated by hairlines rather than
 * being individually boxed — at forty-nine entries, per-row borders turn the
 * page into noise. Four rails: rank, thumbnail, editorial, score. The whole row
 * is one link target, with the editorial note breaking out beneath it.
 */
export function RankRow({ item, ranking, columns = [], showNote = true }) {
  const specs = columns
    .filter((c) => c.key !== 'score')
    .map((col) => ({ col, attr: item.attributes.find((a) => a.key === col.key) }))
    .filter(({ attr }) => attr)
    .slice(0, 3);

  const medal = ranking.rank <= 3 ? ` is-rank-${ranking.rank}` : '';

  return (
    <li className="t49-rankrow">
      <Link href={`/top49/item/${item.slug}`} className="t49-rankrow__hit">
        <span className="t49-sr">
          Rank {ranking.rank}. {item.name}. Score {ranking.score} out of 100.
        </span>
      </Link>

      <div className="t49-rankrow__rank">
        <span className={`t49-rankrow__num${medal}`} aria-hidden="true">
          {padRank(ranking.rank)}
        </span>
        <TrendBadge rank={ranking.rank} previousRank={ranking.previousRank} />
      </div>

      <div className="t49-rankrow__media">
        <T49Image
          id={item.image}
          name={item.name}
          alt=""
          ratio="4-3"
          sizes={sizes.poster}
          width={360}
          rounded
        />
      </div>

      <div className="t49-rankrow__main">
        <div>
          <h3 className="t49-rankrow__title t49-clamp-2">{item.name}</h3>
          {item.subtitle ? (
            <p className="t49-fine t49-faint t49-clamp-1" style={{ marginTop: 3 }}>
              {item.subtitle}
            </p>
          ) : null}
        </div>

        <p className="t49-caption t49-muted t49-clamp-2">{item.summary}</p>

        {specs.length ? (
          <dl className="t49-rankrow__specs">
            {specs.map(({ col, attr }) => (
              <div key={col.key} className="t49-rankrow__spec">
                <dt>{col.label}</dt>
                <dd className="t49-num">{formatValue(attr)}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {item.tags.length || ranking.isEditorsPick ? (
          <div className="t49-rankrow__tags">
            <TagRow tags={item.tags} />
            {ranking.isEditorsPick ? (
              <span className="t49-badge t49-badge--soft">Editor’s pick</span>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="t49-rankrow__score">
        <Score value={ranking.score} />
        <Meter value={ranking.score} label={`${item.name} scores ${ranking.score} out of 100`} />
      </div>

      {showNote && ranking.editorialNote ? (
        <p className="t49-rankrow__note">{ranking.editorialNote}</p>
      ) : null}
    </li>
  );
}
