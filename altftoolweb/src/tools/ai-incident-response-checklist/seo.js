const seo = {
  title: "AI Incident Response Checklist on NIST SP 800-61",
  metaDescription:
    "Build a runbook for harmful output, data leaks, prompt injection or leaked prompts — NIST four phases, GDPR 72-hour trigger, Copy as Markdown.",
  steps: [
    "Select the \"Incident type\" — harmful output, sensitive data leaked in a response, prompt-injection abuse or a leaked system prompt — and the \"Severity\".",
    "Tick \"Users saw the output\", \"Personal data involved\" or \"Third-party model / API\"; personal data adds the DPO and GDPR Article 33 72-hour assessment steps.",
    "Work through the four NIST SP 800-61 phases, watch the \"N of M steps done\" counter, then press \"Copy as Markdown\" to paste the runbook into your incident channel.",
  ],
  intro:
    "The AI Incident Response Checklist generates a tailored, step-by-step response plan for incidents involving AI system output — harmful content shown to users, sensitive data leaked in a response, prompt-injection abuse, or a leaked system prompt or model artefact. It structures every checklist on the NIST SP 800-61 incident-handling lifecycle (preparation, detection and analysis, containment and recovery, post-incident activity) and adapts the steps to severity, personal-data involvement and third-party model use. It is built for engineering leads, security teams and AI product owners who need a working runbook before or during an incident.",
  useCases: [
    "A startup whose chatbot produced dangerous instructions building a containment and regression-testing plan within the hour",
    "A team whose RAG assistant leaked another customer's data working through breach assessment, log purging and the GDPR 72-hour notification question",
    "A security engineer preparing a prompt-injection runbook that covers tool lockdown, session invalidation and rollback of injected actions",
  ],
  benefits: [
    ["NIST 800-61 structure", "Steps are organised into the standard four phases, so the checklist plugs into existing incident processes."],
    ["Incident-specific steps", "Harmful output, data leaks, prompt injection and artefact leaks each get their own analysis and containment actions."],
    ["Regulatory triggers flagged", "Personal-data incidents add DPO involvement and the GDPR Article 33 72-hour notification assessment automatically."],
  ],
  faqs: [
    [
      "What should I do first when my AI chatbot produces harmful output?",
      "Preserve the evidence before changing anything: capture the exact prompt, output, model version, system-prompt version and safety-filter settings. Then assess severity and reproducibility — a reproducible harmful output usually justifies disabling the feature via kill switch while you add the failing pattern to your moderation layer and regression tests.",
    ],
    [
      "Is an AI data leak a reportable data breach under GDPR?",
      "It can be. If personal data was disclosed in model output to someone not entitled to see it, that is a personal data breach under GDPR, and Article 33 requires notifying the supervisory authority within 72 hours of becoming aware unless the breach is unlikely to risk individuals' rights. Involve your DPO or privacy counsel immediately — this checklist flags the assessment step but the legal call is theirs.",
    ],
    [
      "How do I respond to a prompt injection attack?",
      "Contain the capability, not just the string: scope down or disable the tools and data sources reachable from injected context, invalidate affected sessions, and undo any state changes the injected instructions caused. Then fix the trust boundary between untrusted content and instructions — pattern blocklists alone are bypassable, which is why OWASP lists prompt injection as the top LLM application risk.",
    ],
    [
      "What is the NIST incident response lifecycle?",
      "NIST SP 800-61, the Computer Security Incident Handling Guide, defines four phases: preparation; detection and analysis; containment, eradication and recovery; and post-incident activity. This tool maps AI-specific steps — like preserving prompts and model versions, or converting failures into evaluation-suite regression tests — onto those same four phases.",
    ],
  ],
};

export default seo;
