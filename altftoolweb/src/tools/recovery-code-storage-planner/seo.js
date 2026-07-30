const seo = {
  intro:
    "Recovery Code Storage Planner grades a plan for storing 2FA backup codes against the 3-2-1 backup rule — three copies, on two kinds of media, with one copy off-site — and against two failures unique to authentication. The first is keeping the codes on the same phone that runs your authenticator app, which means one theft takes both the factor and its fallback. The second is a circular dependency: storing the codes only inside the password manager or email account they are meant to recover. You get a resilience score, a pass or fail on each rule, and the specific locations to add next.",
  useCases: [
    "Deciding where to put the ten backup codes a bank or work account just made you download.",
    "Checking whether a screenshot in your photo gallery actually counts as a backup before you wipe the phone.",
    "Setting up a second copy off-site before travelling, so a stolen bag does not end your access to everything.",
    "Reviewing an old plan after switching password managers, when several stored code sets have quietly gone stale.",
  ],
  benefits: [
    [
      "Grades a real backup standard",
      "3-2-1 is the same rule used for data backups, applied to the one secret you cannot ask support to resend.",
    ],
    [
      "Catches the circular trap",
      "Flags the case where every copy sits behind an account those codes exist to unlock.",
    ],
    [
      "Tells you what to add",
      "Ranks the unchosen locations by how many failing rules each one would fix.",
    ],
  ],
  faqs: [
    [
      "Where should I store 2FA backup codes?",
      "Across three copies on at least two kinds of media, with one copy away from your home — for example printed in a fire safe, in your password manager's notes field, and in a sealed envelope with a relative. At least one copy must be reachable without signing into anything, or you cannot use it during the lockout it was created for.",
    ],
    [
      "Is it safe to keep recovery codes in a password manager?",
      "Yes as one of your copies — the vault is encrypted and syncs off-site. It must not be your only copy, because the codes for the password manager's own account would then be locked inside the thing they unlock. Keep an offline copy for that account specifically.",
    ],
    [
      "Can I just screenshot my backup codes?",
      "No, not as your only backup. The screenshot usually lands on the same phone as your authenticator app, syncs to a cloud photo library in plaintext, and is readable by every app you grant photo access to. If your phone is lost or stolen, you lose the second factor and the codes together.",
    ],
    [
      "How often should I regenerate recovery codes?",
      "Review them at least once a year and regenerate after any device loss, a shared-account change, or a suspected compromise. Most services invalidate the entire previous set the moment you generate new codes, so replace every stored copy at the same time — a forgotten printout becomes dead paper that gives you false confidence.",
    ],
  ],
};

export default seo;
