const seo = {
  title: "Triangle Budget Calculator for Low Poly Game Assets",
  metaDescription:
    "Turn measured tris/sec throughput and a target fps into a per-frame triangle budget, split across asset classes with LOD chains and buffer memory.",
  steps: [
    "Enter Geometry throughput (million tris/sec) or tap a tier chip such as Modern mobile & standalone VR, then set Target frame rate (fps), Share of the frame geometry may use (%) and the Vertex duplication factor (seams & hard edges).",
    "Under Asset classes, give every class its share of the budget and how many are visible at once.",
    "On-screen triangle budget shows the per-frame count with Frame time and Geometry slice of the frame in ms, and the \"Per-asset budgets and LOD chain\" table lists class total, per instance and LOD1 / 2 / 3; Copy budget copies the plan.",
  ],
  intro:
    "The Low Poly Budget Planner converts a measured geometry throughput and a frame-rate target into the number of triangles you can draw in one frame, using triangles = throughput x geometry share of the frame / target fps. It then splits that budget across asset classes with largest-remainder apportionment, derives a per-instance count, builds a halving LOD chain and estimates vertex and index buffer memory from a 24-byte vertex layout. It is aimed at 3D artists and technical artists agreeing a poly-count spec before modelling starts.",
  useCases: [
    "Set a hero-character triangle cap before blockout so the model does not have to be rebuilt at review.",
    "Check whether 200 scattered foliage instances still fit once characters and environment take their share.",
    "Work out how much VRAM the visible meshes need for vertex and index buffers at a given budget.",
    "Compare the same scene spec at 30, 60 and 90 fps to see what a frame-rate bump actually costs the art team.",
  ],
  benefits: [
    ["Budget from frame time", "Every number traces back to how many milliseconds of the frame geometry may use."],
    ["Shares that add up", "Largest-remainder apportionment means the class totals equal the frame budget exactly."],
    ["Memory, not just triangles", "Buffer size uses Euler's V = F/2 + 2 plus a seam duplication factor and the real index width."],
  ],
  faqs: [
    [
      "How many triangles should a low poly character be?",
      "There is no fixed number — it depends on how much of the frame that character is allowed to own. Divide your per-frame triangle budget by the share you assign to characters and by how many are visible at once; on a 100 million tris/second device at 60 fps with half the frame given to geometry, the whole scene budget is about 833,000 triangles.",
    ],
    [
      "How do I calculate a triangle budget for a target frame rate?",
      "Multiply the geometry throughput you measured on the target device by the fraction of the frame geometry may use, then divide by the target frame rate. At 60 fps the whole frame is 16.67 ms, so a 50% geometry share leaves roughly 8.33 ms for pushing triangles.",
    ],
    [
      "How many vertices does a triangle mesh have?",
      "For a closed triangulated surface Euler's formula gives V = F/2 + 2, so a 10,000-triangle mesh has about 5,002 topological vertices. The GPU sees more because UV seams and hard edges split vertices — a factor of roughly 1.3 to 1.6 is common, and once the mesh needs 65,536 vertices the index buffer doubles from 16-bit to 32-bit.",
    ],
    [
      "What LOD reduction ratio should I use?",
      "Halving the triangle count at each level (100%, 50%, 25%, 12.5%) is the default most engine LOD groups ship with and is what this planner shows. Aggressive scatter assets such as foliage often drop faster or switch to impostors, while silhouettes that stay close to camera need gentler steps.",
    ],
  ],
};

export default seo;
