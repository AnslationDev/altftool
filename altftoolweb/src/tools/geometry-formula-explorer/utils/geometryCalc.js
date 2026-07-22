export function roundNum(n, decimals = 4) {
  return Math.round(n * 10 ** decimals) / 10 ** decimals;
}

export function calculateResults(shape, values) {
  return shape.formulas.map((f) => ({
    ...f,
    result: roundNum(f.fn(values)),
  }));
}

export function generateSteps(shape, values, formula) {
  const steps = [];
  const valEntries = Object.entries(values);

  steps.push(`Given: ${valEntries.map(([k, v]) => `${k} = ${v}`).join(", ")}`);
  steps.push(`Formula: ${formula.label} = ${formula.formula}`);

  if (shape.id === "circle") {
    if (formula.id === "area") steps.push(`A = π × ${values.radius}² = π × ${values.radius * values.radius} = ${roundNum(formula.fn(values))}`);
    if (formula.id === "circumference") steps.push(`C = 2 × π × ${values.radius} = ${roundNum(formula.fn(values))}`);
    if (formula.id === "diameter") steps.push(`D = 2 × ${values.radius} = ${roundNum(formula.fn(values))}`);
  } else if (shape.id === "rectangle") {
    if (formula.id === "area") steps.push(`A = ${values.length} × ${values.width} = ${roundNum(formula.fn(values))}`);
    if (formula.id === "perimeter") steps.push(`P = 2 × (${values.length} + ${values.width}) = 2 × ${values.length + values.width} = ${roundNum(formula.fn(values))}`);
    if (formula.id === "diagonal") steps.push(`D = √(${values.length}² + ${values.width}²) = √(${values.length ** 2} + ${values.width ** 2}) = √${values.length ** 2 + values.width ** 2} = ${roundNum(formula.fn(values))}`);
  } else if (shape.id === "triangle") {
    if (formula.id === "area") steps.push(`A = ½ × ${values.base} × ${values.height} = ½ × ${values.base * values.height} = ${roundNum(formula.fn(values))}`);
    if (formula.id === "hypotenuse") steps.push(`H = √(${values.base}² + ${values.height}²) = √${values.base ** 2 + values.height ** 2} = ${roundNum(formula.fn(values))}`);
  } else if (shape.id === "sphere") {
    if (formula.id === "volume") steps.push(`V = (4/3) × π × ${values.radius}³ = (4/3) × π × ${values.radius ** 3} = ${roundNum(formula.fn(values))}`);
    if (formula.id === "surface") steps.push(`SA = 4 × π × ${values.radius}² = 4 × π × ${values.radius ** 2} = ${roundNum(formula.fn(values))}`);
  } else if (shape.id === "cylinder") {
    if (formula.id === "volume") steps.push(`V = π × ${values.radius}² × ${values.height} = π × ${values.radius ** 2} × ${values.height} = ${roundNum(formula.fn(values))}`);
    if (formula.id === "surface") steps.push(`SA = 2 × π × ${values.radius} × (${values.radius} + ${values.height}) = ${roundNum(formula.fn(values))}`);
  } else if (shape.id === "cone") {
    if (formula.id === "volume") steps.push(`V = (1/3) × π × ${values.radius}² × ${values.height} = ${roundNum(formula.fn(values))}`);
    if (formula.id === "surface") steps.push(`LSA = π × ${values.radius} × √(${values.radius}² + ${values.height}²) = ${roundNum(formula.fn(values))}`);
  } else if (shape.id === "rectangular_prism") {
    if (formula.id === "volume") steps.push(`V = ${values.length} × ${values.width} × ${values.height} = ${roundNum(formula.fn(values))}`);
    if (formula.id === "surface") steps.push(`SA = 2(${values.length}×${values.width} + ${values.length}×${values.height} + ${values.width}×${values.height}) = ${roundNum(formula.fn(values))}`);
    if (formula.id === "diagonal") steps.push(`D = √(${values.length}² + ${values.width}² + ${values.height}²) = √${values.length ** 2 + values.width ** 2 + values.height ** 2} = ${roundNum(formula.fn(values))}`);
  } else {
    steps.push(`Substitute values into the formula`);
    steps.push(`Result = ${roundNum(formula.fn(values))}`);
  }

  return steps;
}
