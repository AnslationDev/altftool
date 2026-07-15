"use client";

import { Search } from "lucide-react";
import useTrace from "../hooks/useTrace";
import ToolHeader from "../components/ToolHeader.jsx";
import TraceInput from "../components/TraceInput.jsx";
import TraceProgress from "../components/TraceProgress.jsx";
import RedirectFlow from "../components/RedirectFlow.jsx";
import RedirectDetails from "../components/RedirectDetails.jsx";
import ResponseHeaders from "../components/ResponseHeaders.jsx";
import {
  ExportResults,
  FinalDestination,
  RedirectSummary,
  ResponseTimeline,
} from "../components/SidebarCards.jsx";
import RelatedTools from "../components/RelatedTools.jsx";
import { CARD } from "../components/ui.jsx";

function EmptyState() {
  return (
    <div className={`${CARD} flex flex-col items-center justify-center gap-3 p-10 text-center`}>
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-(--muted) text-(--muted-foreground)">
        <Search size={26} aria-hidden="true" />
      </span>
      <p className="text-sm font-bold text-(--foreground)">No trace yet</p>
      <p className="max-w-[320px] text-xs leading-5 text-(--muted-foreground)">
        Enter a URL above and press “Trace Redirects” — the full redirect chain, status codes,
        response times, and headers will appear here.
      </p>
    </div>
  );
}

export default function WhereGoesApp() {
  const { status, result, error, tracedUrl, elapsedMs, trace, cancel } = useTrace();
  const hasResult = status === "done" && result;
  const loading = status === "loading";

  return (
    <div className="font-secondary space-y-4 pb-2 text-(--foreground) sm:space-y-5">
      <ToolHeader />

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* main column */}
        <div className="min-w-0 space-y-4">
          <TraceInput status={status} error={error} onTrace={trace} />

          {loading && <TraceProgress url={tracedUrl} elapsedMs={elapsedMs} onCancel={cancel} />}

          {!hasResult && !loading && <EmptyState />}

          {hasResult && (
            <>
              <RedirectFlow chain={result.chain} />
              <RedirectDetails chain={result.chain} />
              <ResponseHeaders step={result.finalStep} />
            </>
          )}
        </div>

        {/* sidebar */}
        {hasResult && (
          <div className="min-w-0 space-y-4">
            <RedirectSummary result={result} />
            <FinalDestination result={result} />
            <ResponseTimeline result={result} />
            <ExportResults result={result} />
          </div>
        )}
      </div>

      <RelatedTools />
    </div>
  );
}
