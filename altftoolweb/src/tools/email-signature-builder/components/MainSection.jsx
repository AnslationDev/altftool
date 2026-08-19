"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PenLine } from "lucide-react";
import FormPanel from "./FormPanel";
import PreviewPanel from "./PreviewPanel";
import { DEFAULT_STATE } from "../lib/signatureData";
import { renderSignatureHtml } from "../lib/signatureHtml";
import { getRecents, pushRecent, clearRecents, getFavorites, saveFavorite, removeFavorite } from "../lib/exportUtils";

const RECENT_DEBOUNCE_MS = 2500;

export default function MainSection() {
  const [state, setState] = useState(DEFAULT_STATE);
  const [client, setClient] = useState("gmail");
  const [darkPreview, setDarkPreview] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [recents, setRecents] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    setRecents(getRecents());
    setFavorites(getFavorites());
  }, []);

  const previewHtml = useMemo(
    () => renderSignatureHtml(state, { outlookMode: client === "outlook", qrDataUrl }),
    [state, client, qrDataUrl],
  );

  // Copy/download always export the canonical (non-Outlook) markup so the
  // currently-selected preview tab never silently strips styling (e.g.
  // border-radius) from what the user takes away with them.
  const exportHtml = useMemo(
    () => renderSignatureHtml(state, { outlookMode: false, qrDataUrl }),
    [state, qrDataUrl],
  );

  // Auto-save to recents once the user has a name filled in and stops editing.
  useEffect(() => {
    if (!state.personal.fullName.trim()) return undefined;
    const handle = window.setTimeout(() => setRecents(pushRecent(state)), RECENT_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [state]);

  const handleQrDataUrl = useCallback((url) => setQrDataUrl(url), []);

  function handleLoadEntry(entry) {
    // Merge over defaults so entries saved by older versions of the tool
    // never leave a missing key behind.
    setState({ ...DEFAULT_STATE, ...entry.state, sections: { ...DEFAULT_STATE.sections, ...entry.state.sections } });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="bg-(--background) text-(--foreground)">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:py-8">
        <div className="mb-6 text-center sm:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-(--primary)/10 px-3 py-1 text-xs font-semibold text-(--primary)">
            <PenLine className="h-3.5 w-3.5" aria-hidden="true" /> Email Marketing
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Email Signature{" "}
            <span className="bg-gradient-to-r from-(--primary) to-(--secondary) bg-clip-text text-transparent">Builder</span>
          </h1>
          <p className="mt-2 max-w-3xl text-(--muted-foreground) sm:text-lg">
            Design a professional signature with 25+ templates, live client previews and one-click export — the
            generated HTML is table-based and inline-styled so it renders correctly in Gmail, Outlook, Apple Mail and
            Yahoo.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,460px)_1fr]">
          <FormPanel state={state} setState={setState} />
          <div className="xl:sticky xl:top-4">
            <PreviewPanel
              state={state}
              html={previewHtml}
              exportHtml={exportHtml}
              client={client}
              onClientChange={setClient}
              darkPreview={darkPreview}
              onDarkPreviewChange={setDarkPreview}
              onQrDataUrl={handleQrDataUrl}
              onSaveFavorite={() => setFavorites(saveFavorite(state))}
              recents={recents}
              favorites={favorites}
              onLoadEntry={handleLoadEntry}
              onClearRecents={() => setRecents(clearRecents())}
              onRemoveFavorite={(id) => setFavorites(removeFavorite(id))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
