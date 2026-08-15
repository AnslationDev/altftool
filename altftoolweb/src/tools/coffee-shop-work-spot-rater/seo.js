const seo = {
  title: "Coffee Shop Work Spot Rater — Score a Café Out of 100",
  metaDescription:
    "Rate a café as a workspace from nine measurements — upload speed, latency, noise in dB(A), sockets, seating — with hard pass/fail gates for video calls.",
  steps: [
    "Enter measured \"Download\", \"Upload\" and \"Latency\" (the form notes 1.2 Mbps upload covers a 720p call) plus \"Noise at your table\" in dB(A).",
    "Describe the room — \"Power sockets\", \"Usable table depth\", seat, \"How long you can sit\" — and tick \"Toilet available\", \"Free drinking water\" or \"Corner or booth for calls\".",
    "Read the score out of 100, the pass/fail verdicts under \"What you can actually do here\" and the weakest factors, then click \"Copy rating\".",
  ],
  intro:
    "Scores a café out of 100 as a place to work, from nine measurements weighted by how much each one actually decides the day: download and upload speed, latency, noise in dB(A), sockets, table depth, seating, how long you can stay, and whether there is a toilet. It then applies hard gates rather than a single number — a café can score well overall and still fail 'video calls' because its upload sits under the 1.2 Mbps a 720p call needs or the room runs past 65 dB(A).",
  useCases: [
    "Deciding between two cafés near a co-working space before a morning of client calls",
    "Recording a repeatable rating for the places you work from so you stop relearning which one has sockets",
    "Explaining to a team why the café with famously good coffee is not where the standup should happen",
  ],
  benefits: [
    ["Thresholds from real standards", "Zoom's bandwidth figures, ITU-T G.114 latency limits and the NIOSH exposure limit, not vibes."],
    ["Gates, not just a score", "Tells you which specific measurement rules out calls or deep work, with the number that failed."],
    ["Weighted where it matters", "Noise and connection carry more weight than the coffee, because that is what ends a work session."],
  ],
  faqs: [
    [
      "What internet speed do I need to work from a café?",
      "For video calls, about 1.2 Mbps upload for a 720p one-to-one call and about 3.8 Mbps upload for 1080p, per Zoom's published requirements. Upload is the number that matters and the one café connections skimp on — a shared line can show 50 Mbps down and under 1 Mbps up, which reads fast and fails on the first call.",
    ],
    [
      "How loud is too loud to work in a coffee shop?",
      "Above roughly 62 dB(A) sustained concentration gets hard, and above 65 dB(A) your microphone starts sending the room rather than your voice. For reference, normal conversation at one metre is around 60 dB(A) and a busy café runs 70 to 80 dB(A). At 85 dB(A) you have reached the NIOSH recommended exposure limit for an eight-hour day, which is a hearing concern rather than a work one.",
    ],
    [
      "What latency is acceptable for video calls?",
      "ITU-T Recommendation G.114 puts acceptable one-way delay at up to 150 ms, with 150 to 400 ms tolerable but noticeably degraded and beyond 400 ms unusable for conversation. Above about 150 ms people start talking over each other because the natural turn-taking gap disappears.",
    ],
    [
      "How long can you sit in a coffee shop with a laptop?",
      "There is no rule, but the working convention is to buy something roughly every 90 minutes to two hours and to give up a large table at peak times. Many cafés post a limit during busy periods, and some switch the Wi-Fi off at lunchtime. If you need four uninterrupted hours with power, a library or co-working desk is a fairer trade for everyone.",
    ],
  ],
};

export default seo;
