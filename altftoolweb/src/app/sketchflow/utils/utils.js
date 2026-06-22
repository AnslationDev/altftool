import { DEFAULT_STYLE, ACCENT } from './constants';
import { nanoid } from 'nanoid';
import getStroke from 'perfect-freehand';
import rough from 'roughjs/bundled/rough.esm';

export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function normalizeScene(scene = []) {
  return scene.map(normalizeElement);
}

export function sceneKey(scene = []) {
  return JSON.stringify(normalizeScene(scene));
}

export function scenesEqual(a = [], b = []) {
  return sceneKey(a) === sceneKey(b);
}

export function makeElement(type, x, y, style = {}) {
  return {
    id: nanoid(10),
    type,
    x,
    y,
    width: 1,
    height: 1,
    angle: 0,
    strokeColor: style.strokeColor ?? DEFAULT_STYLE.strokeColor,
    backgroundColor: style.backgroundColor ?? DEFAULT_STYLE.backgroundColor,
    fillStyle: style.fillStyle ?? DEFAULT_STYLE.fillStyle,
    strokeWidth: style.strokeWidth ?? DEFAULT_STYLE.strokeWidth,
    strokeStyle: style.strokeStyle ?? DEFAULT_STYLE.strokeStyle,
    roughness: style.roughness ?? DEFAULT_STYLE.roughness,
    opacity: style.opacity ?? DEFAULT_STYLE.opacity,
    points: type === "arrow" || type === "line" || type === "freedraw" || type === "laser" ? [[x, y], [x, y]] : [],
    text: type === "text" ? "Text" : "",
    fontSize: style.fontSize ?? DEFAULT_STYLE.fontSize,
    fontFamily: style.fontFamily ?? DEFAULT_STYLE.fontFamily,
    textAlign: style.textAlign ?? DEFAULT_STYLE.textAlign,
    hyperlink: "",
    locked: false,
    groupIds: [],
    arrowType: style.arrowType ?? DEFAULT_STYLE.arrowType,
    startArrowhead: style.startArrowhead ?? DEFAULT_STYLE.startArrowhead,
    endArrowhead: style.endArrowhead ?? DEFAULT_STYLE.endArrowhead,
    boundStartId: null,
    boundEndId: null,
    imageSrc: "",
    imageName: "",
  };
}

export function normalizeElement(el) {
  if (!["line", "arrow", "freedraw", "laser"].includes(el.type)) {
    const x = el.width < 0 ? el.x + el.width : el.x;
    const y = el.height < 0 ? el.y + el.height : el.y;
    return { ...el, x, y, width: Math.abs(el.width), height: Math.abs(el.height) };
  }
  return el;
}

export function boundsOf(el) {
  if (["line", "arrow", "freedraw", "laser"].includes(el.type)) {
    const points = el.points?.length ? el.points : [[el.x, el.y]];
    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    return { x: minX, y: minY, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY) };
  }
  return { x: el.x, y: el.y, width: Math.max(1, el.width), height: Math.max(1, el.height) };
}

export function centerOf(el) {
  const b = boundsOf(el);
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
}

export function unrotatePoint(point, center, angle = 0) {
  if (!angle) return point;
  const cos = Math.cos(-angle);
  const sin = Math.sin(-angle);
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  };
}

export function distToSegment(p, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  if (!dx && !dy) return Math.hypot(p.x - a[0], p.y - a[1]);
  const t = Math.max(0, Math.min(1, ((p.x - a[0]) * dx + (p.y - a[1]) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(p.x - (a[0] + t * dx), p.y - (a[1] + t * dy));
}

export function hitElement(el, point, padding = 6) {
  if (el.type === "line" || el.type === "arrow") {
    return distToSegment(point, el.points[0], el.points[el.points.length - 1]) <= padding;
  }
  if (el.type === "freedraw" || el.type === "laser") {
    return el.points.some((p, index) => index && distToSegment(point, el.points[index - 1], p) <= padding);
  }
  const b = boundsOf(el);
  const localPoint = unrotatePoint(point, centerOf(el), el.angle || 0);
  const insideBox =
    localPoint.x >= b.x - padding &&
    localPoint.x <= b.x + b.width + padding &&
    localPoint.y >= b.y - padding &&
    localPoint.y <= b.y + b.height + padding;
  if (!insideBox) return false;
  if (el.type === "ellipse") {
    const rx = Math.max(1, b.width / 2 + padding);
    const ry = Math.max(1, b.height / 2 + padding);
    const cx = b.x + b.width / 2;
    const cy = b.y + b.height / 2;
    return ((localPoint.x - cx) ** 2) / (rx ** 2) + ((localPoint.y - cy) ** 2) / (ry ** 2) <= 1;
  }
  if (el.type === "diamond") {
    const cx = b.x + b.width / 2;
    const cy = b.y + b.height / 2;
    return Math.abs(localPoint.x - cx) / Math.max(1, b.width / 2 + padding) + Math.abs(localPoint.y - cy) / Math.max(1, b.height / 2 + padding) <= 1;
  }
  return insideBox;
}

export function getSelectedBounds(elements, ids) {
  const selected = elements.filter((el) => ids.includes(el.id));
  if (!selected.length) return null;
  const boxes = selected.map(boundsOf);
  const minX = Math.min(...boxes.map((b) => b.x));
  const minY = Math.min(...boxes.map((b) => b.y));
  const maxX = Math.max(...boxes.map((b) => b.x + b.width));
  const maxY = Math.max(...boxes.map((b) => b.y + b.height));
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export function getHandles(bounds, zoom) {
  if (!bounds) return [];
  const size = 10 / zoom;
  const x = bounds.x;
  const y = bounds.y;
  const w = bounds.width;
  const h = bounds.height;
  const points = {
    nw: [x, y],
    n: [x + w / 2, y],
    ne: [x + w, y],
    e: [x + w, y + h / 2],
    se: [x + w, y + h],
    s: [x + w / 2, y + h],
    sw: [x, y + h],
    west: [x, y + h / 2],
    rotate: [x + w / 2, y - 34 / zoom],
  };
  return Object.entries(points).map(([name, [cx, cy]]) => ({ name, x: cx - size / 2, y: cy - size / 2, width: size, height: size, cx, cy }));
}

export function pointInRect(point, rect) {
  return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
}

export function lineDash(style, width) {
  if (style === "dashed") return [width * 5, width * 4];
  if (style === "dotted") return [width, width * 3];
  return [];
}

export function roughOptions(el) {
  const fill = el.backgroundColor === "transparent" ? undefined : el.backgroundColor;
  return {
    stroke: el.strokeColor,
    strokeWidth: el.strokeWidth,
    roughness: el.roughness,
    fill,
    fillStyle: el.fillStyle === "none" ? undefined : el.fillStyle,
    hachureGap: 8,
    strokeLineDash: lineDash(el.strokeStyle, el.strokeWidth),
    preserveVertices: true,
  };
}

export function pathFromStroke(points) {
  if (!points.length) return "";
  const d = points.reduce((acc, [x0, y0], i, arr) => {
    const [x1, y1] = arr[(i + 1) % arr.length];
    acc.push(`${i === 0 ? "M" : "L"} ${x0.toFixed(2)} ${y0.toFixed(2)} Q ${x0.toFixed(2)} ${y0.toFixed(2)} ${((x0 + x1) / 2).toFixed(2)} ${((y0 + y1) / 2).toFixed(2)}`);
    return acc;
  }, []);
  return `${d.join(" ")} Z`;
}

export function drawArrowhead(ctx, start, end, style, color, width) {
  if (!style || style === "none") return;
  const angle = Math.atan2(end[1] - start[1], end[0] - start[0]);
  const size = 10 + width * 2;
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.translate(end[0], end[1]);
  ctx.rotate(angle);
  if (style === "triangle") {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size, size * 0.5);
    ctx.lineTo(-size, -size * 0.5);
    ctx.closePath();
    ctx.fill();
  } else if (style === "dot") {
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.38, 0, Math.PI * 2);
    ctx.fill();
  } else if (style === "bar") {
    ctx.beginPath();
    ctx.moveTo(-2, -size * 0.6);
    ctx.lineTo(-2, size * 0.6);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawElement(ctx, rc, el, imageCache = {}) {
  const opacity = Math.max(0, Math.min(1, el.opacity / 100));
  ctx.save();
  ctx.globalAlpha = opacity;
  const b = boundsOf(el);
  const c = centerOf(el);
  if (!["line", "arrow", "freedraw", "laser"].includes(el.type)) {
    ctx.translate(c.x, c.y);
    ctx.rotate(el.angle || 0);
    ctx.translate(-c.x, -c.y);
  }

  if (el.type === "rectangle" || el.type === "frame") {
    const opts = roughOptions(el);
    if (el.type === "frame") {
      opts.stroke = ACCENT;
      opts.strokeWidth = Math.max(2, el.strokeWidth);
      opts.fill = "transparent";
    }
    rc.rectangle(el.x, el.y, el.width, el.height, opts);
  } else if (el.type === "ellipse") {
    rc.ellipse(el.x + el.width / 2, el.y + el.height / 2, el.width, el.height, roughOptions(el));
  } else if (el.type === "diamond") {
    const x = el.x;
    const y = el.y;
    const w = el.width;
    const h = el.height;
    rc.polygon(
      [
        [x + w / 2, y],
        [x + w, y + h / 2],
        [x + w / 2, y + h],
        [x, y + h / 2],
      ],
      roughOptions(el)
    );
  } else if (el.type === "line" || el.type === "arrow") {
    const pts = el.points || [];
    const opts = roughOptions(el);
    opts.fill = undefined;
    const start = pts[0] || [el.x, el.y];
    const end = pts[pts.length - 1] || [el.x + el.width, el.y + el.height];
    if (el.arrowType === "elbow" && el.type === "arrow") {
      const mid = [end[0], start[1]];
      rc.line(start[0], start[1], mid[0], mid[1], opts);
      rc.line(mid[0], mid[1], end[0], end[1], opts);
      drawArrowhead(ctx, mid, end, el.endArrowhead, el.strokeColor, el.strokeWidth);
      drawArrowhead(ctx, mid, start, el.startArrowhead, el.strokeColor, el.strokeWidth);
    } else if (el.arrowType === "curved" && el.type === "arrow") {
      const mx = (start[0] + end[0]) / 2;
      const my = Math.min(start[1], end[1]) - Math.abs(end[0] - start[0]) * 0.18 - 20;
      ctx.save();
      ctx.strokeStyle = el.strokeColor;
      ctx.lineWidth = el.strokeWidth;
      ctx.setLineDash(lineDash(el.strokeStyle, el.strokeWidth));
      ctx.beginPath();
      ctx.moveTo(start[0], start[1]);
      ctx.quadraticCurveTo(mx, my, end[0], end[1]);
      ctx.stroke();
      ctx.restore();
      drawArrowhead(ctx, [mx, my], end, el.endArrowhead, el.strokeColor, el.strokeWidth);
      drawArrowhead(ctx, [mx, my], start, el.startArrowhead, el.strokeColor, el.strokeWidth);
    } else {
      rc.line(start[0], start[1], end[0], end[1], opts);
      if (el.type === "arrow") {
        drawArrowhead(ctx, start, end, el.endArrowhead, el.strokeColor, el.strokeWidth);
        drawArrowhead(ctx, end, start, el.startArrowhead, el.strokeColor, el.strokeWidth);
      }
    }
  } else if (el.type === "freedraw" || el.type === "laser") {
    const stroke = getStroke(el.points || [], {
      size: Math.max(2, el.strokeWidth * (el.type === "laser" ? 4 : 3)),
      thinning: 0.52,
      smoothing: 0.58,
      streamline: 0.5,
    });
    const path = pathFromStroke(stroke);
    ctx.fillStyle = el.type === "laser" ? "#ef4444" : el.strokeColor;
    const p = new Path2D(path);
    ctx.fill(p);
  } else if (el.type === "text") {
    ctx.fillStyle = el.strokeColor;
    ctx.font = `${el.fontSize}px ${el.fontFamily}`;
    ctx.textAlign = el.textAlign;
    ctx.textBaseline = "top";
    const lines = String(el.text || "").split("\n");
    const x = el.textAlign === "center" ? el.x + el.width / 2 : el.textAlign === "right" ? el.x + el.width : el.x;
    lines.forEach((line, i) => ctx.fillText(line, x, el.y + i * el.fontSize * 1.25));
  } else if (el.type === "image") {
    const image = imageCache[el.id];
    if (image?.complete && image.naturalWidth > 0) {
      try {
        ctx.drawImage(image, el.x, el.y, el.width, el.height);
      } catch {
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(el.x, el.y, el.width, el.height);
        ctx.strokeStyle = el.strokeColor;
        ctx.strokeRect(el.x, el.y, el.width, el.height);
      }
    } else {
      ctx.fillStyle = "#e5e7eb";
      ctx.fillRect(el.x, el.y, el.width, el.height);
      ctx.strokeStyle = el.strokeColor;
      ctx.strokeRect(el.x, el.y, el.width, el.height);
      ctx.fillStyle = "#64748b";
      ctx.font = `${Math.max(12, Math.min(18, el.height / 6))}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Loading image...", el.x + el.width / 2, el.y + el.height / 2);
    }
  }
  ctx.restore();
}

export function drawGrid(ctx, camera, size, step, dark) {
  const scaledStep = Math.max(4, step);
  const left = -camera.x / camera.zoom;
  const top = -camera.y / camera.zoom;
  const right = left + size.width / camera.zoom;
  const bottom = top + size.height / camera.zoom;
  const startX = Math.floor(left / scaledStep) * scaledStep;
  const startY = Math.floor(top / scaledStep) * scaledStep;
  ctx.save();
  ctx.strokeStyle = dark ? "rgba(255,255,255,.08)" : "rgba(15,23,42,.08)";
  ctx.lineWidth = 1 / camera.zoom;
  ctx.beginPath();
  for (let x = startX; x <= right; x += scaledStep) {
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
  }
  for (let y = startY; y <= bottom; y += scaledStep) {
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
  }
  ctx.stroke();
  ctx.restore();
}

export function drawSelection(ctx, elements, selectedIds, camera) {
  const bounds = getSelectedBounds(elements, selectedIds);
  if (!bounds) return;
  ctx.save();
  ctx.strokeStyle = ACCENT;
  ctx.lineWidth = 1.5 / camera.zoom;
  ctx.setLineDash([6 / camera.zoom, 4 / camera.zoom]);
  ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
  ctx.setLineDash([]);
  getHandles(bounds, camera.zoom).forEach((handle) => {
    ctx.fillStyle = handle.name === "rotate" ? ACCENT : "#ffffff";
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 1.5 / camera.zoom;
    ctx.beginPath();
    ctx.roundRect(handle.x, handle.y, handle.width, handle.height, 2 / camera.zoom);
    ctx.fill();
    ctx.stroke();
  });
  ctx.restore();
}

export function textSize(text, fontSize) {
  const lines = String(text || "Text").split("\n");
  const width = Math.max(...lines.map((line) => Math.max(1, line.length) * fontSize * 0.58), 40);
  return { width: width + 10, height: lines.length * fontSize * 1.25 + 8 };
}

export function downloadFile(filename, content, mime) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function ToolButton({ active, label, shortcut, Icon, onClick }) {
  return (
    <button
      type="button"
      title={`${label} (${shortcut})`}
      onClick={onClick}
      className={`sf-icon-btn ${active ? "is-active" : ""}`}
      aria-label={label}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

export function PropertyButton({ active, children, onClick }) {
  return (
    <button type="button" onClick={onClick} className={`sf-prop-btn ${active ? "is-active" : ""}`}>
      {children}
    </button>
  );
}
