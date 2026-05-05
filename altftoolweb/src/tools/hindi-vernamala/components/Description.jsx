// component/Description.jsx
import React from "react";

const Description = () => {
  const descriptions = [
    {
      title: "शब्द चुनें",
      description: "किसी शब्द का आधार चुनें और अभ्यास शुरू करें।"
    },
    {
      title: "अक्षर मिलाएँ",
      description: "शब्द के अक्षरों को सही क्रम में लगाएँ।"
    },
    {
      title: "अक्षर शफल करें",
      description: "अक्षरों को घुमाएँ और सही शब्द बनाने की कोशिश करें।"
    },
    {
      title: "सहीपन जांचें",
      description: "देखें कि आपने अक्षरों को सही क्रम में रखा है या नहीं।"
    },
    {
      title: "सुझाव प्राप्त करें",
      description: "गलतियों के लिए सुधार और सुझाव पाएं।"
    },
    {
      title: "अभ्यास दोहराएँ",
      description: "फिर से अभ्यास करें और अपने ज्ञान को मजबूत बनाएं।"
    }
  ];

  return (
    <section className="py-16 sm:py-20 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
        How It Works ?
          </h2>
          
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {descriptions.map((item, index) => (
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
                group
              "
            >
              <h3 className="text-lg sm:text-xl font-bold text-(--foreground) mb-3 group-hover:text-blue-500 transition-colors duration-300">
                {item.title}
              </h3>
              <p className="text-sm sm:text-base text-(--muted-foreground) leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Description;