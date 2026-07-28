"use client";

import QuickToolPage from "../../_shared/QuickToolPage";
import { convertUrea, UNITS } from "../lib";

const nf = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const toNumber = (value) => Number(String(value ?? "").replace(/,/g, "").trim());
const optionalNumber = (value) => (String(value ?? "").trim() === "" ? "" : toNumber(value));
const fmt = (value, suffix = "") => (Number.isFinite(value) ? `${nf.format(value)}${suffix}` : "—");

export default function ToolHome() {
  return (
    <QuickToolPage
      eyebrow="Lab unit converter"
      title="Urea and BUN Converter"
      description="Convert BUN and urea units and optionally calculate the BUN-to-creatinine ratio."
      defaults={{ value: "14", unit: "bunMgdl", creatinineMgdl: "0.9" }}
      fields={[
        { key: "value", label: "Result value", inputMode: "decimal" },
        { key: "unit", label: "Reported unit", type: "select", options: UNITS.map((unit) => ({ value: unit.id, label: unit.label })) },
        { key: "creatinineMgdl", label: "Creatinine mg/dL (optional)", inputMode: "decimal" },
      ]}
      outputLabel="Converted result"
      buildOutput={(values) => {
        const result = convertUrea({
          value: toNumber(values.value),
          unit: values.unit,
          creatinineMgdl: optionalNumber(values.creatinineMgdl),
        });
        if (result.error) return result.error;
        return [
          `BUN: ${fmt(result.bunMgdl, " mg/dL")}`,
          `Urea: ${fmt(result.ureaMgdl, " mg/dL")}`,
          `Urea SI: ${fmt(result.ureaMmoll, " mmol/L")}`,
          `Reference band: ${result.band?.label || "—"}`,
          `BUN:creatinine ratio: ${fmt(result.ratio)}`,
          `Ratio band: ${result.ratioBand?.label || "—"}`,
          result.ratioNote,
          `Reference BUN: ${fmt(result.reference.bunMinMgdl)}-${fmt(result.reference.bunMaxMgdl, " mg/dL")}`,
        ].join("\n");
      }}
    />
  );
}
