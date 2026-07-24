function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function clamp(value, minimum, maximum) {
  return Math.min(Math.max(finiteNumber(value, minimum), minimum), maximum);
}

function safeBounds(bounds) {
  return {
    width: Math.max(1, finiteNumber(bounds?.width, 1)),
    height: Math.max(1, finiteNumber(bounds?.height, 1)),
  };
}

export function clampRectangle(rectangle, bounds, minimumSize = 1) {
  const safe = safeBounds(bounds);
  const minWidth = Math.min(Math.max(1, finiteNumber(minimumSize, 1)), safe.width);
  const minHeight = Math.min(Math.max(1, finiteNumber(minimumSize, 1)), safe.height);
  const width = clamp(rectangle?.width, minWidth, safe.width);
  const height = clamp(rectangle?.height, minHeight, safe.height);

  return {
    ...rectangle,
    x: clamp(rectangle?.x, 0, safe.width - width),
    y: clamp(rectangle?.y, 0, safe.height - height),
    width,
    height,
  };
}

export function normalizeRectangle(start, end, bounds, minimumSize = 1) {
  const safe = safeBounds(bounds);
  const startX = clamp(start?.x, 0, safe.width);
  const startY = clamp(start?.y, 0, safe.height);
  const endX = clamp(end?.x, 0, safe.width);
  const endY = clamp(end?.y, 0, safe.height);

  return clampRectangle(
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

export function transformRectangle(rectangle, action, bounds, minimumSize = 8) {
  const safe = safeBounds(bounds);
  const current = clampRectangle(rectangle, safe, minimumSize);
  const deltaX = finiteNumber(action?.dx);
  const deltaY = finiteNumber(action?.dy);

  if (action?.kind === "move") {
    return clampRectangle(
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

  if (handle.includes("w")) left = clamp(left + deltaX, 0, right - minimumSize);
  if (handle.includes("e")) right = clamp(right + deltaX, left + minimumSize, safe.width);
  if (handle.includes("n")) top = clamp(top + deltaY, 0, bottom - minimumSize);
  if (handle.includes("s")) bottom = clamp(bottom + deltaY, top + minimumSize, safe.height);

  return {
    ...current,
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
}

export function hitTestRectangles(rectangles, point, handleSize = 10) {
  const x = finiteNumber(point?.x);
  const y = finiteNumber(point?.y);
  const radius = Math.max(1, finiteNumber(handleSize, 10));
  const handles = [
    ["nw", (rect) => [rect.x, rect.y]],
    ["ne", (rect) => [rect.x + rect.width, rect.y]],
    ["sw", (rect) => [rect.x, rect.y + rect.height]],
    ["se", (rect) => [rect.x + rect.width, rect.y + rect.height]],
  ];

  for (let index = rectangles.length - 1; index >= 0; index -= 1) {
    const rectangle = rectangles[index];

    for (const [handle, getCoordinates] of handles) {
      const [handleX, handleY] = getCoordinates(rectangle);
      if (Math.abs(x - handleX) <= radius && Math.abs(y - handleY) <= radius) {
        return { id: rectangle.id, part: "resize", handle };
      }
    }

    if (
      x >= rectangle.x &&
      x <= rectangle.x + rectangle.width &&
      y >= rectangle.y &&
      y <= rectangle.y + rectangle.height
    ) {
      return { id: rectangle.id, part: "move", handle: null };
    }
  }

  return null;
}

function validatePixelInput(input, width, height) {
  const safeWidth = Math.max(1, Math.floor(finiteNumber(width, 1)));
  const safeHeight = Math.max(1, Math.floor(finiteNumber(height, 1)));
  if (!input || input.length !== safeWidth * safeHeight * 4) {
    throw new TypeError("RGBA data length must match width × height × 4.");
  }
  return { width: safeWidth, height: safeHeight };
}

export function pixelateRgba(input, width, height, requestedBlockSize = 12) {
  const dimensions = validatePixelInput(input, width, height);
  const result = new Uint8ClampedArray(input);
  const blockSize = Math.max(1, Math.floor(finiteNumber(requestedBlockSize, 12)));

  for (let blockY = 0; blockY < dimensions.height; blockY += blockSize) {
    for (let blockX = 0; blockX < dimensions.width; blockX += blockSize) {
      const endX = Math.min(blockX + blockSize, dimensions.width);
      const endY = Math.min(blockY + blockSize, dimensions.height);
      const totals = [0, 0, 0, 0];
      let count = 0;

      for (let y = blockY; y < endY; y += 1) {
        for (let x = blockX; x < endX; x += 1) {
          const offset = (y * dimensions.width + x) * 4;
          for (let channel = 0; channel < 4; channel += 1) {
            totals[channel] += input[offset + channel];
          }
          count += 1;
        }
      }

      for (let y = blockY; y < endY; y += 1) {
        for (let x = blockX; x < endX; x += 1) {
          const offset = (y * dimensions.width + x) * 4;
          for (let channel = 0; channel < 4; channel += 1) {
            result[offset + channel] = Math.round(totals[channel] / count);
          }
        }
      }
    }
  }

  return result;
}

export function boxBlurRgba(input, width, height, requestedRadius = 8) {
  const dimensions = validatePixelInput(input, width, height);
  const radius = Math.max(0, Math.floor(finiteNumber(requestedRadius, 8)));
  if (radius === 0) return new Uint8ClampedArray(input);

  const horizontal = new Uint8ClampedArray(input.length);
  const result = new Uint8ClampedArray(input.length);

  for (let y = 0; y < dimensions.height; y += 1) {
    for (let channel = 0; channel < 4; channel += 1) {
      let left = 0;
      let right = Math.min(dimensions.width - 1, radius);
      let sum = 0;

      for (let x = left; x <= right; x += 1) {
        sum += input[(y * dimensions.width + x) * 4 + channel];
      }

      for (let x = 0; x < dimensions.width; x += 1) {
        horizontal[(y * dimensions.width + x) * 4 + channel] = sum / (right - left + 1);
        const nextLeft = Math.max(0, x + 1 - radius);
        const nextRight = Math.min(dimensions.width - 1, x + 1 + radius);
        if (nextLeft > left) sum -= input[(y * dimensions.width + left) * 4 + channel];
        if (nextRight > right) sum += input[(y * dimensions.width + nextRight) * 4 + channel];
        left = nextLeft;
        right = nextRight;
      }
    }
  }

  for (let x = 0; x < dimensions.width; x += 1) {
    for (let channel = 0; channel < 4; channel += 1) {
      let top = 0;
      let bottom = Math.min(dimensions.height - 1, radius);
      let sum = 0;

      for (let y = top; y <= bottom; y += 1) {
        sum += horizontal[(y * dimensions.width + x) * 4 + channel];
      }

      for (let y = 0; y < dimensions.height; y += 1) {
        result[(y * dimensions.width + x) * 4 + channel] = Math.round(
          sum / (bottom - top + 1),
        );
        const nextTop = Math.max(0, y + 1 - radius);
        const nextBottom = Math.min(dimensions.height - 1, y + 1 + radius);
        if (nextTop > top) sum -= horizontal[(top * dimensions.width + x) * 4 + channel];
        if (nextBottom > bottom) {
          sum += horizontal[(nextBottom * dimensions.width + x) * 4 + channel];
        }
        top = nextTop;
        bottom = nextBottom;
      }
    }
  }

  return result;
}

function luminance(data, offset) {
  return (data[offset] * 3 + data[offset + 1] * 6 + data[offset + 2]) / 10;
}

export function suggestTextLikeRegions(
  input,
  width,
  height,
  { columns = 12, rows = 10, maxSuggestions = 6, minimumScore = 24 } = {},
) {
  const dimensions = validatePixelInput(input, width, height);
  const safeColumns = clamp(Math.floor(finiteNumber(columns, 12)), 2, dimensions.width);
  const safeRows = clamp(Math.floor(finiteNumber(rows, 10)), 2, dimensions.height);
  const cellWidth = dimensions.width / safeColumns;
  const cellHeight = dimensions.height / safeRows;
  const scores = Array.from({ length: safeRows }, () => Array(safeColumns).fill(0));
  const allScores = [];

  for (let row = 0; row < safeRows; row += 1) {
    const startY = Math.floor(row * cellHeight);
    const endY = Math.min(dimensions.height, Math.ceil((row + 1) * cellHeight));

    for (let column = 0; column < safeColumns; column += 1) {
      const startX = Math.floor(column * cellWidth);
      const endX = Math.min(dimensions.width, Math.ceil((column + 1) * cellWidth));
      let edgeTotal = 0;
      let samples = 0;

      for (let y = startY; y < endY; y += 1) {
        for (let x = Math.max(startX + 1, 1); x < endX; x += 1) {
          const offset = (y * dimensions.width + x) * 4;
          const leftOffset = offset - 4;
          edgeTotal += Math.abs(luminance(input, offset) - luminance(input, leftOffset));
          samples += 1;
        }
      }

      const score = samples ? edgeTotal / samples : 0;
      scores[row][column] = score;
      allScores.push(score);
    }
  }

  const averageScore =
    allScores.reduce((total, score) => total + score, 0) / Math.max(1, allScores.length);
  const threshold = Math.max(finiteNumber(minimumScore, 24), averageScore * 1.2);
  const candidates = [];

  for (let row = 0; row < safeRows; row += 1) {
    let column = 0;
    while (column < safeColumns) {
      if (scores[row][column] < threshold) {
        column += 1;
        continue;
      }

      const startColumn = column;
      let scoreTotal = 0;
      let scoreCount = 0;
      while (column < safeColumns && scores[row][column] >= threshold) {
        scoreTotal += scores[row][column];
        scoreCount += 1;
        column += 1;
      }

      const x = Math.floor(startColumn * cellWidth);
      const y = Math.floor(row * cellHeight);
      candidates.push({
        x,
        y,
        width: Math.min(
          dimensions.width - x,
          Math.ceil((column - startColumn) * cellWidth),
        ),
        height: Math.min(dimensions.height - y, Math.ceil(cellHeight)),
        score: scoreTotal / scoreCount,
      });
    }
  }

  return candidates
    .sort((left, right) => right.score - left.score)
    .slice(0, Math.max(1, Math.floor(finiteNumber(maxSuggestions, 6))));
}
