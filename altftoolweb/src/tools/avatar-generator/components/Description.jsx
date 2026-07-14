"use client";

// SEO / explanatory copy rendered below the tool.
export default function Description() {
  return (
    <section className="mx-auto mt-10 max-w-3xl text-(--muted-foreground)">
      <h2 className="mb-2 text-lg font-semibold text-(--foreground)">
        About the Avatar Generator
      </h2>
      <p className="text-sm leading-relaxed">
        Create unique, scalable avatars in seconds. Pick from Flat, Geometric,
        Pixel, and Friendly illustration styles, fine-tune skin tone, hair,
        background and accent colors, and customize every facial feature — eyes,
        eyebrows, mouth, hair, facial hair and accessories like glasses or hats.
      </p>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed">
        <li>
          <strong className="text-(--foreground)">Randomize</strong> produces a
          new valid avatar from a seed you can reproduce.
        </li>
        <li>
          <strong className="text-(--foreground)">AI Generate</strong> applies a
          curated, pattern-driven generator for on-trend, harmonious results.
        </li>
        <li>
          Export your avatar as a crisp PNG or copy it straight to your clipboard
          for use in apps, profiles and games.
        </li>
      </ul>
    </section>
  );
}
