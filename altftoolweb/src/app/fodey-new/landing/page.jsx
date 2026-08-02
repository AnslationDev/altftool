"use client";

import LandingInfo from "@/app/fodey-new/components/LandingInfo";

export default function LandingPage() {
  // LandingInfo is shared with /fodey-new, where it is one tab panel inside a
  // page that already has an H1 in its masthead — so its hero heading is an
  // h2. This route renders the panel on its own, with no masthead and no
  // global site chrome (/fodey-new is a self-chrome experience), which would
  // otherwise leave it with no H1 at all. This names the route; it is
  // screen-reader-only because the panel's own hero is the visual heading, and
  // it renders unconditionally so it survives with JS off.
  return (
    <>
      <h1 className="sr-only">AltF Maker Studio: creative generators</h1>
      <LandingInfo />
    </>
  );
}
