import { LoadingBone } from "@/components/ui/route-loading";

export default function Loading() {
  return (
    <main className="bg-(--background) text-(--foreground)">
      <section className="section space-y-5">
        <LoadingBone className="h-5 w-40 rounded-full" />
        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <LoadingBone className="h-[360px] rounded-[var(--anslation-ds-radius-lg)]" />
          <LoadingBone className="h-[360px] rounded-[var(--anslation-ds-radius-lg)]" />
        </div>
        <LoadingBone className="h-48 rounded-[var(--anslation-ds-radius-lg)]" />
      </section>
    </main>
  );
}
