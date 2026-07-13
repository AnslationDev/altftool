import Reveal from "./Reveal";

export default function SectionHeading({
  eyebrow,
  title,
  highlight,
  subtitle,
  center = true,
  light = false,
}) {
  return (
    <Reveal className={`max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
      {eyebrow && (
        <span className="chp-b mb-4">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand" />
          {eyebrow}
        </span>
      )}
      <h2
        className={`text-3xl font-bold sm:text-4xl lg:text-[2.6rem] lg:leading-[1.1] ${
          light ? "text-white" : ""
        }`}
      >
        {title}{" "}
        {highlight && <span className="gt">{highlight}</span>}
      </h2>
      {subtitle && (
        <p
          className={`mt-4 text-base leading-relaxed ${
            light ? "text-white/70" : "text-slate-500 dark:text-slate-400"
          }`}
        >
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
