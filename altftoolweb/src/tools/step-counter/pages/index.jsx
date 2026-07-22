"use client";

import useStepCounter from "../utils/useStepCounter";
import StepAppV2 from "../components/StepAppV2.jsx";
import ExploreFitnessTools from "../components/ExploreFitnessTools.jsx";
import StepFaqAbout from "../components/StepFaqAbout.jsx";

export default function StepCounterApp() {
  const counter = useStepCounter();

  return (
    <div className="font-secondary pb-2">
      {/* Keep an explicit page heading for SEO/assistive tech — the app UI's
          visible heading is the visitor's personalised greeting. */}
      <h1 className="sr-only">Step Counter — Free Online Daily Step Tracker</h1>

      {/*
        Redesigned app-style screen (dark / cyan reference theme — see
        StepAppV2.jsx). Renders as a phone-sized canvas on every breakpoint;
        the previous indigo/violet StepApp.jsx is kept for easy rollback.
      */}
      <div className="px-3 pt-4 min-[400px]:px-4">
        <StepAppV2 counter={counter} />
      </div>

      {/* Companion sections share the app theme AND the app column, so the
          whole page reads as one designed product. */}
      <div className="mx-auto w-full max-w-[420px] space-y-8 p-3 pt-5 min-[400px]:p-4 min-[400px]:pt-6 md:max-w-6xl md:p-6 md:pt-8 lg:p-7 lg:pt-10">
        <ExploreFitnessTools />
        <StepFaqAbout />
      </div>
    </div>
  );
}
