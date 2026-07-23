"use client";

import { useState } from "react";
import { Code, Play, Trash2, BookOpen, Sparkles } from "lucide-react";

export default function Main(){
      const [code, setCode] = useState(`// Chindi Programming Language - Indian Style Coding! 😄

bolo "Namaste World!";

// Variables
jugaad x = 10;
jugaad naam = "Raju";
jugaad paisa = 500.50;

// Print
bolo "Mera naam hai: " + naam;
bolo "Mere paas " + paisa + " rupaye hain";

// Conditions
agar (x > 5) {
  bolo "Zyada hai!";
} nahi to {
  bolo "Kam hai!";
}

// Loops
jab tak (x > 0) {
  bolo "Count: " + x;
  x = x - 1;
}

// Functions
kaam greet(naam) {
  return "Hello " + naam + "!";
}

bolo greet("Dost");

// Math
jugaad total = 10 + 20;
bolo "Total: " + total;`);

  const [output, setOutput] = useState([]);
  const [error, setError] = useState(null);

  // Chindi Language Syntax Reference
  const syntax = [
    { hindi: "bolo", english: "print/console.log", example: 'bolo "Hello";' },
    { hindi: "jugaad", english: "variable (let)", example: "jugaad x = 10;" },
    { hindi: "agar", english: "if", example: "agar (x > 5) { }" },
    { hindi: "nahi to", english: "else", example: "nahi to { }" },
    { hindi: "jab tak", english: "while", example: "jab tak (x > 0) { }" },
    { hindi: "kaam", english: "function", example: "kaam greet() { }" },
    { hindi: "wapas", english: "return", example: "wapas value;" },
  ];

  const parseAndExecute = () => {
    setOutput([]);
    setError(null);
    const logs = [];

    try {
      // Custom Parser for Chindi Language
      let jsCode = code;

      // First, handle comments - replace with empty lines to preserve line numbers
      jsCode = jsCode.replace(/\/\/.*/g, '');

      // Replace Chindi keywords with JavaScript (order matters!)
      jsCode = jsCode.replace(/bolo\s+/g, "console.log(");

      // Close the console.log parenthesis at the end of the line
      jsCode = jsCode.split('\n').map(line => {
        if (line.includes('console.log(') && !line.trim().endsWith(')')) {
          // Find the semicolon and add ) before it
          return line.replace(/;/, ');');
        }
        return line;
      }).join('\n');

      jsCode = jsCode.replace(/jugaad\s+/g, "let ");
      jsCode = jsCode.replace(/agar\s*\(/g, "if (");
      jsCode = jsCode.replace(/\}\s*nahi\s+to\s*\{/g, "} else {");
      jsCode = jsCode.replace(/jab\s+tak\s*\(/g, "while (");
      jsCode = jsCode.replace(/kaam\s+/g, "function ");
      jsCode = jsCode.replace(/wapas\s+/g, "return ");

      // Capture console.log output
      const originalLog = console.log;
      console.log = (...args) => {
        logs.push(args.map(arg => String(arg)).join(' '));
      };

      // Execute the transformed JavaScript code in a safer way
      const func = new Function(jsCode);
      func();

      // Restore original console.log
      console.log = originalLog;

      setOutput(logs);
    } catch (err) {
      setError(err.message);
      // Restore console.log on error
      if (typeof console.log !== 'function') {
        console.log = (...args) => {};
      }
    }
  };

  const clearCode = () => {
    setCode("");
    setOutput([]);
    setError(null);
  };

  const loadExample = (exampleCode) => {
    setCode(exampleCode);
    setOutput([]);
    setError(null);
  };

  const examples = [
    {
      name: "Hello World",
      code: `bolo "Namaste World!";
bolo "Chindi Language mein coding karo!";`
    },
    {
      name: "Variables",
      code: `jugaad naam = "Sharma Ji";
jugaad umar = 25;
jugaad salary = 50000;

bolo "Naam: " + naam;
bolo "Umar: " + umar;
bolo "Salary: " + salary;`
    },
    {
      name: "Conditions",
      code: `jugaad marks = 75;

agar (marks >= 90) {
  bolo "A+ Grade - Shabash!";
} nahi to {
  bolo "Aur mehnat karo!";
}

jugaad paisa = 100;
agar (paisa > 50) {
  bolo "Amir ho tum!";
} nahi to {
  bolo "Gareeb ho!";
}`
    },
    {
      name: "Loops",
      code: `jugaad count = 5;

bolo "Countdown shuru:";
jab tak (count > 0) {
  bolo count;
  count = count - 1;
}

bolo "Blast!";`
    },
    {
      name: "Functions",
      code: `kaam add(a, b) {
  wapas a + b;
}

kaam multiply(x, y) {
  wapas x * y;
}

jugaad sum = add(10, 20);
jugaad product = multiply(5, 6);

bolo "Sum: " + sum;
bolo "Product: " + product;`
    }
  ];
    return(
              <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-orange-100 border border-orange-200 rounded-full px-4 py-2 mb-4">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span className="text-orange-700 text-sm font-semibold">Desi Programming Language</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Code Karo
            <br />
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Hinglish Mein!
            </span>
          </h1>
          <p className="text-(--foreground) text-lg">
            Indian style parody programming language - Jugaad se coding! 😄
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Examples & Syntax */}
          <div className="lg:col-span-1 space-y-6">
            {/* Examples */}
            <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-orange-600" />
                Examples
              </h3>
              <div className="space-y-2">
                {examples.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => loadExample(ex.code)}
                    className="w-full bg-orange-50 hover:bg-orange-100 text-orange-700 font-medium px-4 py-2 rounded-lg text-left transition-all text-sm"
                  >
                    {ex.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Syntax Reference */}
            <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Syntax</h3>
              <div className="space-y-3">
                {syntax.map((s, i) => (
                  <div key={i} className="border-l-4 border-orange-400 pl-3">
                    <p className="font-bold text-orange-700 text-sm">{s.hindi}</p>
                    <p className="text-xs text-gray-600">{s.english}</p>
                    <code className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded block mt-1">
                      {s.example}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Editor Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Toolbar */}
            <div className="bg-gray-100 rounded-2xl shadow-lg border border-orange-100 p-4">
              <div className="flex flex-wrap gap-3 ">
                <button
                  onClick={parseAndExecute}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-black font-bold px-6 py-2 rounded-lg transition-all shadow-lg flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Run Code
                </button>
                <button
                  onClick={clearCode}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </button>
              </div>
            </div>

            {/* Code Editor */}
            <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-3 flex items-center gap-3">
                <Code className="w-5 h-5 text-white" />
                <h3 className="text-lg font-bold text-white">Code Editor</h3>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-96 bg-gray-900 text-black font-mono text-sm p-6 focus:outline-none resize-none"
                placeholder='bolo "Hello World!";'
                spellCheck={false}
              />
            </div>

            {/* Console Output */}
            <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-700 to-gray-900 px-6 py-3 flex items-center gap-3">
                <Code className="w-5 h-5 text-white" />
                <h3 className="text-lg font-bold text-white">Console Output</h3>
              </div>
              <div className="bg-gray-900 text-black font-mono text-sm p-6 h-64 overflow-y-auto">
                {error ? (
                  <div className="text-red-400 font-bold">
                    ❌ Error: {error}
                  </div>
                ) : output.length === 0 ? (
                  <div className="text-gray-500 italic">
                    Output yaha dikhega... Run code to see results!
                  </div>
                ) : (
                  output.map((line, i) => (
                    <div key={i} className="mb-1">
                      <span className="text-green-400">➜</span> {line}
                    </div>
                  ))
                )}
              </div>
            </div>



            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-orange-100 p-4 text-center">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Code className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-sm font-semibold text-gray-900">Hinglish Syntax</p>
                <p className="text-xs text-gray-600 mt-1">Code in Desi style</p>
              </div>
              <div className="bg-white rounded-xl border border-orange-100 p-4 text-center">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Play className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-sm font-semibold text-gray-900">Live Execution</p>
                <p className="text-xs text-gray-600 mt-1">Run instantly</p>
              </div>
              <div className="bg-white rounded-xl border border-orange-100 p-4 text-center">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-5 h-5 text-yellow-600" />
                </div>
                <p className="text-sm font-semibold text-gray-900">Fun Learning</p>
                <p className="text-xs text-gray-600 mt-1">Entertaining way</p>
              </div>
            </div>
          </div>
        </div>
      </main>


    )
}
