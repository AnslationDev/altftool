const features = [
  {
    title: "Chinese Word Segmentation",
    description:
      "Break Chinese text into readable word tokens so phrases and sentences are easier to understand.",
  },
  {
    title: "Multi-Language Detection",
    description:
      "Detect Chinese, English, Hindi, numbers, punctuation, and mixed-language input directly in the browser.",
  },
  {
    title: "Auto Translation Split",
    description:
      "Translate Chinese input into English and Hindi, or convert English and Hindi text into Chinese.",
  },
  {
    title: "Comparison View",
    description:
      "Compare original text with the segmented output side by side for quick review and validation.",
  },
  {
    title: "Copy and Export",
    description:
      "Copy segmented results, translation rows, or export the complete analysis as TXT and JSON.",
  },
  {
    title: "Browser-Based Workflow",
    description:
      "Segmentation and language checks run locally, keeping the tool fast for everyday text analysis.",
  },
];

export default function Features() {
  return (
    <section className="px-4 py-8 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center sm:mb-12">
          <h2 className="mb-4 text-3xl font-extrabold text-[var(--foreground)] sm:text-4xl">
            Why Choose This Split Tool?
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-[var(--muted-foreground)] sm:text-lg">
            Segment, translate, compare, and export Chinese, English, and Hindi text in one workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex min-w-0 flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl sm:p-8"
            >
              <h3 className="mb-3 break-words text-lg font-bold text-[var(--foreground)] sm:text-xl">
                {feature.title}
              </h3>
              <p className="break-words text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
