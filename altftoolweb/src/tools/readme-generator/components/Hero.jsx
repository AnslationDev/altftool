import { FileText } from "lucide-react";
import ReadmeScore from "./ReadmeScore";

export default function Hero({generatedReadme}) {
  return (
    <div className="text-center mb-12">
      <div className="inline-flex items-center gap-2 bg-(--primary)/10 border border-(--primary)/30 rounded-full px-4 py-2 mb-6">
        <FileText className="w-4 h-4 text-(--primary)" />
        <span className="text-(--primary) text-sm font-semibold">
          Local & Private
        </span>
      </div>

      <h1 className="heading font-bold mb-6">
        Generate Professional
        <br />
        <span className="heading font-bold mb-6">README Files</span>
      </h1>

      <p className="description text-(--muted-foreground) max-w-2xl mx-auto">
        Create clean, accurate README.md files directly in your browser.
      </p>
      <div className="mt-6 flex justify-center">
  <ReadmeScore generatedReadme={generatedReadme} />
</div>
    </div>
  );
}