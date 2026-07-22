"use client";

import { useState, useCallback, useMemo } from "react";
import Header from "../components/Header";
import ShapeSelector from "../components/ShapeSelector";
import ShapeVisual from "../components/ShapeVisual";
import FormulaDisplay from "../components/FormulaDisplay";
import { SHAPES } from "../constants";
import { calculateResults, generateSteps } from "../utils/geometryCalc";

export default function GeometryFormulaExplorer() {
  const [selectedShape, setSelectedShape] = useState(SHAPES[0]);
  const [values, setValues] = useState(() => {
    const init = {};
    SHAPES[0].fields.forEach((f) => { init[f.key] = f.default; });
    return init;
  });
  const [selectedFormula, setSelectedFormula] = useState(null);

  const handleShapeSelect = useCallback((shape) => {
    setSelectedShape(shape);
    const init = {};
    shape.fields.forEach((f) => { init[f.key] = f.default; });
    setValues(init);
    setSelectedFormula(null);
  }, []);

  const handleValueChange = useCallback((key, val) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  }, []);

  const results = useMemo(() => calculateResults(selectedShape, values), [selectedShape, values]);

  const steps = useMemo(() => {
    if (!selectedFormula) return [];
    const f = results.find((r) => r.id === selectedFormula.id);
    if (!f) return [];
    return generateSteps(selectedShape, values, f);
  }, [selectedShape, values, selectedFormula, results]);

  return (
    <div className="bg-[var(--background)] px-4 py-6 text-[var(--foreground)] transition-colors sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Header />

        <div className="space-y-6">
          {/* Shape Selector */}
          <ShapeSelector shapes={SHAPES} selected={selectedShape} onSelect={handleShapeSelect} />

          {/* Visual + Input */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Shape Visualization */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
              <div className="border-b border-[var(--border)] px-6 py-4">
                <h3 className="text-base font-bold text-[var(--foreground)]">{selectedShape.label}</h3>
              </div>
              <ShapeVisual shapeId={selectedShape.id} values={values} />

              {/* Editable inputs */}
              <div className="border-t border-[var(--border)] px-6 py-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {selectedShape.fields.map((f) => (
                    <div key={f.key} className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-[var(--muted-foreground)]">{f.label}</label>
                      <input
                        type="number"
                        step="0.1"
                        min={f.min}
                        value={values[f.key] ?? f.default}
                        onChange={(e) => handleValueChange(f.key, parseFloat(e.target.value) || f.min)}
                        className="h-12 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-center text-lg font-bold text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Formulas + Results */}
            <FormulaDisplay
              shape={selectedShape}
              values={values}
              results={results}
              selectedFormula={selectedFormula}
              onSelectFormula={setSelectedFormula}
              steps={steps}
            />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
          All calculations run in your browser. No data is stored or uploaded.
        </p>
      </div>
    </div>
  );
}
