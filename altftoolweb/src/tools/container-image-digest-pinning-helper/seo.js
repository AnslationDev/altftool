const seo = {
  title: "Docker Image Digest Pinning: Tag to sha256 Reference",
  metaDescription:
    "Convert a mutable image tag into a pinned name:tag@sha256 reference and scan Dockerfile FROM lines and compose or Kubernetes image keys for unpinned tags.",
  steps: [
    "Enter the image under 'Image reference (with or without tag)' and paste its 'Manifest digest (sha256:...)' — the sha256: prefix and 64 hex characters are validated.",
    "Paste a file into 'Scan a Dockerfile / compose file / Kubernetes manifest' to classify every reference as pinned, mutable tag or :latest.",
    "Click 'Copy result' to copy the pinned name:tag@sha256 reference with the tag kept as a human-readable label.",
  ],
  intro:
    "This helper converts a mutable container image tag like nginx:1.27 into an immutable digest reference like nginx:1.27@sha256:..., following the OCI distribution spec rule that a sha256 digest identifies exactly one manifest forever. It also scans Dockerfile FROM lines and image: keys in compose or Kubernetes manifests and reports which references are pinned, which ride mutable tags and which fall back to :latest. Built for DevOps and supply-chain-security work where reproducible deployments matter.",
  useCases: [
    "Pinning every FROM line in a Dockerfile to a digest before enabling a supply-chain policy such as SLSA or scoring well on OpenSSF Scorecard",
    "Auditing a docker-compose.yml or Helm-rendered manifest to find services still deploying :latest or an untagged image",
    "Rewriting a Kubernetes Deployment to name:tag@sha256 form so rollbacks and node cache hits are byte-for-byte identical",
  ],
  benefits: [
    ["Strict digest validation", "Checks the sha256: prefix and exactly 64 hex characters, catching truncated copy-pastes before they break a deploy."],
    ["Tag-preserving output", "Produces name:tag@digest so humans still see the version while the runtime resolves only the digest."],
    ["Manifest scanning", "Classifies every image reference in pasted Dockerfiles and YAML as pinned, mutable tag or implicit :latest — multi-stage build aliases excluded."],
  ],
  faqs: [
    [
      "What does pinning a Docker image by digest mean?",
      "It means referencing the image as name@sha256:<64-hex-digest> instead of name:tag, so the registry must return exactly one immutable manifest. Tags are mutable pointers that can silently move to new content; a digest is the SHA-256 hash of the manifest itself and can never point to anything else.",
    ],
    [
      "How do I find the digest of a Docker image?",
      "Run docker buildx imagetools inspect <image>, crane digest <image>, or docker images --digests for images you have pulled. For multi-architecture images, pin the digest of the top-level manifest list (what imagetools prints), not one platform's manifest, or other architectures will fail to pull.",
    ],
    [
      "Can I keep the tag when pinning by digest?",
      "Yes — the form nginx:1.27@sha256:... is valid, and the container runtime ignores the tag entirely once a digest is present. Keeping the tag is recommended purely for humans reading the manifest, since the digest alone says nothing about the version.",
    ],
    [
      "What is the downside of digest pinning?",
      "A pinned image never changes, so it also never picks up patched base-image rebuilds published under the same tag — you keep running the old bytes until you update the digest yourself. Teams solve this with automation such as Renovate or Dependabot, which watch the tag and open a PR bumping the digest when a new image is published.",
    ],
  ],
};

export default seo;
