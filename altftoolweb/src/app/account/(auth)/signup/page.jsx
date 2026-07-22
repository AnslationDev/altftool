import { Suspense } from "react";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { RouteLoadingShell } from "@/components/ui/route-loading";
import { AuthForm } from "../AuthForm";

export const metadata = createPageMetadata({
  title: "Create Account - AltFTool",
  description:
    "Create a free AltFTool account to save favorite tools, sync preferences, and unlock personalized features across all your devices.",
  path: "/account/signup",
});

export default function SignupPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:py-16">
      <Suspense fallback={<RouteLoadingShell />}>
        <AuthForm mode="signup" />
      </Suspense>
    </main>
  );
}
