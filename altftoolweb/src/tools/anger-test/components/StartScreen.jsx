"use client";

export default function StartScreen({ onStart }) {
  return (
    <div className="max-w-4xl mx-auto text-center">
      <div className="mb-8">
        <h1 className="heading text-center animate-fade-up mb-4">Anger Test</h1>
        <p className="description text-center animate-fade-up">
          Understand your anger responses and get personalized suggestions for better emotional health.
        </p>
      </div>

      <div className="bg-(--background) rounded-2xl p-8 mb-8 border-2 border-(--border)">
        <h2 className="subheading mb-6">How It Works</h2>
        <div className="grid gap-6">
          {[
            {
              step: 1,
              title: "Answer 10 Questions",
              desc: "Scenario-based questions about your typical reactions",
            },
            {
              step: 2,
              title: "Get Your Score",
              desc: "Receive your personalized anger level analysis",
            },
            {
              step: 3,
              title: "Receive Personalized Tips",
              desc: "Get suggestions tailored to your anger level",
            },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 bg-(--card) text-(--foreground) rounded-xl flex items-center justify-center font-bold text-xl shrink-0">
                {step}
              </div>
              <div>
                <h3 className="font-bold text-(--foreground)">{title}</h3>
                <p className="text-(--muted-foreground)">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onStart}
        className="px-10 py-5 bg-(--primary) text-white rounded-xl font-semibold text-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer"
      >
        Start Assessment →
      </button>

      <p className="mt-6 text-(--muted-foreground) text-sm">
        Takes approximately 2-3 minutes • 100% private and confidential
      </p>
    </div>
  );
}