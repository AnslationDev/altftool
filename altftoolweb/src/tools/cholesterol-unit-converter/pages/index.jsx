"use client";

import QuickToolPage from "@/tools/_shared/QuickToolPage";

import { SEXES, UNITS, convertLipidPanel } from "../lib";

const format = (value, digits = 1) =>
  Number.isFinite(value)
    ? new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits }).format(value)
    : "—";

const lineFor = (label, row, unitKind = "cholesterol") => {
  if (!row) return `${label}: not available`;
  const mmolDigits = unitKind === "triglycerides" ? 2 : 2;
  const band = row.band?.label ? ` · ${row.band.label}` : "";
  return `${label}: ${format(row.mgdl)} mg/dL · ${format(row.mmoll, mmolDigits)} mmol/L${band}`;
};

export default function ToolHome() {
  return (
    <QuickToolPage
      eyebrow="Lab unit converter"
      title="Cholesterol Unit Converter"
      description="Convert a lipid panel between mg/dL and mmol/L, calculate non-HDL cholesterol, and estimate LDL when triglycerides allow it."
      defaults={{
        unit: "mgdl",
        total: "200",
        hdl: "55",
        triglycerides: "140",
        ldl: "",
        sex: "male",
      }}
      fields={[
        {
          key: "unit",
          label: "Entered unit",
          type: "select",
          options: UNITS.map((unit) => ({ value: unit.id, label: unit.label })),
        },
        { key: "total", label: "Total cholesterol", placeholder: "200", inputMode: "decimal" },
        { key: "hdl", label: "HDL cholesterol", placeholder: "55", inputMode: "decimal" },
        { key: "triglycerides", label: "Triglycerides", placeholder: "140", inputMode: "decimal" },
        { key: "ldl", label: "LDL cholesterol (optional)", placeholder: "Leave blank to estimate", inputMode: "decimal" },
        {
          key: "sex",
          label: "HDL reference",
          type: "select",
          options: SEXES.map((sex) => ({ value: sex.id, label: sex.label })),
        },
      ]}
      outputLabel="Converted lipid panel"
      buildOutput={(values) => {
        const result = convertLipidPanel(values);
        if (result.error) return result.error;
        return [
          lineFor("Total cholesterol", result.total),
          lineFor("HDL", result.hdl),
          lineFor("Triglycerides", result.triglycerides, "triglycerides"),
          lineFor("Non-HDL cholesterol", result.nonHdl),
          lineFor(result.ldlEstimated ? "LDL (estimated)" : "LDL", result.ldl),
          `Total / HDL ratio: ${format(result.ratio, 2)}`,
          result.ldlNote,
          "Informational only — lab interpretation depends on personal cardiovascular risk.",
        ].join("\n");
      }}
    />
  );
}
