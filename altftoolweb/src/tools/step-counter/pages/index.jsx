"use client";

import useStepCounter from "../utils/useStepCounter";
import StepAppV2 from "../components/StepAppV2.jsx";
import ExploreFitnessTools from "../components/ExploreFitnessTools.jsx";
import StepFaqAbout from "../components/StepFaqAbout.jsx";

export default function StepCounterApp() {
  const counter = useStepCounter();

  return (
    <div className="font-secondary pb-2">
      {/* Keep an explicit page heading for SEO/assistive tech — the app screen's
          visible heading is the tool title inside the tracker. */}
      <h1 className="sr-only">Step Counter — Free Online Daily Step Tracker</h1>

      {/* No wrapper padding: the tool workspace (ToolDetailChrome) already
          supplies the page gutter, and the tracker tops up only what a notched
          phone needs. Adding another px-4 here doubled the gutter and shrank
          the count on exactly the devices that matter most. */}
      <StepAppV2 counter={counter} />

      {/* Companion sections share the tracker's reading column and the platform
          tokens, so the whole page reads as one product. */}
      <div className="mx-auto w-full max-w-[30rem] space-y-8 pt-10 md:max-w-6xl md:pt-12">
        <ExploreFitnessTools />
        <StepFaqAbout />
      </div>
    </div>
  );
}
