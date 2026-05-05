import React from "react";

const Features = () => {
  const features = [
    {
      title: "Scientifically Designed Questions",
      description:
        "Carefully structured questions help evaluate how you typically respond to frustration, stress, and conflict.",
    },
    {
      title: "Instant Anger Score",
      description:
        "Receive your anger level immediately after completing the assessment with a clear and easy-to-understand score.",
    },
    {
      title: "Personalized Insights",
      description:
        "Get tailored recommendations and coping strategies based on your specific anger level.",
    },
    {
      title: "Quick & Simple Assessment",
      description:
        "Complete the test in just 2–3 minutes with straightforward multiple-choice questions.",
    },
    {
      title: "100% Private & Confidential",
      description:
        "Your answers are not stored or shared. Everything runs securely in your browser.",
    },
    {
      title: "Actionable Improvement Tips",
      description:
        "Access practical immediate actions, long-term strategies, and lifestyle changes to manage anger effectively.",
    },
  ];

  return (
    <section className="py-8 sm:py-10 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Take Our Anger Test?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Understand your emotional responses and learn how to manage anger in a healthier way
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
