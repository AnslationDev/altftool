"use client";

// Inline SVG components for the "How It Works" Section
const icons = {
  Input: (props) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-link"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07L14 7" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07L10 17" />
    </svg>
  ),

  Process: (props) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-cpu"
    >
      <rect width="16" height="16" x="4" y="4" rx="2" />
      <path d="M9 9h6v6H9z" />
      <path d="M15 2v2" />
      <path d="M15 20v2" />
      <path d="M2 15h2" />
      <path d="M20 15h2" />
      <path d="M2 9h2" />
      <path d="M20 9h2" />
      <path d="M9 2v2" />
      <path d="M9 20v2" />
    </svg>
  ),

  Output: (props) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-clipboard-list"
    >
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4" />
      <path d="M12 15h4" />
      <path d="M8 11h.01" />
      <path d="M8 15h.01" />
    </svg>
  ),
};

export default function ProcessBreakdown() {
  return (
    <section className="mt-15">
      <h3
        className="text-4xl font-extrabold mb-10 text-(--primary)"
        id="process"
      >
        Process Breakdown
      </h3>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        {/* --- STEP 1 --- */}
        <div
          className={`
            p-6 rounded-2xl shadow-xl transition-all duration-500 
            transform hover:scale-[1.03]
            bg-(--card) border border-(--border)
          `}
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-(--primary) text-(--primary-foreground) mb-4 shadow-lg">
            <icons.Input className="w-6 h-6" />
          </div>

          <p className="text-lg font-bold text-(--card-foreground) mb-2">
            1. Input URL
          </p>

          <p className="text-sm text-(--muted-foreground)">
            Paste any full and valid web address (URL) into the input field
            above. Our system is ready to read the meta information.
          </p>
        </div>

        {/* --- STEP 2 --- */}
        <div
          className="
            p-6 rounded-2xl shadow-xl transition-all duration-500 
            transform hover:scale-[1.03]
            bg-(--card) border border-(--border)
          "
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-pink-500 text-white mb-4 shadow-lg">
            <icons.Process className="w-6 h-6" />
          </div>

          <p className="text-lg font-bold text-(--card-foreground) mb-2">
            2. Fetch Metadata
          </p>

          <p className="text-sm text-(--muted-foreground)">
            Click the &quot;Generate&quot; button. Our engine swiftly connects
            to the site to extract essential Open Graph (OG) tags and metadata.
          </p>
        </div>

        {/* --- STEP 3 --- */}
        <div
          className="
            p-6 rounded-2xl shadow-xl transition-all duration-500 
            transform hover:scale-[1.03]
            bg-(--card) border border-(--border)
          "
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-500 text-white mb-4 shadow-lg">
            <icons.Output className="w-6 h-6" />
          </div>

          <p className="text-lg font-bold text-(--card-foreground) mb-2">
            3. Instant Preview
          </p>

          <p className="text-sm text-(--muted-foreground)">
            The result is instantly displayed in the Preview Card, showing the
            title, image, description, and link.
          </p>
        </div>
      </div>
    </section>
  );
}
