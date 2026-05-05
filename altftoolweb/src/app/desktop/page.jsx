import DesktopClient from "./DesktopClient";

export async function generateMetadata() {
  return {
    title: "Desktop Software – Powerful Tools for Windows & Mac",
    description:
      "Discover useful desktop software on AltFTool. Download powerful tools for productivity, utilities, and everyday tasks designed for Windows and Mac users.",
  };
}

export default function Page() {
  return <DesktopClient />;
}