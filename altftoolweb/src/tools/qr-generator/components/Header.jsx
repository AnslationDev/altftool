import { QrCode } from "lucide-react";
export default function Header() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* PAGE TITLE */}
      <header className="text-center mb-8">
        <h2 className="heading mt-[-40]">
          {/* <QrCode className="w-5 h-5" /> */}
          QR Code Generator{" "}
        </h2>
        <p className="text-center description ">
          Generate QR codes instantly for links, text, and data.
        </p>
      </header>
    </div>
  );
}
