const seo = {
  title: "Logic Gate Simulator with Truth Table and K-Map",
  metaDescription:
    "Wire AND, OR, NOT, NAND, NOR, XOR and XNOR gates, then get the full 2^n truth table, a Karnaugh map and the minimised sum-of-products expression.",
  intro:
    "The Logic Gate Simulator lets you wire AND, OR, NOT, NAND, NOR, XOR and XNOR gates on a canvas, then propagates signals through the circuit and derives a complete truth table by evaluating all 2^n combinations of your n toggle inputs. It carries four signal states — 0, 1, high-impedance Z and error X — resolves feedback loops by iterating to a fixed point with a 20-pass cap, and turns any selected output into a Karnaugh map with Gray-code labels for 2, 3 or 4 variables plus a minimised Boolean expression. It is built for students and hobbyists learning combinational logic who want to see the table and the simplification fall out of a circuit they drew themselves.",
  useCases: [
    "You are working through a digital logic assignment on a half adder or a 2-to-1 multiplexer and want to build it from gates, then check your hand-derived truth table against the simulated one.",
    "You have a truth table from a lab sheet and want to see which K-map groupings produce the minimal sum-of-products expression, rather than trusting your own grouping by eye.",
    "You are teaching De Morgan's laws and want to show a class that a NAND with inverted inputs and an OR gate produce identical output columns.",
  ],
  benefits: [
    [
      "Truth table and K-map come from the circuit, not typed in",
      "Every input combination is simulated through the actual wiring, so the table, the minterm list and the minimised expression all reflect what you built.",
    ],
    [
      "Handles feedback and undriven pins honestly",
      "Cyclic circuits iterate to a fixed point instead of hanging, unconnected pins read as high-impedance Z, and floating gate inputs are listed as explicit warnings.",
    ],
    [
      "XOR and XNOR use parity, not two-input special cases",
      "Odd-parity and even-parity evaluation means multi-input XOR and XNOR gates behave correctly rather than only working with exactly two inputs.",
    ],
  ],
  faqs: [
    [
      "How many rows will the truth table have?",
      "2 raised to the number of toggle inputs: 4 rows for 2 inputs, 8 for 3, 16 for 4, and so on. The simulator evaluates every combination through the full circuit, and each output column can be selected independently for minterm, maxterm and Karnaugh-map analysis.",
    ],
    [
      "How many variables can the Karnaugh map handle?",
      "Two, three or four. A 2-variable map is 2x2, a 3-variable map is 2x4 with the columns in Gray-code order 00, 01, 11, 10, and a 4-variable map is 4x4 with both axes in Gray code. Circuits with more than four inputs still produce a truth table, but not a K-map.",
    ],
    [
      "What do the Z and X states mean?",
      "Z is high impedance — a pin that nothing is driving, which is the initial state of every gate input before signals propagate. X is an error or indeterminate state that appears when a gate receives an unresolvable input. Both are shown rather than silently coerced to 0, so wiring mistakes stay visible.",
    ],
    [
      "Can it simulate circuits with feedback, like a latch?",
      "Yes, up to a point. Signal propagation runs repeatedly until nothing changes or 20 passes elapse, so a stable feedback structure settles into its held state. Because there is no real timing model, oscillating circuits and race conditions will not reproduce true hardware behaviour — the delay and power figures shown are rough teaching estimates based on a fixed per-stage assumption, not device specifications.",
    ],
  ],
  steps: [
    "Click any preset in the Element Library — Input Toggle, Clock Gen, AND Gate, OR Gate, NOT Inverter, NAND Gate, NOR Gate, XOR Gate, XNOR Gate or Signal Lamp — to drop it on the canvas, drag the blocks into position, then click a block's output port dot followed by the destination input port dot to run a wire between them.",
    "Click a toggle's ON/OFF button to flip that input. The simulation never stops — the status bar reads simulation running (1Hz clock oscillation) alongside the node count — so a wire driving a 1 turns green and animates a travelling dot, and any Signal Lamp downstream lights up.",
    "The Logic Analyzer & Optimization Engine below rebuilds after every change: an Exhaustive Truth Table Sweep labelled with the number of states evaluated, the Sum of Minterms, the Karnaugh Map (K-Map) Grid Reduction and the Minimized Sum-of-Products Expression for whichever column you pick under Output Target. Save Project downloads the circuit as logic-circuit-project.json, Open JSON reloads a saved .json file, and Clear Board empties the canvas.",
  ],
};

export default seo;
