import React from "react";

const Features = () => {
  const features = [
    {
      title: "Select Birth Date",
      description:
        "Pick your date of birth from the intuitive calendar dropdown, including month and year.",
    },
    {
      title: "Pick Exact Time",
      description:
        "Enter your birth time to get a ultra-precise age down to minutes and seconds.",
    },
    {
      title: "Automated Logic",
      description:
        "Our engine instantly subtracts your birth date from the current date, adjusting for leap years.",
    },
    {
      title: "View Breakdown",
      description:
        "See your total age in years, months, days, weeks, and even total hours lived so far.",
    },
    {
      title: "Upcoming Milestone",
      description:
        "Automatically find out exactly how many days and months are left until your next birthday.",
    },
    {
      title: "Secure Processing",
      description:
        "Your data is never uploaded. The entire calculation happens instantly within your browser's memory using local JavaScript.",
    },
  ];

  return (
    <section className="py-8 sm:py-10 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Choose Our Age Calculator?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Simple, fast, and accurate age calculation for everyone
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="
                bg-[var(--card)]
                rounded-2xl
                shadow-md
                border border-[var(--border)]
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
