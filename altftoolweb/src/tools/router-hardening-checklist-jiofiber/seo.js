const seo = {
  title: "JioFiber Router Hardening Checklist",
  metaDescription:
    "Score your JioFiber ONT: sticker admin password, WPA2/WPA3, WPS, UPnP and port forwards. Critical gaps cap the score; includes a Wi-Fi crack-time table.",
  steps: [
    "Pick a Risk profile and tick each JioFiber hardening item you have completed — items tagged critical cap the score while they stay open.",
    "Set Attacking GPUs to compare WPA2 crack times for phone-number, birthday, lower-case and mixed 12-character Wi-Fi keys.",
    "Read the Hardening score percentage, its band and the Next actions list, then press Copy checklist to export the summary.",
  ],
  intro:
    "The JioFiber Router Hardening Checklist walks through the settings that matter on a Jio Home Gateway or ONT: changing the sticker admin password, avoiding mobile-number Wi-Fi keys, keeping WPA2/WPA3 on, disabling WPS, checking UPnP and port forwards, using guest Wi-Fi, and knowing which items Jio manages remotely. The score weights critical controls more heavily and caps the result when a critical hole remains open.",
  useCases: [
    "Secure a JioFiber ONT after installation day before sharing the Wi-Fi key with family or tenants.",
    "Check whether a phone-number or birthday Wi-Fi password is easy to crack from a captured WPA2 handshake.",
    "Re-audit settings after a technician visit, ONT replacement or factory reset.",
    "Prepare a work-from-home connection by closing remote administration, UPnP and stale port forwards.",
  ],
  benefits: [
    ["India-first router defaults", "The checklist uses JioFiber's common gateway address, MyJio control surface and sticker-password reality."],
    ["Critical-step cap", "Missing WPS, admin-password or WPA controls can cap the score even if many minor items are done."],
    ["Pattern crack-time table", "The WPA2 estimator compares mobile numbers, birthdays, lower-case keys and mixed 12-character passwords."],
  ],
  faqs: [
    [
      "What is the JioFiber router admin address?",
      "Most Jio Home Gateways answer at 192.168.29.1, though some homes may also see 192.168.1.1. The sticker on the ONT and the MyJio app are the practical source for your model.",
    ],
    [
      "Why is a mobile number a weak Wi-Fi password?",
      "An Indian mobile number is ten digits and normally starts with 6, 7, 8 or 9, so the search space is about 4 billion candidates. A captured WPA2 handshake can be tested offline, making that pattern far weaker than a random mixed passphrase.",
    ],
    [
      "Can I control JioFiber firmware myself?",
      "Usually no. Jio manages ONT firmware and WAN provisioning remotely. That is why the checklist separates the settings you can change from the vendor-managed items you should re-check after visits or resets.",
    ],
  ],
};

export default seo;
