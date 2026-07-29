import PageView from "./PageView";

// No generateMetadata here on purpose. layout.jsx already resolves the
// extension from Firestore and builds real per-extension metadata — title,
// description, OG image and keywords. Next takes the deepest segment's
// metadata, so the hardcoded version that used to live here overrode all of
// it, and every one of the 57 /extensions/<slug> URLs shipped the identical
// title "Chrome Extension Details & Features | AltFTool Extensions". The
// layout's work was written, correct, and entirely dead.

export default function Page(props) {
  return <PageView {...props} />;
}
