"use client";

import data from "../(data)/db.json";

const AboutSection = () => {
  const {
    title,
    intro,
    categoriesTitle,
    categories,
    whyChooseTitle,
    whyChoose
  } = data.about;

  return (
    <div className="my-20">
      <section className="">
        
        {/* Title */}
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 sm:mb-5 md:mb-6">
          {title}
        </h1>

        {/* Intro Paragraphs */}
        <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed mb-8 sm:mb-9 md:mb-10">
          {intro.map((text, i) => (
            <p key={i}>{text}</p>
          ))}
        </div>

        {/* Categories */}
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">
          {categoriesTitle}
        </h2>

        <div className="space-y-4  sm:space-y-5 mb-10 sm:mb-11 md:mb-12">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white  rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                {cat.id}. {cat.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-700 mt-1 sm:mt-2 leading-relaxed">
                {cat.description}
              </p>
            </div>
          ))}
        </div>

        {/* Why Choose */}
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">
          {whyChooseTitle}
        </h2>

        <ul className="list-disc pl-5 sm:pl-6 space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700">
          {whyChoose.map((item) => (
            <li key={item.id} className=" text-(--foreground) leading-relaxed">
              {item.text}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default AboutSection;