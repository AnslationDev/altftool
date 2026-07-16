import InputSection from "./InputSection";
import FeatureFooter from "./FeatureFooter";
import OutputSection from "./OutputSection";
import { useJumpCodeGenerator } from "../hooks/useJumpCodeGenerator";

export default function JumpCodeGenerator() {
  const generator = useJumpCodeGenerator();

  return (
    <div className="mx-auto grid max-w-5xl min-w-0 gap-6">
      <InputSection {...generator} />
      <OutputSection {...generator} />
      <FeatureFooter stats={generator.stats} readiness={generator.readiness} activeType={generator.activeType} history={generator.history} />
    </div>
  );
}
