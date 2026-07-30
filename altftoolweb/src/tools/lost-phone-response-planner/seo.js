const seo = {
  intro:
    "Lost Phone Response Planner turns 'my phone is gone' into a numbered, correctly ordered action list — from marking the device lost in Find My Device or Find My, to suspending the SIM, to changing the account password that everything else recovers through. It reorders the steps based on four facts about the device: platform, whether a screen lock was set, whether banking or wallet apps were on it, and whether work or other sensitive access was signed in. If the phone had no screen lock, session and financial revocation is promoted to the top, because in that case the attacker is already inside.",
  useCases: [
    "Your phone was taken on a train and you are on a borrowed laptop with adrenaline running — you need the order of operations rather than a list of everything you could theoretically do.",
    "A parent or older relative has lost their phone and you are talking them through it by phone, so you need a shared checklist that names the official channels to call rather than search results.",
    "You are writing your household or small-team incident note before anything happens, and want a pre-agreed sequence for device loss covering SIM suspension, bank freeze and work token revocation.",
  ],
  benefits: [
    [
      "Ordered by damage, not convenience",
      "SIM suspension and account password change come before remote erase, because a live SIM lets someone intercept the OTPs that reset every other account.",
    ],
    [
      "The unlocked-phone case is treated differently",
      "With no PIN or biometric on the device, session and financial revocation jumps to step one and the plan is labelled Critical instead of Urgent.",
    ],
    [
      "Warns before the irreversible step",
      "Remote erase is deliberately placed last with a note to weigh backups, evidence and location tracking first, since wiping can destroy both your data and any trail.",
    ],
  ],
  faqs: [
    [
      "What should I do first when my phone is stolen?",
      "From a safe device, sign in to the official Find My Device (Android) or Find My (iPhone) service and mark the phone as lost with a callback message — that locks the screen and displays contact details. If the phone had no screen lock, revoke active account sessions and freeze financial access first, because everything on it is already reachable.",
    ],
    [
      "Should I block my SIM or my bank account first?",
      "Block the SIM first in almost every case. The SIM receives the OTPs and SMS resets that unlock bank, email and wallet accounts, so suspending it through the operator's independently verified number removes the attacker's master key before you start closing individual accounts.",
    ],
    [
      "Should I remote-wipe my lost phone straight away?",
      "Not immediately. Remote erase is the last step in the plan because it can be irreversible — it may remove data you have no backup of and end location tracking that police or your insurer would use. Mark the device lost, suspend the SIM and revoke sessions first, then erase once recovery looks unlikely.",
    ],
    [
      "How many steps does the plan produce?",
      "Four core steps, rising to as many as eight when banking apps, work access and a missing screen lock all apply. The extra steps are inserted at the position that matches their urgency, not appended to the end.",
    ],
  ],
};

export default seo;
