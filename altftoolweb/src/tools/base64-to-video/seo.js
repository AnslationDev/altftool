const seo = {
  title: "Base64 to Video Decoder with Container Detection",
  metaDescription:
    "Decode Base64 or a data URL into a playable video: container identified from magic bytes, MP4/MOV duration and frame size read from mvhd/tkhd boxes.",
  intro:
    "Base64 to Video decodes a Base64 payload back into a playable video file and tells you exactly which container it is, reading the answer from the file's own magic bytes rather than a declared MIME type. For MP4, MOV and M4V it also reports the running time and frame size, parsed from the `mvhd` and `tkhd` boxes specified in ISO/IEC 14496-12, plus the average bitrate. It is for developers handling clips that arrive inside JSON, a webhook body or a database column.",
  useCases: [
    "Play a short clip that an API returned as a Base64 field, without saving it to disk first",
    "Confirm whether a `data:video/mp4;base64,...` string is really MP4 or a WebM that was mislabelled upstream",
    "Check the duration and resolution of an uploaded clip before deciding whether your transcoding pipeline needs to run",
  ],
  benefits: [
    ["Container read from the bytes", "Ten signatures are checked — ftyp brands for MP4/MOV/3GP, the EBML header for WebM and MKV, RIFF for AVI — so a wrong MIME type is caught."],
    ["Real duration and frame size", "Taken from the mvhd timescale and the 16.16 fixed-point width/height in tkhd, not from a guess or a player callback."],
    ["Stays on your machine", "Decoding and playback both use a local blob URL, so unreleased footage is never uploaded."],
  ],
  faqs: [
    [
      "How do I turn a Base64 string back into a video file?",
      "Paste the string here and press Download — the tool decodes it locally and saves the file with the right extension for its container. Everything after the comma in `data:video/mp4;base64,` is the payload, and you can paste either the whole data URL or just that part.",
    ],
    [
      "How much bigger is a Base64 video than the original file?",
      "About 33% bigger: Base64 encodes every 3 bytes as 4 ASCII characters, so a 10 MB MP4 becomes roughly 13.3 MB of text. That overhead is why video is almost always transferred as a binary upload or a signed URL rather than inline in JSON.",
    ],
    [
      "Why will the decoded video not play in my browser?",
      "Three common reasons. The container may be one browsers do not support — AVI, WMV, FLV and MPEG-TS have no native `<video>` support even though the file is valid. The codec inside a supported container may be unsupported, such as H.265 in an MP4. Or the payload is truncated, so the `mdat` box holding the encoded frames is missing; this tool flags that case explicitly.",
    ],
    [
      "How does the tool know the duration without playing the file?",
      "For ISO Base Media files it reads the movie header box: `mvhd` stores a timescale (ticks per second, commonly 600 or 1000) and a duration in those ticks, and the length in seconds is duration ÷ timescale. WebM, AVI and MPEG streams store timing differently, so duration is only reported for the MP4 family.",
    ],
  ],
};

export default seo;
