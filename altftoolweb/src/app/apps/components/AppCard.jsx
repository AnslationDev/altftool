import Link from "next/link";
import { ArrowRight } from "lucide-react";
import DownloadButton from "./DownloadButton";
import { AppIconSvg } from "./AppVisualAssets";

export default function AppCard({ app, compact = false, descriptionFullWidth = false }) {
  return (
    <article className={`flex flex-col rounded-[22px] border border-[var(--home-border)] bg-[var(--card)] shadow-[0_14px_34px_rgba(15,23,42,0.075)] transition hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(15,23,42,0.12)] ${compact ? "min-h-[270px] p-5" : "min-h-[244px] p-4"}`}>
      <div className="flex items-start gap-4">
        <AppIconSvg app={app} className={`${compact ? "h-[72px] w-[72px] rounded-[20px]" : "h-[62px] w-[62px] rounded-[18px]"} shrink-0 shadow-[0_12px_26px_rgba(15,23,42,0.16)]`} />
        <div className="min-w-0 flex-1">
          <h3 className={`${compact ? "text-[18px]" : "text-[16px]"} font-semibold leading-tight text-[var(--foreground)]`}>{app.name}</h3>
          <p className="mt-1.5 text-[13px] font-medium text-[var(--primary)]">{app.category}</p>
          {!descriptionFullWidth ? (
            <p className="mt-3 line-clamp-3 text-[13px] font-semibold leading-6 text-[var(--muted-foreground)]">{app.shortDescription}</p>
          ) : null}
        </div>
      </div>

      {descriptionFullWidth ? (
        <p className={`${compact ? "mt-5 line-clamp-3 leading-6" : "mt-3 line-clamp-2 leading-5"} w-full text-[13px] font-semibold text-[var(--muted-foreground)]`}>
          {app.shortDescription}
        </p>
      ) : null}

      <div className={`mt-auto flex items-center justify-end gap-3 text-sm ${compact ? "pt-6" : "pt-4"}`}>
        <span className="text-xs font-semibold text-[var(--muted-foreground)]">{app.apkSize}</span>
      </div>

      <div className={`${compact ? "mt-5 grid-cols-1" : "mt-4 grid-cols-2"} grid gap-3`}>
        <Link
          href={`/apps/${app.slug}`}
          className={`${compact ? "min-h-12" : "min-h-11"} inline-flex items-center justify-center gap-2 rounded-[14px] border border-[color-mix(in_srgb,var(--primary)_24%,var(--home-border))] bg-[var(--home-primary-soft)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--home-hover)]`}
        >
          Details
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
        {!compact ? (
          <DownloadButton
            href={app.apkUrl}
            label="Download"
            className="min-h-11 px-4 py-2 text-sm"
            comingSoon={app.apkSize === "Coming Soon"}
          />
        ) : null}
      </div>
    </article>
  );
}
