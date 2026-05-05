import GlobalAlertHost from "@/components/ui/GlobalAlertHost";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Script from "next/script";
import PushToastHost from "@/components/ui/PushToastHost";

export const metadata = {
  title: "AltFTools Admin",
  description: "AltFTools Admin Panel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>

        {/* CKEditor Styles */}
        <link
          rel="stylesheet"
          href="https://cdn.ckeditor.com/ckeditor5/47.2.0/ckeditor5.css"
        />

        <link
          rel="stylesheet"
          href="https://cdn.ckeditor.com/ckeditor5-premium-features/47.2.0/ckeditor5-premium-features.css"
        />

      </head>

      <body>
        {/* CKEditor Scripts */}
        <Script
          src="https://cdn.ckeditor.com/ckeditor5/47.2.0/ckeditor5.umd.js"
          strategy="beforeInteractive"
        />

        <Script
          src="https://cdn.ckeditor.com/ckeditor5-premium-features/47.2.0/ckeditor5-premium-features.umd.js"
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