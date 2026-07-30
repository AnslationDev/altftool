const seo = {
  intro:
    "This auditor reviews a pasted sign-in page against the WCAG 2.2 authentication criteria — SC 3.3.8 and 3.3.9 Accessible Authentication, SC 1.3.5 Identify Input Purpose, SC 2.2.1 Timing Adjustable, and SC 3.3.1/3.3.3 error handling — and returns findings graded high, medium or review. It reads the markup for the patterns that turn a login into a memory test: onpaste handlers calling preventDefault, autocomplete=off on credential fields, captcha and security-question wording, and missing alternative sign-in routes. A seven-question checklist then records what you observed in the live flow, because paste blocking, timeout controls and error recovery cannot be judged from static HTML alone.",
  useCases: [
    "Your OTP screen rejects pasted codes and you need the specific criterion and wording to put in a ticket explaining why that has to change",
    "You are preparing an accessibility conformance statement and want a first pass over the login, OTP and password-reset pages before an auditor sees them",
    "A security team wants to add a session timeout to the sign-in step and you need to show what controls WCAG expects alongside it",
  ],
  benefits: [
    ["Each finding cites its criterion", "Every issue names the WCAG 2.2 success criterion behind it, so the report can be handed straight to a developer or an auditor."],
    ["Separates what it read from what you saw", "Findings are tagged as a source heuristic or as observed behaviour, so an inference from markup is never presented as a tested fact."],
    ["The markup is parsed, never executed", "Pasted HTML is scanned as text with scripts and templates stripped out, and nothing is fetched from the page's original host."],
  ],
  faqs: [
    [
      "Is blocking paste in a password or OTP field a WCAG failure?",
      "Yes, under SC 3.3.8 Accessible Authentication (Minimum), a Level AA criterion in WCAG 2.2. Preventing paste forces the user to transcribe or memorise a credential, which is exactly the cognitive function test the criterion prohibits, and it breaks password managers. The same applies to autocomplete=off on username and password fields.",
    ],
    [
      "What does WCAG require if my sign-in step times out?",
      "Under SC 2.2.1 Timing Adjustable you must let the user turn the limit off, or adjust it to at least ten times the default, or warn before it expires and give at least 20 seconds to extend it — with extension possible at least ten times. Security-essential and real-time limits can qualify as exceptions, but the exception has to be justified, not assumed.",
    ],
    [
      "What is the difference between SC 3.3.8 and SC 3.3.9?",
      "The exceptions. SC 3.3.8 (Level AA) allows object recognition and identifying user-provided non-text content as permitted cognitive function tests; SC 3.3.9 (Level AAA) removes those allowances, so a picture-selection challenge that passes at AA still fails at AAA. Findings here flag when a step clears one but not the other.",
    ],
    [
      "Does a clean report mean my login is WCAG conformant?",
      "No. This is a bounded review of up to 300,000 characters and 8,000 elements of pasted markup plus your own checklist answers — it cannot exercise the flow, test with assistive technology, or evaluate anything you did not paste in. Treat it as a triage step before a manual audit, not as a conformance claim.",
    ],
  ],
};

export default seo;
