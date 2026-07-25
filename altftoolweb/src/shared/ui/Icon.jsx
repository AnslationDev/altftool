export default function Icon({ name, className }) {
  return (
    <svg
      className={[
        "transition-colors duration-150 motion-reduce:transition-none",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <use href={`/icons.svg#${name}`} />
    </svg>
  );
}
