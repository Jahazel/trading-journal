# Session and Cookie Security Review — Trading Journal
**Date:** 2026-05-19  
**Scope:** Session management, cookie configuration, CSRF posture, session storage architecture  
**Auditor:** Claude Code (claude-sonnet-4-6)  
**Codebase state:** Post auth-review commit `008b30d`  
**Overall Risk Score:** 2.5 / 10

---

## Executive Summary

The session and cookie architecture is in good shape. The app uses stateless JWT tokens delivered exclusively via httpOnly cookies — there is no server-side session store, no in-memory store risk, and no session fixation surface. `SameSite=lax` combined with a strict CORS origin allowlist provides effective CSRF protection without a dedicated token mechanism. Helmet sets the standard security response headers.

The remaining risks are narrow: the `Secure` flag is conditional on `NODE_ENV` (a pre-existing gap from S-07), `SameSite=lax` could be tightened to `strict` without breaking anything, and the CORS config doesn't restrict to the specific HTTP methods the API uses. None of these represent an active exploit path under normal deployment.

---

## Top 3 Prioritized Fixes

1. **Set `NODE_ENV=production` in the deployment environment** — closes the conditional `Secure` flag gap; the fix is a hosting platform config change, not a code change (pre-existing S-07, restated here)
2. **Change `SameSite` from `"lax"` to `"strict"`** — no user-visible impact for this app; closes the top-level navigation cookie-sending window (SC-02)
3. **Add `methods` to the CORS config** — whitelists only the verbs the API actually uses; defense-in-depth against unexpected method abuse (SC-03)

---

## Findings

---

### SC-01 — `Secure` Flag Conditional on `NODE_ENV`
**Severity:** Medium  
**CWE:** CWE-614 (Sensitive Cookie in HTTPS Session Without Secure Attribute)  
**File:** `backend/src/controllers/auth.controller.ts:15`  
**Previously identified as:** S-07 in `2026-05-19-secrets-audit.md`

**Evidence**
```typescript
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",  // false when NODE_ENV is unset
  sameSite: "lax" as const,
  maxAge: 24 * 60 * 60 * 1000,
};
```

`backend/.env` does not set `NODE_ENV`. A deployment that sources this file without overriding `NODE_ENV` at the platform level will serve auth cookies without the `Secure` flag — meaning the browser will transmit them over plain HTTP, even on a host that has TLS configured.

**Exploitability**  
Requires the cookie to travel over HTTP (MITM on the same network, or the server accepting both HTTP and HTTPS). The `Secure` flag is the last line of defense against this. On a Render/Fly/Railway deploy where HTTPS is terminated by the platform, the cookie is safe in transit even without the flag — but the flag is what tells the browser not to send it over HTTP at all.

**Remediation**  
No code change needed. Set the environment variable in the deployment platform's config UI:
```
NODE_ENV=production
```
This also gates `handleError.ts:7` (error detail leak) and any future conditional behavior.

---

### SC-02 — `SameSite=lax` Instead of `strict`
**Severity:** Low  
**CWE:** CWE-352 (Cross-Site Request Forgery)  
**File:** `backend/src/controllers/auth.controller.ts:16`

**Evidence**
```typescript
sameSite: "lax" as const,
```

`SameSite=lax` sends the auth cookie on **top-level navigations** using safe HTTP methods (clicking a link that navigates to the app). `SameSite=strict` would withhold the cookie on all cross-site requests — including those top-level navigations — until the user makes a same-site request.

**Why it matters**  
For most browsers, `lax` provides sufficient CSRF protection for state-changing requests (POST/PATCH/DELETE) because the cookie is withheld on cross-site subresource requests. The residual risk of `lax` is narrow: a cross-site link that triggers a GET endpoint and that GET endpoint has a side effect. This API has no side-effecting GET endpoints, so the practical difference is zero today. `strict` is a no-cost hardening win.

**Impact on user experience:** None — the app is a standalone SPA; users always navigate to it directly, not via cross-site links that expect a logged-in session.

**Remediation**
```typescript
// auth.controller.ts:16
sameSite: "strict" as const,
```

---

### SC-03 — CORS Config Does Not Restrict Allowed Methods
**Severity:** Low  
**File:** `backend/src/app.ts:30-35`

**Evidence**
```typescript
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    // no `methods` key — defaults to GET, HEAD, PUT, PATCH, POST, DELETE
  }),
);
```

The cors package's default `methods` value is `GET,HEAD,PUT,PATCH,POST,DELETE`. The API uses GET, POST, PATCH, and DELETE — PUT is not used anywhere. More importantly, the absence of an explicit allowlist means any future method (e.g., OPTIONS pre-flight misconfiguration, or a mistakenly added route) is allowed without a config change.

**Why it matters**  
Not an active exploit path — CORS is a browser-enforcement mechanism and the origin allowlist already blocks cross-origin credential requests. This is a defense-in-depth gap: an explicit methods list is a declaration of intent and ensures the CORS policy doesn't silently expand.

**Remediation**
```typescript
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
  }),
);
```

---

### SC-04 — No Explicit `path` Scope on the Auth Cookie
**Severity:** Low (Informational)  
**File:** `backend/src/controllers/auth.controller.ts:13-18`

**Evidence**
```typescript
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 24 * 60 * 60 * 1000,
  // no `path` — defaults to "/"
};
```

Without an explicit `path`, the browser sends the auth cookie on every request to the domain — including requests to paths that don't require authentication (static assets, health checks, future public endpoints).

**Why it matters for this app:** All routes are either public auth routes (`/api/auth/*`) or protected API routes behind `authMiddleware`. There are no static file routes on the Express server. The cookie being sent to `/api/auth/login` is harmless; the middleware reads it from `req.cookies.token` only when present, and the auth routes don't use it.

**If a public route is ever added** (e.g., `/api/health`, `/api/public/*`), the cookie will be sent to those routes unnecessarily, slightly expanding the surface for cookie theft.

**Remediation (optional hardening)**
```typescript
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 24 * 60 * 60 * 1000,
  path: "/api",  // restrict to API paths only
};
```
Note: `clearCookie` in `logout` must use the same `path` value, or the browser won't delete the cookie. Since `COOKIE_OPTIONS` is shared between `res.cookie` and `res.clearCookie`, this is already handled correctly by the existing code.

---

### SC-05 — No CSRF Token Mechanism
**Severity:** Low  
**CWE:** CWE-352 (Cross-Site Request Forgery)  
**Files:** `backend/src/app.ts`, `backend/src/routes/`

**Evidence**  
No CSRF token is generated, stored, or validated anywhere in the codebase. There is no double-submit cookie, no `X-CSRF-Token` header check, and no `csurf`/`csrf-csrf` middleware.

**Why this is Low and not Higher**  
CSRF requires the browser to send the auth cookie on a cross-site request. Three independent controls prevent this:

1. `SameSite=lax` — browser withholds the cookie on cross-site POST/PATCH/DELETE subresource requests
2. CORS `origin: allowedOrigins` — browser blocks cross-origin credentialed requests if the response doesn't echo back the request origin
3. All state-changing requests require `Content-Type: application/json` — HTML form CSRF attacks (which can only submit `application/x-www-form-urlencoded` or `multipart/form-data`) fail at the `express.json()` parsing step

The combination makes CSRF exploitation impractical in supported browsers. Older browsers without `SameSite` support are the residual risk.

**Remediation (if defense-in-depth is required)**
```typescript
// npm install csrf-csrf
import { doubleCsrf } from "csrf-csrf";

const { generateToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET!,
  cookieName: "__Host-csrf",
  cookieOptions: { sameSite: "strict", secure: true, httpOnly: true },
});

// Add GET /api/auth/csrf-token endpoint to issue token
// Apply doubleCsrfProtection middleware to all state-changing routes
```

For a personal single-user app, the existing mitigations are sufficient. Add a CSRF token if the app ever becomes multi-tenant or public-facing.

---

## Checklist

| Category | Check | Status | Notes |
|---|---|---|---|
| **Session config** | `Secure` flag on auth cookie | **FAIL** | Conditional on `NODE_ENV` → SC-01 / S-07 |
| **Session config** | `HttpOnly` flag on auth cookie | **PASS** | `httpOnly: true` |
| **Session config** | `SameSite` attribute set | **PASS (partial)** | `lax` present; `strict` preferred → SC-02 |
| **Session config** | Session timeout enforced | **PASS** | 1-day TTL on JWT + cookie `maxAge` |
| **Session config** | Session regeneration after login | **N/A** | Stateless JWT; new token issued on every login |
| **Cookie security** | No sensitive data in cookie payload | **PASS** | JWT contains only `{ id, iat, exp }` |
| **Cookie security** | All cookies have appropriate flags | **PASS (partial)** | `Secure` conditional; `HttpOnly` + `SameSite` ✅ |
| **Cookie security** | Explicit `path`/`domain` scoping | **FAIL (low)** | No `path` set; defaults to `/` → SC-04 |
| **Cookie security** | Sensitive cookies encrypted | **N/A** | JWT is signed (HMAC-SHA256), not encrypted; payload is non-sensitive |
| **Cookie security** | No other cookies set | **PASS** | Only `token` cookie exists in the codebase |
| **CSRF** | CSRF token mechanism | **FAIL (mitigated)** | No token; mitigated by SameSite + CORS → SC-05 |
| **CSRF** | Double-submit cookie pattern | **N/A** | Not implemented; not required given SameSite + CORS |
| **CSRF** | Origin header validation | **PASS** | CORS `origin: allowedOrigins` — no wildcard |
| **CORS** | Methods explicitly whitelisted | **FAIL (low)** | Default method list used → SC-03 |
| **CORS** | `credentials: true` without wildcard origin | **PASS** | Explicit allowlist, not `*` |
| **Session storage** | No default in-memory session store | **PASS** | `express-session` is not used at all |
| **Session storage** | Stateless/cookie-only session architecture | **PASS** | Pure JWT; no server-side session state |
| **Session storage** | Session expiration enforced | **PASS** | JWT `exp` + `maxAge` both set to 1 day |
| **Session storage** | Server-side session invalidation | **FAIL** | Stateless JWT cannot be revoked before expiry; noted as A-01 |
