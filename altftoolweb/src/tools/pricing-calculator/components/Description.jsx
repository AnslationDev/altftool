"use client";

import React from "react";

const HowItWorksCards = () => {
  const steps = [
    {
      title: "Enter Product Price",
      description: "Add the base price of your product. This is the starting point for all calculations.",
    },
    {
      title: "Set Quantity",
      description: "Specify how many units of the product you want to purchase. The total will scale accordingly.",
    },
    {
      title: "Add Shipping Charges",
      description: "Include any additional shipping costs to calculate the final payable amount accurately.",
    },
    {
      title: "Apply Discount (%)",
      description: "Enter the discount percentage to see the reduced total immediately, without manual math.",
    },
    {
      title: "Instant Total Calculation",
      description: "The calculator automatically computes the total based on price, quantity, shipping, and discount.",
    },
    {
      title: "Reusable for Big Calculations",
      description: "Use this component within larger applications or tools to handle complex pricing scenarios efficiently.",
    },
  ];

  return (
    <section className="py-16 px-4 bg-(--background)">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-(--foreground) mb-4 mt-[-20]">
            How It Works ?
          </h2>
          <p className="text-(--muted-foreground) text-2xl">
            Understand the steps to calculate your product pricing efficiently.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-(--card) rounded-2xl shadow-md border border-(--border) p-6 sm:p-8 flex flex-col hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            >
              <h3 className="text-lg font-bold text-(--foreground) mb-3 hover:text-blue-600">
                {step.title}
              </h3>
              <p className="text-ml text-(--muted-foreground) leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksCards;