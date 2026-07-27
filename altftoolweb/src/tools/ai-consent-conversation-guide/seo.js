const seo = {
  intro:
    "The AI Consent Conversation Guide grades how much AI disclosure a specific piece of work needs — nothing formal, a spoken mention, a written note, or disclosure plus sign-off — by weighting how much of the output the AI shaped, who receives it, and whether confidential data, an unreviewed draft, a synthetic likeness or a contract restriction is involved. It then writes the message for you in a plain, warm or formal tone. The thresholds are anchored on real obligations: EU AI Act Article 50 transparency duties, which apply from 2 August 2026, the academic publishers' rule that AI cannot be an author and its use must be declared, and GDPR Article 28, which makes an AI vendor a processor once client data goes into it.",
  useCases: [
    "Tell a client that AI drafted sections of a deliverable, before they find out from the writing style.",
    "Declare AI assistance to a journal or supervisor in the wording those bodies expect.",
    "Raise it with a manager when a contract clause restricts AI use on an account you have already started.",
    "Write the label for a marketing image that contains a synthetic likeness of a real person.",
  ],
  benefits: [
    ["Proportionate, not paranoid", "Brainstorming for an internal note scores as no disclosure needed; a generated deliverable for a regulator does not."],
    ["A script you can send", "Produces the actual wording, including the awkward parts about unreviewed output or billed hours."],
    ["Flags the real obligations", "Names which rule each factor triggers instead of vaguely warning you to be careful."],
  ],
  faqs: [
    [
      "Do I legally have to tell clients I used AI?",
      "It depends on the work and where you are. Under EU AI Act Article 50, applying from 2 August 2026, deepfakes must be labelled and AI-generated text published to inform the public on matters of public interest must be disclosed, but there is no blanket duty for ordinary commercial work. Your contract, professional body rules and any confidentiality clause usually matter more than general AI law.",
    ],
    [
      "How do I disclose AI use in an academic paper?",
      "Declare it in the methods or acknowledgements, naming the tool and what it was used for, and never list the AI as an author — that is the consistent position of ICMJE and the major publishers, because an author must be able to take responsibility for the work. Many journals also require you to confirm you verified any AI-produced content.",
    ],
    [
      "Is it a problem to paste client data into an AI tool?",
      "It can be. Under GDPR Article 28 the AI provider becomes a processor of any personal data you send, which requires a contract and appropriate safeguards, and many client agreements separately restrict sharing their material with third parties. Check whether the tool trains on your inputs, and disclose what went in rather than describing the use in general terms.",
    ],
    [
      "What should an AI disclosure statement actually say?",
      "Name the specific tool, say what it produced, say what you personally did to verify it, and say what data went into it. Vague statements such as 'AI tools were used in preparing this' invite exactly the questions a two-sentence specific disclosure closes off — and this guide drafts the sentences for the tier your work falls into.",
    ],
  ],
};

export default seo;
