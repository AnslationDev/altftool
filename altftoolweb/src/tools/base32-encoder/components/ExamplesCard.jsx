"use client";

import { useState } from "react";
import { Check, Copy, Download, Zap } from "lucide-react";
import { encodeBase32 } from "../utils/base32";
import { downloadText } from "../utils/download";

const EXAMPLE_INPUTS = ["foobar", "AltFTool", "Base32 Encoding!", "hello@example.com"];

// Outputs are computed with the encoder (defaults: uppercase + padding), never hardcoded.
const EXAMPLES = EXAMPLE_INPUTS.map((input) => ({ input, output: encodeBase32(input).output }));

export default function ExamplesCard({ onUseExample }) {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [exampleIndex, setExampleIndex] = useState(0);

  const copyRow = async (output, index) => {
    try {
      await navigator.clipboard.writeText(output);
      setCopiedIndex(index);
      window.setTimeout(() => setCopiedIndex(null), 1500);
    } catch {
      setCopiedIndex(null);
    }
  };

  const useNextExample = () => {
    onUseExample(EXAMPLES[exampleIndex].input);
    setExampleIndex((exampleIndex + 1) % EXAMPLES.length);
  };

  return (
    <section aria-label="Examples" className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-foreground">Examples</h2>
        <button
          type="button"
          onClick={useNextExample}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3.5 text-xs font-semibold text-primary transition-colors hover:border-primary/40 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <Zap aria-hidden="true" size={13} /> Use Example
        </button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <th scope="col" className="px-2 py-2">Input</th>
              <th scope="col" className="px-2 py-2">Base32 Encoded Output</th>
              <th scope="col" className="w-20 px-2 py-2">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {EXAMPLES.map((example, index) => (
              <tr key={example.input} className="border-b border-border last:border-b-0 hover:bg-muted/40">
                <td className="max-w-40 truncate px-2 py-2.5 text-sm text-foreground">
                  {example.input}
                </td>
                <td className="max-w-72 truncate px-2 py-2.5 font-mono text-xs font-bold text-success">
                  {example.output}
                </td>
                <td className="px-2 py-2.5">
                  <div className="flex justify-end gap-0.5">
                    <button
                      type="button"
                      onClick={() => copyRow(example.output, index)}
                      aria-label={`Copy encoded output for ${example.input}`}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      {copiedIndex === index ? (
                        <Check aria-hidden="true" size={14} className="text-success" />
                      ) : (
                        <Copy aria-hidden="true" size={14} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadText(example.output, `base32-${example.input.replace(/[^a-z0-9]+/gi, "-")}.txt`)}
                      aria-label={`Download encoded output for ${example.input}`}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      <Download aria-hidden="true" size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
