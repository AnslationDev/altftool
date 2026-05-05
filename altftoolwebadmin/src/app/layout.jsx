import GlobalAlertHost from "@/components/ui/GlobalAlertHost";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Script from "next/script";
import PushToastHost from "@/components/ui/PushToastHost";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata = {
  title: "AltFTools Admin",
  description: "AltFTools Admin Panel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <Script id="admin-theme-init" strategy="beforeInteractive">
          {`
            try {
              var manual = localStorage.getItem("themeManual") === "true";
              var stored = localStorage.getItem("appTheme");
              var system = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
              document.documentElement.setAttribute("data-theme", manual && stored ? stored : system);
            } catch (_) {}
          `}
        </Script>

        <link rel="preconnect" href="https://firestore.googleapis.com" />
        <link rel="preconnect" href="https://cdn.ckeditor.com" />
        <link rel="preconnect" href="https://cdn.ckbox.io" />

        {/* CKEditor Styles */}
        <link
          rel="stylesheet"
          href="https://cdn.ckeditor.com/ckeditor5/48.0.1/ckeditor5.css"
        />

        <link
          rel="stylesheet"
          href="https://cdn.ckeditor.com/ckeditor5-premium-features/48.0.1/ckeditor5-premium-features.css"
        />

      </head>

      <body className="anslation-ds-admin antialiased">
        {/* CKEditor Scripts */}
        <Script
          src="https://cdn.ckeditor.com/ckeditor5/48.0.1/ckeditor5.umd.js"
          strategy="beforeInteractive"
        />

        <Script
          src="https://cdn.ckeditor.com/ckeditor5-premium-features/48.0.1/ckeditor5-premium-features.umd.js"
          strategy="beforeInteractive"
        />

        <Script
          src="https://cdn.ckbox.io/ckbox/2.9.2/ckbox.js"
          strategy="beforeInteractive"
        />

        <AuthProvider>
          <GlobalAlertHost />
          <PushToastHost />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
