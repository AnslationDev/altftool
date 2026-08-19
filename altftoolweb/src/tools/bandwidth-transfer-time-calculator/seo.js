const seo = {
  title: "File Transfer Time Calculator: Mbps, GB, GiB",
  metaDescription:
    "Divide size in bits by link rate and efficiency to get transfer time — bits vs bytes handled, GB and GiB kept separate, overhead shown beside ideal.",
  steps: [
    "Enter the data size and pick a size unit — decimal GB/TB (1000-based) and binary GiB/TiB (1024-based) are separate options.",
    "Enter the link speed with its unit (bit/s up to Gbit/s, or MB/s and GB/s) and set 'Protocol efficiency (%)' — 90 is the default; 100 gives the theoretical minimum.",
    "Read the estimated transfer time with effective MB/s throughput, plus the ideal-time and added-by-overhead rows; 'Copy result' copies the summary.",
  ],
  intro:
    "This calculator computes file transfer time as size in bits divided by effective link rate — the formula time = (bytes × 8) ÷ (bit rate × efficiency) — converting correctly between bits and bytes and between decimal (GB, powers of 1000) and binary (GiB, powers of 1024) units. It is for anyone planning a backup window, cloud migration, video upload or dataset sync who wants to know whether the move takes minutes, hours or days at their line speed.",
  useCases: [
    "Estimating whether a 500 GB server backup finishes overnight on a 100 Mbps uplink",
    "Comparing a 2 TB cloud migration over a 1 Gbps line against shipping a physical drive",
    "Working out upload time for a 40 GB video file on an asymmetric home connection's 20 Mbps upstream",
  ],
  benefits: [
    ["Bits vs bytes done right", "Link speeds are bits per second, file sizes are bytes — the 8× conversion is built in, not forgotten."],
    ["Decimal and binary units", "GB (1000³) and GiB (1024³) are separate options, so Windows-reported sizes convert correctly."],
    ["Overhead made visible", "Shows ideal time and the extra minutes added by protocol overhead side by side."],
  ],
  faqs: [
    [
      "How long does it take to transfer 1 GB at 100 Mbps?",
      "About 80 seconds in theory: 1 GB is 8,000,000,000 bits, and 100 Mbps moves 100,000,000 bits per second. With a realistic 90% protocol efficiency it comes to roughly 89 seconds — around a minute and a half.",
    ],
    [
      "Why is my download speed in MB/s so much lower than my internet plan's Mbps?",
      "Because plans are sold in megaBITS per second and file managers report megaBYTES per second, which are 8 times larger units. A 100 Mbps plan therefore tops out at 12.5 MB/s before any protocol overhead — that factor of 8 is the single most common source of confusion.",
    ],
    [
      "What is the difference between GB and GiB?",
      "A gigabyte (GB) is 1,000,000,000 bytes under the SI convention used by drive makers and macOS, while a gibibyte (GiB) is 1,073,741,824 bytes (1024³) as used by Windows and most programming contexts. The difference is about 7.4%, which matters on multi-terabyte transfers.",
    ],
    [
      "Why do real transfers take longer than the calculated time?",
      "The formula gives a best case for a sustained, uncontended link. Real transfers lose throughput to TCP/IP header overhead and acknowledgements (typically 5-10%), latency limiting the TCP window on long routes, slow disks at either end, and competing traffic — which is why the calculator lets you set an efficiency percentage.",
    ],
  ],
};

export default seo;
