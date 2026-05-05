export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-(--background)">
      {/* Header */}
      {/* <Header /> */}

      <div className="container mx-auto px-4 py-8">
        {/* PAGE TITLE */}
        <header className="text-center mb-8">
          <h1 className="heading">Image Size Reducer</h1>

          <p className="description">
            Compress and resize your images while maintaining quality
          </p>
        </header>

        {/* MAIN CONTENT */}
        <main className="max-w-6xl mx-auto bg-(--background) text-(--card-foreground) rounded-xl p-4 sm:p-6 shadow-lg">
          {children}
        </main>
      </div>

      {/* <Footer /> */}
    </div>
  );
}
