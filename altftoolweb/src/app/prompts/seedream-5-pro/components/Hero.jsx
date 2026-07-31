/**
 * Marketplace hero. Parametrized so GPT Image / Midjourney sections can reuse it.
 */
export default function Hero({
  title = "Top Trending AI Image Prompt Collections",
  subtitle = "Browse AI image prompt examples from Seedream 5 Pro, OpenAI, Flux, Krea, and more — collected from the community. Instant copy-and-paste setups ready for prompt execution.",
}) {
  return (
    <section className="mx-auto max-w-3xl px-4 pt-12 pb-6 text-center sm:pt-16">
      <h1 className="mx-auto max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-(--color-foreground) sm:text-4xl md:text-5xl">
        {title}
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-sm text-(--color-muted-foreground) sm:text-base">
        {subtitle}
      </p>
    </section>
  );
}
