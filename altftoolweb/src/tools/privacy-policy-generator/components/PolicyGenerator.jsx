import InputSection from "./InputSection";
import OutputSection from "./OutputSection";
import { usePolicyGenerator } from "../hooks/usePolicyGenerator";
import { FileText } from "lucide-react";

export default function PolicyGenerator() {
  const generator = usePolicyGenerator();

  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(380px,1.08fr)] xl:items-start">
      <div className="min-w-0">
        <InputSection
          form={generator.form}
          updateField={generator.updateField}
          toggleList={generator.toggleList}
          readiness={generator.readiness}
        />
      </div>

      <div className="min-w-0 xl:sticky xl:top-5">
        {generator.showPolicy ? (
        <OutputSection
          policy={generator.policy}
          isGenerating={generator.isGenerating}
          error={generator.error}
          readiness={generator.readiness}
          stats={generator.stats}
          copied={generator.copied}
          setCopied={generator.setCopied}
        />
        ) : generator.isComplete ? (
        <div className="pp-glass pp-empty-state min-w-0 rounded-3xl p-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-400 border-t-transparent"></div>
            <p className="text-sm font-bold text-blue-400">Generating your unique privacy policy...</p>
            <p className="text-xs text-(--muted-foreground)">Creating a custom policy for {generator.form.appName}</p>
          </div>
        </div>
        ) : (
        <div className="pp-glass pp-empty-state min-w-0 rounded-3xl p-6">
          <div className="mx-auto flex max-w-sm flex-col items-center gap-3 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-500/10 text-blue-600">
              <FileText className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-black text-(--foreground)">Policy preview unlocks here</h2>
            <p className="text-sm leading-6 text-(--muted-foreground)">
              Complete required fields and choose collected data to generate a ready-to-copy privacy policy.
            </p>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
