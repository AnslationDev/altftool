const seo = {
  intro:
    "This planner classifies each of your Ansible variables as encrypt, review or plain using credential-keyword rules, then generates the vars/vault indirection layout and the exact ansible-vault command workflow to match. It implements the pattern from Ansible's own best-practice docs: keep a plaintext vars.yml where each secret points at a vault_-prefixed twin stored in an encrypted vault.yml, so variable names stay greppable while values stay encrypted.",
  useCases: [
    "Auditing an existing group_vars tree to find password, token and key variables still sitting in plaintext",
    "Setting up a new project with separate vault files and passwords for dev and prod using --vault-id labels",
    "Deciding between one shared vault.yml and inline ansible-vault encrypt_string blocks for a small playbook",
  ],
  benefits: [
    ["Instant classification", "Password, secret, token, key, cert and connection-string patterns are flagged for encryption automatically."],
    ["Greppable secrets layout", "Generates the documented vault_ prefix indirection so grep still finds every variable name."],
    ["Copy-paste command flow", "ansible-vault create, edit and encrypt_string commands come pre-filled for your chosen layout."],
  ],
  faqs: [
    [
      "Which Ansible variables should I encrypt with Vault?",
      "Anything whose value grants access: passwords, API keys, tokens, private keys and certificates, connection strings and webhook URLs. Structural values like ports, regions and package lists can stay in plain vars; usernames are usually fine in plaintext but should sit next to a vaulted password.",
    ],
    [
      "What is the vault_ prefix pattern in Ansible?",
      "It is Ansible's documented best practice for keeping vaulted variables visible: vars.yml holds db_password: \"{{ vault_db_password }}\" in plaintext while the encrypted vault.yml holds vault_db_password with the real value. Grep and ansible-doc searches still find db_password, but the secret itself is encrypted.",
    ],
    [
      "Should I use one vault password or one per environment?",
      "Use one vault file and password for small single-team projects, and a vault per environment with --vault-id labels (for example dev@prompt and prod@prompt) once production secrets must be restricted to fewer people. Separate vault IDs let CI decrypt dev without ever holding the prod password.",
    ],
    [
      "What is the difference between ansible-vault encrypt and encrypt_string?",
      "ansible-vault encrypt seals a whole file, while encrypt_string encrypts a single value that you paste inline as a !vault block inside a normal vars file. Whole-file vaults are easier to manage at scale; encrypt_string avoids a separate file when you have only one or two secrets.",
    ],
  ],
};

export default seo;
