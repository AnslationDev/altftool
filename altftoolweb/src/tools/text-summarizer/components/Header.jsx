export default function Header() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* PAGE TITLE */}
      <header className="text-center mb-8">
        <h1 className="heading">Text Summarizer</h1>
        <p className="description text-center mt-2 text-lg">
          Summarize long text instantly into clear, concise key points.
        </p>
      </header>
    </div>
  );
}
