const seo = {
  intro:
    "Hardware Capability Fingerprint Viewer shows the machine properties a website can read with no permission prompt: navigator.hardwareConcurrency, navigator.deviceMemory, navigator.maxTouchPoints and the CSS pointer, hover, any-pointer and any-hover media features. Each reading is checked against the values its specification allows — device memory, for example, is rounded to a power of two and capped at 8 GB — and labelled ordinary or unusual, with a device class inferred from input capability rather than the user-agent string. It exists so you can see what fingerprinting scripts collect at this layer before deciding whether it matters to you.",
  useCases: [
    "Check whether your core count or memory bucket puts you in a common group or an unusual one.",
    "Verify that a privacy browser or spoofing extension is reporting values a real browser could return.",
    "Work out why a site is serving you a touch or desktop layout by reading the same pointer and hover queries it uses.",
    "Demonstrate to a team which hardware details leak from navigator before any tracking script loads.",
  ],
  benefits: [
    [
      "Specification-checked values",
      "Flags a device-memory reading that is not one of the six values the API is allowed to return, which usually means an extension altered it.",
    ],
    [
      "Device class from capability",
      "Classifies phone, hybrid or desktop from pointer, hover and touch points rather than a user-agent string that anyone can edit.",
    ],
    [
      "Honest ceiling, not a scare number",
      "Reports an upper bound on how many distinct answers these fields can produce, stated as an upper bound rather than a measured uniqueness.",
    ],
  ],
  faqs: [
    [
      "Can a website see how much RAM my computer has?",
      "Only a coarse bucket. The Device Memory API rounds the figure to a power of two and caps it at 8 GB, so machines with 16, 32 or 64 GB all report 8. Firefox does not implement the API at all, so the value is simply absent there.",
    ],
    [
      "What does navigator.hardwareConcurrency actually report?",
      "The number of logical processors available to run threads, which includes hyper-threaded siblings rather than physical cores only. Browsers may cap the value, so a large machine can legitimately report a smaller number than it has.",
    ],
    [
      "Is maxTouchPoints a reliable way to detect a phone?",
      "On its own, no. Many Windows laptops report 10 touch points and some tablets report 5 while being used with a keyboard and trackpad. Combining maxTouchPoints with the pointer and hover media features is far more accurate, which is what the device class here uses.",
    ],
    [
      "Can I stop my browser reporting these values?",
      "Not selectively in a normal browser, but you can reduce them. Firefox omits device memory entirely, hardened browsers cap or normalise the processor count, and running an unmodified mainstream browser at default settings keeps you in a larger crowd than a heavily customised spoofing setup.",
    ],
  ],
};

export default seo;
