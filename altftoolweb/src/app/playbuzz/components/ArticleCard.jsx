import { useRef, useState } from 'react';
import Link from 'next/link';

const ArticleCard = ({ id = 1, image, title, author, plays }) => {
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef(null);
  const metadata = [author, plays].filter(Boolean);

  const getShareUrl = () => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/playbuzz/quiz-play?id=${id}`;
  };

  const handleFacebookShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = getShareUrl();
    if (!shareUrl) return;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer,width=650,height=500');
  };

  const handleTwitterShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = getShareUrl();
    if (!shareUrl) return;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer,width=650,height=500');
  };

  const handleCopyLink = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = getShareUrl();
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      window.prompt('Copy this quiz link:', shareUrl);
      return;
    }
    clearTimeout(copyTimer.current);
    setCopied(true);
    copyTimer.current = setTimeout(() => setCopied(false), 1600);
  };

  return (
    <Link
      href={`/playbuzz/quiz-play?id=${id}`}
      className="group flex flex-col bg-card border border-border rounded-lg overflow-hidden cursor-pointer h-full no-underline transition-all duration-300 hover:shadow-md hover:border-[var(--primary)] hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none"
    >
      <div className="relative w-full pt-[56.25%] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/45 flex items-center justify-center gap-2.5 opacity-0 transition-opacity duration-200 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto">
          <button
            type="button"
            onClick={handleFacebookShare}
            aria-label="Share on Facebook"
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white border-none cursor-pointer focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
            style={{ backgroundColor: '#1877f2' }}
          >
            f
          </button>
          <button
            type="button"
            onClick={handleTwitterShare}
            aria-label="Share on Twitter"
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white border-none cursor-pointer focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
            style={{ backgroundColor: '#1da1f2' }}
          >
            t
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={handleCopyLink}
              aria-label="Copy quiz link"
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white border-none cursor-pointer focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
              style={{ backgroundColor: '#25d366' }}
            >
              w
            </button>
            {copied && (
              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[var(--foreground)] px-2.5 py-1 text-[11px] font-medium text-[var(--card)] shadow-lg">
                Copied!
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="px-4 py-5 text-center flex-1 flex flex-col justify-start">
        <h3 className="text-sm font-medium mb-2 leading-tight" style={{ color: 'var(--foreground)' }}>
          {title}
        </h3>
        {metadata.length > 0 && (
          <p className="text-xs font-normal" style={{ color: 'var(--muted-foreground)' }}>
            {metadata.map((item, index) => (
              <span key={`${item}-${index}`}>
                {index > 0 && <span className="mx-1">·</span>}
                {item}
              </span>
            ))}
          </p>
        )}
      </div>
    </Link>
  );
};

export default ArticleCard;
