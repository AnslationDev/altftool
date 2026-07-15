import { Heart, Sparkles } from "lucide-react";

export default function NameInput({ name1, setName1, name2, setName2, onAnalyze, errors }) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="flex items-center gap-2 mb-5">
        <Sparkles className="h-5 w-5 text-[var(--primary)]" />
        <h3 className="text-lg font-semibold text-[var(--foreground)]">Enter Names</h3>
      </div>

      <form onSubmit={onAnalyze} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name1" className="text-sm font-medium text-[var(--foreground)] block mb-1.5">
              First Name
            </label>
            <input
              id="name1"
              type="text"
              value={name1}
              onChange={(e) => setName1(e.target.value)}
              placeholder="Enter first name"
              className="w-full border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition"
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="name2" className="text-sm font-medium text-[var(--foreground)] block mb-1.5">
              Second Name
            </label>
            <input
              id="name2"
              type="text"
              value={name2}
              onChange={(e) => setName2(e.target.value)}
              placeholder="Enter second name"
              className="w-full border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition"
              autoComplete="off"
            />
          </div>
        </div>

        {errors.length > 0 && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm space-y-1">
            {errors.map((err, i) => (
              <div key={i}>{err}</div>
            ))}
          </div>
        )}

        <button
          type="submit"
          className="w-full sm:w-auto bg-[var(--primary)] text-white px-8 py-2.5 rounded-lg cursor-pointer font-semibold hover:opacity-90 transition inline-flex items-center justify-center gap-2"
        >
          <Heart className="h-4 w-4" />
          Check Compatibility
        </button>
      </form>
    </div>
  );
}
