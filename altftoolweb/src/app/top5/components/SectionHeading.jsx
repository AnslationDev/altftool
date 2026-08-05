export default function SectionHeading({ index, eyebrow, heading, description }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
      <div>
        <p className="text-xs font-semibold tracking-widest text-[#10b981]">
          {index} / {eyebrow}
        </p>
        <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-[#0b1120]">
          {heading}
        </h2>
      </div>
      {description ? (
        <p className="text-sm sm:text-base text-[#6b7280] max-w-sm lg:text-right">{description}</p>
      ) : null}
    </div>
  );
}
