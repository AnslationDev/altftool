const seo = {
  intro:
    "The Student Privacy Starter Kit scores a student's real security setup across 16 controls — accounts, personal and shared lab devices, campus Wi-Fi, the student portal, social profiles and coursework backups — and returns a plan sized to the minutes you have free. Each control carries a protection weight of 1 to 5, ordered the way public baselines such as CISA's core advice rank them: multi-factor authentication and unique passwords first, device lock and encryption next, then network and exposure controls. Built for undergraduates and postgraduates who share lab machines, join campus Wi-Fi daily and are about to lose their college mailbox at graduation.",
  useCases: [
    "Set up a new laptop and phone in freshers' week and see which controls matter before the first lab session.",
    "Work out what to fix in a free 30-minute gap between classes instead of trying to do the whole list at once.",
    "Stop a shared computer lab machine from keeping your saved passwords, browser profile and live sessions.",
    "Export college mail and Drive data and move account recovery to a personal address before the student account is deactivated.",
  ],
  benefits: [
    [
      "Weighted, not flat",
      "Multi-factor authentication counts for five points and a bio tweak for three, so the score reflects real risk reduction.",
    ],
    [
      "Fits your actual free time",
      "Enter the minutes you have and it picks the open items with the best protection per minute, criticals first.",
    ],
    [
      "Campus-specific",
      "Covers WPA2-Enterprise certificates, roll-number defaults, ERP directory listings and shared lab machines, not generic advice.",
    ],
  ],
  faqs: [
    [
      "What should a student do first to protect their accounts?",
      "Turn on multi-factor authentication for your personal email and college account, using an authenticator app or passkey rather than SMS. Email is the password-reset path for everything else, so protecting it protects the rest; save the backup codes offline in case you lose the phone.",
    ],
    [
      "Is campus Wi-Fi safe to use?",
      "A WPA2 or WPA3 Enterprise campus network with a verified server certificate is safe for normal use; the open captive-portal SSID is not encrypted at the link layer. Install the network profile your IT department publishes, and never accept a certificate warning to get online faster.",
    ],
    [
      "How do I use a shared lab computer without leaking my passwords?",
      "Use a private or incognito window, decline every save-password prompt, and sign out of both the site and the browser profile before leaving. Never sign into browser sync on a lab machine — that copies your saved passwords and history onto a computer other people use.",
    ],
    [
      "What happens to my college email account after I graduate?",
      "Most institutions suspend or recycle student mailboxes within weeks or months of your final result, and export tools stop working once access ends. Move account recovery to a personal email and phone number, and run the provider's data export while you can still sign in — check your own institution's IT policy for the exact cut-off date.",
    ],
  ],
};

export default seo;
