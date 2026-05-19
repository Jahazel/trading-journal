# Authentication Security Review — Trading Journal
**Date:** 2026-05-19  
**Scope:** Full authentication stack — backend auth controller, JWT middleware, user model, frontend AuthContext, API layer, signup/login pages  
**Auditor:** Claude Code (claude-sonnet-4-6)  
**Codebase state:** Post security-fix commit `85a1a8a`  
**Overall Risk Score:** 5.5 / 10

---

## Executive Summary

The authentication stack is structurally sound: bcrypt hashing is async with per-record salt, JWT algorithm is pinned, tokens travel only in httpOnly cookies, CORS is locked to an explicit origin allowlist, and helmet secures response headers. Ownership checks are enforced on all resource writes.

The main risks are: a single long-lived 7-day token with no refresh mechanism (stolen cookie = 7-day access window), a timing oracle on the login path that lets an attacker distinguish valid from invalid email addresses, and unguarded MongoDB query operators that could bypass uniqueness checks on signup. All three are fixable with small, targeted changes.

---

## Top 5 Prioritized Fixes

1. **Add `mongoose.set('sanitizeFilter', true)`** — one line, closes NoSQL injection on all query paths (A-04)
2. **Normalize email to lowercase before the login query** — closes the case-sensitivity functional bug and timing gap (A-03)
3. **Add a dummy-hash constant-time path for the "user not found" branch** — prevents timing-based email enumeration (A-02)
4. **Reduce token TTL to ≤24h** — narrow the stolen-cookie window; pairs with a refresh token if you later add one (A-01)
5. **Strengthen password minimum to 8+ characters** — one-line change in both schema and frontend validation (A-05)

---

## Findings

---

### A-01 — Single Long-Lived Access Token, No Refresh Architecture
**Severity:** High  
**CWE:** CWE-613 (Insufficient Session Expiration)  
**Files:** `backend/src/controllers/auth.controller.ts:14`, `auth.controller.ts:95-98`

**Evidence**
```typescript
// auth.controller.ts:10-15 — cookie maxAge and token TTL both 7 days
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,   // 604800000 ms = 7 days
};

// auth.controller.ts:95-98
const token = jsonwebtoken.sign({ id: existingUser.id }, secret, {
  expiresIn: "7d",                     // access token valid 7 days
});
```

There is no refresh token. The access token IS the session — it lives in a cookie for 7 full days with no rotation.

**Why it matters**  
If the cookie is captured (network interception on a non-HTTPS connection, malicious browser extension, MITM on a shared network) the attacker holds a fully valid session for up to 7 days. There is no server-side mechanism to revoke it, no sliding expiry, and no way to force re-authentication on a compromised session without rotating `JWT_SECRET` (which invalidates ALL sessions).

**Exploitability**  
Medium — requires cookie theft, but once obtained, access is unconditional for the full window. Made worse by S-07 (NODE_ENV unset → cookie `Secure` flag is false → cookie travels over HTTP).

**Remediation**

Two options — pick based on complexity tolerance:

**Option A (minimal change): Shorter TTL**
```typescript
// Reduce access token to 24h — same single-token design, much smaller window
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 24 * 60 * 60 * 1000,   // 1 day
};

const token = jsonwebtoken.sign({ id: existingUser.id }, secret, {
  expiresIn: "1d",
});
```

**Option B (full fix): Access + Refresh token pair**
- Access token: 15 minutes, in-memory on frontend
- Refresh token: 7–30 days, httpOnly cookie, stored hashed in DB, invalidated on reuse
- `/auth/refresh` endpoint rotates the refresh token and issues a new access token
- Logout deletes the refresh token from DB
- This enables true session revocation and per-device tracking

---

### A-02 — Timing Oracle on Login (Email Enumeration)
**Severity:** Medium  
**CWE:** CWE-208 (Observable Timing Discrepancy)  
**File:** `backend/src/controllers/auth.controller.ts:77-89`

**Evidence**
```typescript
const existingUser = await User.findOne({ email: email }).select("+password");

if (!existingUser) {
  return res.status(400).json({ message: "Invalid email or password" });
  // ↑ returns immediately — no bcrypt work, ~1–5ms
}

const isMatch = await bcrypt.compare(password, existingUser.password);
// ↑ bcrypt at cost 10 takes ~80–120ms
```

When the email isn't found the handler returns within ~2ms. When the email exists (regardless of password correctness) it takes ~100ms. The status code and body are identical, but the response latency reveals whether the email is registered.

**Exploitability**  
Low tooling, easily scripted. An attacker can enumerate which emails are registered by sending login requests and measuring RTT. Over HTTPS the timing difference survives network jitter because the bcrypt delta is ~100ms, well above typical jitter.

**Minimal PoC**
```bash
# Registered email — ~100ms response
curl -w "\ntime_total: %{time_total}" -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" -d '{"email":"real@user.com","password":"wrong"}'

# Unregistered email — ~2ms response
curl -w "\ntime_total: %{time_total}" -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" -d '{"email":"nobody@fake.com","password":"wrong"}'
```

**Remediation**
```typescript
// backend/src/controllers/auth.controller.ts
const DUMMY_HASH =
  "$2b$10$xxxxxxxxxxxxxxxxxxxxxxuOWdGxkqtjsAl0z0IfAh1T1TU68vKu";  // bcrypt dummy

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please enter all fields." });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail }).select("+password");

  // Always run bcrypt — use dummy hash when user not found to equalise timing
  const hashToCompare = existingUser?.password ?? DUMMY_HASH;
  const isMatch = await bcrypt.compare(password, hashToCompare);

  if (!existingUser || !isMatch) {
    return res.status(400).json({ message: "Invalid email or password." });
  }
  // ... rest of login
}
```

Note: also fixes A-03 (email case normalization) in the same change.

---

### A-03 — Email Not Normalized Before Login Query
**Severity:** Medium  
**CWE:** CWE-178 (Improper Handling of Case Sensitivity)  
**Files:** `backend/src/controllers/auth.controller.ts:77`, `backend/src/models/user.model.ts:16`

**Evidence**
```typescript
// user.model.ts:16 — email lowercased on save
email: {
  type: String,
  lowercase: true,   // stores "user@example.com"
  trim: true,
}

// auth.controller.ts:77 — raw email used in query, NOT lowercased
const existingUser = await User.findOne({ email: email });  // "User@Example.COM" != stored "user@example.com"
```

MongoDB string equality is case-sensitive by default. A user who registered as `alice@example.com` cannot log in as `Alice@Example.com` or `ALICE@EXAMPLE.COM`. The Mongoose `lowercase` transform fires on document save, not on query input.

**Why it matters**  
This is a functional bug that silently breaks login for users who enter their email with any capitalization other than all-lowercase — a common scenario on mobile devices where autocorrect capitalizes the first character. Additionally, the uniqueness index on `email` (case-sensitive in MongoDB) could allow `Alice@example.com` and `alice@example.com` to be registered as separate accounts if both are attempted before Mongoose's `lowercase` transform coerces them on save.

**Remediation**  
Normalize input before querying. See A-02 remediation above — the `normalizedEmail` line addresses both findings simultaneously.

---

### A-04 — No NoSQL Injection Sanitization
**Severity:** Medium  
**CWE:** CWE-943 (Improper Neutralization of Special Elements in Data Query Logic)  
**Files:** `backend/src/controllers/auth.controller.ts:28-37`, `auth.controller.ts:77`

**Evidence**
```typescript
// auth.controller.ts:77 — login: email from req.body used directly in query
const existingUser = await User.findOne({ email: email });

// auth.controller.ts:28-37 — signup: both username and email used directly
const existingUser = await User.findOne({
  $or: [{ username: username }, { email: email }],
});
```

Mongoose 9 does not strip MongoDB query operators (`$gt`, `$where`, `$regex`, etc.) from user-supplied query values by default. `sanitizeFilter` is not configured at `backend/src/config/database.ts:1-17` or `backend/src/index.ts`.

**Exploitability — Signup bypass**

If `username` and `email` are submitted as operator objects, the `$or` lookup matches every existing user. Because neither `existingUser.username === username` nor `existingUser.email === email` will be true (the comparison is object vs string), both guard branches are skipped and a new User document is created — bypassing the uniqueness check enforced by application logic (the DB-level unique index will still catch the duplicate and throw, but the application's intended 400 response is never returned):

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":{"$gt":""},"email":{"$gt":""},"password":"newpass"}'
# → unique index throws MongoServerError, caught by handleServerError as 500
# → response leaks "E11000 duplicate key error" when NODE_ENV != production
```

**Exploitability — Login**  
`findOne({ email: { "$gt": "" } })` returns the first user in collection order. Then `bcrypt.compare` runs against that user's real hash with the attacker's password, which will fail — but the attacker now has a timing oracle confirming a user exists.

**Remediation**

One line in `backend/src/config/database.ts` or `backend/src/index.ts`:
```typescript
import mongoose from "mongoose";
mongoose.set("sanitizeFilter", true);  // strips $ operators from all queries
```

This should be added before `connectDB()` is called. Also add runtime string type guards at the auth boundary:

```typescript
// auth.controller.ts — near the top of login/signup handlers
if (typeof email !== "string" || typeof password !== "string") {
  return res.status(400).json({ message: "Invalid input." });
}
```

---

### A-05 — Weak Password Minimum (6 Characters)
**Severity:** Low  
**CWE:** CWE-521 (Weak Password Requirements)  
**Files:** `backend/src/models/user.model.ts:27`, `frontend/src/pages/SignupPage.tsx:152`, `frontend/src/pages/LoginPage.tsx:124`

**Evidence**
```typescript
// user.model.ts:27
password: { minLength: 6 }

// SignupPage.tsx:152 / LoginPage.tsx:124
minLength: { value: 6, message: "Password must be at least 6 characters." }
```

6-character passwords are extremely weak. Passwords like `abc123`, `123456`, or `qwerty` are valid. The NIST SP 800-63B minimum is 8 characters for memorized secrets; 12 is recommended for apps handling sensitive personal data.

**Why it matters**  
This app stores trading activity data (P&L, strategy patterns). A weak password policy, combined with the per-IP-only (not per-username) rate limiting, means that targeting a specific account with common passwords from rotating IPs is feasible.

**Remediation**  
Raise the minimum to 8 in both locations:
```typescript
// user.model.ts
password: { minLength: 8, maxLength: 100 }

// SignupPage.tsx
minLength: { value: 8, message: "Password must be at least 8 characters." }
```

---

### A-06 — bcrypt Cost Factor 10 — Below Current Recommendation
**Severity:** Low  
**CWE:** CWE-916 (Use of Password Hash with Insufficient Computational Effort)  
**File:** `backend/src/controllers/auth.controller.ts:47`

**Evidence**
```typescript
const hashedPassword = await bcrypt.hash(password, 10);
```

Cost factor 10 means ~2^10 = 1024 iterations. This was the standard recommendation circa 2012. The 2024 recommendation for bcrypt is cost 12 (4× more work per attempt). On modern consumer hardware, cost 10 allows ~30,000 attempts/second with GPU cracking; cost 12 reduces that to ~7,500.

**Remediation**
```typescript
const hashedPassword = await bcrypt.hash(password, 12);
```
Existing hashes remain valid — bcrypt stores the cost factor in the hash string, so `bcrypt.compare` handles mixed-cost hashes correctly. Only new registrations get cost 12.

---

### A-07 — JWT Payload Missing Standard Claims (iss, aud, sub, jti)
**Severity:** Low  
**CWE:** CWE-345 (Insufficient Verification of Data Authenticity)  
**File:** `backend/src/controllers/auth.controller.ts:95-98`, `backend/src/middleware/auth.middleware.ts:25-27`

**Evidence**
```typescript
// Issued with only:
const token = jsonwebtoken.sign({ id: existingUser.id }, secret, {
  expiresIn: "7d",
});

// Verified with only:
jwt.verify(token, secret, { algorithms: ["HS256"] });
// No issuer, audience, or subject check
```

`iss` (issuer), `aud` (audience), and `sub` (subject) are not set or verified. `jti` (JWT ID) is absent — there is no per-token identifier, making server-side revocation impossible.

**Why it matters**  
For a single-service app, `iss`/`aud` provide defense-in-depth against token reuse from another service. `jti` is the prerequisite for implementing a token blacklist — which is the only way to support immediate session invalidation (e.g., after a password change, suspicious login, or explicit "sign out all devices").

**Remediation**
```typescript
// auth.controller.ts — when issuing
import { randomUUID } from "crypto";

const token = jsonwebtoken.sign(
  { sub: existingUser.id, jti: randomUUID() },
  secret,
  { expiresIn: "1d", issuer: "trading-journal", audience: "trading-journal-app" },
);

// auth.middleware.ts — when verifying
jwt.verify(token, secret, {
  algorithms: ["HS256"],
  issuer: "trading-journal",
  audience: "trading-journal-app",
});
```

Full revocation would additionally require storing issued `jti` values in a cache (Redis or MongoDB TTL collection) and checking them in the middleware.

---

### A-08 — No Input Body Size Limit on `/api/auth` Routes
**Severity:** Low  
**CWE:** CWE-400 (Uncontrolled Resource Consumption)  
**File:** `backend/src/app.ts:28`

**Evidence**
```typescript
app.use(express.json());  // default limit is 100kb
```

The default `express.json()` limit is 100kb. While large in practice for auth payloads (email + password are never more than ~200 bytes), this applies globally — including the auth routes — and does not enforce a tight limit at the auth boundary where request bodies have a well-known, tiny maximum size.

**Remediation**
```typescript
app.use(express.json({ limit: "10kb" }));  // tight global cap
```

This does not prevent the attack, but makes it more expensive and reduces memory pressure from oversized JSON payloads.

---

### A-09 — Rate Limit Shared Across Signup, Login, and Logout
**Severity:** Low  
**File:** `backend/src/app.ts:36`

**Evidence**
```typescript
app.use("/api/auth", authLimiter, authRoutes);  // 20 req / 15min shared
```

The 20-request window is shared across `POST /api/auth/login`, `POST /api/auth/signup`, and `POST /api/auth/logout`. A legitimate user who logs in and out several times (e.g., switching between devices) may exhaust their own limit and find themselves blocked from logging in.

**Remediation**
```typescript
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
const signupLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10 });

router.post("/login", loginLimiter, login);
router.post("/signup", signupLimiter, signUp);
router.post("/logout", logout);   // no rate limit needed
```

---

## Checklist

| # | Check | Status | Finding |
|---|---|---|---|
| 1 | bcrypt async, salt rounds ≥ 10, no double-hash | **PASS (partial)** | Cost 10 used → A-06 |
| 2 | JWT secret loaded from env, not hardcoded | **PASS** | — |
| 3 | JWT secret entropy documented/enforced | **Unverified** | S-06 from secrets audit |
| 4 | Access token TTL 5–15 min | **FAIL** | 7-day token → A-01 |
| 5 | Refresh token with rotation and reuse detection | **N/A** | No refresh system; single-token design |
| 6 | Session invalidation on password change | **N/A** | No password change/reset feature |
| 7 | `jwt.verify()` with explicit `algorithms` | **PASS** | `algorithms: ["HS256"]` |
| 8 | `iss`, `aud`, `sub`, `jti` set and verified | **FAIL** | Only `id` claim → A-07 |
| 9 | Rate limit on login/signup endpoints | **PASS (partial)** | Shared limiter → A-09 |
| 10 | Per-username rate limiting or CAPTCHA | **FAIL** | Per-IP only |
| 11 | Generic errors for "user not found" vs "bad password" | **PASS** | Same message, same status |
| 12 | Timing-safe login path | **FAIL** | Timing oracle → A-02 |
| 13 | Password reset via `crypto.randomBytes`, hashed, TTL | **N/A** | No password reset feature |
| 14 | Email verification | **FAIL** | No verification → no feature |
| 15 | NoSQL injection sanitization (`sanitizeFilter`) | **FAIL** | Not configured → A-04 |
| 16 | Mongoose query operators stripped from user input | **FAIL** | No type guards → A-04 |
| 17 | Roles/permissions loaded server-side, deny-by-default | **PASS** | userId from JWT, ownership enforced |
| 18 | Cookie: `HttpOnly` | **PASS** | — |
| 19 | Cookie: `Secure` (in production) | **PASS (conditional)** | Requires `NODE_ENV=production` (S-07) |
| 20 | Cookie: `SameSite=Lax` | **PASS** | — |
| 21 | Cookie: narrow `path`/`domain` | **Pass** | Defaults are fine for single-domain |
| 22 | CSRF protection | **PASS** | SameSite=lax + explicit CORS origin allowlist |
| 23 | Email normalization before query | **FAIL** | Case-sensitive mismatch → A-03 |
| 24 | Password minimum ≥ 8 characters | **FAIL** | 6-character minimum → A-05 |
| 25 | Mass assignment protection in auth handlers | **PASS** | Explicit destructuring throughout |
| 26 | `jwt.verify()` used for authz (not `jwt.decode()`) | **PASS** | — |
| 27 | No passwords/tokens in logs | **PASS** | `handleError.ts` logs error, not input |
| 28 | `jsonwebtoken` and `bcrypt` on maintained versions | **PASS** | `jsonwebtoken@9.0.3`, `bcrypt@6.0.0` |
| 29 | No custom JWT parser | **PASS** | Standard `jsonwebtoken` library |
| 30 | CORS locked to trusted origins (no wildcard) | **PASS** | `allowedOrigins` from env |
| 31 | Helmet security headers | **PASS** | `app.use(helmet())` |
| 32 | Post-login redirect uses hardcoded path | **PASS** | `navigate("/dashboard")` — no `next=` param |
| 33 | Request body size limit | **FAIL (minor)** | Default 100kb, no auth-specific limit → A-08 |

---

## Hardening Suggestions (Non-Finding)

**Switch to RS256 with asymmetric keys**  
HS256 requires sharing `JWT_SECRET` with any service that needs to verify tokens. RS256 lets you publish the public key — useful if this app ever exposes a public API or third-party integrations. Node `crypto.generateKeyPairSync('rsa', { modulusLength: 2048 })` + `jsonwebtoken` supports it natively.

**`mongoose.set('sanitizeFilter', true)` and `mongoose.set('strict', true)`**  
`strict: true` is already the Mongoose default (extra fields on save are silently dropped), but enabling `sanitizeFilter` at startup closes the operator-injection surface on all query paths, not just auth.

**Add device/session management**  
Pair `jti` (A-07) with a `sessions` collection: `{ userId, jti, userAgent, ip, createdAt, expiresAt }`. This enables "sign out all devices" and per-session revocation visible in a UI.

**Quick validation tests**

```bash
# A-04: NoSQL injection in signup (should return 400, not 500)
curl -s -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":{"$gt":""},"email":{"$gt":""},"password":"test"}'

# A-03: Case-sensitive email login (should succeed, currently fails)
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"YOUR_REGISTERED_EMAIL_IN_CAPS","password":"your_password"}'

# A-02: Timing oracle — compare response times
time curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"real@user.com","password":"wrong"}'

time curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nobody@fake.com","password":"wrong"}'
```
