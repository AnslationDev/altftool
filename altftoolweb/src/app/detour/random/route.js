import { NextResponse } from "next/server";
import { ALL_SITES } from "@altftool/core/detour";
import { CATEGORIES } from "@altftool/core/detour/taxonomy";
import { pickDetour } from "@altftool/core/detour/randomiser";

/*
 * The button, as a URL.
 *
 * `GET /detour/random` redirects to a random destination. Two consumers:
 *
 *   - The hero button, which fetches `?format=json` so it can show what it
 *     landed on and remember it, then navigates itself.
 *   - Anyone who bookmarks or shares the bare URL, or has JavaScript off. That
 *     path has to work, which is why this is a real redirect and not only an
 *     API the client component happens to call.
 *
 * Filters mirror the browse page so a link like
 * `/detour/random?time=instant&vibe=funny&sfw=1` is shareable and does what it
 * says.
 *
 * `force-dynamic` because the whole point is a different answer each time; a
 * cached redirect would send everyone to the same site.
 */

export const dynamic = "force-dynamic";

const CATEGORY_FAMILY = new Map(CATEGORIES.map((c) => [c.id, c.family]));

const list = (value) =>
  value
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : undefined;

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const filters = {
    timeToJoy: searchParams.get("time") || undefined,
    vibes: list(searchParams.get("vibe")),
    categories: list(searchParams.get("category")),
    families: list(searchParams.get("family")),
    sfwOnly: searchParams.get("sfw") === "1",
    silentOnly: searchParams.get("silent") === "1",
    mobileOnly: searchParams.get("mobile") === "1",
    noAccountOnly: searchParams.get("noaccount") === "1",
    originalsOnly: searchParams.get("originals") === "1",
    categoryFamilyMap: CATEGORY_FAMILY,
  };

  const exclude = new Set(list(searchParams.get("seen")) ?? []);

  let site = pickDetour(ALL_SITES, { filters, exclude });

  // An over-narrow filter combination should still send you somewhere rather
  // than erroring — dropping to the unfiltered catalog is the friendlier
  // failure, and the JSON consumer is told it happened.
  const relaxed = !site;
  if (!site) site = pickDetour(ALL_SITES, { exclude });

  if (!site) {
    return NextResponse.json(
      { error: "The catalog is empty, which should be impossible." },
      { status: 503 },
    );
  }

  if (searchParams.get("format") === "json") {
    return NextResponse.json(
      {
        slug: site.slug,
        name: site.name,
        url: site.url,
        blurb: site.blurb,
        category: site.category,
        timeToJoy: site.timeToJoy,
        vibes: site.vibes,
        origin: site.origin,
        needsSound: site.needsSound,
        sfw: site.sfw,
        relaxed,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.redirect(new URL(site.url, request.url), {
    status: 307,
    headers: { "Cache-Control": "no-store" },
  });
}
