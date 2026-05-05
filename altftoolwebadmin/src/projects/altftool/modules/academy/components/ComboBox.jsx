/* ── ComboBox: typeable + dropdown ── */
function ComboBox({ value, onChange, options = [], placeholder, disabled, error, hint }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || "");
  const wrapRef = useRef(null);

  useEffect(() => { setQuery(value || ""); }, [value]);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  const handleInput = (e) => {
    setQuery(e.target.value);
    onChange(e.target.value);
    setOpen(true);
  };

  const handleSelect = (opt) => {
    setQuery(opt);
    onChange(opt);
    setOpen(false);
  };

  return (
    <div className="relative" ref={wrapRef}>
      <div className="relative">
        <input
          value={query}
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className={`w-full text-sm px-3 py-2.5 pr-8 rounded-xl border bg-white placeholder:text-gray-400
            focus:outline-none focus:ring-2 transition
            ${error ? "border-red-300 focus:ring-red-400/30 focus:border-red-400"
                    : "border-gray-200 focus:ring-blue-400/30 focus:border-blue-400"}
            ${disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "cursor-text"}`}
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => !disabled && setOpen((p) => !p)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-40 transition"
        >
          <svg viewBox="0 0 24 24" className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {open && !disabled && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-52 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-3 py-2.5 text-xs text-gray-400 italic">
              {query ? `Press Enter to add "${query}"` : "No options"}
            </div>
          ) : (
            <>
              {options.length > 0 && (
                <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Suggestions
                </div>
              )}
              {filtered.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); handleSelect(opt); }}
                  className={`w-full text-left px-3 py-2 text-sm transition flex items-center gap-2
                    hover:bg-blue-50 hover:text-blue-700
                    ${value === opt ? "text-blue-600 font-semibold bg-blue-50/60" : "text-gray-700"}`}
                >
                  {value === opt && (
                    <svg viewBox="0 0 24 24" className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                  <span>{opt}</span>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}