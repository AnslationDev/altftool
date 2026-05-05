import { Suspense } from "react";
import SearchContent from "./SearchContent";

export default function Page() {
  return (
    <Suspense fallback={<div className="py-24 text-center">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
