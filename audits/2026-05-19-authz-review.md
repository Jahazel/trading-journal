# Authorization Implementation Review — Trading Journal
**Date:** 2026-05-19  
**Scope:** All routes — BOLA/IDOR, middleware ordering, privilege escalation, JWT validation, field-level authorization, error behavior  
**Auditor:** Claude Code (claude-sonnet-4-6)  
**Codebase state:** Post auth-review commit `008b30d`  
**Overall Risk Score:** 2 / 10

---

## Route Inventory

| Method | Route | Auth | Handler | Ownership check |
|---|---|---|---|---|
| POST | /api/auth/signup | None (public) | signUp | N/A |
| POST | /api/auth/login | None (public) | login | N/A |
| POST | /api/auth/logout | None (intentional) | logout | N/A |
| GET | /api/trades-entry | authMiddleware | getTradeEntries | Query-level `{ userId }` |
| POST | /api/trades-entry | authMiddleware | createTradeEntry | Account ownership check |
| GET | /api/trades-entry/stats | authMiddleware | getStats | Aggregate `$match { userId }` |
| GET | /api/trades-entry/:id | authMiddleware | getTradeEntry | Post-fetch userId compare |
| PATCH | /api/trades-entry/:id | authMiddleware | updateTradeEntry | Post-fetch userId compare |
| DELETE | /api/trades-entry/:id | authMiddleware | deleteTradeEntry | Post-fetch userId compare |
| GET | /api/no-trade-entries | authMiddleware | getNoTradeEntries | Query-level `{ userId }` |
| POST | /api/no-trade-entries | authMiddleware | createNoTradeEntry | Account ownership check |
| GET | /api/no-trade-entries/:id | authMiddleware | getNoTradeEntry | Post-fetch userId compare |
| PATCH | /api/no-trade-entries/:id | authMiddleware | updateNoTradeEntry | Post-fetch userId compare |
| DELETE | /api/no-trade-entries/:id | authMiddleware | deleteNoTradeEntry | Post-fetch userId compare |
| GET | /api/accounts | authMiddleware | getAccounts | Query-level `{ userId }` |
| POST | /api/accounts | authMiddleware | createAccount | userId injected server-side |
| GET | /api/accounts/:id | authMiddleware | getAccount | Post-fetch userId compare |
| PATCH | /api/accounts/:id | authMiddleware | updateAccount | Post-fetch userId compare |
| DELETE | /api/accounts/:id | authMiddleware | deleteAccount | Post-fetch userId compare |
| POST | /api/upload | authMiddleware | uploadImage | AuthN only (no object) |

---

## Executive Summary

The authorization implementation is strong. Every protected route has `authMiddleware` before the handler. All list endpoints scope at query time (`find({ userId })`). All single-resource endpoints perform a post-fetch `userId.toString() !== userId` ownership check before returning data or allowing writes. No privilege escalation vectors exist — `userId` is always injected server-side from the verified JWT, never from the request body.

The findings are narrow and primarily concern compile-time safety (AZ-01) and 404/403 response consistency (AZ-02). Neither is an active exploit path in the current single-user design.

---

## Top 3 Prioritized Fixes

1. **Make `req.userId` optional in the TypeScript augmentation** — closes a silent compile-time gap that could let an unprotected route reach a handler without a type error (AZ-01)
2. **Return 404 for both "not found" and "not owned" branches** — prevents authenticated users from enumerating whether IDs belong to other users (AZ-02)
3. **Validate `req.params.id` is a valid ObjectId before `findById`** — turns Mongoose CastError 500s into proper 400s and prevents stack trace leakage in development (AZ-03)

---

## Findings

---

### AZ-01 — `req.userId` Declared as Non-Optional String
**Severity:** Medium  
**CWE:** CWE-284 (Improper Access Control)  
**File:** `backend/src/types/express.d.ts:6`

**Evidence**
```typescript
// express.d.ts:6
interface Request {
  userId: string;   // non-optional — no compiler warning if accessed without middleware
}
```

`req.userId` is typed as `string`, not `string | undefined`. This means TypeScript will not flag `req.userId` access on any route — protected or not. If a new route is added to a router without `authMiddleware`, every controller that reads `req.userId` will compile cleanly, and at runtime `req.userId` will be `undefined` (crashing or silently passing an `undefined` userId to a query).

**Why it matters**  
Type safety is the first line of defense against accidentally exposed routes. Every controller across all five routers relies on `req.userId` being populated. Making it optional forces every handler to prove the middleware is present — the compiler catches the gap at write time, not in production.

**Exploitability**  
Not currently exploitable — all existing routes have `authMiddleware`. The risk is forward-looking: a future route added without middleware would be silently broken.

**Remediation**
```typescript
// backend/src/types/express.d.ts
declare global {
  namespace Express {
    interface Request {
      userId?: string;   // optional — controllers must handle undefined
    }
  }
}
```

With `userId?`, TypeScript will error on `req.userId` access in any handler where the type can't be narrowed to `string`. The auth middleware sets it unconditionally, so the narrowing happens naturally in any route that correctly uses `authMiddleware`. No controller logic needs to change — the compiler will confirm all existing paths are safe.

---

### AZ-02 — 404/403 Distinction Reveals Resource Existence
**Severity:** Low  
**CWE:** CWE-203 (Observable Discrepancy)  
**Files:** All `/:id` handlers across `tradeEntry.controller.ts`, `noTradeEntry.controller.ts`, `account.controller.ts`

**Evidence**
```typescript
// Pattern repeated in getTradeEntry, updateTradeEntry, deleteTradeEntry,
// getNoTradeEntry, updateNoTradeEntry, deleteNoTradeEntry,
// getAccount, updateAccount, deleteAccount

const tradeEntry = await TradeEntry.findById(tradeEntryId);

if (!tradeEntry) {
  return res.status(404).json({ message: "Trade entry not found." });
  // → tells caller: this ID does not exist
}

if (tradeEntry.userId.toString() !== userId) {
  return res.status(403).json({ message: "You don't have permission..." });
  // → tells caller: this ID exists but belongs to someone else
}
```

An authenticated user who obtains or guesses another user's resource ID can distinguish between IDs that exist (403) and IDs that don't (404).

**Exploitability**  
Low for the current design — the app is personal/single-user and there are no other users to enumerate against. The risk becomes significant if this ever scales to multiple users, where user A could map out user B's trade IDs by scanning ObjectId ranges.

**Remediation**  
Return 404 for both branches — never confirm that a resource exists to a user who doesn't own it:

```typescript
// Consistent pattern for all /:id handlers
const tradeEntry = await TradeEntry.findById(tradeEntryId);

if (!tradeEntry || tradeEntry.userId.toString() !== userId) {
  return res.status(404).json({ message: "Trade entry not found." });
}
```

Alternatively, combine the ownership check into the query itself to eliminate the extra round trip:

```typescript
const tradeEntry = await TradeEntry.findOne({ _id: tradeEntryId, userId });

if (!tradeEntry) {
  return res.status(404).json({ message: "Trade entry not found." });
}
// No separate ownership check needed — the query enforces it
```

The combined-query approach is both safer and more efficient — one DB round trip instead of two.

---

### AZ-03 — No ObjectId Validation Before `findById` — CastError Returns 500
**Severity:** Low  
**CWE:** CWE-233 (Improper Handling of Parameters)  
**Files:** All `/:id` handlers — `tradeEntry.controller.ts:44-48`, `noTradeEntry.controller.ts:41-45`, `account.controller.ts:40-44`

**Evidence**
```typescript
// tradeEntry.controller.ts:48 — no format validation before query
const tradeEntry = await TradeEntry.findById(tradeEntryId);
// If tradeEntryId is "not-an-objectid", Mongoose throws:
// CastError: Cast to ObjectId failed for value "not-an-objectid" at path "_id" for model "Trade"
// → caught by catch block → handleServerError → 500
```

When a non–ObjectId string is passed as a URL parameter, Mongoose throws a `CastError` that is caught by the generic `handleServerError` and returned as a 500. In development (`NODE_ENV !== "production"`), `handleServerError` returns the raw error message, leaking the internal model name and field path.

**Exploitability**  
Informational in production (message is "Internal server error."). In development, the 500 response body reads: `Cast to ObjectId failed for value "abc" at path "_id" for model "Trade"` — leaking the Mongoose model name.

**Minimal PoC**
```bash
curl http://localhost:3000/api/trades-entry/not-an-id \
  -H "Cookie: token=<valid_token>"
# Development → 500: "Cast to ObjectId failed for value \"not-an-id\"..."
# Production  → 500: "Internal server error."
# Expected    → 400: "Invalid ID format."
```

**Remediation**  
Validate the ID format before querying. The cleanest approach is a shared utility:

```typescript
// backend/src/utils/validateObjectId.ts
import { Types } from "mongoose";
import type { Response } from "express";

export function isValidObjectId(
  id: string | undefined,
  res: Response,
  label = "ID",
): id is string {
  if (!id || !Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: `Invalid ${label} format.` });
    return false;
  }
  return true;
}
```

```typescript
// Usage in any /:id handler
if (!isValidObjectId(tradeEntryId, res, "trade entry ID")) return;
const tradeEntry = await TradeEntry.findById(tradeEntryId);
```

---

### AZ-04 — `images` Array Accepts Arbitrary URLs Without Validation
**Severity:** Low  
**CWE:** CWE-20 (Improper Input Validation)  
**Files:** `tradeEntry.controller.ts:210`, `noTradeEntry.controller.ts:136`

**Evidence**
```typescript
// tradeEntry.controller.ts:210 — no URL validation
if (images !== undefined) tradeEntry.images = images;

// noTradeEntry.controller.ts:136
if (images !== undefined) noTradeEntry.images = images;
```

The `images` field accepts any string array from the request body. The values are not validated as Cloudinary URLs or checked against the upload endpoint's output. An authenticated user can persist arbitrary URLs in their journal entries.

**Why it matters for a personal app:** Low — the user is writing to their own data. The rendered URLs are displayed back only to themselves.

**Why it matters at scale:** If this ever becomes multi-user or entries are shared, stored URLs become a stored-content injection surface (malicious media, tracking pixels, SSRF if the backend ever fetches image URLs for processing).

**Remediation**  
Add a URL allowlist check at the controller boundary:

```typescript
// utils/validateImageUrls.ts
const ALLOWED_HOSTS = ["res.cloudinary.com"];

export function validateImageUrls(urls: unknown): urls is string[] {
  if (!Array.isArray(urls)) return false;
  return urls.every((url) => {
    try {
      const parsed = new URL(url as string);
      return ALLOWED_HOSTS.includes(parsed.hostname);
    } catch {
      return false;
    }
  });
}
```

```typescript
// In update handlers
if (images !== undefined) {
  if (!validateImageUrls(images)) {
    return res.status(400).json({ message: "Invalid image URLs." });
  }
  tradeEntry.images = images;
}
```

---

## Checklist

| # | Check | Status | Notes |
|---|---|---|---|
| **BOLA / IDOR** | Ownership check on all `GET /:id` routes | **PASS** | Post-fetch userId compare on all handlers |
| **BOLA / IDOR** | Ownership check on all `PATCH /:id` routes | **PASS** | Post-fetch userId compare on all handlers |
| **BOLA / IDOR** | Ownership check on all `DELETE /:id` routes | **PASS** | Post-fetch userId compare on all handlers |
| **BOLA / IDOR** | List endpoints scoped at query time | **PASS** | All `find({ userId })` — no post-fetch filtering |
| **BOLA / IDOR** | Cross-resource ownership (account → entry) | **PASS** | Account ownership verified on entry create/update |
| **Function level authZ** | All privileged routes have middleware | **PASS** | Every protected route: `authMiddleware, handler` |
| **Function level authZ** | Server-side enforcement (not UI-only) | **PASS** | All checks in Express handlers |
| **Function level authZ** | Correct middleware ordering | **PASS** | Auth before handler on all routes |
| **Missing auth checks** | No exposed admin/debug/seed endpoints | **PASS** | None exist in the codebase |
| **Missing auth checks** | Upload endpoint protected | **PASS** | `authMiddleware` on `POST /api/upload` |
| **RBAC** | Roles cannot be set by client | **PASS** | No role field on User model |
| **RBAC** | Deny-by-default | **PASS** | `authMiddleware` returns 401 with no token |
| **Privilege escalation** | Update endpoints whitelist allowed fields | **PASS** | Explicit destructuring; no `userId`/`role` in body types |
| **Privilege escalation** | `userId` injected server-side only | **PASS** | Always from `req.userId` (JWT), never `req.body` |
| **JWT validation** | `jwt.verify` with explicit algorithms | **PASS** | `algorithms: ["HS256"]` |
| **JWT validation** | No `jwt.decode` for authZ decisions | **PASS** | Only `jwt.verify` used |
| **JWT validation** | `exp` enforced | **PASS** | Enforced by `jwt.verify` |
| **JWT validation** | `iss`, `aud`, `jti` checked | **FAIL (low)** | Not set or verified — noted as A-07 |
| **JWT validation** | Token revocation strategy | **FAIL** | No revocation; noted as A-01 |
| **TypeScript safety** | `req.userId` typed optional | **FAIL** | Non-optional type hides missing-middleware bugs → AZ-01 |
| **Error behavior** | Uniform 404 for non-owned resources | **FAIL (low)** | 403 reveals existence to authenticated users → AZ-02 |
| **Error behavior** | Invalid IDs return 400 | **FAIL (low)** | CastError returns 500 → AZ-03 |
| **Input validation** | `images` URLs validated | **FAIL (low)** | Arbitrary URLs accepted → AZ-04 |
| **Multi-tenant isolation** | Tenant (userId) injected server-side | **PASS** | Never client-provided |
| **Bulk endpoints** | No bulk endpoints exist | **N/A** | — |
| **Field-level authZ** | Sensitive fields excluded from responses | **PASS** | `password` is `select: false`; no other secrets on models |
| **CORS/CSRF** | No wildcard origins with credentials | **PASS** | Explicit origin allowlist |
| **CORS/CSRF** | CSRF mitigations in place | **PASS** | SameSite=lax + CORS (detailed in session-cookie-review) |
| **Open redirect** | No `next`/`redirect` params | **PASS** | Hardcoded `navigate("/dashboard")` |
| **Debug routes** | No `/seed`, `/reset`, `/debug` exposed | **PASS** | None exist |
