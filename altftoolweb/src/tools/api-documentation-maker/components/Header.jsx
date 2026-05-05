export default function Header() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* PAGE TITLE */}
      <header className="text-center mb-8 text(--primary)">
        <h2 className="heading">Api Documentation Maker</h2>
        <p className="text-center description text-(muted--foreground)">
         Generate clean, structured API documentation automatically from endpoints, requests, and responses
        </p>
      </header>
    </div>
  );
}
