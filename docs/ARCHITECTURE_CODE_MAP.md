# AltFTool — Architecture Code Map (Graphify-style)

> Generated 2026-06-17. A visual map of the monorepo: frontend, backend, database, authentication flow, APIs, services, and dependencies. Diagrams use Mermaid — view in any Mermaid-capable Markdown renderer (GitHub, VS Code Mermaid preview, etc.).

---

## 1. System context (monorepo at a glance)

The repo is an **npm workspaces monorepo** with two Next.js apps and two shared packages.

```mermaid
flowchart TB
    subgraph Repo["altftool (npm workspaces monorepo)"]
        WEB["altftoolweb<br/>Public tools site · port 3002<br/>~232 utility tools, blogs, deals"]
        ADMIN["altftoolwebadmin<br/>Admin / Ads Manager · port 3001<br/>auth, support, notifications, analytics"]
        CORE["packages/core<br/>@altftool/core<br/>http · cache · env · firebase contracts"]
        UI["packages/ui<br/>@altftool/ui<br/>design-system components"]
    end

    WEB -->|imports| CORE
    WEB -->|imports| UI
    ADMIN -->|imports| CORE
    ADMIN -->|imports| UI

    WEB -->|client + REST| FB[(Firebase / Firestore)]
    ADMIN -->|client SDK + Admin SDK| FB
    ADMIN -->|FCM push| FCM[Firebase Cloud Messaging]

    WEB -->|server proxy| EXT[External APIs:<br/>OpenAI · Gemini · Giphy · AlphaVantage<br/>Adzuna · RapidAPI · remove.bg · linkpreview<br/>PageSpeed · metalprice · frankfurter · trends · YouTube]

    CI["GitHub Actions<br/>ci · deployment-readiness · monitoring · vercel-deploy"] -.->|deploys| VERCEL[Vercel]
    VERCEL -.->|hosts| WEB
    VERCEL -.->|hosts| ADMIN
```

| Workspace | Role | Auth? | Runtime |
|-----------|------|-------|---------|
| `altftoolweb` | Public, read-only tools catalog + content | No user auth | Next.js App Router (SSR/ISR) |
| `altftoolwebadmin` | Internal admin console | Firebase Auth + Firestore RBAC | Next.js App Router |
| `packages/core` | Shared runtime helpers | n/a | ESM library |
| `packages/ui` | Shared React design system | n/a | React 19 library |

---

## 2. Frontend architecture

```mermaid
flowchart LR
    subgraph AdminFE["altftoolwebadmin — frontend"]
        LP["/login (page.jsx)"]
        AC["AuthContext.jsx<br/>(onAuthStateChanged, /api/admin/me)"]
        PROT["(protected) route group<br/>AdminLayout"]
        MODS["module routes:<br/>admin-management · analytics · health<br/>support · tickets · notifications · profile · [project]"]
        LIB["lib/: firebase.js · apiClient.js<br/>permissionUtils · usePushNotifications"]
    end

    subgraph WebFE["altftoolweb — frontend"]
        SLUG["[slug] dynamic tool pages"]
        TOOLS["src/tools/* (~232 tools)"]
        PLAT["src/platform/*<br/>analytics · navigation · seo · registry · chatbot"]
        CTX["contexts: ThemeContext · GlobalAnimationProvider"]
        WLIB["lib/: firebase.js · firebaseCache.js"]
    end

    LP --> AC --> PROT --> MODS
    AC --> LIB
    SLUG --> TOOLS --> PLAT
    SLUG --> CTX
    PLAT --> WLIB

    AdminFE -->|@altftool/ui| UIPKG[(Design system)]
    WebFE -->|@altftool/ui| UIPKG
```

- **Framework:** Next.js App Router, React 19, Tailwind CSS.
- **Shared UI:** `@altftool/ui` (Button, Input, Card, Modal, Toast, Badge, …).
- **Admin state:** `AuthContext` is the single source of truth for the signed-in admin; pages render inside the `(protected)` route group.
- **Web app:** registry-driven — `src/tools/*` tool definitions are mapped to dynamic `[slug]` routes; mostly static/ISR with client interactivity.

---

## 3. Backend architecture (API routes & services)

```mermaid
flowchart TB
    subgraph AdminAPI["altftoolwebadmin/src/app/api (~31 routes)"]
        direction TB
        A1["/api/admin/me (GET)"]
        A2["/api/admin/google-login (POST)"]
        A3["/api/admin/create · update · toggle-status · list · superadmins"]
        A4["/api/admin/access-requests (+approve/reject) · request-access"]
        A5["/api/admin/change-password · audit/list"]
        A6["/api/support/* (create/reply/all/my-tickets/…)"]
        A7["/api/notifications/* (broadcast/scheduler/save-token/test-push/mark-read)"]
        A8["/api/analytics · /api/audit/log · /api/health"]
    end

    subgraph AdminSvc["admin services (src/lib)"]
        SAA["serverAdminAuth.js<br/>verifyActiveAdmin / verifySuperAdmin"]
        AA["adminAccess.js<br/>verifySuperAdminRequest (+5s cache)"]
        FA["firebaseAdmin.js<br/>lazy Admin SDK init + config validation"]
        DW["dualWrite.js · syncAdminClaims.js"]
        PUSH["sendPushNotification.js"]
    end

    subgraph WebAPI["altftoolweb/src/app/api (~15 routes)"]
        W1["/api/blogs · /api/health · /api/trends"]
        W2["/api/tools/* proxies:<br/>openai · gemini · giphy · stock · pagespeed<br/>remove-bg · link-preview · metal-prices · skill-demand · currency"]
    end

    A1 --> SAA
    A2 --> FA
    A3 --> AA
    A4 --> AA
    A6 --> SAA
    A7 --> FA
    A7 --> PUSH
    SAA --> FA
    AA --> FA
    DW --> FA
    PUSH --> FA

    A1 & A2 & A3 & A4 & A6 & A7 & A8 --> RL["@altftool/core/http<br/>enforceRateLimit (in-memory)"]
    W1 & W2 --> RL
    W2 --> EXTAPI[External 3rd-party APIs]
    FA --> FS[(Firestore Admin)]
    SAA --> FS
```

- **Pattern:** Next.js Route Handlers (serverless functions), one folder per endpoint.
- **Admin SDK:** `firebaseAdmin.js` lazily initializes `firebase-admin` via a proxy, validating credentials from `FIREBASE_SERVICE_ACCOUNT`, a service-account file, or split `FIREBASE_*` env vars.
- **Authorization helpers:** `serverAdminAuth.js` (token → `admins` doc → active check) and `adminAccess.js` (`verifySuperAdminRequest`, with a 5s read cache).
- **Web API:** thin server-side **proxies** that keep third-party API keys off the client and apply rate limiting.

---

## 4. Database model (Firestore)

```mermaid
erDiagram
    admins ||--o{ accessRequests : "uid"
    admins {
        string uid PK
        string email
        string roleType "admin|superadmin"
        bool isActive
        map permissions
        map projectAccess
    }
    accessRequests {
        string id PK
        string uid
        string email
        string type "new"
        string status "pending|approved|rejected"
        string createdAt
    }
    blogs ||--o{ blog_comments : "has"
    blogs ||--o{ blog_views : "has"
    blogs {
        string id PK
        string status
        string category
        number likesCount
        number viewsCount
    }
    support_tickets ||--o{ ticket_messages : "has"
    support_tickets {
        string id PK
        string createdBy
        string status
        bool isDeleted
        string autoDeleteAt
    }
    notifications {
        string id PK
        string ownerUid
        bool read
    }
    notification_broadcasts {
        string id PK
        string status "scheduled|sent"
        number scheduledAt
    }
```

Other collections governed by `firestore.rules`: `projects/{projectId}/**`, `pintrest`, `pintrest_categories`, `results`. Rules are **default-deny** with field-level constraints on public writes (counters, comments, view pings). Composite indexes are defined in `firestore.indexes.json`; storage governed by `storage.rules` (MIME allowlist + size caps).

---

## 5. Authentication & authorization flow (UI → DB)

This is the path that was failing. It is now restored.

```mermaid
sequenceDiagram
    participant U as User
    participant LP as Login page
    participant FBA as Firebase Auth (client)
    participant AC as AuthContext
    participant ME as /api/admin/me
    participant ASDK as Admin SDK (firebaseAdmin.js)
    participant FS as Firestore (admins)

    U->>LP: email+password OR Google popup
    LP->>FBA: signInWithEmailAndPassword / signInWithPopup
    FBA-->>AC: onAuthStateChanged(user)
    AC->>FBA: getIdToken(true)
    AC->>ME: GET /api/admin/me (Bearer token)
    ME->>ASDK: verifyIdToken(token)
    Note over ASDK: needs valid FIREBASE_* credentials
    ASDK-->>ME: decoded {uid,email}
    ME->>FS: admins/{uid} (fallback: where email==)
    alt active admin doc
        FS-->>ME: profile + role
        ME-->>AC: 200 {roleType, permissions, projectAccess}
        AC-->>LP: user+adminData set
        LP->>U: redirect to first allowed route
    else no doc yet
        ME-->>AC: 404 (pending) → /access-requested
    else rejected / inactive
        ME-->>AC: 403 (denied / sign out)
    else backend/config error
        ME-->>AC: 500 → (now) keep Firebase session, no logout loop
    end
```

```mermaid
flowchart LR
    G["Google sign-in"] --> GL["/api/admin/google-login (POST)"]
    GL --> DOM{"email ends with<br/>@anslation.com?"}
    DOM -- no --> R403[403 rejected]
    DOM -- yes --> EX{"admin doc exists<br/>& active?"}
    EX -- yes --> OK["status: admin"]
    EX -- no --> REQ["create/return accessRequest<br/>status: pending"] --> PEND["/access-requested<br/>(awaits superadmin approval)"]
```

**Key facts:**
- There is **no public self-signup**. "Signup" = the **request-access** flow: a new Google user is auto-recorded as a *pending* `accessRequest`, which a superadmin approves to create the `admins` doc.
- **Authentication** = Firebase Auth (email/password or Google, domain-restricted).
- **Authorization** = Firestore `admins` doc (`roleType`, `isActive`, `permissions`, `projectAccess`) + Firebase custom claims (`syncAdminClaims.js`).
- Server trust boundary = Admin SDK `verifyIdToken` on every API call. **If the Admin SDK can't initialize, the entire auth chain fails closed at `/api/admin/me`.** ← this was the outage.

---

## 6. Dependency & build topology

```mermaid
flowchart TB
    subgraph Build
        ROOT["root package.json<br/>workspaces + 27 check-*.mjs scripts"]
    end
    ROOT --> CORE["@altftool/core"]
    ROOT --> UI["@altftool/ui"]
    CORE --> WEB["altftoolweb"]
    CORE --> ADMIN["altftoolwebadmin"]
    UI --> WEB
    UI --> ADMIN

    WEB --> NEXT["next · react 19 · tailwind"]
    ADMIN --> NEXT
    ADMIN --> FADMIN["firebase-admin"]
    WEB --> FCLIENT["firebase (client)"]
    ADMIN --> FCLIENT

    subgraph Infra
        GH[".github/workflows"]
        FBJSON["firebase.json · firestore.rules · storage.rules · *.indexes.json"]
    end
    GH -.-> VERCEL[Vercel]
    FBJSON -.-> FB[(Firebase project: altftool-bca36)]
```

- **Shared deps flow one way:** `core`/`ui` → apps. No app-to-app imports.
- **Validation tooling:** root has ~27 `scripts/check-*.mjs` gates (env readiness, route QA, Firebase contracts/integrity, performance budgets, deploy readiness) wired into CI.
- **CI/CD:** `ci.yml` (build/test/security/lighthouse + Firebase emulator) → `vercel-deploy.yml`; `monitoring.yml` runs hourly production health checks.

---

## 7. Where the failure lived (heat map)

```mermaid
flowchart LR
    ENV[".env.local<br/>❌ shadowed valid creds"]:::crit --> FA["firebaseAdmin.js<br/>init throws"]:::crit
    FA --> ME["/api/admin/me → 500"]:::crit
    ME --> AC["AuthContext<br/>signOut() loop"]:::high
    AC --> LOGIN["login appears to fail"]:::crit

    CRON["scheduler CRON_SECRET<br/>⚠️ fail-open"]:::high
    BYPASS["adminAccess host-spoof<br/>⚠️ superadmin bypass"]:::crit

    classDef crit fill:#fde2e2,stroke:#c0392b,color:#7b241c;
    classDef high fill:#fdebd0,stroke:#d68910,color:#7e5109;
```

See `BACKEND_AUTH_AUDIT_REPORT.md` for root-cause detail, the fixes applied, and the prioritized improvement roadmap.
