const seo = {
  intro:
    "The International Roaming Privacy Guide compares the four ways to stay connected abroad — home SIM roaming, a prepaid travel eSIM, a local SIM bought on arrival, and cellular off with Wi-Fi and a VPN — and scores each against what you actually need: OTP access on your home number, minimum new identity exposure, capped spending, coverage and setup effort. It rules out options your handset cannot support, and lists what the network still sees regardless of which SIM is in the phone. Written for travellers who have been told a local SIM makes them anonymous, which in most countries it does not.",
  useCases: [
    "Decide before a two-week multi-country trip whether one regional eSIM beats buying a SIM at each border.",
    "Work out how to keep receiving Indian bank and UPI OTPs while using cheap local data on a single-SIM handset.",
    "Check whether a carrier-locked or non-eSIM phone leaves you with any option other than home roaming.",
    "Explain to a family member why turning cellular off is the only setting that stops the location trail, and what stops working when they do it.",
  ],
  benefits: [
    [
      "Honest about what SIM swapping fixes",
      "Changing SIM changes who holds the record of your movements; it never removes the record or the handset's IMEI.",
    ],
    [
      "Ruled out, not just ranked",
      "Options your handset cannot run — no eSIM, carrier-locked, single line with OTP needs — are excluded with the reason.",
    ],
    [
      "OTP access treated as a hard requirement",
      "Data-only travel eSIMs carry no SMS, so any plan that drops your home number is flagged before you are stranded abroad.",
    ],
  ],
  faqs: [
    [
      "Does a local SIM make me anonymous abroad?",
      "In most countries, no. Prepaid SIM registration with a passport or national ID is mandatory in India, Spain, Germany, Italy, Thailand, the UAE and dozens of other countries, so buying locally links your travel document to a new carrier's database rather than hiding you. A handful of places still allow unregistered prepaid, but the visited network logs your cell usage either way, and your handset presents the same IMEI whichever SIM is inside it.",
    ],
    [
      "Can I receive bank OTPs on a travel eSIM?",
      "Almost never. Consumer travel eSIMs are sold as data-only products with no voice and no SMS, so a code sent to your home number will not arrive on them. To keep OTPs you have to keep the home line registered — either roaming on its own, or as the second line on a dual-SIM handset with data roaming switched off so it only carries text messages.",
    ],
    [
      "Is my home operator tracking me while I roam?",
      "Your home operator can see which country and which partner network you have registered on, because inter-operator signalling has to route your calls and texts to wherever you are. The visited network sees more detail, down to the cells your handset used. Neither of those depends on your consent settings; the only way to stop the trail is to turn the cellular radio off.",
    ],
    [
      "Is hotel or airport Wi-Fi with a VPN safer than mobile data?",
      "For confidentiality, mobile data is generally the safer default, because a public Wi-Fi network is an untrusted local network that anyone else on it can probe. A VPN protects the traffic in transit but moves your trust to the VPN operator, who then sees the same metadata your ISP would. If you use Wi-Fi, use a reputable paid VPN, turn off auto-connect to open networks, and never enter banking credentials on a captive-portal network you cannot verify.",
    ],
  ],
};

export default seo;
