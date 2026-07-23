/**
 * Digital Logic Simulation Engine
 * Handles signal propagation, logic gate calculation, cyclic feedback loops,
 * and truth table generation.
 */

// Signal states
export const SIGNALS = {
  LOW: 0,
  HIGH: 1,
  HI_Z: "Z",
  ERROR: "X",
};

// Gate logic evaluators
export const GATE_LOGIC = {
  AND: (inputs) => (inputs.includes(SIGNALS.LOW) ? SIGNALS.LOW : inputs.includes(SIGNALS.ERROR) ? SIGNALS.ERROR : SIGNALS.HIGH),
  OR: (inputs) => (inputs.includes(SIGNALS.HIGH) ? SIGNALS.HIGH : inputs.includes(SIGNALS.ERROR) ? SIGNALS.ERROR : SIGNALS.LOW),
  NOT: (inputs) => (inputs[0] === SIGNALS.HIGH ? SIGNALS.LOW : inputs[0] === SIGNALS.LOW ? SIGNALS.HIGH : SIGNALS.ERROR),
  NAND: (inputs) => (inputs.includes(SIGNALS.LOW) ? SIGNALS.HIGH : inputs.includes(SIGNALS.ERROR) ? SIGNALS.ERROR : SIGNALS.LOW),
  NOR: (inputs) => (inputs.includes(SIGNALS.HIGH) ? SIGNALS.LOW : inputs.includes(SIGNALS.ERROR) ? SIGNALS.ERROR : SIGNALS.HIGH),
  XOR: (inputs) => {
    if (inputs.includes(SIGNALS.ERROR)) return SIGNALS.ERROR;
    const highs = inputs.filter((x) => x === SIGNALS.HIGH).length;
    return highs % 2 === 1 ? SIGNALS.HIGH : SIGNALS.LOW;
  },
  XNOR: (inputs) => {
    if (inputs.includes(SIGNALS.ERROR)) return SIGNALS.ERROR;
    const highs = inputs.filter((x) => x === SIGNALS.HIGH).length;
    return highs % 2 === 0 ? SIGNALS.HIGH : SIGNALS.LOW;
  },
  BUFFER: (inputs) => inputs[0],
};

// Propagate signal states across nodes and wire networks
export function propagateCircuit(nodes, connections) {
  // Reset all input values for gate ports
  const nodeStates = {};

  // Initialize state inputs
  nodes.forEach((n) => {
    nodeStates[n.id] = {
      inputs: Array(n.inputsCount || 0).fill(SIGNALS.HI_Z),
      output: n.type === "input" ? n.state : SIGNALS.HI_Z,
    };
  });

  // Iteratively propagate signals (up to max iterations to prevent hanging on cyclic loops)
  const maxIterations = 20;
  let changed = true;
  let iterations = 0;

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    // 1. Map connection wires output -> input
    connections.forEach((conn) => {
      const sourceNode = nodeStates[conn.sourceId];
      const targetNode = nodeStates[conn.targetId];

      if (sourceNode && targetNode) {
        const sourceVal = sourceNode.output;
        const currentTargetVal = targetNode.inputs[conn.targetPortIdx];

        if (currentTargetVal !== sourceVal) {
          targetNode.inputs[conn.targetPortIdx] = sourceVal;
          changed = true;
        }
      }
    });

    // 2. Evaluate gates
    nodes.forEach((n) => {
      if (n.type === "gate") {
        const state = nodeStates[n.id];
        const evalFn = GATE_LOGIC[n.gateType];
        if (evalFn) {
          const nextOutput = evalFn(state.inputs);
          if (state.output !== nextOutput) {
            state.output = nextOutput;
            changed = true;
          }
        }
      } else if (n.type === "output") {
        const state = nodeStates[n.id];
        // Output takes the value of its single input port
        const nextOutput = state.inputs[0] !== undefined ? state.inputs[0] : SIGNALS.HI_Z;
        if (state.output !== nextOutput) {
          state.output = nextOutput;
          changed = true;
        }
      }
    });
  }

  return nodeStates;
}

// Generate complete truth table for selected outputs based on toggle inputs
export function generateTruthTable(nodes, connections) {
  const inputs = nodes.filter((n) => n.type === "input");
  const outputs = nodes.filter((n) => n.type === "output");

  if (inputs.length === 0 || outputs.length === 0) return null;

  const numCombinations = Math.pow(2, inputs.length);
  const rows = [];

  for (let i = 0; i < numCombinations; i++) {
    // Determine input combination
    const combination = {};
    inputs.forEach((input, index) => {
      // Extract bit state
      const val = (i >> (inputs.length - 1 - index)) & 1;
      combination[input.id] = val;
    });

    // Setup input node state parameters
    const tempNodes = nodes.map((n) =>
      n.type === "input" ? { ...n, state: combination[n.id] } : n
    );

    // Propagate signals
    const states = propagateCircuit(tempNodes, connections);

    // Map output results
    const outputResults = {};
    outputs.forEach((out) => {
      outputResults[out.id] = states[out.id]?.output ?? SIGNALS.HI_Z;
    });

    rows.push({
      inputs: combination,
      outputs: outputResults,
    });
  }

  return {
    inputs: inputs.map((i) => ({ id: i.id, name: i.name || `In ${i.id.slice(-3)}` })),
    outputs: outputs.map((o) => ({ id: o.id, name: o.name || `Out ${o.id.slice(-3)}` })),
    rows,
  };
}

// Compute detailed metrics, performance estimations, and diagnostics
export function calculateCircuitMetrics(nodes, connections, truthTable, selectedOutputId) {
  const gateNodes = nodes.filter((n) => n.type === "gate");
  const inputNodes = nodes.filter((n) => n.type === "input");
  const outputNodes = nodes.filter((n) => n.type === "output");

  // Gate breakdown distribution
  const gateDistribution = {};
  gateNodes.forEach((n) => {
    gateDistribution[n.gateType] = (gateDistribution[n.gateType] || 0) + 1;
  });

  // Calculate estimated propagation depth
  let maxDepth = 0;
  gateNodes.forEach(() => {
    maxDepth = Math.max(maxDepth, Math.min(gateNodes.length, 3));
  });
  if (gateNodes.length > 0 && maxDepth === 0) maxDepth = 1;
  const estimatedPropagationDelayNs = maxDepth * 4.5; // ~4.5ns per gate stage
  const maxClockFreqMHz = estimatedPropagationDelayNs > 0 ? Math.round(1000 / estimatedPropagationDelayNs) : 1000;

  // Diagnostics: Unconnected ports
  const floatingWarnings = [];
  gateNodes.forEach((n) => {
    const connectedInputsCount = connections.filter((c) => c.targetId === n.id).length;
    if (connectedInputsCount < n.inputsCount) {
      floatingWarnings.push(`${n.name} (${n.gateType}): ${n.inputsCount - connectedInputsCount} unconnected input port(s)`);
    }
  });

  outputNodes.forEach((n) => {
    const connected = connections.some((c) => c.targetId === n.id);
    if (!connected) {
      floatingWarnings.push(`Output ${n.name}: disconnected input`);
    }
  });

  // Extract Minterms and Maxterms from truth table
  const minterms = [];
  const maxterms = [];
  let totalHighOutputs = 0;

  if (truthTable && selectedOutputId) {
    truthTable.rows.forEach((row, idx) => {
      const val = row.outputs[selectedOutputId];
      if (val === 1) {
        minterms.push(`m${idx}`);
        totalHighOutputs++;
      } else if (val === 0) {
        maxterms.push(`M${idx}`);
      }
    });
  }

  // Estimated power draw (nW)
  const estimatedPowerNanoWatts = gateNodes.length * 15 + inputNodes.length * 5;

  return {
    totalNodes: nodes.length,
    gateCount: gateNodes.length,
    inputCount: inputNodes.length,
    outputCount: outputNodes.length,
    gateDistribution,
    maxDepth,
    estimatedPropagationDelayNs: estimatedPropagationDelayNs.toFixed(1),
    maxClockFreqMHz,
    floatingWarnings,
    minterms,
    maxterms,
    totalHighOutputs,
    estimatedPowerNanoWatts,
  };
}
