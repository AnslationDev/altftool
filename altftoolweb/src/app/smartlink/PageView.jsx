import Link from "next/link";
import { Unlink, Wrench } from "lucide-react";

// This route previously forwarded visitors to a third-party ad network while
// showing crawlers a loading shell. That behaviour has been removed. There is no
// legitimate destination behind /smartlink, so the route now renders a plain
// notice and sends people to the tools directory instead.
export default function SmartLink() {
  return (
    <div className="section flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-xl text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--card) text-(--primary) shadow-[var(--anslation-ds-shadow-sm)]">
          <Unlink className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-normal text-(--foreground) sm:text-4xl">
          This link is no longer active
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-(--muted-foreground) sm:text-base">
          The smart link you followed has been retired and no longer points
          anywhere. Nothing was installed or opened on your device.
        </p>

        <Link
          href="/tools/all"
          className="mt-8 inline-flex h-10 items-center gap-2 rounded-[var(--anslation-ds-radius)] bg-(--primary) px-4 text-sm font-semibold text-(--primary-foreground) shadow-[var(--anslation-ds-shadow-sm)] transition duration-200 hover:bg-(--primary-active) hover:shadow-[var(--anslation-ds-shadow-md)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary) motion-reduce:transition-none motion-reduce:transform-none"
        >
          <Wrench className="h-4 w-4" aria-hidden="true" />
          Browse all tools
        </Link>
      </div>
    </div>
  );
}
