const seo = {
  title: "Lossless Audio Transcoder: WAV, FLAC, MP3, OGG",
  metaDescription:
    "Convert audio to WAV, FLAC, MP3 or OGG with FFmpeg in WebAssembly — processed in the tab, never uploaded. WAV to FLAC round-trips bit-identical.",
  steps: [
    "Choose your recording in the Source file picker, which accepts any audio/* type your browser can decode.",
    "Set Output format to wav, flac, mp3 or ogg and press Process locally — the FFmpeg WebAssembly engine loads at that moment and your recording is written to an in-memory filesystem, not uploaded.",
    "The converted track downloads on its own as altftool-lossless-audio-transcoder.flac (or .wav, .mp3, .ogg) and the Local processing report confirms it completed locally.",
  ],
  intro:
    "Lossless Audio Transcoder converts an audio file to WAV, FLAC, MP3 or OGG using a WebAssembly build of FFmpeg that runs inside the page, so the audio itself is never uploaded to a server. WAV and FLAC are both lossless PCM containers, meaning a WAV to FLAC conversion and back returns bit-identical samples — only the MP3 and OGG targets re-encode and discard data. It is aimed at anyone handed a file in the wrong container: musicians, podcasters, archivists and people feeding audio into software that only accepts one format.",
  useCases: [
    "A studio sent you 24-bit WAV stems that fill your drive, and you want FLAC copies that decode back to the identical samples at roughly half the size.",
    "Your DAW, game engine or hardware sampler refuses to import OGG, so you need a plain WAV of the same recording before you can drop it on the timeline.",
    "You are attaching an interview recording to an email or a form with a size cap and need a compact MP3 or OGG version, while keeping the lossless master untouched.",
  ],
  benefits: [
    [
      "Truly lossless where it matters",
      "WAV and FLAC round-trips preserve the exact PCM samples, so an archive copy is verifiable rather than merely 'high quality'.",
    ],
    [
      "Real FFmpeg, not a re-wrapper",
      "The same decoder set FFmpeg ships with handles the input, so odd sample rates, bit depths and channel layouts convert instead of erroring out.",
    ],
    [
      "The audio never leaves the tab",
      "The file is written into an in-memory filesystem and the result is downloaded directly, which matters for unreleased masters and recorded interviews.",
    ],
  ],
  faqs: [
    [
      "Is converting WAV to MP3 with this tool lossless?",
      "No. Only WAV and FLAC are lossless targets; MP3 and OGG Vorbis are lossy formats and re-encoding to them permanently discards audio data. Keep the WAV or FLAC as your master and treat the MP3 or OGG as a distribution copy.",
    ],
    [
      "How much smaller is FLAC than WAV?",
      "Typically 40 to 60 percent smaller for normal music, depending on how much the material compresses — dense, loud mixes shrink least and sparse acoustic recordings shrink most. The decoded audio is bit-identical to the source WAV either way.",
    ],
    [
      "Does converting FLAC to WAV lose quality?",
      "No. FLAC decodes back to exactly the PCM data it was made from, so a FLAC to WAV conversion is a container change, not a quality change. The file just gets larger because WAV stores samples uncompressed.",
    ],
    [
      "Is there a file size limit?",
      "There is no fixed cap, but everything runs in browser memory, so very long files can exhaust the tab. Multi-hour uncompressed recordings are the usual failure point — split long sessions or convert on a desktop machine with more RAM.",
    ],
  ],
};

export default seo;
