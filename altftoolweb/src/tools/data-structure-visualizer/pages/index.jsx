"use client";

import React, { useState } from "react";
import { Network, Plus, Minus, Trash2, RefreshCw } from "lucide-react";

export default function ToolHome() {
  const [ds, setDs] = useState("array");
  const [array, setArray] = useState([5, 12, 8, 3, 15]);
  const [stack, setStack] = useState([10, 20, 30]);
  const [queue, setQueue] = useState(["A", "B", "C"]);
  const [linkedList, setLinkedList] = useState([3, 7, 12, 9]);
  const [treeValues, setTreeValues] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [highlighted, setHighlighted] = useState(null);

  const handleAdd = () => {
    if (!inputValue.trim()) return;
    if (ds === "array") setArray([...array, inputValue]);
    else if (ds === "stack") setStack([...stack, inputValue]);
    else if (ds === "queue") setQueue([...queue, inputValue]);
    else if (ds === "linked-list") setLinkedList([...linkedList, inputValue]);
    setInputValue("");
  };

  const handleRemove = () => {
    if (ds === "array") setArray(array.slice(0, -1));
    else if (ds === "stack") setStack(stack.slice(0, -1));
    else if (ds === "queue") setQueue(queue.slice(1));
    else if (ds === "linked-list") setLinkedList(linkedList.slice(0, -1));
  };

  const resetDS = () => {
    setArray([5, 12, 8, 3, 15]);
    setStack([10, 20, 30]);
    setQueue(["A", "B", "C"]);
    setLinkedList([3, 7, 12, 9]);
    setHighlighted(null);
  };

  const renderTree = () => {
    const vals = treeValues.split(",").map((v) => v.trim()).filter(Boolean);
    const tree = [];
    let level = 0;
    while (tree.length < vals.length) {
      const count = Math.pow(2, level);
      tree.push(vals.slice(tree.length, tree.length + count));
      level++;
    }
    return tree;
  };

  const currentData = {
    array,
    stack,
    queue,
    "linked-list": linkedList,
  }[ds] || [];

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors">
              <Network className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground leading-none">Data Structure Visualizer</h1>
              <p className="text-xs text-muted-foreground mt-1">Visualize arrays, stacks, queues, linked lists, and trees with interactive operations.</p>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap gap-2">
          {["array", "stack", "queue", "linked-list", "tree"].map((d) => (
            <button
              key={d}
              onClick={() => setDs(d)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                ds === d ? "bg-primary text-primary-foreground" : "bg-surface-soft border border-border text-foreground"
              }`}
            >
              {d === "linked-list" ? "Linked List" : d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-foreground uppercase">{ds === "linked-list" ? "Linked List" : ds.charAt(0).toUpperCase() + ds.slice(1)}</h2>
                <button onClick={resetDS} className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1">
                  <RefreshCw size={12} /> Reset
                </button>
              </div>

              {ds !== "tree" ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2 min-h-[60px] p-4 bg-surface-soft rounded-xl border border-border">
                    {currentData.map((item, idx) => (
                      <div key={idx} className="relative">
                        <div className={`px-4 py-2 rounded-lg text-xs font-bold border-2 transition ${
                          highlighted === idx ? "bg-primary/20 border-primary text-primary scale-110" : "bg-background border-border text-foreground"
                        }`}>
                          {item}
                        </div>
                        {ds === "stack" && idx === currentData.length - 1 && (
                          <span className="absolute -top-2 -right-2 text-[8px] font-bold text-primary bg-background px-1 rounded border border-primary">TOP</span>
                        )}
                        {ds === "queue" && idx === 0 && (
                          <span className="absolute -top-2 -left-2 text-[8px] font-bold text-amber-500 bg-background px-1 rounded border border-amber-500">FRONT</span>
                        )}
                        {ds === "queue" && idx === currentData.length - 1 && (
                          <span className="absolute -top-2 -right-2 text-[8px] font-bold text-primary bg-background px-1 rounded border border-primary">REAR</span>
                        )}
                        {ds === "linked-list" && idx < currentData.length - 1 && (
                          <span className="ml-2 text-muted-foreground">→</span>
                        )}
                      </div>
                    ))}
                    {currentData.length === 0 && <span className="text-muted-foreground text-xs italic">Empty</span>}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={
                        ds === "array" ? "Add element" :
                        ds === "stack" ? "Push value" :
                        ds === "queue" ? "Enqueue value" : "Add node"
                      }
                      className="flex-1 bg-surface-soft border border-border rounded-xl text-xs p-3 outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button onClick={handleAdd} className="p-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90">
                      <Plus size={16} />
                    </button>
                    <button onClick={handleRemove} className="p-3 border border-border rounded-xl text-muted-foreground hover:bg-surface-soft">
                      <Minus size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground uppercase">Tree Values (comma separated)</label>
                    <input
                      value={treeValues}
                      onChange={(e) => setTreeValues(e.target.value)}
                      placeholder="e.g., 10, 5, 15, 2, 7, 12, 20"
                      className="w-full bg-surface-soft border border-border rounded-xl text-xs p-3 outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="flex flex-col items-center gap-3 p-4 bg-surface-soft rounded-xl border border-border min-h-[120px]">
                    {renderTree().map((level, lIdx) => (
                      <div key={lIdx} className="flex justify-center gap-3">
                        {level.map((val, vIdx) => (
                          <div key={vIdx} className="px-3 py-2 rounded-lg bg-background border-2 border-primary/30 text-xs font-bold text-foreground">
                            {val}
                          </div>
                        ))}
                      </div>
                    ))}
                    {!treeValues && <span className="text-muted-foreground text-xs italic">Enter comma-separated values to build a tree</span>}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-xs font-bold text-foreground uppercase mb-4">Operations</h2>
              <div className="space-y-3 text-xs text-foreground">
                {ds === "array" && (
                  <>
                    <div className="p-3 bg-surface-soft rounded-xl border border-border"><span className="font-bold text-primary">Access:</span> arr[index] — O(1)</div>
                    <div className="p-3 bg-surface-soft rounded-xl border border-border"><span className="font-bold text-primary">Search:</span> O(n)</div>
                    <div className="p-3 bg-surface-soft rounded-xl border border-border"><span className="font-bold text-primary">Insert/Delete:</span> O(n)</div>
                  </>
                )}
                {ds === "stack" && (
                  <>
                    <div className="p-3 bg-surface-soft rounded-xl border border-border"><span className="font-bold text-primary">Push:</span> Add to top — O(1)</div>
                    <div className="p-3 bg-surface-soft rounded-xl border border-border"><span className="font-bold text-primary">Pop:</span> Remove from top — O(1)</div>
                    <div className="p-3 bg-surface-soft rounded-xl border border-border"><span className="font-bold text-primary">Peek:</span> View top — O(1)</div>
                    <div className="p-3 bg-surface-soft rounded-xl border border-border"><span className="font-bold text-primary">LIFO:</span> Last In, First Out</div>
                  </>
                )}
                {ds === "queue" && (
                  <>
                    <div className="p-3 bg-surface-soft rounded-xl border border-border"><span className="font-bold text-primary">Enqueue:</span> Add to rear — O(1)</div>
                    <div className="p-3 bg-surface-soft rounded-xl border border-border"><span className="font-bold text-primary">Dequeue:</span> Remove from front — O(1)</div>
                    <div className="p-3 bg-surface-soft rounded-xl border border-border"><span className="font-bold text-primary">FIFO:</span> First In, First Out</div>
                  </>
                )}
                {ds === "linked-list" && (
                  <>
                    <div className="p-3 bg-surface-soft rounded-xl border border-border"><span className="font-bold text-primary">Append:</span> Add to end — O(n)</div>
                    <div className="p-3 bg-surface-soft rounded-xl border border-border"><span className="font-bold text-primary">Prepend:</span> Add to start — O(1)</div>
                    <div className="p-3 bg-surface-soft rounded-xl border border-border"><span className="font-bold text-primary">Delete:</span> Remove from end — O(n)</div>
                    <div className="p-3 bg-surface-soft rounded-xl border border-border"><span className="font-bold text-primary">Each node:</span> Value → Next pointer</div>
                  </>
                )}
                {ds === "tree" && (
                  <>
                    <div className="p-3 bg-surface-soft rounded-xl border border-border"><span className="font-bold text-primary">Root:</span> Top node</div>
                    <div className="p-3 bg-surface-soft rounded-xl border border-border"><span className="font-bold text-primary">Parent / Child:</span> Hierarchical</div>
                    <div className="p-3 bg-surface-soft rounded-xl border border-border"><span className="font-bold text-primary">Leaf:</span> Node with no children</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
