// Safe arithmetic expression evaluator (no eval / Function).
// Shunting-yard → RPN → evaluate. Supports + - * / ^ %, parentheses, unary
// minus, factorial (!), constants (pi, e), and common functions. Angle mode
// "deg" | "rad" controls trig. Used by the scientific & basic calculators.

const FUNCS = {
  sin: (x, m) => Math.sin(toRad(x, m)),
  cos: (x, m) => Math.cos(toRad(x, m)),
  tan: (x, m) => Math.tan(toRad(x, m)),
  asin: (x, m) => fromRad(Math.asin(x), m),
  acos: (x, m) => fromRad(Math.acos(x), m),
  atan: (x, m) => fromRad(Math.atan(x), m),
  sinh: (x) => Math.sinh(x),
  cosh: (x) => Math.cosh(x),
  tanh: (x) => Math.tanh(x),
  sqrt: (x) => Math.sqrt(x),
  cbrt: (x) => Math.cbrt(x),
  ln: (x) => Math.log(x),
  log: (x) => Math.log10(x),
  log2: (x) => Math.log2(x),
  exp: (x) => Math.exp(x),
  abs: (x) => Math.abs(x),
  round: (x) => Math.round(x),
  floor: (x) => Math.floor(x),
  ceil: (x) => Math.ceil(x),
};

function toRad(x, mode) {
  return mode === "deg" ? (x * Math.PI) / 180 : x;
}
function fromRad(x, mode) {
  return mode === "deg" ? (x * 180) / Math.PI : x;
}

function factorial(n) {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

const OPS = {
  "+": { prec: 2, assoc: "L", fn: (a, b) => a + b },
  "-": { prec: 2, assoc: "L", fn: (a, b) => a - b },
  "*": { prec: 3, assoc: "L", fn: (a, b) => a * b },
  "/": { prec: 3, assoc: "L", fn: (a, b) => a / b },
  "%": { prec: 3, assoc: "L", fn: (a, b) => a % b },
  "^": { prec: 4, assoc: "R", fn: (a, b) => Math.pow(a, b) },
};

function tokenize(input) {
  const tokens = [];
  const s = input.replace(/\s+/g, "").replace(/×/g, "*").replace(/÷/g, "/").replace(/π/g, "pi").replace(/√/g, "sqrt");
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/[0-9.]/.test(c)) {
      let num = "";
      while (i < s.length && /[0-9.]/.test(s[i])) num += s[i++];
      tokens.push({ type: "num", value: parseFloat(num) });
      continue;
    }
    if (/[a-zA-Z]/.test(c)) {
      let name = "";
      while (i < s.length && /[a-zA-Z0-9]/.test(s[i])) name += s[i++];
      const lower = name.toLowerCase();
      if (lower === "pi") tokens.push({ type: "num", value: Math.PI });
      else if (lower === "e") tokens.push({ type: "num", value: Math.E });
      else if (FUNCS[lower]) tokens.push({ type: "func", value: lower });
      else throw new Error(`Unknown name: ${name}`);
      continue;
    }
    if (c === "(") { tokens.push({ type: "lparen" }); i++; continue; }
    if (c === ")") { tokens.push({ type: "rparen" }); i++; continue; }
    if (c === "!") { tokens.push({ type: "fact" }); i++; continue; }
    if (OPS[c]) {
      const prev = tokens[tokens.length - 1];
      const isUnary = c === "-" && (!prev || prev.type === "op" || prev.type === "lparen" || prev.type === "func");
      if (isUnary) tokens.push({ type: "num", value: 0 }); // 0 - x
      tokens.push({ type: "op", value: c });
      i++;
      continue;
    }
    throw new Error(`Unexpected character: ${c}`);
  }
  return tokens;
}

function toRPN(tokens) {
  const output = [];
  const stack = [];
  for (const t of tokens) {
    if (t.type === "num") output.push(t);
    else if (t.type === "func") stack.push(t);
    else if (t.type === "fact") output.push(t);
    else if (t.type === "op") {
      while (
        stack.length &&
        stack[stack.length - 1].type === "op" &&
        (OPS[stack[stack.length - 1].value].prec > OPS[t.value].prec ||
          (OPS[stack[stack.length - 1].value].prec === OPS[t.value].prec && OPS[t.value].assoc === "L"))
      ) {
        output.push(stack.pop());
      }
      stack.push(t);
    } else if (t.type === "lparen") stack.push(t);
    else if (t.type === "rparen") {
      while (stack.length && stack[stack.length - 1].type !== "lparen") output.push(stack.pop());
      if (!stack.length) throw new Error("Mismatched parentheses");
      stack.pop();
      if (stack.length && stack[stack.length - 1].type === "func") output.push(stack.pop());
    }
  }
  while (stack.length) {
    const t = stack.pop();
    if (t.type === "lparen") throw new Error("Mismatched parentheses");
    output.push(t);
  }
  return output;
}

function evalRPN(rpn, mode) {
  const st = [];
  for (const t of rpn) {
    if (t.type === "num") st.push(t.value);
    else if (t.type === "fact") st.push(factorial(st.pop()));
    else if (t.type === "op") {
      const b = st.pop();
      const a = st.pop();
      if (a === undefined || b === undefined) throw new Error("Invalid expression");
      st.push(OPS[t.value].fn(a, b));
    } else if (t.type === "func") {
      const a = st.pop();
      if (a === undefined) throw new Error("Invalid expression");
      st.push(FUNCS[t.value](a, mode));
    }
  }
  if (st.length !== 1) throw new Error("Invalid expression");
  return st[0];
}

// Returns { value } or { error }.
export function evaluate(expression, mode = "deg") {
  try {
    if (!expression || !expression.trim()) return { value: null };
    const result = evalRPN(toRPN(tokenize(expression)), mode);
    if (!Number.isFinite(result)) return { error: "Math error" };
    return { value: result };
  } catch (e) {
    return { error: e.message || "Invalid expression" };
  }
}
