import HistorySection from "./HistorySection";
import InputSection from "./InputSection";
import OutputSection from "./OutputSection";
import { useJsonToGoStruct } from "../hooks/useJsonToGoStruct";

export default function JsonGoGenerator() {
  const generator = useJsonToGoStruct();

  return (
    <div className="mx-auto grid max-w-6xl min-w-0 gap-6">
      <InputSection
        workspace={generator.workspace}
        updateField={generator.updateField}
        readiness={generator.readiness}
        loadFile={generator.loadFile}
        transformJson={generator.transformJson}
        clearJson={generator.clearJson}
        resetWorkspace={generator.resetWorkspace}
        error={generator.error}
        notice={generator.notice}
      />
      {generator.result?.code && (
        <OutputSection
          result={generator.result}
          workspace={generator.workspace}
          copied={generator.copied}
          setCopied={generator.setCopied}
          saveHistory={generator.saveHistory}
        />
      )}
      <HistorySection history={generator.workspace.history} restoreHistory={generator.restoreHistory} />
    </div>
  );
}
