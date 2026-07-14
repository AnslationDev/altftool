const faqItems = [
  {
    question: "How does video frame rate conversion work?",
    answer:
      "The tool uses FFmpeg.wasm to re-encode your video at the target frame rate. It decodes every frame, then re-timestamps them at the new FPS using the 'fps' filter, producing a properly encoded MP4 file — all within your browser.",
  },
  {
    question: "My video has a variable frame rate (VFR). Will this work?",
    answer:
      "Yes. FFmpeg's fps filter converts VFR to CFR (constant frame rate) by duplicating or dropping frames as needed to match the target FPS exactly. The output will always be CFR.",
  },
  {
    question: "Will the video speed up or slow down?",
    answer:
      "No — the playback speed stays the same. The 'fps' filter preserves the original duration. Frames are added (duplicated) or dropped to match the target rate, so the video plays at normal speed.",
  },
  {
    question: "What frame rates are supported?",
    answer:
      "The tool supports 23.976, 24, 25, 29.97, 30, 48, 50, 59.94, 60, and 120 fps. You can also type a custom value if your target isn't listed.",
  },
  {
    question: "Is this really 100% browser-based?",
    answer:
      "Yes. FFmpeg.wasm runs the actual FFmpeg compiled to WebAssembly right in your browser. Your video file never leaves your device — there is no server upload.",
  },
  {
    question: "What output format does the tool produce?",
    answer:
      "The output is an MP4 file with H.264 video codec (libx264) at CRF 18 quality, which offers excellent visual quality with reasonable file size.",
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
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about video frame rate conversion
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
