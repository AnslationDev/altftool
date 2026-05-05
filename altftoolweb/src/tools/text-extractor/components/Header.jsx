export default function Header() {
  return (
    <div className="container mx-auto px-4 py-2">
      {/* PAGE TITLE */}
      <header className="text-center mb-8">
        <h2 className="heading">Text Extractor</h2>
        <p className="text-center description">
          Extract text accurately from images, files, or pasted content.
        </p>
      </header>
    </div>
  );
}
