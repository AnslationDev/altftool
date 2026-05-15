import React, { useCallback, useEffect, useRef } from 'react';

const ISO_COS = Math.cos(Math.PI / 6);
const ISO_SIN = Math.sin(Math.PI / 6);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const shadeColor = (hex, amount) => {
  const color = hex.replace('#', '');
  const value = parseInt(color.length === 3 ? color.split('').map((c) => c + c).join('') : color, 16);
  const r = clamp((value >> 16) + amount, 0, 255);
  const g = clamp(((value >> 8) & 255) + amount, 0, 255);
  const b = clamp((value & 255) + amount, 0, 255);
  return `rgb(${r}, ${g}, ${b})`;
};

const drawPolygon = (ctx, points, fill, stroke = 'rgba(255,255,255,0.12)') => {
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1;
  ctx.stroke();
};

const CanvasScene = ({ objects, selectedId, onSelect, isLocked, onUpdate }) => {
  const canvasRef = useRef(null);
  const hitZonesRef = useRef([]);
  const dragRef = useRef(null);

  const drawScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const center = { x: rect.width / 2, y: rect.height * 0.58 };
    const scale = Math.max(34, Math.min(58, rect.width / 12));
    const depthTilt = isLocked ? 1 : 0.72;

    const project = ([x = 0, y = 0, z = 0]) => ({
      x: center.x + (x - z * depthTilt) * scale * ISO_COS,
      y: center.y + (x + z * depthTilt) * scale * ISO_SIN - y * scale,
    });

    const background = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    background.addColorStop(0, '#020617');
    background.addColorStop(0.55, '#0f172a');
    background.addColorStop(1, '#111827');
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, rect.width, rect.height);

    ctx.save();
    ctx.globalAlpha = 0.32;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    for (let i = -10; i <= 10; i += 1) {
      const a = project([i, 0, -10]);
      const b = project([i, 0, 10]);
      const c = project([-10, 0, i]);
      const d = project([10, 0, i]);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(d.x, d.y);
      ctx.stroke();
    }
    ctx.restore();

    hitZonesRef.current = [];

    const drawCube = (obj, selected) => {
      const [sx = 1, sy = 1, sz = 1] = obj.scale || [1, 1, 1];
      const [x = 0, y = 0, z = 0] = obj.position || [0, 0, 0];
      const base = obj.color || '#3b82f6';
      const p000 = project([x - sx / 2, y, z - sz / 2]);
      const p100 = project([x + sx / 2, y, z - sz / 2]);
      const p110 = project([x + sx / 2, y, z + sz / 2]);
      const p010 = project([x - sx / 2, y, z + sz / 2]);
      const p001 = project([x - sx / 2, y + sy, z - sz / 2]);
      const p101 = project([x + sx / 2, y + sy, z - sz / 2]);
      const p111 = project([x + sx / 2, y + sy, z + sz / 2]);
      const p011 = project([x - sx / 2, y + sy, z + sz / 2]);

      drawPolygon(ctx, [p010, p110, p111, p011], shadeColor(base, -22));
      drawPolygon(ctx, [p100, p110, p111, p101], shadeColor(base, -42));
      drawPolygon(ctx, [p001, p101, p111, p011], selected ? '#f8fafc' : shadeColor(base, 18));

      if (selected) {
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 3;
        ctx.setLineDash([7, 5]);
        ctx.strokeRect(project([x, y + sy / 2, z]).x - scale * sx * 0.7, project([x, y + sy / 2, z]).y - scale * sy * 0.7, scale * sx * 1.4, scale * sy * 1.25);
        ctx.setLineDash([]);
      }
    };

    const drawCylinder = (obj, selected) => {
      const [sx = 1, sy = 1, sz = 1] = obj.scale || [1, 1, 1];
      const point = project(obj.position || [0, 0, 0]);
      const width = scale * Math.max(sx, sz) * 0.9;
      const height = scale * sy;
      const base = obj.color || '#3b82f6';

      ctx.fillStyle = shadeColor(base, -30);
      ctx.fillRect(point.x - width / 2, point.y - height, width, height);
      ctx.beginPath();
      ctx.ellipse(point.x, point.y - height, width / 2, width / 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = selected ? '#f8fafc' : shadeColor(base, 20);
      ctx.fill();
      ctx.strokeStyle = selected ? '#60a5fa' : 'rgba(255,255,255,0.18)';
      ctx.lineWidth = selected ? 3 : 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(point.x, point.y, width / 2, width / 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = shadeColor(base, -45);
      ctx.fill();
    };

    const drawPrism = (obj, selected) => {
      const [sx = 1, sy = 1, sz = 1] = obj.scale || [1, 1, 1];
      const [x = 0, y = 0, z = 0] = obj.position || [0, 0, 0];
      const base = obj.color || '#3b82f6';
      const left = project([x - sx / 2, y, z]);
      const right = project([x + sx / 2, y, z]);
      const top = project([x, y + sy, z]);
      const back = project([x, y + sy * 0.35, z + sz]);
      drawPolygon(ctx, [left, right, back], shadeColor(base, -28));
      drawPolygon(ctx, [left, top, back], selected ? '#f8fafc' : shadeColor(base, 14));
      drawPolygon(ctx, [right, top, back], shadeColor(base, -42));
    };

    const renderObject = (obj) => {
      const selected = obj.id === selectedId;
      if (obj.type === 'cylinder') drawCylinder(obj, selected);
      else if (obj.type === 'prism') drawPrism(obj, selected);
      else if (obj.type === 'stair') {
        const [x = 0, y = 0, z = 0] = obj.position || [0, 0, 0];
        const [sx = 1, sy = 1, sz = 1] = obj.scale || [1, 1, 1];
        drawCube({ ...obj, scale: [sx, sy * 0.5, sz], position: [x, y, z] }, selected);
        drawCube({ ...obj, scale: [sx, sy * 0.5, sz * 0.5], position: [x, y + sy * 0.5, z + sz * 0.25] }, selected);
      } else drawCube(obj, selected);

      const point = project(obj.position || [0, 0, 0]);
      hitZonesRef.current.push({
        id: obj.id,
        x: point.x,
        y: point.y,
        radius: scale * 0.9,
        position: obj.position || [0, 0, 0],
      });
    };

    [...objects]
      .sort((a, b) => ((a.position?.[0] || 0) + (a.position?.[2] || 0)) - ((b.position?.[0] || 0) + (b.position?.[2] || 0)))
      .forEach(renderObject);

    if (objects.length === 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.72)';
      ctx.font = '700 14px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Add a shape or preset to start building', rect.width / 2, rect.height / 2);
    }

    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.arc(rect.width / 2, rect.height / 2, 2, 0, Math.PI * 2);
    ctx.fill();
  }, [isLocked, objects, selectedId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const resizeObserver = new ResizeObserver(drawScene);
    resizeObserver.observe(canvas);
    drawScene();
    return () => resizeObserver.disconnect();
  }, [drawScene]);

  const getPointer = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const handlePointerDown = (event) => {
    const point = getPointer(event);
    const hit = [...hitZonesRef.current].reverse().find((zone) => {
      const dx = point.x - zone.x;
      const dy = point.y - zone.y;
      return Math.sqrt(dx * dx + dy * dy) < zone.radius;
    });

    if (!hit) {
      onSelect(null);
      return;
    }

    onSelect(hit.id);
    dragRef.current = {
      id: hit.id,
      pointer: point,
      position: hit.position,
    };
  };

  const handlePointerMove = (event) => {
    if (!dragRef.current || isLocked) return;
    const point = getPointer(event);
    const rect = canvasRef.current.getBoundingClientRect();
    const scale = Math.max(34, Math.min(58, rect.width / 12));
    const dx = (point.x - dragRef.current.pointer.x) / (scale * ISO_COS);
    const dz = (point.y - dragRef.current.pointer.y) / (scale * ISO_SIN);
    const [x = 0, y = 0, z = 0] = dragRef.current.position || [0, 0, 0];
    onUpdate?.({
      id: dragRef.current.id,
      position: [Number((x + dx * 0.5).toFixed(2)), y, Number((z + dz * 0.5).toFixed(2))],
    });
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-950">
      <canvas
        ref={canvasRef}
        className="block h-full min-h-[400px] w-full cursor-crosshair touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
      <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-white/70 backdrop-blur">
        {isLocked ? 'Locked isometric preview' : 'Unlocked canvas drag mode'}
      </div>
    </div>
  );
};

export default CanvasScene;
