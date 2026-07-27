const seo = {
  intro:
    "This tool picks the smallest container base image that still satisfies your workload's real requirements — libc flavour (glibc vs musl vs none), shell access, package manager and CA certificates — comparing scratch, distroless static and base, alpine, debian slim, ubuntu LTS and full debian. It encodes the standard hardening guidance: ship the minimum filesystem your binary needs, because every extra megabyte is pull time and attack surface. Built for backend and platform engineers writing Dockerfiles for Go, Rust, Java, Python and Node services.",
  useCases: [
    "Choosing between scratch and distroless/static for a Go binary that makes outbound HTTPS calls and therefore needs CA certificates",
    "Working out why a glibc-linked binary crashes on alpine and which glibc base (distroless base or debian slim) to move to",
    "Cutting a 1 GB debian-based image down by checking which requirements actually force a shell or apt into production",
  ],
  benefits: [
    ["Hard-requirement filtering", "Images that cannot run your binary (wrong libc, no interpreter path) are excluded with the exact reason."],
    ["Smallest-first ranking", "Surviving candidates are ordered by approximate uncompressed size, from 0 MB scratch to 117 MB full debian."],
    ["Practical caveats", "Flags missing CA certificates, distroless :debug tags and musl DNS quirks before they bite in production."],
  ],
  faqs: [
    [
      "What is the difference between alpine and distroless base images?",
      "Alpine (~8 MB) is a full mini-distribution with a busybox shell, the apk package manager and musl libc; distroless images ship only your app's runtime dependencies — glibc, CA certs and tzdata in distroless/base (~21 MB), or ~2 MB for distroless/static — with no shell or package manager at all. Distroless trades debuggability for a smaller attack surface; its :debug tags add busybox back when you need to exec in.",
    ],
    [
      "Why does my binary fail with 'not found' on alpine?",
      "Because alpine uses musl libc, and a binary dynamically linked against glibc asks for a loader (/lib64/ld-linux-x86-64.so.2) that does not exist there — the kernel reports the missing loader as 'not found'. Fix it by building a static binary, rebuilding against musl, or switching to a glibc base such as debian slim or distroless/base.",
    ],
    [
      "When should I use FROM scratch?",
      "Only for fully static binaries, such as Go built with CGO_ENABLED=0 or Rust targeting musl statically. scratch is the reserved empty image — no shell, no CA certificates, no tzdata, no nonroot user — so you must COPY in anything the app needs; distroless/static (~2 MB) adds those basics and is usually the better choice.",
    ],
    [
      "Is a smaller base image really more secure?",
      "Generally yes: fewer packages mean fewer CVEs to patch and fewer tools (shell, curl, package manager) an attacker can use after a compromise, which is why scanners report far fewer findings on distroless and alpine than on full debian or ubuntu. Size is a proxy though, not a guarantee — you still need to rebuild regularly to pick up base-image security updates.",
    ],
  ],
};

export default seo;
