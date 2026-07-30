const seo = {
  intro:
    "Paste an openssl s_client transcript, an openssl x509 -text certificate dump, an nmap ssl-enum-ciphers table or an nginx / Apache TLS block, and this auditor parses it. Every protocol version it finds is labelled with its actual standing — SSL 2.0 and 3.0 prohibited by RFC 6176 and RFC 7568, TLS 1.0 and 1.1 deprecated by RFC 8996, TLS 1.2 and 1.3 current — and every cipher suite is split into key exchange, authentication, bulk cipher, mode and MAC, so you can see for yourself whether it has forward secrecy and whether it is an AEAD. It then reads the certificate: signature algorithm, key size, validity dates against a reference date you control, nominal lifetime against the 398-day public limit, and the subject alternative names. It never opens a connection — the analysis is only ever of the text you paste.",
  useCases: [
    "A scanner report tells you a host offers 3DES and you need to explain to the owning team exactly why: 64-bit block, SWEET32, plaintext recovery from a long-lived connection.",
    "You have an openssl s_client transcript from a customer whose client cannot connect, and want the negotiated protocol, the chain verify code and the certificate dates read out in one pass.",
    "You are reviewing an nginx ssl_protocols and ssl_ciphers pair in a pull request and want the deprecated versions and the missing !aNULL / !3DES exclusions flagged before it merges.",
  ],
  benefits: [
    [
      "Decomposes cipher suite names properly",
      "ECDHE-RSA-AES128-GCM-SHA256 and TLS_RSA_WITH_AES_128_CBC_SHA are parsed into their parts, so the difference between them — forward secrecy and an AEAD versus neither — is on screen rather than implied.",
    ],
    [
      "Certificate dates against a date you choose",
      "The expiry countdown runs from a reference date field, so an archived transcript can be judged against the day it was captured instead of today, and the same paste always gives the same answer.",
    ],
    [
      "Says plainly what it cannot see",
      "No handshake is performed, so downgrade behaviour, revocation status and what the server would negotiate with a different client are all explicitly out of scope rather than quietly guessed at.",
    ],
  ],
  faqs: [
    [
      "Does it connect to my server?",
      "No, and it cannot. Everything is parsed from the text in the box inside your browser tab. That means you can audit output captured from an internal host that no public scanner can reach, but it also means the tool knows only what your paste contains — for an active test, run testssl.sh, sslyze or nmap --script ssl-enum-ciphers against the host and paste the result here.",
    ],
    [
      "Which protocol versions are considered obsolete?",
      "SSL 2.0 (prohibited by RFC 6176) and SSL 3.0 (deprecated by RFC 7568 after POODLE) are treated as critical. TLS 1.0 and TLS 1.1 are treated as high severity: RFC 8996 formally deprecated both in March 2021, and PCI DSS stopped accepting TLS 1.0 in June 2018. TLS 1.2 restricted to AEAD suites with forward secrecy, and TLS 1.3, are the current versions.",
    ],
    [
      "How does it decide a cipher suite is weak?",
      "From the suite's own components, not a blocklist. NULL encryption, export grade, anonymous key exchange and RC4 are critical. 3DES is high because of its 64-bit block (SWEET32), as is an MD5 MAC and any suite without forward secrecy — static RSA key transport keeps recorded traffic decryptable once the certificate key leaks, and is the family ROBOT targets. CBC-with-HMAC construction is flagged as medium against the Lucky13 padding-oracle family.",
    ],
    [
      "It reported nothing. Is my configuration fine?",
      "It means nothing in that particular text triggered a check. A transcript from a single successful handshake shows one negotiated suite; it says nothing about the other suites the server would accept, whether it permits renegotiation, whether it is vulnerable to a downgrade, or whether the certificate has been revoked. Treat a quiet result as the absence of evidence, not evidence of a good configuration.",
    ],
  ],
};

export default seo;
