const seo = {
  title: "Bitrate Converter: Mbps, MB/s, GB/hr, File Size",
  metaDescription:
    "Convert a data rate between kbps, Mbps, Gbps, MB/s, GB per hour and TB per day, then see the file size it makes over a set duration.",
  steps: [
    "Type a Rate value and choose its From unit, then set Duration (minutes) and Target file size (MB) — the fields open at 25 Mbps over 10 minutes with a 500 MB target.",
    "Everything recalculates as you type: the headline reads Megabits per second and states the gigabytes that rate produces over the duration you entered.",
    "Read the kbps, Mbps, Gbps, MB/s, GB per hour and TB per day cards plus the line giving the Mbps your target size needs, then press Copy for the summary or Reset.",
  ],
  intro:
    "The Data Rate Bitrate Converter normalises any data rate to bits per second and converts it into every unit a delivery spec might use — kbps, Mbps, Gbps, MB/s, MiB/s, MB per minute and GB per hour — then shows the file size that rate produces over a given running time. It keeps the two prefix systems apart: bit-rate prefixes are decimal by definition, so 1 Mbps is exactly 1,000,000 bit/s, while byte sizes appear in both decimal MB and binary MiB. Aimed at editors, streamers and developers reconciling an encoder setting against a platform requirement or a storage budget.",
  useCases: [
    "Translate a client's 25 MB/s camera card spec into the Mbps figure your encoder actually asks for.",
    "Check whether a 10-minute export at 40 Mbps will fit inside a 2 GB upload limit.",
    "Work out the bitrate needed to squeeze a 20-minute cut into a 500 MB email-friendly file.",
    "Size a storage plan by converting an ingest rate into terabytes per day.",
  ],
  benefits: [
    [
      "Bits and bytes both ways",
      "Converts across the factor-of-eight boundary that causes most bitrate mistakes.",
    ],
    [
      "Decimal and binary",
      "Shows MB and MiB side by side so a Windows file size and a cloud dashboard figure reconcile.",
    ],
    [
      "Real reference specs",
      "Includes documented rates for DVD, Blu-ray, ProRes, DCP, audio CD and YouTube uploads.",
    ],
  ],
  faqs: [
    [
      "How many Mbps is 1 MB/s?",
      "Exactly 8 Mbps, because one byte is eight bits and both prefixes are decimal in this context. The reverse is also worth memorising: a 100 Mbps connection tops out at 12.5 MB/s of file transfer before any protocol overhead.",
    ],
    [
      "How big is a 10-minute video at 8 Mbps?",
      "About 600 MB. The arithmetic is 8,000,000 bits per second x 600 seconds / 8 bits per byte = 600,000,000 bytes. Add the audio track — a 384 kbps stereo AAC stream adds roughly another 29 MB over the same ten minutes.",
    ],
    [
      "What bitrate should I upload to YouTube?",
      "YouTube's recommended upload bitrates for SDR at standard frame rates are about 8 Mbps for 1080p, 16 Mbps for 1440p and 35-45 Mbps for 2160p, with high frame rate versions roughly 50% higher. YouTube re-encodes everything on ingest, so uploading well above the streaming bitrate gives its encoder better source material.",
    ],
    [
      "Why does my 1 GB file show as 0.93 GB somewhere else?",
      "Because one tool is counting decimal gigabytes (1,000,000,000 bytes) and the other binary gibibytes (1,073,741,824 bytes). The file has not changed; 1 GB is 0.931 GiB. Windows labels binary units as GB, which is where most of the confusion comes from.",
    ],
  ],
};

export default seo;
