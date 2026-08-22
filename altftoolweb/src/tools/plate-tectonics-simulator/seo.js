const seo = {
  title: "Plate Tectonics Simulator: 3 Plate Boundaries",
  metaDescription:
    "Animated cross-section of divergent, convergent and transform plate boundaries, with a 1-15 cm/yr velocity slider and the landforms each produces.",
  steps: [
    "Pick 'Divergent (Spreading)', 'Convergent (Subduction)' or 'Transform (Strike-Slip)' under Plate Boundary Type.",
    "Drag the Plate Relative Velocity slider between 1 and 15 cm/yr, and use Pause Motion or Animate Motion to freeze the frame.",
    "Read that boundary's Geologic Features Formed and Seismic Hazard beside the cross-section of plates, subducting slab and asthenosphere.",
  ],
  intro:
    "The Plate Tectonics Simulator draws an animated cross-section of the lithosphere for the three plate boundary types — divergent, convergent and transform — with a relative plate velocity you set anywhere from 1 to 15 cm per year. Each boundary comes with a side panel naming the landforms it produces, its seismic hazard level and its melting mechanism, so the moving picture and the geology vocabulary stay side by side. It is built for earth science students and teachers who need boundary behaviour shown rather than described.",
  useCases: [
    "A student revising for an earth science exam needs to fix the difference between decompression melting at a spreading ridge and flux melting above a subducting slab.",
    "A teacher is introducing continental drift and wants a projectable cross-section they can pause mid-motion to point at the trench and the volcanic arc.",
    "Someone reading about a large earthquake wants to see why a strike-slip fault produces shallow destructive shaking while a mid-ocean ridge only produces moderate tremors.",
  ],
  benefits: [
    [
      "Motion you control",
      "Pause the animation at any frame and change the velocity from 1 to 15 cm/yr to see how spreading rate changes the width of new crust.",
    ],
    [
      "Boundary facts travel with the diagram",
      "Switching boundary type also switches the landforms, seismic hazard and magma source panels, so the visual never sits without its explanation.",
    ],
    [
      "Cross-section, not a map view",
      "The canvas renders the asthenosphere, the rigid plates, the subducting slab and the overlying water column in depth, which is where subduction actually makes sense.",
    ],
  ],
  faqs: [
    [
      "What are the three types of plate boundary?",
      "Divergent, convergent and transform. Divergent boundaries pull apart and build new oceanic lithosphere at mid-ocean ridges and rift valleys, convergent boundaries drive a dense oceanic plate beneath a lighter one to form trenches and volcanic arcs, and transform boundaries slide past each other along strike-slip faults such as the San Andreas.",
    ],
    [
      "How fast do tectonic plates actually move?",
      "Typically a few centimetres a year — roughly fingernail-growth speed. The simulator's velocity slider spans 1 to 15 cm/yr, which brackets the observed range from slow-spreading ridges up through the fastest Pacific spreading centres.",
    ],
    [
      "Which boundary produces the strongest earthquakes?",
      "Convergent subduction zones, which generate mega-thrust earthquakes — the largest events ever recorded. Transform faults produce shallow and highly destructive shaking too, while divergent ridges are limited to moderate shallow quakes.",
    ],
    [
      "Why is there no magma at a transform boundary?",
      "Because nothing changes the mantle's pressure or water content there. Divergent boundaries melt rock by decompression as mantle rises, convergent boundaries melt it by fluxing water off the descending slab, but transform motion is purely horizontal sliding, so no melting mechanism is triggered.",
    ],
  ],
};

export default seo;
