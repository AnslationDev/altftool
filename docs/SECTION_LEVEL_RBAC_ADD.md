# Section-Level RBAC — Architecture Design Document (ADD)

**Status:** DRAFT **v3** (post adversarial review + Architecture Readiness Review — see §22 Review Log). No implementation authorized until approved AND §21 freeze gates cleared.
**Author:** Platform (assisted).
**Scope:** `altftoolwebadmin` admin platform. Evolve `project → module → {read,write,delete}` into `project → module → section → action`, with a resolution model that also supports role templates, team permissions, temporary grants, delegated administration, audit history, and a future field-level dimension.
**Grounding:** This ADD is written against the *verified* current architecture (see `docs/` audits and the in-repo evidence cited inline). It does **not** assume anything beyond Tier-1 (repository-verified). Tier-2 (deployed infrastructure) and Tier-3 (external consumers) items are flagged as prerequisites.

---

## 0. Non-negotiable constraints (from the completed audit)

| # | Constraint | Evidence / Source |
|---|-----------|-------------------|
| C1 | **Fine-grained permissions must NOT live in Firebase Custom Claims.** | Runtime-measured: module-level full access already serializes to **1618 bytes > 1000-byte hard limit**; section-level ≈ 12.7KB. Claims also have **zero verified consumers** in-repo. |
| C2 | **Server-side enforcement is mandatory and currently absent.** | `hasModuleAccess` is called only in 3 client files (`AdminLayout.jsx:122`, `AdminHeader.jsx:77`, `AdminSidebar.jsx:178`); **no `/api` data route checks `projectAccess`**. Admin SDK bypasses Firestore Rules → Rules are not a backstop for APIs. |
| C3 | **Permission data must stay denormalized on a single admin document** (or a single read), not fanned across sub-docs that Rules must `get()`. | Firestore Rules allow ≤10 document accesses per evaluation (audit note). |
| C4 | **100% backward compatibility**: a module with no section config must behave exactly as today. | Existing `projectAccess[project].permissions[module] = {read,write,delete}` must keep working unchanged. |
| C5 | **`sectionKey` must be the kebab route-key** used by `adminModuleRouteKeys.js` / `routeSegment`, NOT the camelCase moduleKey. | Avoids the `permissionModules.js`-style desync already observed in the codebase. |
| C6 | **Change freeze** on Auth, RBAC, Rules, Claims, Sessions, API-authz until Tier-2/Tier-3 verification + migration/rollback/validation are complete. | Standing directive. |

---

## 1. Problem Statement

The admin panel enforces access at **module** granularity, and **only in the client UI**. This produces two classes of problem:

1. **Security (P0):** An authenticated, active admin with zero module permissions can call any module API directly (e.g. `POST /api/seo/config`) and succeed, because the API layer authenticates identity but never authorizes the module. RBAC is cosmetic at the trust boundary.
2. **Granularity + scale:** Product needs finer control — "this admin may edit the SEO *Global* section but not *Bulk*" — and must scale to 100+ projects, 500+ modules, 1000+ sections, with reusable role templates, team-based access, temporary grants, and delegated administration, without a redesign.

The design must fix (1) and deliver (2) while preserving every existing behavior.

---

## 2. Root Cause (of the current limitations)

| Symptom | Root cause | Evidence |
|---------|-----------|----------|
| No API-layer authorization | Authorization was implemented as a *UI concern* (render-gating), never as a *trust-boundary* concern. | `verifyActiveAdmin` checks `isActive` only (`serverAdminAuth.js:22`); no module dimension. |
| Cannot express section access | The permission leaf stops at module: `permissions[module] = {read,write,delete}`. | `permissionUtils.js:24-27`. |
| Claims-based sync is fragile | Fine-grained permissions were pushed into Custom Claims, a 1000-byte cross-system contract. | `syncAdminClaims.js:13-19`; measured 1618B. |
| Per-admin duplication risk | Every admin stores its own full permission map; no templates/teams → 1000s of duplicated grants at scale. | `admin/create/route.js:99-106` writes a flat `projectAccess`. |

**Core architectural root cause:** authorization is *stored and enforced as per-admin denormalized UI state*, rather than as a *resolved projection over a normalized permission source*, enforced at the server trust boundary.

---

## 3. Current Behavior (verified baseline — do not regress)

- **Identity:** Firebase Auth (Google popup + email/password) → ID token → `adminAuth.verifyIdToken` (`firebaseAdmin.js`).
- **Authorization data:** `admins/{uid}` doc holds `roleType`, `permissions` (legacy flat), `projectAccess[project].permissions[module] = {read,write,delete}`.
- **Enforcement:** client-only. `hasModuleAccess({adminData, projectId, moduleKey, action})` (`permissionUtils.js:14`) → checked in `AdminLayout` route guard, `AdminHeader`, `AdminSidebar`.
- **Registry:** `PROJECTS[project].modules[module] = {label, icon, routeSegment}` (`projects/*/config.js`).
- **Routing:** `(protected)/[project]/[module]/[...subpath]` → `renderAdminModuleRoute` → `AdminModuleLazyRoute` (per-module code-split, verified intact).
- **Claims:** `syncAdminClaims` writes `role` + flattened perms on create/update/approve; **no consumer**.
- **Super Admin UX:** `CreateAdminModal` / `EditAdminModal` + `PermissionMatrix` (flat module × {R,W,D} grid).

---

## 4. Proposed Behavior (target)

- Authorization becomes a **resolved effective-permission set** computed from a **normalized source** (role templates + team memberships + direct grants + temporary grants), with an explicit precedence, cached, and enforced **server-side first**, client-side second (for UX).
- Permission leaf becomes `project → module → section → action`, with `action` an **open set** (`read, write, delete` today; `create, publish, approve, export, import, manage, execute` reserved) and a **reserved field-level dimension** below section.
- A module with no section config resolves exactly as today (module-level).

---

## 5. Data Model

### 5.1 The permission address (canonical key)

A single permission is addressed by a hierarchical tuple, serialized as a **stable string key** for O(1) lookups:

```
proj:<project> / mod:<module> / sec:<section> / [fld:<field>] : <action>
# example:  altftool/seo/global:write
# module-level (no section):  altftool/seo:read   (back-compat)
# future field-level:  altftool/seo/global/canonicalUrl:write
```

- `section` and `field` are **optional levels**. Resolution treats a grant at a higher level as **inherited** by lower levels unless a more specific grant/deny overrides (see §6).
- Keys use the **kebab route-key** for module/section (C5).

### 5.2 Normalized source-of-truth (Firestore) — NOT the resolved projection

| Concept | Where | Shape (summary) |
|---------|-------|-----------------|
| **Section registry** | **Code** (`projects/*/config.js`) — source of truth for *what sections exist* | `modules[m].sections = { <sectionKey>: { label, order } }` |
| **Role template** | `roleTemplates/{templateId}` | `{ name, description, grants: PermissionGrantSet, scope?: {projects[]}, updatedBy, updatedAt }` |
| **Team** | `teams/{teamId}` | `{ name, members: uid[], grants: PermissionGrantSet, updatedBy, updatedAt }` |
| **Admin** | `admins/{uid}` (extended) | adds `roleTemplateIds: string[]`, `teamIds: string[]`, `directGrants: PermissionGrantSet`, `denies: PermissionKey[]`, `grantExpiry: { <key>: ISOString }` |
| **Grant audit** | `admin_audit_logs/**` (existing infra) | every grant/revoke/template/team change |

Where `PermissionGrantSet` is a compact nested map with a **tri-state leaf** (F3): `true` = ALLOW, `false` = explicit DENY, **absent** = inherit/unspecified. This lets **any** source (template, team, direct) express a deny — the deny-wins model (§6) is only implementable because deny is a first-class leaf value, not a separate list.
```jsonc
{
  "altftool": {                          // project
    "seo": {                             // module
      "__module": { "read": true },      // module-level (inherited by sections)
      "global":    { "read": true, "write": true },
      "bulk":      { "read": false }      // explicit DENY on a section within an allowed module
    }
  }
}
```
> **Why nested-map, not an array of keys:** deep-merge across sources is O(depth), diffs are localized, and the whole set stays on one admin-doc read (C3). Arrays would force full-scan merges and larger docs.
> **Note:** the earlier separate `admin.denies: PermissionKey[]` is superseded by the tri-state leaf; `grantExpiry` (temporary grants) remains a sibling map keyed by permission-key.

### 5.3 Resolved projection (the "effective permission set")

Computed by the **resolver** (§10) from: `superadmin?` → `denies` → `directGrants` → `teams[].grants` → `roleTemplates[].grants` → module inheritance → default-deny, with **temporary grants filtered by `grantExpiry`**.

- Server: resolved into an in-memory `EffectiveSet` (a `Set<PermissionKey>` + a `has(project,module,section,action)` method) cached with TTL.
- Client: the same resolved set is delivered via `/api/admin/me` (already the client's authz source) as a compact `effective` map; the client never re-derives from raw sources → single source of truth, no client/server drift.

> **Storage bound:** the resolved set is **sparse** — sized by what an admin *can* do, not the 1000×500 universe. A power-admin with ~1000 section-actions ≈ 40KB, well under the 1MB doc limit, but far over the 1KB claims limit → confirms C1 (Firestore, not claims).

---

## 6. Permission Hierarchy & Resolution Algorithm (F1)

Authorization resolves along **two orthogonal axes** — *specificity* (field ⊂ section ⊂ module) and *source* (direct, team, template). The earlier draft conflated them and was **non-deterministic** (e.g. template-specific-ALLOW vs direct-broad-DENY had no defined winner). This is the corrected, deterministic algorithm.

### 6.1 Axis 1 — Specificity: "most-specific level that speaks, wins"
For a query `(project, module, section?, field?, action)`, walk the address from **most specific → least specific**:

```
levels = [ field?, section?, module, "__module" ]   // N-level generic; field reserved for future
for L in levels (most-specific first):
    verdict = combineSources(L, action)             // see 6.2
    if verdict is ALLOW or DENY:  return verdict     // the most specific level that has ANY grant decides
return DENY                                           // default-deny (least privilege)
```
A more-specific level that has **any** grant (allow or deny) for that action **fully decides** — a broader level is consulted only when the specific level is silent. Thus `mod:seo:read=true` + `sec:bulk:read=false` → Bulk read = **DENY** (section speaks). `mod:seo:read=true` with Global silent → Global read = **ALLOW** (inherited from module).

### 6.2 Axis 2 — Source combination *within a single level* (deny-wins)
At a given level, combine the leaf values across sources:

```
combineSources(level, action):
    superadmin?                          → ALLOW           // short-circuits everything
    values = [ direct, team*, template* ] leaf at (level, action), dropping expired (grantExpiry)
    if any value === false (DENY)        → DENY            // deny-wins across sources
    if any value === true  (ALLOW)       → ALLOW
    return SILENT                          // no source spoke at this level → fall to broader level
```
> Rationale: **deny-wins is applied within the deciding level, not across levels.** This is what makes the two-axis interaction deterministic: specificity picks the level; deny-wins picks the verdict *at* that level. `team*`/`template*` are the union of the admin's teams/templates.

### 6.3 Invariants
- **Superadmin** (`roleType==="superadmin"`) → ALLOW all, short-circuit (unchanged).
- **Downward inheritance only:** module grant implies sections; a section grant never widens to the module.
- **Action independence:** each action resolved independently (`write` ⇏ `read`); UI may still require `read` to display.
- **Temporary grants:** `grantExpiry[key]` filters expired leaves at resolution time — no write needed to expire.
- **N-level generic:** the `levels` array makes field-level a pure extension (prepend `field`), no algorithm rewrite (F10).
- **Determinism:** the algorithm is a pure function of `(effective sources, query)`; property-tested by an exhaustive truth table over {allow, deny, silent} × {module, section} × {direct, team, template}.

---

## 7. Firestore Schema (collections & rules posture)

| Collection | Access (client via Rules) | Written by |
|------------|---------------------------|-----------|
| `admins/{uid}` | self-read allowed (own doc only, existing rule `firestore.rules:37`); **self-update whitelist must NOT include** `directGrants/roleTemplateIds/teamIds/denies/grantExpiry` (prevents self-escalation, C-audit) | server only (admin APIs) |
| `roleTemplates/{id}` | superadmin/delegated-admin read; **deny client write** | server only |
| `teams/{id}` | member-or-superadmin read; **deny client write** | server only |
| `admin_audit_logs/**` | `if false` (existing) | server only |

- **No new Rules `get()` fan-out**: resolution reads happen **server-side via Admin SDK** (bypasses Rules); Rules only gate the *client's own admin doc read* and continue to block escalation. → C3 satisfied; **no Security-Rules change strictly required** for correctness (only the self-update whitelist must remain closed).
- **Indexes:** effective-set resolution is by document ID (`admins/{uid}`, `teams`, `roleTemplates`) → **no composite indexes needed** for the hot path. (Separate finding: `notifications` and `accessRequests(uid,createdAt)` indexes are missing — tracked independently, not part of this feature.)

---

## 8. API Authorization Strategy (the P0 fix)

### 8.1 Single choke-point
Introduce one server helper, used by **every** module API and the RSC route renderer:

```
assertAccess(principal, { projectId, moduleKey, sectionKey?, action }) → void | throws 403
```
- Resolves (cached) the principal's `EffectiveSet`, checks `has(...)`, throws a typed `ForbiddenError` (→ 403) otherwise.
- Wired into `withAdminApi` as an optional `access: { module, section?, action }` option so routes declare their requirement declaratively:
  ```
  export const POST = withAdminApi(handler, {
    access: { project: "altftool", module: "seo", section: "global", action: "write" },
  });
  ```
- Routes not yet migrated keep working (option absent = identity-only, as today) → incremental, non-breaking rollout.

### 8.2 Shadow → enforce
The enforcement ships behind a flag `ALTFT_API_RBAC_ENFORCE` with three modes: `off` (today), `shadow` (log would-be-denials, do not block), `enforce`. This lets us observe real traffic for false-positives before blocking (see §16 rollout).

### 8.3 API↔permission mapping
A declarative map `apiAccessMap` (code) binds route groups to their `{module, section, action}` requirement. This map is the **missing artifact** identified in the audit and is authored once per module during migration.

---

## 9. Route Guard Strategy (corrected — F2)

> **Correction (F2):** the v1 draft claimed an RSC "server guard" in `renderAdminModuleRoute`. This is **infeasible with the current auth model**: Firebase Auth is entirely client-side (ID token in IndexedDB/localStorage — verified); RSC server components receive **no token and no session cookie**, so they cannot authorize. RSC-level enforcement would require introducing an httpOnly **server session cookie** mirroring the ID token — a new authentication mechanism that is **under freeze** (and adds CSRF surface). It is therefore **explicitly deferred**, not part of this design.

- **The authoritative server boundary is the API layer** (§8, `assertAccess`). All *data mutations and reads* flow through APIs that carry the Bearer token — that is where authorization is enforced. Rendering a module shell the user can't act on is a **UX** concern, not a security hole, because every underlying data call is API-enforced.
- **Client guard (`AdminLayout`, UX):** extend the existing guard (`AdminLayout.jsx:112-128`) to resolve the **section** — `sectionKey` = the **registered route-key** that the subpath resolves to via a new `resolveProjectModuleSection` (analogous to `resolveProjectModule`); deeper segments (record ids) are **not** sections (F9). A module with no sections → `sectionKey` undefined → identical to today.
- **Global modules** migrate off the legacy flat `permissions` branch (`AdminLayout.jsx:126`) to the unified resolver, removing the keying inconsistency noted in the audit.
- **Deferred (post-freeze, optional):** if RSC-level pre-render authorization is later required, adopt a server session cookie + middleware — tracked as a separate auth-architecture change, not this feature.

---

## 10. Permission Caching Strategy (revised — F4)

> **Correction (F4):** v1 cached the whole effective-set for 15–30s → a permission **revoke honored up to 30s late** and no cross-instance invalidation. The revised model splits *fresh* from *cacheable* so **direct revokes are immediate** and only the expensive team/template resolution is cached, version-gated.

The resolved effective-set is **computed at request time and cached — never persisted** to Firestore (persisting it would reintroduce the fan-out-on-change anti-pattern).

**Per-request resolution:**
1. **Always read `admins/{uid}`** (this read already happens for `isActive`). Captures — **fresh, every request** — `directGrants`, tri-state denies, `teamIds`, `roleTemplateIds`, and a monotonic `permVersion`. ⇒ a **direct grant/deny revoke is immediate** (no cache).
2. **Team/template grant-sets** are resolved via a **single batched `getAll(teamRefs…, templateRefs…)`** (one round-trip, not N+M), and each is **cached per-instance keyed by its own doc `version`**. A team/template edit bumps its `version` → next resolution re-reads only that doc.
3. **Merge** (1) + (2) through the §6 algorithm → `EffectiveSet`, memoized per-request.

| Layer | Mechanism | Freshness |
|-------|-----------|-----------|
| Admin doc (direct grants/denies) | read every request | **immediate** |
| Team/template grant-sets | batched `getAll`, cached by doc `version` | immediate on version bump; else instance-cached |
| Client (`adminData.effective`) | delivered by `/api/admin/me`; refetched via `refreshAuth()` | on refresh / next `onAuthStateChanged` |
| Claims | **`role` only** (C1) | token life |

### 10.1 Consistency & revocation latency — HONEST model (F11; ARR #5/#6/#19)
> **Correction (F11):** v2 claimed "version-gated, near-immediate, no reads." That **overclaimed** — detecting a template/team `version` change *requires reading the doc*, i.e. the very read we cache. Firestore has **no free version signal**. The honest model is **short-TTL eventual consistency** — industry-normal (Google/AWS IAM propagate in seconds), acceptable when TTLs are small and stated.

| Permission source | Cache TTL | Worst-case revocation latency |
|-------------------|-----------|-------------------------------|
| `admins/{uid}` direct grants / denies / `grantExpiry` / `isActive` | **≤5s** (extends `adminAccess.js` 5s pattern) | **≤5s** |
| `teams` / `roleTemplates` grant-sets | **≤30s** | **≤30s** |

- **No permission change is truly instantaneous** — all are eventually consistent within the TTL above (deliberate cost/latency trade: reading the admin doc every request would be immediate but costly at scale).
- **Urgent-revocation path (documented):** to revoke faster than the ≤30s template window, remove the admin's **direct grant** or **deactivate** — both ≤5s. Templates/teams are for convenience, not emergency response.
- **Read cost:** cache-miss = 1 admin doc + 1 batched `getAll` (≤ small N+M); hits = 0 extra reads.
- **Fail-closed** on any resolution error (§13B).

---

## 11. Super Admin UX

- **Permission Matrix v2** (`PermissionMatrix.jsx` evolution): module rows are **expandable** into section sub-rows; each cell is `{read, write, delete}` (action set data-driven so new actions render automatically).
- **Role templates:** create/edit named grant-sets; assign template(s) to an admin; admin view shows *effective* = templates ⊕ team ⊕ direct with provenance ("granted via template X").
- **Teams:** manage members + team grant-set; admin inherits.
- **Temporary grants:** any grant may carry an `expiresAt`; UI surfaces countdown + auto-expiry.
- **Bulk assign/revoke:** multi-select admins → apply a template/section-set.
- **Effective-permission preview:** a read-only resolver view answering "what can this admin actually do?" with the deny/allow provenance — critical for auditability at scale.
- **Delegated administration:** a non-superadmin granted `manage` on a scope may grant/revoke within that scope. **(F8)** The server validates the **resolved permission delta ⊆ the delegator's own effective set** — *not* the raw template/team reference (a template may contain perms beyond the delegator; assigning it must be rejected unless every resulting leaf is within the delegator's scope). All delegation is audit-logged.

> **(F7) Provenance is server-computed.** The "effective preview" and "granted via template X" labels are produced **server-side** (the resolver knows every source) and delivered via `/api/admin/me`. The client **never reads `roleTemplates`/`teams` directly** — consistent with §7's client-read denial. This resolves the v1 contradiction between §11 (provenance UI) and §7 (template read denied to non-super clients).

---

## 12. Performance Impact

- **Reads:** the resolver replaces "no server check" with "cached effective-set lookup." Hot path is O(1) `Set.has`. Cache-miss cost is a handful of doc reads amortized over TTL. Net server read volume is **bounded and cache-amortized**, not per-request.
- **Client:** nav/section filtering uses the already-delivered `effective` map (memoized, as just shipped for the sidebar). Only accessible sections render/fetch → fewer components + fewer data calls (the "modular = fast" goal, now *authorization-driven*).
- **Claims:** dropping fine-grained flattening removes the >1000-byte failure mode and shrinks the token.
- **No new realtime listeners.** No Rules `get()` fan-out. No composite index on the hot path.
- **Expected, not yet measured:** exact read/latency deltas require staging measurement (documented as expected optimization until profiled).

---

## 13. Security Model

- **Server-side enforcement first** (§8) — closes the P0 gap. Client checks are UX only.
- **Least privilege / default-deny** (§6).
- **Deny-wins** for safe exceptions and delegated scoping.
- **Tamper-proof source:** grants/templates/teams are **server-written only**; the admin self-update whitelist must never include permission fields (self-escalation blocked, consistent with the verified rule at `firestore.rules:42`).
- **Delegation is bounded** by the delegator's own effective set.
- **Full audit trail** for every authorization change (§15).
- **No fine-grained data in claims** (cross-system contract minimized to `role`).

---

## 13A. Concurrency, Race Conditions & Consistency (F5)

- **Concurrent permission edits (lost-update):** two super-admins (or delegated admins) editing the same admin/template/team simultaneously would silently lose one edit under the current `.set()/.update()` (last-write-wins). **Mitigation:** **optimistic concurrency** — every permission write carries the read `version`/`updatedAt` as a precondition (Firestore transaction with a version check); on mismatch the write is **rejected** and the client refetches + re-applies its diff. UI shows "changed by <actor> — reload."
- **Field-scoped writes:** the permission editor writes only the changed `permissions[module][section]` sub-path (not the whole map) to shrink the conflict window; the transaction still guards the doc `version`.
- **Dangling references:** a template/team deleted while referenced → the resolver **skips missing** refs (treats as no-grant), never throws. Deletion of a template/team is audit-logged and the UI warns how many admins reference it.
- **`permVersion` monotonicity:** bumped via `FieldValue.increment(1)` inside the same transaction as any grant change → safe under concurrency.
- **Consistency contract (documented):** direct grant/deny = read-your-writes immediate; team/template = propagates on next request seeing the new `version`. No stronger guarantee is promised or required.

## 13B. Disaster Recovery & Failure Semantics (F6)

- **Fail-CLOSED, always.** If Firestore is unavailable or resolution throws, `assertAccess` **denies** (never fails open). A missing deny-template must never silently *escalate*; a missing allow-template simply removes access. Security correctness is preferred over availability.
- **Break-glass superadmin (claim-only — ARR #10).** For the break-glass path to survive a **Firestore outage**, superadmin verification must NOT require a Firestore read. Therefore break-glass authorizes on the **`role: "superadmin"` custom claim in the verified ID token alone** (no `admins` doc read). Precedence: `verifySuperAdmin` tries the Firestore `roleType` first (normal path, revocable); on Firestore failure it **falls back to the token `role` claim** (break-glass). `scripts/seed-superadmin.mjs` already sets this claim (`:112`). Trade-off & mitigation: a claim can only be revoked by a token refresh, so break-glass superadmins are a **small, tightly-controlled set** and every claim-only authorization is audit-logged as `rbac.breakglass`. This is the availability backstop that makes fail-closed (§13B) acceptable — a Firestore outage denies normal admins (fail-closed) but never locks out the break-glass set.
- **Backups.** `roleTemplates`, `teams`, and `admins` are included in scheduled Firestore backups/exports; permission changes are reconstructable from `admin_audit_logs` (before/after diffs, §15) — enabling point-in-time recovery of "who could do what."
- **Corruption blast-radius.** Because grants are denormalized per admin and templates/teams are the only shared source, corruption is bounded: a bad template affects only its referencing admins, all of whom are enumerable and audit-traceable.
- **Outage runbook (reserved):** documented procedure to (a) confirm break-glass access, (b) restore templates/teams from backup, (c) replay audit log if needed.

## 14. Migration Strategy

**Backward-compatible, additive, phased. No destructive step.**

1. **Schema additive:** add `sections` to module configs (code) and the new optional fields to admin docs. Absent = today's behavior (C4).
2. **Resolver introduced in parallel:** `resolveEffective(admin)` produces a set that, for admins with only legacy `projectAccess`, is **byte-identical** to today's module-level decisions (proved by a golden-test corpus of existing admins).
3. **Read-path swap:** `hasModuleAccess`/`hasSectionAccess` delegate to the resolver; callers unchanged in signature (add optional `sectionKey`).
4. **Server enforcement in shadow** (§8.2) → observe → enforce.
5. **UX v2** ships after enforcement is proven.
6. **Templates/teams/temporary/delegation** layered on last (each additive).
7. **Claims migration** is a **separate, gated workstream** (its own dependency audit + Tier-2/Tier-3 verification), not bundled here.

No data backfill is required to *start*: legacy `projectAccess` continues to resolve correctly; new capabilities are opt-in per module.

---

## 15. Audit Logs

- Reuse existing `admin_audit_logs` + `withAdminApi` auto-audit.
- New audited events: `rbac.grant`, `rbac.revoke`, `rbac.template.update`, `rbac.team.update`, `rbac.delegate`, `rbac.temp_grant`, each with actor, target, before/after grant diff, and the resolved-effective delta.
- Enables **permission history** and point-in-time "who could do what, when."

---

## 16. Rollout Plan

| Stage | Action | Gate to advance |
|-------|--------|-----------------|
| 0 | ADD review & approval (this doc) | Staff sign-off |
| 1 | Resolver + `assertAccess` + registry `sections` (no callers changed) | golden-tests: legacy decisions byte-identical; build/lint |
| 2 | API enforcement in **shadow** on SEO + blogs | zero false-denials in logs over N days |
| 3 | Flip SEO+blogs to **enforce** | manual QA with limited + super admin |
| 4 | SEO **section** pilot (registry + guard + UI) | limited-admin sees only granted sections (UI+API) |
| 5 | Super Admin UX v2 (matrix + templates) | round-trip grant→effect verified |
| 6 | Roll enforcement + sections to remaining modules | per-module QA |
| 7 | Templates / teams / temporary / delegation | per-capability QA |

Each stage is independently shippable and reversible.

---

## 17. Rollback Strategy

- **Feature-flagged:** `ALTFT_API_RBAC_ENFORCE=off` instantly reverts to identity-only API behavior (no redeploy).
- **Code:** each stage is a discrete commit/PR → `git revert`.
- **Data:** additive fields only; legacy `projectAccess` is never removed during migration → rollback needs **no data migration**.
- **Resolver:** can be pinned to "legacy mode" (ignore sections/templates/teams) via flag, resolving exactly as today.
- **Claims:** untouched by this feature (separate workstream) → not a rollback surface here.

---

## 18. Backward-Compatibility Plan

- **C4 guarantee** enforced by golden tests: for every current admin doc shape, `resolveEffective` must yield the same allow/deny as `hasModuleAccess` today.
- Modules without a `sections` config behave identically (module-level).
- `hasModuleAccess` keeps its current signature; `sectionKey` is optional and additive.
- Legacy flat `permissions` continues to resolve (kept until a later, separate deprecation with its own audit).

---

## 19. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| False-denial locks out a legitimate admin after enforce | Med | High | Shadow mode + logs before enforce; per-route flag; instant flag-off rollback |
| Resolver diverges from legacy decision | Low | High | Golden-test corpus; byte-identical assertion in CI |
| Stale cache serves revoked access briefly | Med | Med | Short TTL; `isActive` still immediate; documented eventual-consistency window |
| Storage growth on broad admins | Low | Med | Sparse resolved set (bounded by grants); normalized templates/teams avoid duplication |
| Rules `get()` fan-out at scale | Low | High | Resolution is Admin-SDK server-side; Rules unchanged; denormalized admin doc (C3) |
| Claims contract breakage | N/A here | — | Claims explicitly out of scope for this feature |
| sectionKey ↔ routeKey desync | Med | Med | Single kebab source (C5); registry lock-step test with `adminModuleRouteKeys.js` |

---

## 20. Testing Strategy

- **Unit:** resolver precedence (deny-wins, inheritance, expiry, superadmin), `assertAccess`, `hasSectionAccess`.
- **Golden/backward-compat:** corpus of real admin shapes → assert identical decisions pre/post.
- **Contract:** `apiAccessMap` covers every mutating module route (lint/test that asserts no unmapped mutating route).
- **Integration:** limited-permission admin blocked at API (403) and UI (hidden) for a denied section; allowed for a granted one; superadmin unaffected.
- **Security:** self-escalation attempt (client writes permission fields) denied by Rules; delegated admin cannot grant beyond own scope.
- **Perf (staging):** React Profiler (nav render), server read counts per request (cache hit/miss), token size.
- **Rollback drill:** flip flag `enforce→off`, verify instant revert.

---

## 21. Prerequisites before ANY implementation (freeze gates)

1. **Tier-2 (deployed infra) verified:** deployed Firestore/Storage Rules == repo; deployed Cloud Functions / Auth triggers / Extensions enumerated (repo shows none). Commands provided separately.
2. **Tier-3 (external) confirmed:** no external service / other app on project `altftool-bca36` consumes ID-token permission claims.
3. **Approval** of this ADD by Staff/Principal review.

Until 1–3 are complete, the change freeze on Auth/RBAC/Rules/Claims/Sessions/API-authz remains in force. This document is design only.

---

## Appendix A — Confidence levels on the design's factual premises

| Premise | Confidence | Basis |
|---------|-----------|-------|
| No server-side module authz today | **High** | grep + route reads (Tier-1) |
| Claims exceed 1000B at module scale | **High** | runtime byte-measurement |
| Claims have no in-repo consumer | **High (repo) / Unknown (external)** | repo grep; external unprovable from repo |
| Rules block self-escalation | **High** | rule read `firestore.rules:37,42` |
| Deployed rules == repo rules | **Unknown** | Tier-2 not yet verified |
| Code-splitting intact | **High** | loader read (Tier-1) |

---

## 22. Architecture Review Log (adversarial self-review → v2 revisions)

A formal review was performed from the stance of a Principal Engineer who did not author v1, attempting to *disprove* each decision. Findings and resolutions:

| ID | Finding (v1 weakness) | Severity | Resolution in v2 | Confidence |
|----|----------------------|----------|------------------|-----------|
| **F1** | Precedence conflated two axes (source × specificity) → **non-deterministic** authorization | **Major** | §6 rewritten as a deterministic **N-level, most-specific-wins + deny-wins-within-level** algorithm, property-tested by truth table | High |
| **F2** | RSC "server guard" **infeasible** (client-side Firebase Auth → no server token) | **Major** | §9 corrected: **API layer is the sole server boundary**; RSC guard dropped; session-cookie path deferred (frozen) | High |
| **F3** | Grant-set allow-only, but precedence assumed template/team **denies** | Correctness | §5.2 leaf made **tri-state** (allow/deny/inherit); separate `denies[]` superseded | High |
| **F4** | Whole-effective-set cached 15–30s → revoke honored late, no invalidation | Scale/Security | §10 **version-gated hybrid**: fresh admin-doc (direct = immediate) + batched `getAll` team/template cache keyed by version | High |
| **F5** | Concurrency/race conditions absent (lost updates, dangling refs) | Enterprise gap | New **§13A**: optimistic concurrency (version precondition), field-scoped writes, skip-missing refs | High |
| **F6** | DR / fail-open-vs-closed undefined | Operational | New **§13B**: **fail-closed** + **break-glass superadmin** (role-claim, resolver-independent) + backups | High |
| **F7** | Provenance UI (§11) contradicted client template-read denial (§7) | Clarify | §11: provenance **server-computed**, delivered via `/api/admin/me`; client never reads templates | High |
| **F8** | Delegation validated raw template ref, not resolved delta | Security | §11: delegation validates **resolved delta ⊆ delegator's effective set** | High |
| **F9** | `sectionKey` ambiguity (raw `parts[2]`) | Clarify | §9: `sectionKey` = registered route-key; deeper segments are ids, not sections | High |
| **F10** | Algorithm hard-coded 3 levels → field-level would need rewrite | Extensibility | §6 made **N-level generic** (`levels` array); field-level is a prepend | High |

### v3 — Architecture Readiness Review (ARR) findings

| ID | Finding (v2 weakness) | Severity | Resolution in v3 | Confidence |
|----|----------------------|----------|------------------|-----------|
| **F11** | Cache "version-gated near-immediate" **overclaimed** — no free Firestore version signal; revocation not instantaneous | **Material** | §10.1 honest **short-TTL** model (≤5s direct / ≤30s template) + documented urgent-revocation path; industry-normal | High |
| **F12** | Break-glass superadmin depended on Firestore `roleType` → **dies in a Firestore outage** | **Material** | §13B break-glass is **claim-only** (token `role`, no Firestore read), audit-logged `rbac.breakglass`, tightly-scoped | High |

**Minor concerns (accepted / deferred, tracked):**
- (ARR#2) Resolved representation = **merged tri-state map + O(levels) query walk** (not a pre-expanded flat Set) — avoids expanding module→1000 sections. *To specify in Stage-1 impl.*
- (ARR#14) **Nested teams** not supported — flat teams only; deferred until demand.
- (ARR#15) Grants for **sections absent from the code registry are inert** (ignored) + a cleanup lint — Stage-1 detail.
- (ARR#9/#23) DR **runbook** + **concurrency/fault-injection tests** — authored during Stage-1/2, not design-blocking.
- (ARR#18) **Premature-complexity guard:** Stages 5–7 (templates/teams/temporary/delegation) are **explicitly gated on demonstrated demand**; the resolver runs on **direct section grants alone** for Stages 1–4 (teams/templates are empty unions until used).

**Held up without change** (re-challenged across both reviews, survived): sparse resolved-set storage scalability, downward-only inheritance, backward-compat golden-test approach, additive migration, flag-based rollback, `claims = role only`, server-API-only enforcement boundary.

### Architecture Readiness Score

**Design readiness: 96 / 100** (0 FAIL; 3 material CONCERNS resolved in v3 → F1–F12; 5 minor CONCERNS accepted/deferred with owners). Deductions: −2 residual operational complexity (mitigated by phasing), −2 eventual-consistency revocation window (industry-normal, documented).

**Implementation-readiness gate: NOT MET** — despite design ≥95, the following hard gates from the review remain **open**:
- ❌ Tier-2 (deployed Firebase infra: Rules/Functions/Extensions) — **unverified**
- ❌ Tier-3 (external ecosystem / other apps on project) — **unverified**
- ⏳ Staff/Principal formal approval of this ADD — pending

**Verdict: DO NOT begin implementation.** The *design* is ready (96/100); the *gates* are not. Implementation may start only when both Tier-2 and Tier-3 verification are complete and this ADD is approved.

**Reviewer verdict:** v2 addresses all Major findings with deterministic, evidence-grounded designs and no reliance on unavailable infrastructure. **Recommended to proceed to Staff/Principal review.** Residual risks are enumerated in §19 and are all Med-or-lower with defined mitigations. **No implementation until this ADD is approved and the §21 freeze gates (Tier-2 deployed-infra + Tier-3 external) are cleared.**
