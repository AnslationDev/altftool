"use client";

import { findPrank, standalonePrankComponents } from "./data/pranxData";
import PranxHeader from "./components/PranxHeader";
import HomePage from "./components/HomePage";
import NotFoundPrank from "./components/NotFoundPrank";
import PrankFrame from "./components/PrankFrame";
import RenderPrank from "./pranks/RenderPrank";

const wideComponents = new Set(["matrix", "pipes", "dvd", "static"]);
const immersivePranksWithoutVisibleHeading = new Set([
  "hacker",
  "matrix-code-rain",
  "google-terminal",
  "fake-dos",
  "bios",
  "norton-commander",
  "jurassic-park",
  "jurassic-park/console",
  "static-tv",
]);

export default function PranxApp({ slug }) {
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
          {immersivePranksWithoutVisibleHeading.has(prank.slug) ? (
            <h1 className="sr-only">{prank.title}</h1>
          ) : null}
          <RenderPrank prank={prank} />
        </>
      );
    }

    return (
      <PrankFrame prank={prank}>
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
