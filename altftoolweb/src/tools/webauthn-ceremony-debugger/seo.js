const seo = {
  title: "WebAuthn Debugger: Decode clientDataJSON and authData",
  metaDescription:
    "Base64url-decodes clientDataJSON, walks the attestation CBOR, and unpacks authenticatorData: rpIdHash, all eight flag bits, counter, AAGUID, COSE key.",
  steps: [
    "Paste the serialised PublicKeyCredential into the box labelled Credential JSON, or a DOMException name, or press Registration example, Assertion example or Error example to load a sample.",
    "Type your Expected RP ID — its SHA-256 is computed in the tab and compared with the rpIdHash the authenticator signed — and optionally an Expected origin, which is compared byte for byte with clientData.origin.",
    "Read the findings list, then clientDataJSON, decoded, the Authenticator data table showing all eight flag bits set or clear, the RP ID check verdict and Attested credential data with its AAGUID and COSE public key, and press Copy report.",
  ],
  intro:
    "Paste the JSON a WebAuthn ceremony produced and this decodes it properly. clientDataJSON is base64url-decoded and its type, challenge, origin and crossOrigin fields are read out and checked; the attestation object is walked as real CBOR to reach fmt, attStmt and authData; and the authenticator data is taken apart byte by byte — the 32-byte rpIdHash, all eight flag bits (UP, UV, BE, BS, AT, ED and the two reserved bits), the 4-byte signature counter, the AAGUID, the credential ID and the COSE public key with its kty, alg and curve. It also computes SHA-256 of an RP ID you supply, in pure JavaScript in the page, and compares it to the rpIdHash the authenticator actually signed — the check that catches a credential registered under the wrong domain. Paste a DOMException name instead of JSON and it explains what makes a browser throw it.",
  useCases: [
    "Registration works in Chrome but your server rejects it, and you need to see whether the AT flag and the attested credential data are really there before blaming the library.",
    "Logins fail for one group of users and you suspect the credentials were created under a bare domain while your RP ID is now a subdomain — enter both and compare the rpIdHash.",
    "You keep getting NotAllowedError with no detail and want the list of the six or seven different conditions the browser deliberately collapses into that one name.",
  ],
  benefits: [
    [
      "Real CBOR and COSE parsing",
      "The attestation object is decoded as CBOR rather than pattern-matched, so fmt, an x5c chain with its certificate sizes, and the COSE key's kty, alg and curve come out of the actual bytes.",
    ],
    [
      "Every authenticator flag, spelled out",
      "All eight bits are shown set or clear with what each one means, including BE and BS — the pair that tells you whether a credential is a synced passkey or bound to one device.",
    ],
    [
      "An rpIdHash check you can trust",
      "SHA-256 is implemented in the page, so entering a candidate RP ID gives a real hash comparison rather than a guess based on the origin string.",
    ],
  ],
  faqs: [
    [
      "What exactly should I paste?",
      "The serialised PublicKeyCredential — the object with id, rawId, type and a response containing clientDataJSON plus either attestationObject (registration) or authenticatorData and signature (assertion). That is what PublicKeyCredential.toJSON() gives you, and what most client libraries post to the server. A DOMException name such as NotAllowedError or InvalidStateError also works on its own.",
    ],
    [
      "Does it verify the signature?",
      "No, and that is deliberate. Verifying an assertion needs the public key your server stored during registration, and the check belongs in your server code where the challenge, the origin and the stored counter live. This tool decodes the structures so you can see what the server is being asked to verify.",
    ],
    [
      "Why is the signature counter zero?",
      "Most platform authenticators and every synced passkey leave it at zero because they do not maintain a per-credential counter. Enforcing a strictly increasing counter against those credentials locks users out. Only apply the cloning check when the authenticator actually increments — that is, when you have already seen a non-zero value for that credential.",
    ],
    [
      "Is anything I paste sent anywhere?",
      "No. There is no network request in this tool at all: the base64url decoding, the CBOR walk, the SHA-256 and the DER parsing all run in your browser tab. It also means it cannot check an attestation certificate chain against the FIDO Metadata Service, and it can only name AAGUIDs from a short built-in list — anything else is shown as its raw value for you to look up.",
    ],
  ],
};

export default seo;
