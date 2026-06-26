import Link from 'next/link';

const ArticleCard = ({ id = 1, image, title, author, plays }) => {
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
        <div className="absolute inset-0 bg-black/45 flex items-center justify-center gap-2.5 opacity-0 transition-opacity duration-200 pointer-events-none group-hover:opacity-100">
          <span
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: '#1877f2' }}
          >
            f
          </span>
          <span
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: '#1da1f2' }}
          >
            t
          </span>
          <span
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: '#25d366' }}
          >
            w
          </span>
        </div>
      </div>
      <div className="px-4 py-5 text-center flex-1 flex flex-col justify-start">
        <h3 className="text-sm font-medium mb-2 leading-tight" style={{ color: 'var(--foreground)' }}>
          {title}
        </h3>
        <p className="text-xs font-normal" style={{ color: 'var(--muted-foreground)' }}>
          {author} <span className="mx-1">·</span> {plays}
        </p>
      </div>
    </Link>
  );
};

export default ArticleCard;
