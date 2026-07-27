const seo = {
  intro:
    "This chooser compares the SSH key algorithms OpenSSH still supports — Ed25519, ECDSA on the NIST curves, RSA, and the FIDO2 hardware variants — against the constraints you actually have: the oldest server that must accept the key, any mandated security strength, and whether the private key has to live on a security token. Strengths are the comparable-security figures from NIST SP 800-57 Part 1 Rev. 5, so RSA-2048 is treated as 112-bit and RSA-3072 as 128-bit, the same level as Ed25519. It ends with the exact ssh-keygen line plus the fingerprint, permission and agent commands that follow it.",
  useCases: [
    "Deciding what to standardise on before rolling new deploy keys across a fleet",
    "Working out whether a legacy network appliance forces you back to RSA, and at what size",
    "Setting up an Ed25519-sk key on a YubiKey with a PIN required for every signature",
  ],
  benefits: [
    ["Constraint driven", "Rules out algorithms your oldest server or your policy cannot accept, instead of just listing options."],
    ["Real strength figures", "Uses the NIST SP 800-57 comparable-strength table rather than treating a bigger number as automatically better."],
    ["Command included", "Produces the ssh-keygen invocation with the right -t, -b and -a values, plus the follow-up commands."],
  ],
  faqs: [
    [
      "Should I use Ed25519 or RSA for SSH?",
      "Use Ed25519 unless something forces your hand. It gives roughly the same 128-bit security as RSA-3072 in a 32-byte public key, signs far faster, and has been available since OpenSSH 6.5 in 2014. Stay on RSA only for hardware or appliances that predate that.",
    ],
    [
      "Is RSA 4096 meaningfully safer than RSA 3072?",
      "Barely. NIST rates RSA-3072 at 128-bit strength and does not reach 192-bit until RSA-7680, so 4096 lands in between while making every signature 512 bytes and key generation noticeably slower. If 128-bit is your target, 3072 or Ed25519 is the honest choice.",
    ],
    [
      "Why is ECDSA considered riskier than Ed25519?",
      "ECDSA needs a fresh random nonce for every signature, and a repeated or predictable nonce lets an attacker recover the private key from two signatures. Ed25519 derives its nonce deterministically from the message and the key, so a weak random source cannot cause that failure.",
    ],
    [
      "What does the -a flag in ssh-keygen do?",
      "It sets the number of bcrypt KDF rounds used to encrypt the private key file with your passphrase. The current default is 16; raising it to 100 makes an offline guessing attack on a stolen key file substantially slower, at the cost of a short delay each time the key is unlocked.",
    ],
  ],
};

export default seo;
