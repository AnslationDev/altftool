"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Segmented, Grid, ResultPanel, ResultStat, ResultRow, CalcNote } from "./ui";
import { num, fmt } from "./format";

export default function TileCalculator() {
  const [mode, setMode] = useState("dims"); // dims | area
  const [roomUnit, setRoomUnit] = useState("ft"); // ft | m
  const [length, setLength] = useState("12");
  const [width, setWidth] = useState("10");
  const [area, setArea] = useState("120");
  const [tileUnit, setTileUnit] = useState("cm"); // cm | in
  const [tileW, setTileW] = useState("60");
  const [tileH, setTileH] = useState("60");
  const [wastage, setWastage] = useState("10");
  const [perBox, setPerBox] = useState("");

  const r = useMemo(() => {
    // Room area in m²
    let areaM2 = null;
    if (mode === "dims") {
      const L = num(length), W = num(width);
      if (L === null || W === null || L <= 0 || W <= 0) return null;
      const rf = roomUnit === "ft" ? 0.3048 : 1; // metres per unit
      areaM2 = (L * rf) * (W * rf);
    } else {
      const A = num(area);
      if (A === null || A <= 0) return null;
      const af = roomUnit === "ft" ? 0.09290304 : 1; // m² per input area unit
      areaM2 = A * af;
    }

    const tw = num(tileW), th = num(tileH);
    if (tw === null || th === null || tw <= 0 || th <= 0) return null;
    const tf = tileUnit === "cm" ? 0.01 : 0.0254; // metres per tile unit
    const tileM2 = (tw * tf) * (th * tf);
    if (tileM2 <= 0) return null;

    const w = num(wastage);
    const waste = w === null || w < 0 ? 0 : w;
    const tiles = Math.ceil((areaM2 / tileM2) * (1 + waste / 100));

    const pb = num(perBox);
    const boxes = pb !== null && pb > 0 ? Math.ceil(tiles / pb) : null;

    const coveredM2 = tiles * tileM2;
    const coveredFt2 = coveredM2 / 0.09290304;
    return { areaM2, tiles, boxes, coveredM2, coveredFt2, waste };
  }, [mode, roomUnit, length, width, area, tileUnit, tileW, tileH, wastage, perBox]);

  const areaFt2 = r ? r.areaM2 / 0.09290304 : null;

  return (
    <div className="afc-calc">
      <Grid cols={2}>
        <Field label="Room measured by">
          <Segmented
            name="mode"
            value={mode}
            onChange={setMode}
            options={[
              { label: "Length × Width", value: "dims" },
              { label: "Total area", value: "area" },
            ]}
          />
        </Field>
        <Field label="Room units">
          <Segmented
            name="roomUnit"
            value={roomUnit}
            onChange={setRoomUnit}
            options={[
              { label: "Feet", value: "ft" },
              { label: "Metres", value: "m" },
            ]}
          />
        </Field>
      </Grid>

      {mode === "dims" ? (
        <Grid cols={2}>
          <Field label="Room length">
            <NumberInput suffix={roomUnit} value={length} min="0" step="0.1" onChange={(e) => setLength(e.target.value)} />
          </Field>
          <Field label="Room width">
            <NumberInput suffix={roomUnit} value={width} min="0" step="0.1" onChange={(e) => setWidth(e.target.value)} />
          </Field>
        </Grid>
      ) : (
        <Field label="Total room area">
          <NumberInput suffix={roomUnit === "ft" ? "ft²" : "m²"} value={area} min="0" onChange={(e) => setArea(e.target.value)} />
        </Field>
      )}

      <Field label="Tile size units">
        <Segmented
          name="tileUnit"
          value={tileUnit}
          onChange={setTileUnit}
          options={[
            { label: "Centimetres", value: "cm" },
            { label: "Inches", value: "in" },
          ]}
        />
      </Field>
      <Grid cols={2}>
        <Field label="Tile width">
          <NumberInput suffix={tileUnit} value={tileW} min="0" step="0.1" onChange={(e) => setTileW(e.target.value)} />
        </Field>
        <Field label="Tile height">
          <NumberInput suffix={tileUnit} value={tileH} min="0" step="0.1" onChange={(e) => setTileH(e.target.value)} />
        </Field>
      </Grid>
      <Grid cols={2}>
        <Field label="Wastage" hint="Extra for cuts, breakage & spares">
          <NumberInput suffix="%" value={wastage} min="0" step="1" onChange={(e) => setWastage(e.target.value)} />
        </Field>
        <Field label="Tiles per box" hint="Optional — to get box count">
          <NumberInput value={perBox} min="0" step="1" onChange={(e) => setPerBox(e.target.value)} />
        </Field>
      </Grid>

      {r ? (
        <ResultPanel title="Tiles required">
          <ResultStat label={`Tiles needed (incl. ${fmt(r.waste, 0)}% wastage)`} value={fmt(r.tiles, 0)} accent />
          <div className="afc-result-rows">
            {r.boxes !== null ? <ResultRow label="Boxes to buy" value={fmt(r.boxes, 0)} strong /> : null}
            <ResultRow label="Room area" value={`${fmt(areaFt2, 2)} ft² · ${fmt(r.areaM2, 2)} m²`} />
            <ResultRow label="Area the tiles cover" value={`${fmt(r.coveredFt2, 2)} ft² · ${fmt(r.coveredM2, 2)} m²`} />
          </div>
          <CalcNote>
            Tile count is always rounded up to whole tiles. Buy from a single production batch and
            keep a few spares — colours and calibres can differ slightly between batches.
          </CalcNote>
        </ResultPanel>
      ) : (
        <ResultPanel title="Tiles required" muted>
          <p className="afc-note">Enter the room size and tile dimensions to estimate tiles and boxes.</p>
        </ResultPanel>
      )}
    </div>
  );
}
