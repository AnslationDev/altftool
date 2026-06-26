const categories = [
  'NEW', 'TRIVIA', 'PERSONALITY', 'LOVE', 'LIFESTYLE',
  'ENTERTAINMENT', 'SMART', 'ANIMALS', 'SPORTS', 'MUSIC', 'MOVIES',
];

const NavMenu = ({ activeCategory, onCategorySelect }) => {
  return (
    <nav className="w-full bg-background border-b border-border">
      <div className="max-w-[1760px] mx-auto px-6 py-8 max-md:px-4 max-md:py-6">
        <ul className="flex justify-center items-center gap-8 overflow-x-auto no-scrollbar">
          {categories.map((category) => (
            <li key={category} className="whitespace-nowrap">
              <button
                className={`bg-transparent border-none cursor-pointer font-primary text-xs font-extrabold tracking-wide uppercase pb-2.5 transition-colors focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none rounded-sm ${
                  activeCategory === category
                    ? 'text-foreground border-b-2'
                    : 'text-muted-foreground border-b-2 border-transparent'
                }`}
                style={{
                  borderBottomColor:
                    activeCategory === category ? 'var(--primary)' : 'transparent',
                }}
                onClick={() => onCategorySelect(category)}
              >
                {category}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default NavMenu;
