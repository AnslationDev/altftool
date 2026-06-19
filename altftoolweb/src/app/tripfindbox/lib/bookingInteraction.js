"use client";

const HEADER_OFFSET = 92;
const SCROLL_TIMEOUT_MS = 720;

function getScrollContainer(field) {
  return field.closest(".nova-search-panel") ?? field.closest(".flight-search") ?? field;
}

export function getPopupPlacement(field, popupHeight = 420) {
  const rect = field.getBoundingClientRect();
  const safeTop = HEADER_OFFSET + 12;
  const safeBottom = 24;
  const spaceBelow = window.innerHeight - rect.bottom - safeBottom;
  const spaceAbove = rect.top - safeTop;
  const neededSpace = Math.min(popupHeight, Math.max(300, window.innerHeight * 0.52));

  return spaceBelow < neededSpace && spaceAbove > spaceBelow ? "above" : "below";
}

export function scrollBookingSectionToHeader(field) {
  const container = getScrollContainer(field);
  const rect = container.getBoundingClientRect();
  const targetTop = Math.max(0, window.scrollY + rect.top - HEADER_OFFSET);
  const distance = Math.abs(window.scrollY - targetTop);

  if (distance < 18) {
    return Promise.resolve();
  }

  window.scrollTo({ top: targetTop, behavior: "smooth" });

  return new Promise((resolve) => {
    const startedAt = performance.now();

    const check = () => {
      const remaining = Math.abs(window.scrollY - targetTop);
      const timedOut = performance.now() - startedAt > SCROLL_TIMEOUT_MS;

      if (remaining < 8 || timedOut) {
        if (remaining >= 8) {
          window.scrollTo({ top: targetTop, behavior: "auto" });
        }
        resolve();
        return;
      }

      window.requestAnimationFrame(check);
    };

    window.requestAnimationFrame(check);
  });
}

export async function prepareBookingPopup(field, popupHeight) {
  await scrollBookingSectionToHeader(field);
  field.focus({ preventScroll: true });
  return getPopupPlacement(field, popupHeight);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function getFloatingLayerStyle(field, placement, options = {}) {
  const gap = options.gap ?? 14;
  const safe = 16;
  const rect = field.getBoundingClientRect();

  if (window.innerWidth < 768) {
    return {
      position: "fixed",
      left: 12,
      right: 12,
      bottom: 12,
      zIndex: 999999,
    };
  }

  const width = Math.min(options.width ?? rect.width, window.innerWidth - safe * 2);
  const height = Math.min(options.height ?? 420, window.innerHeight - safe * 2);
  const left = clamp(rect.left + rect.width / 2 - width / 2, safe, window.innerWidth - width - safe);
  const top =
    placement === "above"
      ? clamp(rect.top - height - gap, safe, window.innerHeight - height - safe)
      : clamp(rect.bottom + gap, safe, window.innerHeight - height - safe);

  return {
    position: "fixed",
    left,
    top,
    width,
    maxHeight: height,
    zIndex: 999999,
  };
}
