import { Suspense } from "react";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { RouteLoadingShell } from "@/components/ui/route-loading";
import { AuthForm } from "../AuthForm";

export const metadata = createPageMetadata({
  title: "Reset Password - AltFTool Account",
  description:
    "Forgot your AltFTool password? Enter your email address and we'll send you a secure link to reset it.",
  path: "/account/forgot-password",
  noindex: true,
});

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:py-16">
      <Suspense fallback={<RouteLoadingShell />}>
        <AuthForm mode="reset" />
      </Suspense>
    </main>
  );
}
