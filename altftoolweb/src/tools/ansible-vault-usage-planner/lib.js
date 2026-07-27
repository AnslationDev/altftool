/**
 * Ansible Vault usage planner.
 *
 * The layout it generates is the indirection pattern documented in Ansible's
 * "Keep vaulted variables safely visible" best practice
 * (docs.ansible.com/ansible/latest/tips_tricks/ansible_tips_tricks.html):
 * a plaintext vars file maps each variable to a vault_-prefixed twin that lives
 * in an encrypted vault file, so grep still finds every variable name while the
 * values stay encrypted. Commands follow the ansible-vault CLI docs
 * (docs.ansible.com/ansible/latest/vault_guide/index.html).
 */

/** Prefix Ansible's docs recommend for the encrypted twin of a variable. */
export const VAULT_PREFIX = "vault_";

/**
 * Name fragments that almost always mean the value is a secret.
 * Sources: common credential-scanner keyword lists (gitleaks/trufflehog defaults).
 */
export const SENSITIVE_PATTERNS = [
  /passw(or)?d/i,
  /secret/i,
  /token/i,
  /api_?key/i,
  /private_?key/i,
  /access_?key/i,
  /client_?secret/i,
  /credential/i,
  /(^|_)cert(ificate)?s?(_|$)/i, // \b fails across underscores (tls_cert), so anchor on _ instead
  /keystore/i,
  /passphrase/i,
  /license_?key/i,
  /salt/i,
  /dsn/i,
  /conn(ection)?_?str(ing)?/i,
  /webhook_?url/i,
  /ssh_?key/i,
];

/** Fragments that are usually fine in plaintext but worth a second look. */
export const REVIEW_PATTERNS = [
  { pattern: /user(name)?/i, reason: "Usernames are usually fine in plain vars but pair them with a vaulted password." },
  { pattern: /email/i, reason: "Email addresses are personal data — vault them if the repo is shared widely." },
  { pattern: /\bhost(name)?\b/i, reason: "Hostnames are normally public inside the team; vault only for hardened environments." },
  { pattern: /internal_?url|endpoint/i, reason: "Internal endpoints can aid an attacker; vault in regulated setups." },
  { pattern: /\bip\b|_ip$|^ip_/i, reason: "Internal IPs are low-risk but some policies treat them as sensitive." },
];

export const STRATEGY_OPTIONS = [
  {
    id: "single",
    label: "One vault file (group_vars/all)",
    note: "Simplest: one vault.yml next to vars.yml, one password for everything.",
  },
  {
    id: "per-env",
    label: "Vault file per environment",
    note: "group_vars/<env>/vault.yml each — different passwords, prod stays separate.",
  },
  {
    id: "encrypt-string",
    label: "Inline encrypt_string values",
    note: "No separate vault file; each secret is an !vault block inside normal vars.",
  },
];

const VARIABLE_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

/** Classify one variable name: "encrypt", "review" or "plain" with a reason. */
export function classifyVariable(name) {
  for (const pattern of SENSITIVE_PATTERNS) {
    if (pattern.test(name)) {
      return {
        name,
        level: "encrypt",
        reason: `Matches secret pattern ${pattern.source.replace(/\\b/g, "")} — encrypt it.`,
      };
    }
  }
  for (const { pattern, reason } of REVIEW_PATTERNS) {
    if (pattern.test(name)) {
      return { name, level: "review", reason };
    }
  }
  return { name, level: "plain", reason: "No secret-looking fragment — keep in plain vars." };
}

/**
 * Plan the vault split and command workflow.
 * @param {object} input
 * @param {string} input.namesText   Variable names, one per line ("key: value" lines allowed — value ignored).
 * @param {string} input.strategy    One of STRATEGY_OPTIONS ids.
 * @param {string} [input.envsText]  Comma-separated environments for per-env strategy.
 * @param {boolean} [input.useVaultIds] Label passwords with --vault-id.
 * @returns {object} plan or { error }
 */
export function planVault({ namesText, strategy, envsText = "dev, prod", useVaultIds = false }) {
  if (typeof namesText !== "string" || namesText.trim() === "") {
    return { error: "Enter at least one variable name, one per line." };
  }
  if (!STRATEGY_OPTIONS.some((option) => option.id === strategy)) {
    return { error: "Choose a vault layout strategy." };
  }

  const seen = new Set();
  const names = [];
  const invalid = [];
  namesText.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trim();
    if (line === "" || line.startsWith("#")) return;
    const name = line.split(/[:=\s]/)[0].trim();
    if (name === "") return;
    if (!VARIABLE_NAME_PATTERN.test(name)) {
      invalid.push(name);
      return;
    }
    if (!seen.has(name)) {
      seen.add(name);
      names.push(name);
    }
  });

  if (invalid.length > 0) {
    return {
      error: `Not valid Ansible variable names: ${invalid.join(", ")}. Use letters, digits and underscores, starting with a letter or underscore.`,
    };
  }
  if (names.length === 0) {
    return { error: "No variable names found — enter one per line." };
  }
  if (names.length > 500) {
    return { error: "More than 500 variables — split the list before planning." };
  }

  const classified = names.map(classifyVariable);
  const encrypted = classified.filter((entry) => entry.level === "encrypt");
  const review = classified.filter((entry) => entry.level === "review");
  const plain = classified.filter((entry) => entry.level === "plain");

  const envs =
    strategy === "per-env"
      ? envsText
          .split(",")
          .map((env) => env.trim().toLowerCase())
          .filter((env) => /^[a-z][a-z0-9_]*$/.test(env))
      : [];
  if (strategy === "per-env" && envs.length === 0) {
    return { error: "List at least one environment (letters, digits, underscores) for the per-environment layout." };
  }

  // vars.yml keeps every name greppable; secrets point at their vault_ twin.
  const varsLines = ["# group_vars/all/vars.yml — plaintext, safe to commit"];
  classified.forEach((entry) => {
    if (entry.level === "encrypt") {
      varsLines.push(`${entry.name}: "{{ ${VAULT_PREFIX}${entry.name} }}"`);
    } else {
      varsLines.push(`${entry.name}: "<value>"`);
    }
  });

  const vaultLines = ["# vault.yml — encrypted with ansible-vault, never commit in plaintext"];
  encrypted.forEach((entry) => {
    vaultLines.push(`${VAULT_PREFIX}${entry.name}: "<secret value>"`);
  });
  if (encrypted.length === 0) vaultLines.push("# (no secrets detected — vault file not needed)");

  const idFlag = (label) => (useVaultIds ? `--vault-id ${label}@prompt` : "--ask-vault-pass");
  const commands = [];
  if (strategy === "single") {
    commands.push(
      { title: "Create the vault file", cmd: `ansible-vault create group_vars/all/vault.yml${useVaultIds ? " --vault-id all@prompt" : ""}` },
      { title: "Edit it later", cmd: `ansible-vault edit group_vars/all/vault.yml${useVaultIds ? " --vault-id all@prompt" : ""}` },
      { title: "Run the playbook", cmd: `ansible-playbook site.yml ${idFlag("all")}` },
    );
  } else if (strategy === "per-env") {
    envs.forEach((env) => {
      commands.push({
        title: `Create the ${env} vault`,
        cmd: `ansible-vault create group_vars/${env}/vault.yml${useVaultIds ? ` --vault-id ${env}@prompt` : ""}`,
      });
    });
    commands.push({
      title: "Run against one environment",
      cmd: `ansible-playbook -i inventories/${envs[0]} site.yml ${idFlag(envs[0])}`,
    });
    if (useVaultIds && envs.length > 1) {
      commands.push({
        title: "Run with several vault passwords",
        cmd: `ansible-playbook site.yml ${envs.map((env) => `--vault-id ${env}@prompt`).join(" ")}`,
      });
    }
  } else {
    const example = encrypted[0]?.name ?? "db_password";
    commands.push(
      {
        title: "Encrypt one value inline",
        cmd: `ansible-vault encrypt_string${useVaultIds ? " --vault-id all@prompt" : ""} '<secret value>' --name '${VAULT_PREFIX}${example}'`,
      },
      { title: "Paste the !vault block into vars.yml, then run", cmd: `ansible-playbook site.yml ${idFlag("all")}` },
    );
  }
  commands.push({
    title: "Stop plaintext leaks in CI",
    cmd: "grep -rL '$ANSIBLE_VAULT;' group_vars/*/vault.yml && echo 'UNENCRYPTED VAULT FILE' ",
  });

  return {
    classified,
    counts: { encrypt: encrypted.length, review: review.length, plain: plain.length, total: names.length },
    varsSnippet: varsLines.join("\n"),
    vaultSnippet: vaultLines.join("\n"),
    commands,
    strategy,
    envs,
  };
}
