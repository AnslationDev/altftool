// No generateMetadata here on purpose. layout.jsx already resolves the
// record and builds metadata from the store's own name and offers; Next takes the deepest
// segment's metadata, so the hardcoded title that used to live here
// overrode all of it and every URL in this family shipped the same one.

import PageView from "./PageView";

export default function Page(props) {
  return <PageView {...props} />;
}
