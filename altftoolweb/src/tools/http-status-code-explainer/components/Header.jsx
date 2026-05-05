export default function Header() {
  return (
    <div className="container mx-auto px-4 py-8 mt-4 mb-[-20]">
      {/* PAGE TITLE */}
      <header className="text-center mb-8">
        <h1 className="heading">HTTP Status Explainer </h1>

        <p className="description text-(--secondary) text-2xl mt-5 text-center">
          Understand HTTP status codes with simple, clear explanations
          instantly.
        </p>
      </header>
    </div>
  );
}
