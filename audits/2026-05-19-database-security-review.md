# Database Security Review — Trading Journal
**Date:** 2026-05-19  
**Scope:** All database interactions — Mongoose models, controllers, connection config, query patterns  
**Auditor:** Claude Code (claude-sonnet-4-6)  
**Codebase state:** Post input-validation commit `e1e3ee0`  
**Overall Risk Score:** 2 / 10

---

## Executive Summary

The database layer is in good shape. All queries go through Mongoose ODM methods — no raw string concatenation, no `$where` usage. `sanitizeFilter: true` blocks operator injection globally. Row-level ownership checks are enforced server-side on every document access. No secrets are committed to source control.

The two findings worth acting on are both Low severity: list endpoints return all matching documents with no upper bound (DB-01), and the Mongoose connection is opened with no timeout options (DB-02). For a personal single-user app neither is exploitable, but both will quietly cause problems as the journal grows or a network issue surfaces.

Several checklist items from the 29-point review are **Unable to verify** because they are MongoDB Atlas platform-configuration concerns (network ACLs, disk encryption, backup policy, DB user privileges) — these are not code-level issues.

---

## Top 3 Prioritized Fixes

1. **Add a hard `LIMIT` cap on list queries** — prevents a slow unbounded scan as the journal grows (DB-01)
2. **Add `serverSelectionTimeoutMS` and `socketTimeoutMS` to `mongoose.connect()`** — prevents indefinitely hanging connections on network loss (DB-02)
3. **Add field projection to list endpoints** — avoids fetching full `notes` HTML and `images` arrays when rendering list views (DB-03, Low / informational)

---

## Findings

---

### DB-01 — Unbounded List Queries (No Pagination or Hard Cap)
**Severity:** Medium  
**CWE:** CWE-770 (Allocation of Resources Without Limits or Throttling)  
**Files:** `backend/src/controllers/tradeEntry.controller.ts:27`, `backend/src/controllers/noTradeEntry.controller.ts:24`

**Evidence**
```typescript
// tradeEntry.controller.ts:27 — no .limit()
const tradeEntries = await TradeEntry.find({ userId }).sort({ createdAt: -1 });

// noTradeEntry.controller.ts:24 — same
const noTradeEntries = await NoTradeEntry.find({ userId }).sort({ createdAt: -1 });
```

Both list endpoints fetch every document owned by the authenticated user in a single query. For a trader logging daily, this reaches 500+ documents within two years. Each `TradeEntry` document can carry a `notes` field up to ~64 kb (IV-05 limit not yet applied to the schema) and an `images` array of Cloudinary URLs. A full fetch of 1,000 entries with notes populated is a multi-megabyte payload delivered on every dashboard load.

**Why it matters**  
- Response time degrades linearly with entry count — a user with 2,000 entries eventually notices.
- The MongoDB driver must deserialize the entire result set before returning it to the application layer — memory pressure on the Node process.
- For a personal app the blast radius is self-contained (no other users), but the behavior is not bounded by any server-side guard today.

**Remediation**

The lightest-weight fix is a hard cap that matches whatever the frontend renders. If the dashboard shows the 50 most recent entries, enforce that server-side:

```typescript
// tradeEntry.controller.ts — in getTradeEntries
const tradeEntries = await TradeEntry.find({ userId })
  .sort({ createdAt: -1 })
  .limit(200); // hard cap; add pagination params when the UI needs them
```

When the UI eventually needs pagination, add `skip` based on a validated `page` query parameter:

```typescript
const PAGE_SIZE = 50;
const page = Math.max(0, parseInt(req.query.page as string) || 0);

const tradeEntries = await TradeEntry.find({ userId })
  .sort({ createdAt: -1 })
  .skip(page * PAGE_SIZE)
  .limit(PAGE_SIZE);
```

Apply the same to `getNoTradeEntries`.

---

### DB-02 — No Connection Timeout Options on `mongoose.connect()`
**Severity:** Low  
**CWE:** CWE-400 (Uncontrolled Resource Consumption)  
**File:** `backend/src/config/database.ts:9`

**Evidence**
```typescript
// database.ts:9 — no timeout options
await mongoose.connect(connectionString);
```

Mongoose's `mongodb` driver defaults:
- `serverSelectionTimeoutMS`: 30,000 ms (30 s) — how long to wait when selecting a server before throwing
- `socketTimeoutMS`: 0 — **no timeout** on individual operations once connected; a hung query never returns

With `socketTimeoutMS: 0`, a network partition or a slow aggregation that stalls mid-execution will hold the connection open indefinitely until the OS-level TCP keepalive fires (typically 2+ hours on Linux). During that window, Node's event loop is not blocked (Mongoose uses async callbacks), but the connection slot is consumed and the request hangs waiting for a response that never arrives.

**Why it matters**  
For a hosted personal app (Render, Railway, Fly.io), a network blip between the app server and MongoDB Atlas can silently park a connection for hours. The user sees a spinner forever instead of a timeout error.

**Remediation**

```typescript
// database.ts
await mongoose.connect(connectionString, {
  serverSelectionTimeoutMS: 5_000,  // fail fast if Atlas is unreachable on startup
  socketTimeoutMS: 45_000,          // abort an individual operation after 45 s
  connectTimeoutMS: 10_000,         // TCP handshake timeout
});
```

These values are conservative defaults that work well for Atlas-hosted instances. Adjust `socketTimeoutMS` up if the `getStats` aggregation ever runs over 45 s (unlikely for a personal journal).

---

### DB-03 — No Field Projection on List Endpoints (Informational)
**Severity:** Low  
**CWE:** CWE-213 (Exposure of Sensitive Information Due to Incompatible Policies)  
**Files:** `backend/src/controllers/tradeEntry.controller.ts:27`, `backend/src/controllers/noTradeEntry.controller.ts:24`

**Evidence**
```typescript
// Returns all fields including notes (HTML) and images[]
const tradeEntries = await TradeEntry.find({ userId }).sort({ createdAt: -1 });
```

List endpoints return every stored field, including `notes` (up to 64 kb of HTML per entry) and `images` (arrays of Cloudinary URLs). If the list view only renders summary columns (result, contract, P&L, date), the notes and images fields are fetched, serialized, sent over the wire, and deserialized by the client — then discarded.

**This is informational, not a security issue.** It has no exploitability. It is included because it compounds DB-01: each document in the unbounded list is larger than it needs to be for list rendering.

**Remediation**

Add a projection when only summary data is needed:

```typescript
// tradeEntry.controller.ts — list endpoint only
const tradeEntries = await TradeEntry.find({ userId })
  .select("result contract direction contracts entryPrice exitPrice pnl entryTime exitTime accountId createdAt")
  .sort({ createdAt: -1 })
  .limit(200);
```

The individual `getTradeEntry` endpoint already fetches the full document, so no change needed there.

---

## Checklist

| # | Check | Status | Notes |
|---|---|---|---|
| 1 | Parameterized queries / ORM usage | **PASS** | All queries use Mongoose ODM methods. No string concatenation in any query. |
| 2 | Connection string security | **PASS** | `process.env.MONGO_URI` used. `.env` in `.gitignore`. No secrets committed. |
| 3 | DB user permissions (least privilege) | **Unable to verify** | MongoDB Atlas console config — not enforceable from code. |
| 4 | Sensitive data encryption at rest | **Unable to verify** | Atlas M0/M10+ provide encryption at rest by default. Verify in Atlas dashboard. |
| 5 | PII handling compliance | **PASS** | Minimal PII: username, email, bcrypt hash. `password` has `select: false`. No SSNs, addresses, or financial identifiers. |
| 6 | Query timeout config | **FAIL** | No timeout options on `mongoose.connect()` → DB-02 |
| 7 | Connection pool settings | **PASS (partial)** | Mongoose 9 + mongodb driver v6 defaults to `maxPoolSize: 100`. Acceptable for a personal app; no explicit override needed. |
| 8 | Transaction handling | **PASS (N/A)** | All writes are single-document. `deleteAccount` has a TOCTOU check (`countDocuments` then `delete`) but is unexploitable for a single-user app. |
| 9 | Audit logging for sensitive operations | **FAIL (Low)** | Only `console.error`. No access log or audit trail. Acceptable for a personal app. |
| 10 | NoSQL injection hardening | **PASS** | `mongoose.set('sanitizeFilter', true)` set globally in `database.ts:3`. `typeof` guards on auth inputs. Fixed in prior authz audit. |
| 11 | Row/tenant isolation | **PASS** | Every controller checks `document.userId.toString() !== req.userId!` post-fetch. Fixed in prior authz audit. |
| 12 | Least-privilege networking | **Unable to verify** | MongoDB Atlas network ACL / VPC config — not visible from code. |
| 13 | TLS in transit | **PASS (Atlas default)** | Atlas connection strings use TLS by default. No `tls: false` override found anywhere in the codebase. |
| 14 | Secret management & rotation | **PASS (partial)** | `MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_*` in `.env` (git-ignored). No secrets manager rotation. Acceptable for a personal project. |
| 15 | Schema & integrity controls | **PASS** | `userId` and `accountId` are `required: true` ObjectIds on all entry schemas. Enums enforced by Mongoose. `unique: true` on `username` and `email`. |
| 16 | Field-level minimization (`SELECT *`) | **FAIL (Low)** | List endpoints return all fields → DB-03 |
| 17 | Pagination & query limits | **FAIL (Medium)** | No `.limit()` on any list query → DB-01 |
| 18 | Backup/restore security | **Unable to verify** | MongoDB Atlas automated backup config — not visible from code. |
| 19 | Data retention & deletion | **PASS (partial)** | Delete endpoints exist for all entity types. No automated retention policy; user-controlled deletion is sufficient for a personal app. |
| 20 | Migrations safety | **N/A** | No migration framework. Mongoose schema updates handle structural changes. Appropriate for MongoDB at this scale. |
| 21 | ORM raw-query escape hatch | **PASS** | One `aggregate()` call in `getStats` — uses only static field references and `$sum`/`$cond`/`$eq`. No user input in the pipeline. |
| 22 | LIKE / regex input handling | **PASS** | No `$regex` queries anywhere. No pattern-based search endpoints. |
| 23 | Query timeouts & resource guards | **FAIL (Low)** | Same as check 6 → DB-02 |
| 24 | Audit & monitoring depth | **FAIL (Low)** | No structured logging or alerting. Acceptable for a personal app. |
| 25 | PII in logs/metrics | **PASS** | `console.error(error)` logs Error objects (stack traces), not user documents. No query debug logging enabled. |
| 26 | Indexing of sensitive data | **PASS** | `email` and `username` are indexed (via `unique: true`) — appropriate for auth lookups. `password` has `select: false`. |
| 27 | Service/account lifecycle | **Unable to verify** | MongoDB Atlas IAM/service account management. |
| 28 | Caching layers | **N/A** | No Redis or Memcached in the stack. |
| 29 | Analytics/ETL exports | **N/A** | No analytics pipeline or ETL infrastructure. |
