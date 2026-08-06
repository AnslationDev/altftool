"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Shuffle, Sparkles } from "lucide-react";
import { HISTORY_DEPTH } from "@altftool/core/detour/randomiser";
import { pushTrail } from "./VisitTrail";

/*
 * The button.
 *
 * Two decisions worth explaining:
 *
 * 1. The next destination is fetched *before* it is needed, on mount and again
 *    after every use. That makes the click instant, and — more importantly —
 *    keeps `window.open` inside the user gesture. Fetching on click would push
 *    the open past the gesture and straight into the popup blocker.
 *
 * 2. External destinations open in a new tab, internal ones navigate in place.
 *    The reference products replace the tab, which means a dead link ends the
 *    session. Keeping Detour open lets you spin again immediately, which is the
 *    behaviour people actually want from a random button.
 *
 * Renders as a real link to /detour/random, so it still works with JavaScript
 * off — the enhancement is the prefetch and the "you landed on…" readout.
 */

const STORAGE_KEY = "altf-detour-seen";

function readHistory() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeHistory(history) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // Private mode or a full quota. The button works fine without history; it
    // just repeats itself sooner.
  }
}

export default function GoButton({
  filters = {},
  label = "Take me somewhere",
  enableShortcut = false,
}) {
  const router = useRouter();
  const [pending, setPending] = useState(null);
  const [landed, setLanded] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const historyRef = useRef([]);
  const abortRef = useRef(null);

  // Callers build `filters` inline, so it is a new object on every render.
  // Depending on it directly would make `prefetch` a new function each render
  // and turn the mount effect below into an endless fetch loop — so identity is
  // taken from the serialised value instead.
  const filterKey = JSON.stringify(filters);

  const query = useCallback(
    (extra = {}) => {
      const params = new URLSearchParams();
      Object.entries({ ...JSON.parse(filterKey), ...extra }).forEach(
        ([key, value]) => {
          if (
            value === undefined ||
            value === null ||
            value === "" ||
            value === false
          ) {
            return;
          }
          params.set(key, Array.isArray(value) ? value.join(",") : String(value));
        },
      );
      return params;
    },
    [filterKey],
  );

  const href = useMemo(() => {
    const search = query().toString();
    return `/detour/random${search ? `?${search}` : ""}`;
  }, [query]);

  const prefetch = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const params = query({
      format: "json",
      seen: historyRef.current.slice(0, HISTORY_DEPTH),
    });

    try {
      const response = await fetch(`/detour/random?${params.toString()}`, {
        signal: controller.signal,
        cache: "no-store",
      });
      if (!response.ok) return;
      setPending(await response.json());
    } catch {
      // Aborted or offline. `pending` stays null and the click falls back to a
      // normal navigation, which is a perfectly good outcome.
    }
  }, [query]);

  useEffect(() => {
    historyRef.current = readHistory();
    prefetch();
    return () => abortRef.current?.abort();
  }, [prefetch]);

  const spin = useCallback(() => {
    if (!pending) return false;

    setSpinning(true);
    const destination = pending;

    historyRef.current = [
      destination.slug,
      ...historyRef.current.filter((slug) => slug !== destination.slug),
    ].slice(0, HISTORY_DEPTH);
    writeHistory(historyRef.current);

    // The no-repeat list above is session-scoped and disposable; the trail is
    // the durable record the visitor can actually go back to.
    pushTrail({
      slug: destination.slug,
      name: destination.name,
      url: destination.url,
      origin: destination.origin,
    });

    if (destination.origin === "altf") {
      router.push(destination.url);
    } else {
      window.open(destination.url, "_blank", "noopener,noreferrer");
      setLanded(destination);
    }

    setPending(null);
    setSpinning(false);
    prefetch();
    return true;
  }, [pending, prefetch, router]);

  const go = (event) => {
    // No prefetched destination yet — let the browser follow the href to the
    // server route, which does the same job a fraction slower.
    if (!pending) return;
    event.preventDefault();
    spin();
  };

  /*
   * Space spins again without reaching for the mouse.
   *
   * Only bound when `enableShortcut` is set, so the hero owns it and the copy
   * of this button in the browse sidebar does not fight it. Ignored while a
   * field is focused or a modifier is held, otherwise it eats the space bar for
   * anyone typing in the search box.
   */
  useEffect(() => {
    if (!enableShortcut) return undefined;

    const onKeyDown = (event) => {
      if (event.code !== "Space" && event.key !== " ") return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const active = document.activeElement;
      const tag = active?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        tag === "BUTTON" ||
        tag === "A" ||
        active?.isContentEditable
      ) {
        return;
      }

      // Space also scrolls; only swallow it once we know we are acting on it.
      event.preventDefault();
      spin();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enableShortcut, spin]);

  return (
    <div className="flex flex-col items-center gap-5">
      <Link
        href={href}
        onClick={go}
        prefetch={false}
        className="dtr-go text-center text-2xl sm:text-3xl"
        data-spinning={spinning ? "true" : "false"}
      >
        <Shuffle className="mb-1 h-6 w-6" aria-hidden="true" />
        <span>{label}</span>
        <span className="text-xs font-semibold uppercase tracking-[0.16em] opacity-70">
          anywhere but here
        </span>
      </Link>

      <div className="min-h-14 max-w-sm text-center" aria-live="polite">
        {landed ? (
          <p className="dtr-fade-in text-sm text-muted-foreground">
            Opened{" "}
            <a
              href={landed.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-foreground underline-offset-2 hover:underline"
            >
              {landed.name}
              <ArrowUpRight className="ml-0.5 inline h-3.5 w-3.5" aria-hidden="true" />
            </a>{" "}
            in a new tab.{" "}
            <Link
              href={`/detour/site/${landed.slug}`}
              className="underline-offset-2 hover:underline"
            >
              What is it?
            </Link>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {pending?.origin === "altf" ? (
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Next one is an AltF original.
              </span>
            ) : enableShortcut ? (
              <>
                One button, one detour. Or press{" "}
                <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px]">
                  Space
                </kbd>
                .
              </>
            ) : (
              "One button, one detour. Press it as often as you like."
            )}
          </p>
        )}
      </div>
    </div>
  );
}
