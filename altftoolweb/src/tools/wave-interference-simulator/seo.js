const seo = {
  intro:
    "Wave Interference Simulator animates the superposition of sinusoidal waves in real time, summing y = A·sin(kx − ωt + φ) with k = 2π/λ and ω = 2πf so you can watch amplitude, wavelength, frequency and phase reshape the combined wave as you drag them. It covers six modes — single wave, two-wave interference, standing waves, 2D ripple tanks, Young's double slit, and a custom formula box — with a phasor diagram and live resultant amplitude alongside. It is built for physics students and teachers who need to see why two identical waves cancel when one is shifted by π.",
  useCases: [
    "You are teaching superposition and want the class to see two identical waves go from full reinforcement to complete cancellation as the phase offset is dragged from 0 to π",
    "A lab writes up the double-slit experiment and you need to show why halving the slit separation doubles the fringe spacing before the students touch the optical bench",
    "You are working through standing waves on a string and want to watch nodes and antinodes appear when a wave meets its own reflection travelling in the opposite direction",
  ],
  benefits: [
    [
      "Phasor view next to the waveform",
      "The rotating phasor diagram shows why the resultant amplitude is what it is, turning the phase difference from an abstract number into a vector sum you can see.",
    ],
    [
      "Double slit with real optics numbers",
      "Slit separation, screen distance and wavelength are entered in physical units with 405 nm, 532 nm and 633 nm laser presets, so the fringe pattern matches what a bench setup would produce.",
    ],
    [
      "A formula box, not just sliders",
      "Custom mode compiles an expression in x, t, A, k, w and phi against a restricted maths scope, so you can plot a beat, a chirp or a damped wave that no preset covers.",
    ],
  ],
  faqs: [
    [
      "What equation does the simulator use for each wave?",
      "The travelling-wave form y = A·sin(kx − ωt + φ), where the wavenumber k is 2π divided by the wavelength and the angular frequency ω is 2π times the frequency times the speed setting. Two waves are combined by straight addition of their displacements at each point, which is what linear superposition means.",
    ],
    [
      "How is the double-slit pattern calculated?",
      "As the Young two-slit intensity I(y) = cos²(π·d·y / (λ·L)), where d is the slit separation, L the slit-to-screen distance and λ the wavelength; if you give the slits a finite width a, that is multiplied by the single-slit envelope sinc²(π·a·y / (λ·L)). With the built-in 532 nm preset, 0.2 mm separation and a 1.5 m screen distance, the bright fringes come out about 4 mm apart.",
    ],
    [
      "Why do the two waves cancel completely at a phase difference of π?",
      "Because a phase shift of π is exactly half a wavelength, so every crest of one wave lands on a trough of the other and the displacements sum to zero. Complete cancellation only happens when the two amplitudes are equal — with unequal amplitudes the resultant is the difference between them.",
    ],
    [
      "Why do ripple-mode waves fade as they spread out?",
      "Because the simulator applies a 1/√r amplitude falloff from each point source, matching the way energy on a two-dimensional surface spreads over a circle whose circumference grows with the radius. That is why interference bands stay sharpest near the sources and wash out toward the edges.",
    ],
  ],
};

export default seo;
