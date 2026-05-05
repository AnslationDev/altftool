import { Node, Edge } from "@xyflow/react";

export const demoNodes = [
  {
    id: "demo-1",
    type: "startEnd",
    position: { x: 250, y: 0 },
    data: { label: "Start" },
  },
  {
    id: "demo-2",
    type: "ioNode",
    position: { x: 230, y: 100 },
    data: { label: "User Input" },
  },
  {
    id: "demo-3",
    type: "process",
    position: { x: 235, y: 220 },
    data: { label: "Process Data" },
  },
  {
    id: "demo-4",
    type: "decision",
    position: { x: 215, y: 340 },
    data: { label: "Is Valid?" },
  },
  {
    id: "demo-5",
    type: "database",
    position: { x: 230, y: 540 },
    data: { label: "Save to DB" },
  },
  {
    id: "demo-6",
    type: "process",
    position: { x: 480, y: 370 },
    data: { label: "Show Error" },
  },
  {
    id: "demo-7",
    type: "document",
    position: { x: 215, y: 670 },
    data: { label: "Generate Report" },
  },
  {
    id: "demo-8",
    type: "startEnd",
    position: { x: 250, y: 800 },
    data: { label: "End" },
  },
];

export const demoEdges = [
  {
    id: "demo-e1-2",
    source: "demo-1",
    target: "demo-2",
    animated: true,
    style: { stroke: "#6366f1", strokeWidth: 2 },
  },
  {
    id: "demo-e2-3",
    source: "demo-2",
    target: "demo-3",
    animated: true,
    style: { stroke: "#6366f1", strokeWidth: 2 },
  },
  {
    id: "demo-e3-4",
    source: "demo-3",
    target: "demo-4",
    animated: true,
    style: { stroke: "#6366f1", strokeWidth: 2 },
  },
  {
    id: "demo-e4-5",
    source: "demo-4",
    target: "demo-5",
    label: "Yes",
    style: { stroke: "#22c55e", strokeWidth: 2 },
    labelStyle: { fill: "#22c55e", fontWeight: 700 },
  },
  {
    id: "demo-e4-6",
    source: "demo-4",
    sourceHandle: "right",
    target: "demo-6",
    label: "No",
    style: { stroke: "#ef4444", strokeWidth: 2 },
    labelStyle: { fill: "#ef4444", fontWeight: 700 },
  },
  {
    id: "demo-e6-2",
    source: "demo-6",
    target: "demo-2",
    animated: true,
    style: { stroke: "#f59e0b", strokeWidth: 2 },
    type: "smoothstep",
  },
  {
    id: "demo-e5-7",
    source: "demo-5",
    target: "demo-7",
    animated: true,
    style: { stroke: "#6366f1", strokeWidth: 2 },
  },
  {
    id: "demo-e7-8",
    source: "demo-7",
    target: "demo-8",
    animated: true,
    style: { stroke: "#6366f1", strokeWidth: 2 },
  },
];
