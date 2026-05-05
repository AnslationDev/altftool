export default function Header() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* PAGE TITLE */}
      <header className="text-center mb-8">
        <h1 className="heading">
          Text to Voice Converter
          <br />
          {/* <span className="text-(--foreground) text-2xl sm:text-3xl">
            Converter
          </span> */}
        </h1>
        <p className="description text-center mt-2 text-lg">
          Convert text to speech with customizable settings
        </p>
      </header>
    </div>
  );
}
