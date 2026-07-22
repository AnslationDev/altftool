import { Suspense } from "react";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { RouteLoadingShell } from "@/components/ui/route-loading";
import { AuthForm } from "../AuthForm";

export const metadata = createPageMetadata({
  title: "Sign In - AltFTool Account",
  description:
    "Sign in to your AltFTool account to sync favorite tools, saved preferences, and personalized features across devices.",
  path: "/account/login",
  noindex: true,
});

export default function LoginPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:py-16">
      <Suspense fallback={<RouteLoadingShell />}>
        <AuthForm mode="login" />
      </Suspense>
    </main>
  );
}
