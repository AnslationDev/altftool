const faqItems = [
  {
    question: "What is WebP and why convert it?",
    answer:
      "WebP is a modern image format by Google that offers superior compression for smaller file sizes. However, some platforms, software, or workflows still require PNG or JPG. Our converter lets you batch-convert WebP images to widely-compatible formats entirely in your browser.",
  },
  {
    question: "Are my images uploaded to a server?",
    answer:
      "No. All conversion happens locally in your browser using the Canvas API. Your files never leave your device, making this tool 100% private and secure.",
  },
  {
    question: "What is the difference between PNG, JPG, and PDF output?",
    answer:
      "PNG is a lossless format that preserves transparency and sharp edges — ideal for graphics, logos, and screenshots. JPG is a lossy format that produces smaller file sizes at the cost of some quality — best for photographs. PDF wraps your image into a portable document, perfect for sharing or printing. Use the quality slider to control JPG and PDF compression.",
  },
  {
    question: "Can I convert multiple WebP files at once?",
    answer:
      "Yes. You can upload multiple WebP images in one batch and convert them all at once. Each converted image can be downloaded individually, or you can download all of them together as a single ZIP archive.",
  },
  {
    question: "Does this tool work on mobile devices?",
    answer:
      "Yes. The converter is fully responsive and works on any modern browser — desktop, tablet, or phone. Since everything runs client-side, there is no server dependency.",
  },
  {
    question: "Is there a limit on file size or number of files?",
    answer:
      "There is no hard limit, but since processing happens in the browser, very large files or extremely large batches may affect performance. Your device's available memory is the only constraint.",
  },
];

export default function Features() {
  return (
    <section className="py-16 sm:py-20 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about converting WebP to PNG or JPG
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="bg-(--surface) rounded-2xl border border-(--border) p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-bold text-(--foreground) mb-3 flex items-start gap-2.5">
                  <span className="text-teal-500 font-extrabold text-lg shrink-0">Q.</span>
                  <span>{item.question}</span>
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
