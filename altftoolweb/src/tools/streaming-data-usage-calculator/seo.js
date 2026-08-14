const seo = {
  title: "Streaming Data Usage Calculator: GB Per Hour",
  metaDescription:
    "1080p at 5 Mbps costs about 2.36 GB an hour. Convert any bitrate to data per minute, hour and month, and see how long your allowance lasts.",
  steps: [
    "Pick from the Quality list — audio presets such as \"Music, normal quality (AAC 128 kbps)\" through video ones such as \"1080p full HD (~5 Mbps)\" and \"4K UHD (~16 Mbps)\" — or choose Custom bitrate and type a figure into \"Bitrate in kbps\".",
    "Set \"Protocol overhead (%, 0-30)\", which starts at 5, then fill Hours per day, Days in the period and Data allowance in GB; the figures recompute as you type, with no calculate button.",
    "Read \"Data used per hour\" at the top plus the Per minute, Per day, Allowance used, \"Hours the allowance covers\" and \"Days at this daily habit\" rows and the \"An hour at every quality\" table, then press Copy result or Reset.",
  ],
  intro:
    "The Streaming Data Usage Calculator converts a stream's bitrate into the mobile data it consumes per minute, hour and month, and tells you how many hours of viewing a given allowance covers. It uses one identity — bytes = bitrate in bits per second ÷ 8 × seconds — which means 1 Mbps sustained for an hour is exactly 0.45 GB, then adds an editable protocol overhead of 5% for the TCP/IP, TLS, manifest and telemetry traffic real apps generate on top of the media payload. It is for anyone on a capped or roaming plan deciding whether an hour of 1080p is worth the data.",
  useCases: [
    "Checking whether a 50 GB monthly allowance survives two hours of 1080p Netflix a day (it does not — that is 141.75 GB).",
    "Sizing a roaming bundle before a flight by seeing that 128 kbps audio uses 60.5 MB an hour against 1080p video's 2.36 GB.",
    "Deciding whether switching a commute podcast from 256 kbps to 64 kbps Opus is worth it — it cuts an hour from 121 MB to 30 MB.",
  ],
  benefits: [
    ["Real bytes, not marketing figures", "Every number comes from bitrate ÷ 8 × time, with the decimal GB that networks actually meter, not binary GiB."],
    ["Overhead you can set", "Adds 5% by default for protocol, manifest and telemetry traffic, because raw media bitrate always understates real usage."],
    ["Answers the allowance question directly", "Shows the hours your cap covers and how many days that is at your own daily viewing habit."],
  ],
  faqs: [
    [
      "How much data does an hour of Netflix use?",
      "About 2.36 GB an hour at 1080p on a 5 Mbps stream with 5% overhead, roughly 1.42 GB at 720p (3 Mbps), and about 7.56 GB at 4K (16 Mbps). Data-saver settings around 300 kbps drop it to about 142 MB an hour. Streaming services use adaptive bitrate, so your actual figure moves with the connection.",
    ],
    [
      "How much data does an hour of Spotify or music streaming use?",
      "About 60.5 MB an hour at the 128 kbps normal setting, 121 MB at 256 kbps high quality, and roughly 667 MB an hour for CD-quality lossless at 1,411 kbps, all including 5% overhead. A 64 kbps speech podcast is about 30 MB an hour, so an hour of talk audio costs less data than 30 seconds of 4K video.",
    ],
    [
      "How do you convert bitrate to gigabytes per hour?",
      "Multiply the kbps figure by 0.00045. That comes from kbps × 1,000 bits × 3,600 seconds ÷ 8 bits per byte ÷ 1,000,000,000 bytes per GB. So 1 Mbps is 0.45 GB an hour and 5 Mbps is 2.25 GB an hour before overhead.",
    ],
    [
      "Why does my phone report more data used than the video bitrate suggests?",
      "Because the media payload is not the only traffic. TCP/IP and TLS framing, HLS or DASH manifests, thumbnail images, player telemetry and re-buffered segments you never watched all count against your allowance. A few percent is typical, which is why this calculator adds 5% by default and lets you raise it to 30%.",
    ],
  ],
};

export default seo;
