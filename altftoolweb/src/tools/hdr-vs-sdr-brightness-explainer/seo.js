const seo = {
  title: "HDR vs SDR Nits: PQ and HLG Code Value Explainer",
  metaDescription:
    "Convert nits to PQ (ST 2084) and HLG code values, see headroom in stops over 203-nit reference white, and what skipping tone mapping costs.",
  steps: [
    "Enter HDR peak (nits), SDR display peak (nits) and Diffuse (paper) white in the grade (nits).",
    "Set Level to explain (nits) to the highlight you want broken down.",
    "Read the PQ code value and HLG signal for that level, the tone-mapped versus untone-mapped nits, Brightness lost by skipping tone mapping in stops and the Brightness ladder, then press Copy result.",
  ],
  intro:
    "This explainer converts absolute brightness in nits into PQ (SMPTE ST 2084) and HLG (ITU-R BT.2100) code values, then shows how much headroom an HDR grade has above diffuse white and what happens to that headroom on an SDR screen. It tone maps with extended Reinhard against the HDR peak and contrasts that with the untone-mapped result a naive player produces, which is the usual reason an HDR grade looks flat and dark on SDR. Written for editors, colourists and developers who keep hearing about nits without a clear picture of what the numbers mean.",
  useCases: [
    "Work out how many stops of specular headroom a 1000-nit grade actually has over a 203-nit diffuse white.",
    "Show a client why the HDR master looks washed out when their laptop plays it back without tone mapping.",
    "Convert a target highlight level in nits into the PQ code value a grading tool expects.",
    "Sanity-check whether a highlight will clip on a typical 200-nit SDR laptop panel.",
  ],
  benefits: [
    ["Real transfer functions", "PQ and HLG use their published constants, so the code values match a scope."],
    ["Headroom in stops", "Brightness differences are expressed the way a photographer already thinks about them."],
    ["Names the failure mode", "Side-by-side tone-mapped and untone-mapped values quantify the flat-looking playback."],
  ],
  faqs: [
    [
      "What is a nit and how bright is 1000 nits?",
      "A nit is one candela per square metre, a measure of light actually leaving the screen. SDR is mastered to 100 nits reference white, HDR reference white sits at 203 nits under ITU-R BT.2408, and 1000 nits is a common HDR mastering peak — roughly 2.3 stops of headroom above that reference white.",
    ],
    [
      "Why does HDR video look washed out or grey on my screen?",
      "Usually the player is sending an HDR signal to a display or pipeline that treats it as SDR, so the PQ code value gets fed to a gamma curve instead of being tone mapped. Feeding a 203-nit PQ code to a 200-nit gamma 2.4 display produces about 54 nits — roughly a stop darker than it should be, which reads as flat and desaturated.",
    ],
    [
      "What is the difference between PQ and HLG?",
      "PQ is absolute: a code value maps to a fixed luminance in nits regardless of the display, which is why it needs mastering metadata. HLG is relative and scene-referred, with the signal below 1/12 of scene white following a square root and above it a logarithm, so it degrades more gracefully on an SDR display.",
    ],
    [
      "How many stops of dynamic range does HDR add?",
      "It depends entirely on the peak and the diffuse white you compare against, not on the label. A 1000-nit peak over a 203-nit diffuse white is about 2.3 stops of specular headroom; a 4000-nit peak over the same white is about 4.3 stops.",
    ],
  ],
};

export default seo;
