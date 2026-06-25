import GlobalAlertHost from "@/components/ui/GlobalAlertHost";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import SecurityGate from "@/components/security/SecurityGate";
import { AdminThemeProvider } from "@/context/ThemeContext";
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
    <html lang="en" data-theme-mode="system" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <Script id="admin-theme-init" strategy="beforeInteractive">
          {`
            try {
              var storedMode = localStorage.getItem("appThemeMode");
              var legacyManual = localStorage.getItem("themeManual") === "true";
              var legacyTheme = localStorage.getItem("appTheme");
              var validMode = storedMode === "system" || storedMode === "light" || storedMode === "dark";
              var validLegacy = legacyTheme === "light" || legacyTheme === "dark";
              var mode = validMode ? storedMode : (legacyManual && validLegacy ? legacyTheme : "system");
              var system = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
              var theme = mode === "system" ? system : mode;
              document.documentElement.setAttribute("data-theme", theme);
              document.documentElement.setAttribute("data-theme-mode", mode);
              document.documentElement.style.colorScheme = theme;
            } catch (_) {}
          `}
        </Script>

        <link rel="preconnect" href="https://firestore.googleapis.com" />

      </head>

      <body className="anslation-ds-admin antialiased">
        <AdminThemeProvider>
          <AuthProvider>
            <GlobalAlertHost />
            <PushToastHost />
            <SecurityGate />
            {children}
          </AuthProvider>
        </AdminThemeProvider>
      </body>
    </html>
  );
}
