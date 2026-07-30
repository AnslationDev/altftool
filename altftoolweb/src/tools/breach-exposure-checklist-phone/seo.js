const seo = {
  intro:
    "The Phone Number Exposure Checklist scores your response to a leaked phone number across 17 weighted steps, grouped by the window each one belongs in — first 24 hours, first week, first month, and ongoing. A phone number is different from most leaked fields because it is the target of a specific attack, a SIM swap, and because banks, carriers and reset flows still treat knowing it as proof of identity. The score is weighted towards the port-out lock that blocks a SIM swap, the habit of never reading a one-time code to a caller, and replacing the number as a verification token. Enter the date you found out and the tool flags which steps have already slipped past their window.",
  useCases: [
    "Your number appeared in a leaked customer database or a data-broker dump and you want an ordered plan instead of a panic list.",
    "You are getting a wave of smishing texts or spoofed spam calls right after a breach notice named your provider.",
    "You suspect a SIM-swap attempt — an unexpected \"SIM activated\" text, lost signal for no reason, or a code you never requested.",
    "You are helping a family member work through carrier lockdown and stop over-trusting caller ID after their number was doxxed.",
  ],
  benefits: [
    [
      "Ordered by window",
      "Every step carries a 24-hour, one-week, one-month or ongoing deadline, and overdue items are surfaced separately so the carrier call happens before the scam call does.",
    ],
    [
      "Weighted, not a flat list",
      "The port-out lock, the SMS-to-authenticator migration and the never-read-back-a-code rule score far higher than call filtering, so effort lands on what actually blocks a takeover.",
    ],
    [
      "Nothing leaves the browser",
      "The number itself is never entered — you tick steps, and the tool stores no personal data at all.",
    ],
  ],
  faqs: [
    [
      "What is a SIM swap and why does a leaked phone number make it more likely?",
      "A SIM swap is when someone convinces your carrier's support desk to move your number onto a SIM they control, so every call and SMS — including one-time codes — goes to them. A leaked number, paired with your name or a few account details, is exactly what makes that support call convincing. A port-out lock and a carrier PIN are the direct defence.",
    ],
    [
      "Should I change my phone number after a breach?",
      "Usually not first. Changing the number is disruptive and most of the actual risk — SIM swap, spoofed calls, its use as a verification token — is fixed by locking the account with your carrier and stopping other services from trusting the number, not by rotating it. Reserve a number change for cases where harassment or targeting continues after the checklist is done.",
    ],
    [
      "Why does the checklist say never to read a one-time code back to a caller?",
      "Because that is the entire attack in one step. Legitimate services never ask for a code they just sent you — a caller who does is using the code you are about to read out to complete a login or a password reset on their end while you are still on the phone.",
    ],
    [
      "Is it safe to trust caller ID showing my bank or carrier's name?",
      "No. Once a number is known to be active and in regular use, spoofing the caller ID of a bank, a carrier or a government office is trivial and common. Hang up and dial the number printed on your card, statement or the provider's official site instead of trusting the display.",
    ],
  ],
};

export default seo;
