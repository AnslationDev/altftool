export const PASSPORT_MASK_PRESETS = {
  mrz: {
    label: "MRZ bottom zone",
    xRatio: 0.04,
    yRatio: 0.74,
    widthRatio: 0.92,
    heightRatio: 0.22,
  },
  passportNumber: {
    label: "Passport number",
    xRatio: 0.55,
    yRatio: 0.14,
    widthRatio: 0.38,
    heightRatio: 0.1,
  },
  face: {
    label: "Face",
    xRatio: 0.06,
    yRatio: 0.22,
    widthRatio: 0.32,
    heightRatio: 0.52,
  },
  custom: {
    label: "Custom area",
    xRatio: 0.25,
    yRatio: 0.35,
    widthRatio: 0.5,
    heightRatio: 0.2,
  },
};

function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function safeBounds(bounds) {
  return {
    width: Math.max(1, finiteNumber(bounds?.width, 1)),
    height: Math.max(1, finiteNumber(bounds?.height, 1)),
  };
}

export function clamp(value, minimum, maximum) {
  return Math.min(Math.max(finiteNumber(value, minimum), minimum), maximum);
}

export function clampMask(mask, bounds, minimumSize = 1) {
  const safe = safeBounds(bounds);
  const minWidth = Math.min(
    Math.max(1, finiteNumber(minimumSize, 1)),
    safe.width,
  );
  const minHeight = Math.min(
    Math.max(1, finiteNumber(minimumSize, 1)),
    safe.height,
  );
  const width = clamp(mask?.width, minWidth, safe.width);
  const height = clamp(mask?.height, minHeight, safe.height);

  return {
    ...mask,
    x: clamp(mask?.x, 0, safe.width - width),
    y: clamp(mask?.y, 0, safe.height - height),
    width,
    height,
  };
}

export function normalizeDrag(start, end, bounds, minimumSize = 1) {
  const safe = safeBounds(bounds);
  const startX = clamp(start?.x, 0, safe.width);
  const startY = clamp(start?.y, 0, safe.height);
  const endX = clamp(end?.x, 0, safe.width);
  const endY = clamp(end?.y, 0, safe.height);

  return clampMask(
    {
      x: Math.min(startX, endX),
      y: Math.min(startY, endY),
      width: Math.abs(endX - startX),
      height: Math.abs(endY - startY),
    },
    safe,
    minimumSize,
  );
}

export function transformMask(mask, action, bounds, minimumSize = 12) {
  const safe = safeBounds(bounds);
  const current = clampMask(mask, safe, minimumSize);
  const deltaX = finiteNumber(action?.dx);
  const deltaY = finiteNumber(action?.dy);

  if (action?.kind === "move") {
    return clampMask(
      {
        ...current,
        x: current.x + deltaX,
        y: current.y + deltaY,
      },
      safe,
      minimumSize,
    );
  }

  if (action?.kind !== "resize") return current;

  const handle = action.handle || "se";
  let left = current.x;
  let top = current.y;
  let right = current.x + current.width;
  let bottom = current.y + current.height;

  if (handle.includes("w")) {
    left = clamp(left + deltaX, 0, right - minimumSize);
  }
  if (handle.includes("e")) {
    right = clamp(right + deltaX, left + minimumSize, safe.width);
  }
  if (handle.includes("n")) {
    top = clamp(top + deltaY, 0, bottom - minimumSize);
  }
  if (handle.includes("s")) {
    bottom = clamp(bottom + deltaY, top + minimumSize, safe.height);
  }

  return {
    ...current,
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
}

export function hitTestMasks(masks, point, handleSize = 10) {
  const x = finiteNumber(point?.x);
  const y = finiteNumber(point?.y);
  const radius = Math.max(1, finiteNumber(handleSize, 10));
  const handles = [
    ["nw", (mask) => [mask.x, mask.y]],
    ["ne", (mask) => [mask.x + mask.width, mask.y]],
    ["sw", (mask) => [mask.x, mask.y + mask.height]],
    ["se", (mask) => [mask.x + mask.width, mask.y + mask.height]],
  ];

  for (let index = masks.length - 1; index >= 0; index -= 1) {
    const mask = masks[index];

    for (const [handle, coordinates] of handles) {
      const [handleX, handleY] = coordinates(mask);
      if (Math.abs(x - handleX) <= radius && Math.abs(y - handleY) <= radius) {
        return { id: mask.id, part: "resize", handle };
      }
    }

    if (
      x >= mask.x &&
      x <= mask.x + mask.width &&
      y >= mask.y &&
      y <= mask.y + mask.height
    ) {
      return { id: mask.id, part: "move", handle: null };
    }
  }

  return null;
}

export function createPresetMask(presetKey, bounds, id) {
  const preset =
    PASSPORT_MASK_PRESETS[presetKey] || PASSPORT_MASK_PRESETS.custom;
  const safe = safeBounds(bounds);

  return clampMask(
    {
      id,
      preset: presetKey in PASSPORT_MASK_PRESETS ? presetKey : "custom",
      label: preset.label,
      x: Math.round(preset.xRatio * safe.width),
      y: Math.round(preset.yRatio * safe.height),
      width: Math.round(preset.widthRatio * safe.width),
      height: Math.round(preset.heightRatio * safe.height),
    },
    safe,
  );
}

export function maskToIntegerPixels(mask, bounds) {
  const safe = safeBounds(bounds);
  const clamped = clampMask(mask, safe, 1);
  const x = Math.floor(clamped.x);
  const y = Math.floor(clamped.y);
  const right = Math.min(safe.width, Math.ceil(clamped.x + clamped.width));
  const bottom = Math.min(safe.height, Math.ceil(clamped.y + clamped.height));

  return {
    x,
    y,
    width: Math.max(1, right - x),
    height: Math.max(1, bottom - y),
  };
}

export function getExportSpec(format, originalName = "passport") {
  const normalizedFormat = format === "jpeg" ? "jpeg" : "png";
  const extension = normalizedFormat === "jpeg" ? "jpg" : "png";
  const mimeType = normalizedFormat === "jpeg" ? "image/jpeg" : "image/png";
  const withoutExtension = String(originalName).replace(/\.[^./\\]+$/, "");
  const safeBaseName =
    withoutExtension
      .normalize("NFKC")
      .replace(/[^\p{L}\p{N}_-]+/gu, "-")
      .replace(/^-+|-+$/g, "") || "passport";

  return {
    format: normalizedFormat,
    mimeType,
    extension,
    filename: `${safeBaseName}-masked.${extension}`,
    quality: normalizedFormat === "jpeg" ? 0.92 : undefined,
  };
}
