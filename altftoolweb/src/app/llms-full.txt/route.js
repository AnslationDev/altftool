import { buildLlmsFullTxt } from "@/platform/seo/answerEngineManifest";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return new Response(buildLlmsFullTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
