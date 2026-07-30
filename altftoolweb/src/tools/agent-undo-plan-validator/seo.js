const seo = {
  intro:
    "The Agent Undo Plan Validator reads a proposed AI agent plan — as a JSON action array or as one step per line — and labels every step reversible, recoverable or irreversible, then checks the plan for the four safeguards that would make an undo real: backup, checkpoint, confirmation and rollback. Crucially it grades each safeguard twice, as merely mentioned or as actually detailed, so 'we will take a backup first' is treated differently from a line that says where the backup goes and how it is restored. It is for anyone reviewing an agent plan before granting execution, and it never runs, sends or verifies anything — the analysis is local keyword classification over the text you paste.",
  useCases: [
    "An agent has produced a twelve-step migration plan and you want to know which steps cannot be undone before you approve any of them",
    "You are writing a runbook for an autonomous job and want a check that your rollback section actually says how to roll back, rather than just promising to",
    "You are reviewing a plan that mixes cleanup with a deployment, and need to spot the delete step buried among the read-only ones",
  ],
  benefits: [
    ["Distinguishes mentioned from detailed", "A safeguard counts as detailed only when the plan names a location, method, commit, version or approver alongside it — a bare promise to 'restore if needed' is reported as vague, not present."],
    ["Knows which undos are not undos", "Sending a message, publishing content and moving money are classified irreversible outright, because no rollback step recalls a delivered email or a completed payment."],
    ["Quotes the phrase that triggered it", "Every finding cites the matched wording and the rule it hit, so you can tell a genuine destructive step from a false positive on the word 'remove' in a sentence."],
  ],
  faqs: [
    [
      "What makes a step come back as irreversible?",
      "Two things. Either it matches an inherently irreversible external effect — communication, publication, or money movement — or it contains a destructive phrase such as delete, purge, drop table, truncate, force-push or factory reset without a detailed backup-or-checkpoint and a detailed restoration path in the plan. Add both of those in specific terms and the same step downgrades to recoverable.",
    ],
    [
      "Which safeguards does it look for?",
      "Four: Backup, Checkpoint, Confirmation and Rollback. Which ones are required depends on the step — a state change needs a checkpoint and a rollback, an external side effect needs confirmation and rollback, and a destructive step needs all four. Each is reported as detailed, mentioned but vague, or not found.",
    ],
    [
      "What input format should the plan be in?",
      "Either JSON — a bare array, or an object with an actions, steps, tasks, operations or plan key — or plain text with one step per line. Markdown bullets, numbered lists, checkboxes, headings and code fences are stripped automatically, so you can paste a runbook straight from a document.",
    ],
    [
      "If everything comes back reversible, is the plan safe to run?",
      "No. This is keyword-based static analysis: it cannot see runtime behaviour, hidden instructions, or what a custom tool name really does, and it never checks that the backups and approvals described in the plan actually exist. A reversible label means a rollback path looks plausible in the wording, so verify that path yourself before granting execution.",
    ],
  ],
};

export default seo;
