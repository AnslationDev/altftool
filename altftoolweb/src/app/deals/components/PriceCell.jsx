// One price, rendered honestly.
//
// The badge is the point of this component. A figure read off an India
// storefront and a figure read in USD look identical once they are typeset,
// so the status from paidProducts.js is surfaced as a visible label rather
// than left in a comment. Status colours are used as a soft tint plus a
// border, never as body-text colour — `--success` (#16a34a) on `--surface`
// does not clear 4.5:1, so the text stays on `--foreground`.
//
// Server component: no state, nothing reaches the client bundle.

const STATUS_BADGE = {
  regional: {
    label: "Not a USD price",
    className: "border-(--warning) bg-(--warning-soft)",
  },
  free: {
    label: "No paid tier — it's free",
    className: "border-(--success) bg-(--success-soft)",
  },
};

export default function PriceCell({ product, showDetail = true }) {
  if (!product?.price) return <span aria-hidden="true">—</span>;

  const { price, checkedOn } = product;
  const badge = STATUS_BADGE[price.status];

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-semibold text-(--foreground)">{price.headline}</span>
      {badge ? (
        <span
          className={`inline-flex w-fit items-center rounded-[6px] border px-2 py-0.5 text-[11px] font-semibold text-(--foreground) ${badge.className}`}
        >
          {badge.label}
        </span>
      ) : null}
      {showDetail && price.detail ? (
        <span className="text-xs leading-5 text-(--muted-foreground)">{price.detail}</span>
      ) : null}
      {checkedOn ? (
        <span className="text-xs leading-5 text-(--muted-foreground)">
          Checked <time dateTime={checkedOn}>{checkedOn}</time>
        </span>
      ) : null}
    </div>
  );
}
