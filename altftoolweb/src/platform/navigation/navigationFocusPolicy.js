export function shouldRestoreDesktopMenuFocus(trigger, activeElement) {
  return Boolean(
    trigger &&
      activeElement &&
      trigger !== activeElement &&
      trigger.parentElement?.contains(activeElement),
  );
}

export function isVisibleFocusable(element) {
  if (!element || element.hasAttribute("disabled")) return false;
  if (element.getAttribute("aria-hidden") === "true") return false;
  return typeof element.checkVisibility === "function"
    ? element.checkVisibility()
    : element.getClientRects().length > 0;
}
