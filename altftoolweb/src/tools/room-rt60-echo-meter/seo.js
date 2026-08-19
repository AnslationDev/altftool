const seo = {
  title: "RT60 Echo Meter: Clap Decay Log, -35 to -55 dB",
  metaDescription:
    "Run a clap or sweep recording through FFmpeg in your browser at a -35, -45 or -55 dB floor and download the decay log. Not a calibrated RT60.",
  steps: [
    "Choose your clap or sweep recording in the Source file picker, which accepts audio/*, then set Noise floor to -35dB, -45dB or -55dB.",
    "Press Process locally — the FFmpeg WebAssembly engine loads only at that point and runs silencedetect plus astats on the file in its in-memory filesystem rather than uploading it.",
    "The diagnostic log downloads as altftool-room-rt60-echo-meter-analysis.txt with the silence boundaries and peak/RMS levels, while the Local processing report panel lists the File, Size, Type and Profile used.",
  ],
  intro:
    "The Room RT60 Echo Meter analyses a clap or sweep recording you upload and reports how long the sound tail stays above a noise floor you pick — -35 dB, -45 dB or -55 dB — using FFmpeg's silencedetect and astats decay diagnostics. It is aimed at anyone setting up a home studio, podcast corner, meeting room or practice space who wants a repeatable number for how live the room sounds. The result is a decay and level report you can compare before and after adding treatment, not a calibrated RT60 certificate.",
  useCases: [
    "You have just moved a podcast mic into a spare bedroom and want to know whether the hard wall behind you is adding an audible tail before you buy panels.",
    "You clapped once in a meeting room and once again after hanging curtains, and you want two decay reports side by side to prove the change did something.",
    "A guitar practice room sounds boomy on recordings and you want to see how far the tail extends above a -45 dB floor compared with a room you know sounds dry.",
  ],
  benefits: [
    ["Choose your own noise floor", "Run the same clap at -35 dB, -45 dB and -55 dB to see how the answer depends on where you set the threshold."],
    ["Decay plus level statistics together", "The astats pass reports peak and RMS levels alongside the silence boundaries, so you can tell a quiet room from a short one."],
    ["Honest about its limits", "It reports what the waveform actually shows instead of printing a single confident RT60 figure a phone clap cannot support."],
  ],
  faqs: [
    [
      "What is RT60?",
      "RT60 is the time it takes for sound in a room to decay by 60 decibels after the source stops, the standard reverberation measure defined in ISO 3382. Because a 60 dB drop is rarely measurable above real background noise, acousticians usually measure a 20 dB or 30 dB decay (T20 or T30) and extrapolate it to 60 dB.",
    ],
    [
      "Is a clap recorded on my phone accurate enough for RT60?",
      "No — a phone clap gives you a useful relative comparison, not a calibrated measurement. A proper RT60 needs a repeatable excitation signal such as a sine sweep or starter pistol, a measurement microphone with a known response, several source and receiver positions, and a fitted decay curve; this tool reports the decay and silence diagnostics from your file and stops short of claiming a certified number.",
    ],
    [
      "Which noise floor should I choose?",
      "Start at -45 dB, which sits between the two extremes offered. A -35 dB floor cuts the tail off early and suits noisy rooms, while -55 dB captures more of the decay but will read background hiss as signal if your room is not quiet.",
    ],
    [
      "What reverberation time should a small recording room have?",
      "Small speech and podcast spaces are usually aimed at roughly 0.3 to 0.5 seconds, with music rooms and control rooms treated to taste around or below that. Use the numbers as a direction of travel; for a room that has to meet a specification, have it measured by an acoustic consultant with calibrated equipment.",
    ],
  ],
};

export default seo;
