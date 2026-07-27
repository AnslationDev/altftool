"use client";

import QuickToolPage from "@/tools/_shared/QuickToolPage";

const defaults = {
  dish: "paneer butter masala",
  constraint: "high-protein, less cream, weeknight cooking",
  ingredients: "paneer, tomato puree, onion, curd, cashews, garam masala",
  servings: "4",
};

const fields = [
  { key: "dish", label: "Original dish" },
  { key: "constraint", label: "Remix goal / diet constraint" },
  { key: "ingredients", label: "Available ingredients", multiline: true },
  { key: "servings", label: "Servings", inputMode: "numeric" },
];

function buildOutput(values) {
  return [
    "Recipe Remix Prompt",
    "",
    `Dish to remix: ${values.dish}`,
    `Goal/constraint: ${values.constraint}`,
    `Servings: ${values.servings}`,
    "",
    `Available ingredients:\n${values.ingredients}`,
    "",
    "Create a practical recipe remix. Keep the soul of the original dish, explain substitutions, list exact quantities, steps, timing, storage notes and one fallback if a key ingredient is missing.",
    "",
    "Do not make medical claims. If the constraint is health-related, frame it as general cooking preference.",
  ].join("\n");
}

export default function ToolHome() {
  return (
    <QuickToolPage
      eyebrow="Kitchen prompt"
      title="Recipe Remix Prompt Builder"
      description="Turn a dish, available ingredients and dietary preference into a controlled recipe prompt."
      fields={fields}
      defaults={defaults}
      buildOutput={buildOutput}
      outputLabel="Recipe prompt"
    />
  );
}
