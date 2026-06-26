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

export function drawElement(ctx, rc, el, imageCache = {}, accent = ACCENT) {
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
      opts.stroke = accent;
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

export function drawSelection(ctx, elements, selectedIds, camera, accent = ACCENT) {
  const bounds = getSelectedBounds(elements, selectedIds);
  if (!bounds) return;
  ctx.save();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.5 / camera.zoom;
  ctx.setLineDash([6 / camera.zoom, 4 / camera.zoom]);
  ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
  ctx.setLineDash([]);
  getHandles(bounds, camera.zoom).forEach((handle) => {
    ctx.fillStyle = handle.name === "rotate" ? accent : "#ffffff";
    ctx.strokeStyle = accent;
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

const NODE_TYPES = new Set(['rectangle', 'diamond', 'ellipse', 'text', 'image', 'frame']);

export function autoLayout(elements, options = {}) {
  if (!elements?.length) return elements;

  const nodeSpacing = options.nodeSpacing ?? 200;
  const layerSpacing = options.layerSpacing ?? 140;
  const padding = options.padding ?? 80;

  const nodes = elements.filter(el => NODE_TYPES.has(el.type));
  const arrows = elements.filter(el => el.type === 'arrow');

  // Build directed graph from arrow bindings
  const children = new Map();
  const parents = new Map();

  for (const arrow of arrows) {
    if (arrow.boundStartId && arrow.boundEndId && arrow.boundStartId !== arrow.boundEndId) {
      if (!children.has(arrow.boundStartId)) children.set(arrow.boundStartId, []);
      if (!parents.has(arrow.boundEndId)) parents.set(arrow.boundEndId, []);
      children.get(arrow.boundStartId).push(arrow.boundEndId);
      parents.get(arrow.boundEndId).push(arrow.boundStartId);
    }
  }

  const nodeIdSet = new Set(nodes.map(n => n.id));
  const connectedIds = new Set(
    [...new Set([...children.keys(), ...parents.keys()])].filter(id => nodeIdSet.has(id))
  );

  // Find connected components
  const adjacency = new Map();
  for (const id of connectedIds) {
    adjacency.set(id, [...(children.get(id) || []), ...(parents.get(id) || [])]);
  }
  const components = [];
  const visited = new Set();
  for (const id of connectedIds) {
    if (visited.has(id)) continue;
    const comp = [];
    const stack = [id];
    while (stack.length) {
      const cur = stack.pop();
      if (visited.has(cur)) continue;
      visited.add(cur);
      comp.push(cur);
      for (const nb of (adjacency.get(cur) || [])) {
        if (!visited.has(nb)) stack.push(nb);
      }
    }
    components.push(comp);
  }

  // Assign layers
  const layers = new Map();
  for (const comp of components) {
    const queue = comp.filter(id => !parents.has(id) || parents.get(id).length === 0).map(id => ({ id, l: 0 }));
    const inQ = new Set(queue.map(q => q.id));
    for (let qi = 0; qi < queue.length; qi++) {
      const { id, l } = queue[qi];
      const prev = layers.get(id);
      if (prev !== undefined && prev >= l) continue;
      layers.set(id, l);
      for (const child of (children.get(id) || [])) {
        if (!comp.includes(child)) continue;
        if (inQ.has(child)) {
          const existing = queue.find(q => q.id === child);
          if (existing) existing.l = Math.max(existing.l, l + 1);
        } else {
          queue.push({ id: child, l: l + 1 });
          inQ.add(child);
        }
      }
    }
    for (const id of comp) {
      if (!layers.has(id)) {
        layers.set(id, Math.max(...layers.values(), 0) + 1);
      }
    }
  }

  // Layer → node groups
  const maxLayer = layers.size ? Math.max(...layers.values()) : -1;
  const layerBuckets = [];
  for (let l = 0; l <= maxLayer; l++) layerBuckets.push([]);
  for (const [id, l] of layers) layerBuckets[l].push(id);

  // Component-based vertical offset
  const positions = new Map();
  let componentOffsetY = 0;

  for (const comp of components) {
    const compLayers = [];
    const compMin = Math.min(...comp.map(id => layers.get(id) ?? 0));
    const compMax = Math.max(...comp.map(id => layers.get(id) ?? 0));
    for (let l = compMin; l <= compMax; l++) {
      const ids = comp.filter(id => (layers.get(id) ?? -1) === l);
      if (ids.length) compLayers.push(ids);
    }
    for (const layerIds of compLayers) {
      const count = layerIds.length;
      const totalWidth = (count - 1) * nodeSpacing;
      const startX = -totalWidth / 2;
      for (let i = 0; i < count; i++) {
        const id = layerIds[i];
        positions.set(id, {
          x: startX + i * nodeSpacing,
          y: componentOffsetY + ((layers.get(id) ?? 0) - compMin) * layerSpacing,
        });
      }
    }
    componentOffsetY += (compMax - compMin + 1) * layerSpacing + padding;
  }

  // Unconnected nodes → tiled grid below
  const unconnectedIds = [...nodeIdSet].filter(id => !connectedIds.has(id));
  if (unconnectedIds.length) {
    const cols = Math.max(1, Math.ceil(Math.sqrt(unconnectedIds.length)));
    for (let i = 0; i < unconnectedIds.length; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      positions.set(unconnectedIds[i], {
        x: (col - (cols - 1) / 2) * nodeSpacing,
        y: componentOffsetY + row * layerSpacing,
      });
    }
  }

  if (!positions.size) return elements;

  // Build a map of original node bounds before moving
  const origBounds = new Map();
  for (const el of elements) {
    if (NODE_TYPES.has(el.type)) {
      origBounds.set(el.id, boundsOf(el));
    }
  }

  // Compute group offsets so grouped nodes stay together
  const groupCenters = new Map();
  for (const el of nodes) {
    for (const gId of (el.groupIds || [])) {
      if (!groupCenters.has(gId)) groupCenters.set(gId, { count: 0, x: 0, y: 0 });
      const c = groupCenters.get(gId);
      c.count++;
      c.x += el.x + (el.width || 0) / 2;
      c.y += el.y + (el.height || 0) / 2;
    }
  }
  for (const [, c] of groupCenters) {
    c.x /= c.count;
    c.y /= c.count;
  }

  const groupOffsets = new Map();
  for (const el of nodes) {
    for (const gId of (el.groupIds || [])) {
      const c = groupCenters.get(gId);
      if (c) {
        const key = `${gId}-${el.id}`;
        groupOffsets.set(key, {
          dx: el.x + (el.width || 0) / 2 - c.x,
          dy: el.y + (el.height || 0) / 2 - c.y,
        });
      }
    }
  }

  // Apply positions, preserving group cohesion
  const nodeMidpoints = new Map();
  for (const el of nodes) {
    const pos = positions.get(el.id);
    if (!pos) continue;
    nodeMidpoints.set(el.id, { ...pos });
  }

  // For grouped nodes, compute group center from layout positions
  const groupLayoutCenters = new Map();
  for (const [gId, c] of groupCenters) {
    let cx = 0, cy = 0, count = 0;
    const memberIds = nodes.filter(el => (el.groupIds || []).includes(gId)).map(el => el.id);
    for (const mid of memberIds) {
      const p = nodeMidpoints.get(mid);
      if (p) { cx += p.x; cy += p.y; count++; }
    }
    if (count) groupLayoutCenters.set(gId, { x: cx / count, y: cy / count, count });
  }

  // Create final positions respecting groups
  const finalPositions = new Map();
  const placedInGroup = new Set();

  // First pass: place group members relative to their group layout center
  for (const el of nodes) {
    const gIds = el.groupIds || [];
    if (!gIds.length) continue;
    const gId = gIds[0];
    const glc = groupLayoutCenters.get(gId);
    const orig = origBounds.get(el.id);
    if (glc && orig) {
      const offKey = `${gId}-${el.id}`;
      const off = groupOffsets.get(offKey);
      if (off) {
        finalPositions.set(el.id, {
          x: glc.x + off.dx - orig.width / 2,
          y: glc.y + off.dy,
        });
        placedInGroup.add(el.id);
      }
    }
  }

  // Second pass: place remaining nodes at their individual position
  for (const el of nodes) {
    if (placedInGroup.has(el.id)) continue;
    const pos = positions.get(el.id);
    const orig = origBounds.get(el.id);
    if (pos && orig) {
      finalPositions.set(el.id, {
        x: pos.x - orig.width / 2,
        y: pos.y,
      });
    }
  }

  let result = elements.map(el => {
    const fp = finalPositions.get(el.id);
    if (fp) return { ...el, x: fp.x, y: fp.y };
    return el;
  });

  // Reconnect arrows between repositioned nodes
  result = result.map(el => {
    if (el.type !== 'arrow') return el;

    const startNode = el.boundStartId && result.find(n => n.id === el.boundStartId);
    const endNode = el.boundEndId && result.find(n => n.id === el.boundEndId);

    if (startNode && endNode) {
      const sb = boundsOf(startNode);
      const eb = boundsOf(endNode);
      const startX = sb.x + sb.width / 2;
      const startY = sb.y + sb.height;
      const endX = eb.x + eb.width / 2;
      const endY = eb.y;
      return { ...el, points: [[startX, startY], [endX, endY]] };
    }

    if (startNode && !endNode) {
      const sb = boundsOf(startNode);
      const oldStart = el.points?.[0];
      if (oldStart) {
        const startX = sb.x + sb.width / 2;
        const startY = sb.y + sb.height;
        return { ...el, points: [[startX, startY], oldStart] };
      }
    }

    if (!startNode && endNode) {
      const eb = boundsOf(endNode);
      const oldEnd = el.points?.[el.points.length - 1];
      if (oldEnd) {
        const endX = eb.x + eb.width / 2;
        const endY = eb.y;
        return { ...el, points: [oldEnd, [endX, endY]] };
      }
    }

    return el;
  });

  return normalizeScene(result);
}
