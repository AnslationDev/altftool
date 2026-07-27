/**
 * Service mesh comparison data and weighted scoring.
 *
 * Factual attributes come from each project's own documentation
 * (istio.io, linkerd.io, developer.hashicorp.com/consul, cilium.io) as of
 * mid-2025. Ratings are 1-5 editorial scores derived from those documented
 * capabilities — encoded here as named data, not magic numbers — so the
 * weighted ranking is transparent and reproducible:
 *
 *  featureBreadth      — traffic management, policy, extensibility surface
 *  operationalSimplicity — install/upgrade/day-2 burden (higher = simpler)
 *  resourceEfficiency  — data-plane CPU/memory footprint (higher = lighter)
 *  heterogeneousSupport — VMs, multi-cluster, non-Kubernetes workloads
 *
 * Pure data + pure function. No React, no DOM.
 */

export const CRITERIA = [
  { id: "featureBreadth", label: "Feature breadth", blurb: "Traffic shifting, retries, fault injection, extensibility" },
  { id: "operationalSimplicity", label: "Operational simplicity", blurb: "Install, upgrades, day-2 burden, learning curve" },
  { id: "resourceEfficiency", label: "Resource efficiency", blurb: "Data-plane CPU and memory per pod / node" },
  { id: "heterogeneousSupport", label: "VMs & multi-cluster", blurb: "Non-Kubernetes workloads, multi-cluster, multi-runtime" },
];

export const MESHES = [
  {
    id: "istio",
    name: "Istio",
    dataPlane: "Envoy sidecars, or sidecar-less 'ambient' mode (ztunnel + waypoint proxies)",
    mtls: "Automatic mutual TLS with SPIFFE identities",
    trafficManagement: "Richest: VirtualService/Gateway API, canary, mirroring, fault injection, WASM plugins",
    apex: "CNCF graduated",
    scores: {
      featureBreadth: 5, // broadest traffic/policy/extension surface (istio.io feature docs)
      operationalSimplicity: 2, // many CRDs, complex upgrades — the common critique its ambient mode targets
      resourceEfficiency: 2, // Envoy per pod is the heaviest documented data plane; ambient improves it
      heterogeneousSupport: 4, // documented VM integration + multi-cluster/multi-primary topologies
    },
    bestFor: "Large platforms needing every traffic-management knob and WASM extensibility.",
  },
  {
    id: "linkerd",
    name: "Linkerd",
    dataPlane: "Purpose-built Rust micro-proxy (linkerd2-proxy) sidecar per pod",
    mtls: "Automatic mutual TLS on by default for all TCP traffic",
    trafficManagement: "Core set: retries, timeouts, traffic split (SMI/Gateway API), golden metrics",
    apex: "CNCF graduated",
    scores: {
      featureBreadth: 3, // deliberately minimal feature set (linkerd.io design philosophy)
      operationalSimplicity: 5, // single-command install, famously small operational surface
      resourceEfficiency: 4, // Rust micro-proxy is far lighter than Envoy per the project's benchmarks
      heterogeneousSupport: 3, // multi-cluster supported; Kubernetes-only, no VM story
    },
    bestFor: "Teams that want mTLS and golden metrics this week with minimal ops burden.",
  },
  {
    id: "consul",
    name: "Consul Connect",
    dataPlane: "Envoy sidecars managed by Consul agents / dataplanes",
    mtls: "Mutual TLS via Consul CA with service intentions for authorization",
    trafficManagement: "Resolvers/splitters/routers for L7 routing and failover",
    apex: "HashiCorp (BSL license), not CNCF",
    scores: {
      featureBreadth: 4, // L7 routing + service discovery + KV + federation (developer.hashicorp.com)
      operationalSimplicity: 3, // servers/agents to run, but familiar to HashiCorp shops
      resourceEfficiency: 3, // Envoy data plane plus agent overhead
      heterogeneousSupport: 5, // first-class VMs, bare metal, multi-runtime, multi-DC federation
    },
    bestFor: "Mixed VM + Kubernetes estates, especially existing HashiCorp users.",
  },
  {
    id: "cilium",
    name: "Cilium Service Mesh",
    dataPlane: "Sidecar-less: eBPF in the kernel, with per-node Envoy only for L7 policies",
    mtls: "Mutual authentication (SPIFFE-based) — newer than the sidecar meshes' mTLS",
    trafficManagement: "L7-aware policies, Gateway API support, Hubble observability",
    apex: "CNCF graduated (as CNI)",
    scores: {
      featureBreadth: 3, // strong network policy/observability; fewer app-level traffic features
      operationalSimplicity: 3, // trivial if Cilium is already the CNI; a platform decision otherwise
      resourceEfficiency: 5, // no per-pod proxy — eBPF datapath is the lightest documented approach
      heterogeneousSupport: 3, // cluster mesh spans clusters; kernel/eBPF and CNI requirements apply
    },
    bestFor: "Clusters already on Cilium CNI wanting mesh features without sidecars.",
  },
];

/** Weight scale used by the UI sliders: 0 (ignore) to 5 (critical). */
export const WEIGHT_MIN = 0;
export const WEIGHT_MAX = 5;

/**
 * Weighted-sum ranking. Each mesh scores sum(weight_c * score_c) normalised
 * to a 0-100 scale against the maximum possible (weight_c * 5).
 *
 * @param {object} weights  {featureBreadth, operationalSimplicity, resourceEfficiency, heterogeneousSupport}
 * @returns {{ranking: [{mesh, score, raw}], maxRaw}|{error}}
 */
export function scoreMeshes(weights) {
  if (!weights || typeof weights !== "object") return { error: "Set at least one priority weight." };

  const cleaned = {};
  let total = 0;
  for (const { id } of CRITERIA) {
    const w = Number(weights[id]);
    if (!Number.isFinite(w) || w < WEIGHT_MIN || w > WEIGHT_MAX) {
      return { error: `Weight for "${id}" must be a number between ${WEIGHT_MIN} and ${WEIGHT_MAX}.` };
    }
    cleaned[id] = w;
    total += w;
  }
  if (total === 0) {
    return { error: "All weights are zero — raise at least one priority above 0 to get a ranking." };
  }

  const MAX_SCORE = 5; // ratings are on a 1-5 scale
  const maxRaw = total * MAX_SCORE;

  const ranking = MESHES.map((mesh) => {
    let raw = 0;
    const contributions = {};
    for (const { id } of CRITERIA) {
      const c = cleaned[id] * mesh.scores[id];
      contributions[id] = c;
      raw += c;
    }
    return { mesh, raw, contributions, score: Math.round((raw / maxRaw) * 100) };
  }).sort((a, b) => b.raw - a.raw || a.mesh.name.localeCompare(b.mesh.name));

  return { ranking, maxRaw, weights: cleaned };
}
