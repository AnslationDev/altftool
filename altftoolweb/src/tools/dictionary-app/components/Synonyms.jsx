export default function Synonyms({ data, setWord, onSearch }) {
  return (
    <div className="p-4 sm:p-5 bg-(--background) text-(--foreground) rounded-lg shadow border border-(--border)">
      <h3 className="font-semibold text-base sm:text-lg mb-3">Synonyms</h3>

      <div className="flex flex-wrap gap-2">
        {data.slice(0, 10).map((item, idx) => (
          <span
            key={idx}
            className="px-2 sm:px-3 py-1 bg-(--primary) rounded cursor-pointer text-white text-xs sm:text-sm hover:opacity-80 transition"
            onClick={() => {
              setWord(item.word);
              onSearch(item.word);
            }}
          >
            {item.word}
          </span>
        ))}
      </div>
    </div>
  );
}