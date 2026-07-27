"use client";

import { findPrank, standalonePrankComponents } from "./data/pranxData";
import PranxHeader from "./components/PranxHeader";
import HomePage from "./components/HomePage";
import NotFoundPrank from "./components/NotFoundPrank";
import PrankFrame from "./components/PrankFrame";
import RenderPrank from "./pranks/RenderPrank";

const wideComponents = new Set(["matrix", "pipes", "dvd", "static"]);

// `intro` / `explainer` are server-rendered nodes passed down from the route
// so the prose ships in the initial HTML. Immersive pranks get the intro band
// above the simulation and the detail block underneath it; framed pranks show
// the answer sentence in the frame header and the detail block below the app.
export default function PranxApp({ slug, answer, intro = null, explainer = null }) {
  const prank = findPrank(slug);
  const isImmersivePrank =
    prank && (standalonePrankComponents.has(prank.component) || wideComponents.has(prank.component));

  const renderContent = () => {
    if (!slug) {
      return <HomePage />;
    }

    if (!prank) {
      return <NotFoundPrank />;
    }

    if (isImmersivePrank) {
      return (
        <>
          {intro}
          <RenderPrank prank={prank} />
          {explainer}
        </>
      );
    }

    return (
      <PrankFrame prank={prank} answer={answer} explainer={explainer}>
        <RenderPrank prank={prank} />
      </PrankFrame>
    );
  };

  return (
    <div className={`min-h-screen ${isImmersivePrank ? "bg-black" : "bg-slate-950"}`}>
      {!isImmersivePrank && <PranxHeader activeSlug={slug} />}
      {renderContent()}
    </div>
  );
}
