import React from "react";

const Features = () => {
  const features = [
    {
      title: "Instant Word Search",
      description:
        "Find accurate definitions instantly by typing any word into the search bar.",
    },
    {
      title: "Detailed Word Meanings",
      description:
        "Get clear definitions along with parts of speech, examples, and contextual usage.",
    },
    {
      title: "Synonyms & Antonyms",
      description:
        "Explore related words including synonyms and antonyms to expand your vocabulary.",
    },
    {
      title: "Pronunciation Guide",
      description:
        "View phonetic spelling and improve your pronunciation with easy-to-follow guidance.",
    },
    {
      title: "Simple & Clean Interface",
      description:
        "Enjoy a distraction-free and user-friendly design for smooth word discovery.",
    },
    {
      title: "Fully Responsive Design",
      description:
        "Access the dictionary seamlessly on desktop, tablet, and mobile devices anytime, anywhere.",
    },
  ];

  return (
    <section className="py-8 sm:py-10 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our Dictionary App?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Discover word meanings, improve vocabulary, and enhance your language skills instantly
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="
                bg-(--card)
                rounded-2xl
                shadow-md
                border border-(--border)
                p-6 sm:p-8
                flex flex-col
                hover:shadow-xl
                hover:-translate-y-2
                transition-all duration-300
              "
            >
              <h3 className="text-lg sm:text-xl font-bold text-(--foreground) mb-3">
                {feature.title}
              </h3>

              <p className="text-sm sm:text-base text-(--muted-foreground) leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
