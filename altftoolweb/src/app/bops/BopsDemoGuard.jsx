"use client";

import { useEffect, useRef } from "react";
import { isBopsDemoActionLabel } from "./demoGuardPolicy";

const DEMO_SENTINEL = "#demo-only";

function isPlaceholderDestination(rawHref) {
  if (typeof rawHref !== "string") return false;
  const href = rawHref.trim();
  if (!href) return false;
  if (href === DEMO_SENTINEL) return true;
  if (/^(?:tel|mailto):/i.test(href)) return true;

  try {
    const parsed = new URL(href, window.location.href);
    return (
      parsed.hostname.toLowerCase() === "example.com" &&
      parsed.pathname.toLowerCase().startsWith("/quote/")
    );
  } catch {
    return false;
  }
}

function hasDemoActionLabel(element) {
  const label = [
    element.getAttribute("aria-label"),
    element.getAttribute("title"),
    element.textContent,
    element instanceof HTMLInputElement ? element.value : "",
  ]
    .filter(Boolean)
    .join(" ");
  return isBopsDemoActionLabel(label);
}

function disableDemoAction(element) {
  if (element.dataset.bopsDemoAction === "disabled") return;
  element.dataset.bopsDemoAction = "disabled";
  element.setAttribute("aria-disabled", "true");
  element.setAttribute("title", "Unavailable in this design demonstration");

  if (element instanceof HTMLAnchorElement) {
    element.removeAttribute("href");
    element.tabIndex = -1;
  } else if (
    element instanceof HTMLButtonElement ||
    element instanceof HTMLInputElement
  ) {
    element.disabled = true;
  } else if (element instanceof HTMLFormElement) {
    element.removeAttribute("action");
  }
}

function disablePlaceholderActions(root) {
  for (const element of root.querySelectorAll(
    "a[href], form[action], button[formaction], input[formaction]",
  )) {
    const href =
      element.getAttribute("href") ||
      element.getAttribute("action") ||
      element.getAttribute("formaction");
    if (isPlaceholderDestination(href)) disableDemoAction(element);
  }

  for (const element of root.querySelectorAll("a, button, input[type='submit']")) {
    if (!hasDemoActionLabel(element)) continue;
    disableDemoAction(element);
    const form = element.closest("form");
    if (form) form.dataset.bopsDemoForm = "disabled";
  }
}

/**
 * Makes legacy placeholder quote and phone controls genuinely inert while the
 * BOPS prototypes remain available for visual review. Source data is cleaned
 * too; this runtime guard covers direct landers and future nested components.
 */
export default function BopsDemoGuard({ children }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    disablePlaceholderActions(root);
    const observer = new MutationObserver(() => disablePlaceholderActions(root));
    observer.observe(root, { childList: true, subtree: true });

    const stopDisabledAction = (event) => {
      const target = event.target instanceof Element ? event.target : null;
      const action = target?.closest("[data-bops-demo-action='disabled']");
      if (!action) return;
      event.preventDefault();
      event.stopPropagation();
    };

    const stopDemoForm = (event) => {
      if (!(event.target instanceof HTMLFormElement)) return;
      if (event.target.dataset.bopsDemoForm !== "disabled") return;
      event.preventDefault();
      event.stopPropagation();
    };

    root.addEventListener("click", stopDisabledAction, true);
    root.addEventListener("auxclick", stopDisabledAction, true);
    root.addEventListener("submit", stopDemoForm, true);

    return () => {
      observer.disconnect();
      root.removeEventListener("click", stopDisabledAction, true);
      root.removeEventListener("auxclick", stopDisabledAction, true);
      root.removeEventListener("submit", stopDemoForm, true);
    };
  }, []);

  return (
    <div ref={rootRef} data-bops-demo-root>
      {children}
    </div>
  );
}
