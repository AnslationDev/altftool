const seo = {
  intro:
    "This generator builds a pip requirements.txt line by line, validating package names, extras and environment markers against PEP 508 and version specifiers against PEP 440 — including exact pins (==), compatible releases (~=), wildcards (==2.0.*) and markers like python_version < \"3.11\". It is for Python developers who want a correct, reproducible dependency file without memorising specifier grammar, and it warns about unpinned or unbounded requirements.",
  useCases: [
    "Pinning an application's dependencies exactly (requests==2.31.0) so every deployment installs identical versions",
    "Adding a conditional backport like tomli that should only install on Python below 3.11 via an environment marker",
    "Declaring extras such as uvicorn[standard] or requests[socks] correctly instead of guessing the bracket syntax",
  ],
  benefits: [
    ["Real PEP validation", "Names, extras, versions and markers are checked against the actual PEP 508/440 grammar, not just non-empty."],
    ["Marker presets", "One-click markers for Python version, Windows/macOS/Linux and arm64 — quoting handled for you."],
    ["Reproducibility warnings", "Flags unpinned packages and >= ranges with no upper bound before they break a future install."],
  ],
  faqs: [
    [
      "What is the difference between == and ~= in requirements.txt?",
      "== pins one exact version (requests==2.31.0 installs only 2.31.0), while ~= allows compatible releases: ~=2.31.0 means >=2.31.0 but <2.32.0, and ~=2.2 means >=2.2 but <3.0. Applications usually pin with ==; libraries usually declare ranges.",
    ],
    [
      "How do I make a requirement apply only to certain Python versions?",
      "Append an environment marker after a semicolon: tomli>=1.1.0 ; python_version < \"3.11\". The comparison value must be in quotes. PEP 508 markers can also test sys_platform, platform_machine and os_name, and combine clauses with and/or.",
    ],
    [
      "What do the square brackets like requests[socks] mean?",
      "They install the package's optional extras — additional dependency groups the project defines. requests[socks] pulls in the SOCKS-proxy dependencies alongside requests itself; multiple extras are comma-separated, like uvicorn[standard] or celery[redis,msgpack].",
    ],
    [
      "Should I pin every version in requirements.txt?",
      "For deployed applications, yes — exact pins (plus hashes via pip-compile --generate-hashes) are the only way to guarantee the same install twice. For libraries, no — pin ranges instead, because exact pins in a library force conflicts onto every consumer. A common setup is a loose pyproject.toml plus a fully pinned, generated requirements lock file.",
    ],
  ],
};

export default seo;
