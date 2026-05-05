export default function Header() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* PAGE TITLE */}
      <header className="text-center mb-[-30]">
        <h2 className="heading mb-[20] mt-[-5]">Astro Rashi Finder </h2>
        <p className="text-center description text-2xl mb-0 ">
          Find your rashi instantly based on date of birth.
        </p>
      </header>
    </div>
  );
}
