import "./globals.css";

import NotFound from "./not-found";

export const metadata = {
  title: "Admin Route Not Found | AltFTool",
  description: "The requested AltFTool admin route does not exist.",
};

const themeInitializer = `(function(){var d=document.documentElement;try{var s=localStorage.getItem("appThemeMode"),lm=localStorage.getItem("themeManual")==="true",lt=localStorage.getItem("appTheme"),vm=s==="system"||s==="light"||s==="dark",vl=lt==="light"||lt==="dark",m=vm?s:(lm&&vl?lt:"system"),pd=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches,t=m==="system"?(pd?"dark":"light"):m;d.setAttribute("data-theme",t);d.setAttribute("data-theme-mode",m);d.style.colorScheme=t;}catch(e){var f=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";d.setAttribute("data-theme",f);d.setAttribute("data-theme-mode","system");d.style.colorScheme=f;}})();`;

export default function GlobalNotFound() {
  return (
    <html lang="en" data-theme-mode="system" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializer }} />
      </head>
      <body className="anslation-ds-admin antialiased">
        <NotFound />
      </body>
    </html>
  );
}
