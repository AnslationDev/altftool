const seo = {
  title: "Video Upload Time Estimator: Size, Mbps, Overhead",
  metaDescription:
    "File size in bits over usable throughput: GB and GiB kept apart, protocol overhead and link utilisation applied, with 4G, DSL, cable and fibre presets.",
  steps: [
    "Enter File size and pick a Size unit — MB, GB or TB decimal, or MiB and GiB binary — so a Windows figure is not read as a macOS one.",
    "Enter Upload speed with its unit (kbps, Mbps, Gbps or MB/s) or tap a preset such as Mobile 4G LTE or Gigabit fibre, then set Protocol overhead (%) and Link utilisation (%).",
    "Read Estimated upload time with the usable throughput in Mbps underneath, then press Copy result.",
  ],
  intro:
    "The Video Upload Time Estimator divides a file's size in bits by the usable throughput of your connection to predict how long an upload will actually take. It keeps the two unit systems straight — ISPs quote decimal megabits per second while file managers report megabytes, an eight-fold difference before you count anything else — and then applies a protocol overhead allowance and a link utilisation factor so the answer matches reality rather than the theoretical line rate. Useful for editors, videographers and anyone scheduling a large delivery against a deadline.",
  useCases: [
    "Decide whether a 40 GB ProRes master can reach the client before a 6pm cut-off on a 40 Mbps fibre upload.",
    "Compare uploading from a hotel 4G tether against waiting until you are back on the studio's symmetric fibre.",
    "Work out how many finished episodes you can push to a CDN overnight before the edit suite comes back online.",
    "Sanity-check a hosting quote by seeing what throughput you would need to hit a stated ingest window.",
  ],
  benefits: [
    [
      "Bits versus bytes handled",
      "Decimal MB/GB and binary MiB/GiB are separate options, so a Windows file size is not silently mistaken for a macOS one.",
    ],
    [
      "Real-world throughput",
      "Applies a protocol overhead percentage and a utilisation factor instead of assuming you get the full advertised speed.",
    ],
    [
      "Connection comparison",
      "Shows the same file on 4G, DSL, cable, fibre and gigabit so you can pick where to upload from.",
    ],
  ],
  faqs: [
    [
      "How long does it take to upload a 5 GB video?",
      "On a 40 Mbps upload link at around 90% utilisation with 8% protocol overhead, a 5 GB file takes roughly 20 minutes. The arithmetic is 5 GB = 40 billion bits divided by about 33.3 Mbps of usable throughput. On a 10 Mbps DSL upload the same file takes about 80 minutes.",
    ],
    [
      "Why is my upload slower than the speed my ISP advertises?",
      "Three reasons stack up: most consumer cable and DSL plans are asymmetric so upload is a fraction of the advertised download speed; TCP, IP and TLS headers consume roughly 4-8% of every packet; and congestion control, Wi-Fi contention and other devices stop a single transfer from saturating the link. Allow 85-95% utilisation on a quiet wired connection.",
    ],
    [
      "Is 1 GB the same as 1 GiB?",
      "No. 1 GB is 1,000,000,000 bytes and 1 GiB is 1,073,741,824 bytes, so a GiB is 7.4% larger. Windows Explorer labels binary sizes as GB, while macOS, Android and most cloud dashboards use decimal GB — pick the unit that matches where you read the file size.",
    ],
    [
      "How can I make a large video upload finish faster?",
      "Use a wired connection instead of Wi-Fi, upload a delivery-grade H.264 or H.265 file rather than the camera original, and check whether your host supports resumable multipart uploads so a dropped connection does not restart the transfer. If the line is genuinely the limit, the only real lever is a smaller file or a faster upstream plan.",
    ],
  ],
};

export default seo;
