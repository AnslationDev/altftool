const seo = {
  intro:
    "The Streaming Bandwidth Calculator works out the upload speed a live stream actually needs, adding video and audio bitrate, inflating the total by TCP/IP and RTMP protocol overhead (5% by default), then multiplying by a safety headroom factor — the common advice being twice the stream bitrate. It also converts the on-the-wire rate into gigabytes per hour and for the whole session, so you can check a stream against a data cap as well as against a line speed. It is for streamers and event technicians who need to know whether a given connection can carry 1080p60 before they go live on it.",
  useCases: [
    "You are streaming an event from a venue whose upload you can measure but not change, and need to pick the highest quality preset the line will actually sustain.",
    "Your ISP applies a monthly data cap and you want to know what four hours of 1080p60 costs you in gigabytes before you commit to a weekly schedule.",
    "Frames drop about ten minutes into every stream and you want to check whether the line was only ever marginal once protocol overhead is counted, rather than blaming the encoder.",
  ],
  benefits: [
    ["Counts what the encoder does not", "Your encoder reports the stream bitrate; the wire carries 5% more once headers and retransmissions are added, which is exactly the margin that makes a 'just enough' connection fail."],
    ["Verdict against your real upload", "Enter your measured speed and it returns comfortable, tight or insufficient against both the raw bitrate and your chosen headroom, instead of leaving you to compare two numbers."],
    ["Data usage as well as speed", "The same figures are converted to GB per hour and GB per session using decimal gigabytes, the unit ISPs use for caps, so the answer is directly comparable to your plan."],
  ],
  faqs: [
    [
      "How much upload speed do I need to stream 1080p 60fps?",
      "About 12.9 Mbps to be comfortable. A typical 1080p60 stream runs 6,000 kbps of video plus 128 kbps of audio, which becomes roughly 6.43 Mbps on the wire after 5% protocol overhead, and the standard advice is to hold twice that in upload capacity so spikes and other devices do not cause dropped frames.",
    ],
    [
      "How much data does live streaming use per hour?",
      "Around 2.9 GB per hour for a 1080p60 stream at 6,000 kbps video and 128 kbps audio, or about 1.5 GB per hour at 720p30. A four-hour 1080p60 session comes to roughly 11.6 GB, which matters if your connection has a monthly cap.",
    ],
    [
      "Why is my actual bandwidth use higher than my bitrate setting?",
      "Because the encoder's bitrate covers only the media payload. TCP/IP and RTMP or SRT headers plus retransmitted packets typically add 3 to 5% on top, so a 6,128 kbps stream occupies about 6,434 kbps of real line capacity — and more on a lossy connection, where retransmissions climb.",
    ],
    [
      "Why is 6,000 kbps mentioned as a limit?",
      "That is the ingest ceiling most Twitch channels are given, so a higher video bitrate may be rejected or transcoded regardless of how good your connection is. YouTube Live accepts more — its published 1080p60 range reaches 9,000 kbps — so check your destination platform's own limit before raising the bitrate.",
    ],
  ],
};

export default seo;
