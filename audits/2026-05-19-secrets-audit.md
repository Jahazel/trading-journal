# Secrets Management Audit — Trading Journal
**Date:** 2026-05-19  
**Scope:** Full codebase — secret storage, rotation posture, env var hygiene, key management  
**Auditor:** Claude Code (claude-sonnet-4-6)  
**Codebase state:** Post security-fix commit `85a1a8a`  
**Overall Risk Score:** 4.5 / 10

---

## Executive Summary

No hardcoded secret values exist in source code or git history across all 115 commits. Both `.env` files are correctly excluded from git. S-04 (JWT algorithm constraint) was resolved in commit `85a1a8a`. The remaining risk is operational: real production credentials live in an unencrypted plaintext file with no access controls, no startup validation, no pre-commit scanning gate, and no rotation runbook. A new consequence of the cookie-based auth migration is that `NODE_ENV` being unset now also makes auth cookies non-`secure` in any deployment that doesn't explicitly set it.

---

## Top 5 Prioritized Fixes

1. **Add a `pre-commit` hook with `gitleaks`** — prevents future accidental commits of secrets (15 min)
2. **Set `NODE_ENV=production` in the deployment environment** — now also gates cookie `secure` flag (S-01 and S-07 interact)
3. **Add startup validation for all required env vars** — fail fast with a clear message instead of cryptic SDK errors
4. **Rotate credentials** — if `backend/.env` has ever been visible to anyone else, rotate MongoDB, Cloudinary, and JWT secret now
5. **Restore `backend/.env.example`** — re-document the required surface so no secret is silently omitted on a new deploy

---

## Findings

---

### S-01 — Plaintext Credentials in Local `.env` (No Encryption at Rest)
**Severity:** High  
**CWE:** CWE-312 (Cleartext Storage of Sensitive Information)  
**File:** `backend/.env:1-6`

**Evidence**  
`backend/.env` contains live credentials for three external services in plaintext: a MongoDB Atlas connection string (embedded username + password), a 30-byte JWT signing secret, and Cloudinary API key + secret. Standard Unix permissions are the only protection.

```
# Fields present — values redacted:
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/...
PORT=3000
JWT_SECRET=<30-char alphanum>
CLOUDINARY_CLOUD_NAME=<name>
CLOUDINARY_API_KEY=<numeric>
CLOUDINARY_API_SECRET=<secret>
```

**New interaction with S-07:** The `COOKIE_OPTIONS` object in `auth.controller.ts:10` sets `secure: process.env.NODE_ENV === "production"`. Without `NODE_ENV=production`, auth cookies are served without the `Secure` flag even on an HTTPS deployment — making them transmittable over plain HTTP.

**Git status:** Confirmed clean — `git check-ignore` verifies both `.env` files are excluded by the root `.gitignore` pattern `.env`. Pickaxe search against the actual credential strings found zero matches across all 115 commits.

**Exploitability:** Not remotely exploitable via git. Risk is local (shared machine, screen recording, unencrypted backup) or supply-chain (malicious npm package reading the file directly from `process.env` or the filesystem).

**Remediation**

Short-term (no tooling):
```bash
chmod 600 backend/.env
```

Production (no `.env` files):
- **Railway / Render / Fly.io** — inject secrets through the platform's environment variable UI; never deploy a `.env` file.
- **Local dev** — replace `.env` with [Doppler](https://www.doppler.com/) or `op run --env-file` (1Password CLI) so secrets never touch disk in plaintext.

---

### S-02 — No Pre-commit Secret Scanning Hook
**Severity:** High  
**CWE:** CWE-522 (Insufficiently Protected Credentials)  
**File:** `.git/hooks/` (all hooks are `.sample` — none active)

**Evidence**
```bash
$ ls .git/hooks/
applypatch-msg.sample  pre-commit.sample  ...  # no active hooks
```
Nothing prevents a secret value from being committed if it is pasted inline into a source file. The `.gitignore` guards against committing the `.env` files themselves but not against a credential appearing inside a `.ts` or `.json` file.

**Why it matters**  
A credential pasted inline to test something locally — then forgotten — is the most common real-world secret-leak vector. There is currently zero tooling to catch it before it hits the remote.

**Remediation**
```bash
brew install gitleaks

# .git/hooks/pre-commit
#!/bin/sh
gitleaks protect --staged --redact --exit-code 1
```
```bash
chmod +x .git/hooks/pre-commit
```
Add a `.gitleaks.toml` to the repo root if any false positives need suppressing.

---

### S-03 — No Startup Validation of Required Environment Variables
**Severity:** Medium  
**CWE:** CWE-391 (Unchecked Error Condition)  
**Files:** `backend/src/config/database.ts:2`, `backend/src/config/cloudinary.ts:4-6`, `backend/src/index.ts`

**Evidence**
```typescript
// database.ts:2 — TypeScript cast, no runtime check
const connectionString = process.env.MONGO_URI as string;

// cloudinary.ts:4-6 — non-null assertions silence TypeScript; undefined passes to SDK
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});
```
`JWT_SECRET` has a guard in `auth.middleware.ts` (returns 500 and logs `FATAL:` if missing). The MongoDB and Cloudinary variables have no equivalent — they fail at the point of first use with SDK-specific errors that don't identify the misconfiguration.

**Why it matters**  
A deploy with a misnamed env var (e.g., `MONGO_URL` instead of `MONGO_URI`) starts the server silently. The first DB-touching request crashes with a Mongoose connection error rather than a clear startup message. Diagnosis time increases.

**Remediation**
```typescript
// backend/src/index.ts — add before startServer()
const REQUIRED_ENV_VARS = [
  "MONGO_URI",
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    console.error(`FATAL: Missing required env vars: ${missing.join(", ")}`);
    process.exit(1);
  }
}

validateEnv();
startServer();
```

---

### S-04 — JWT Algorithm Not Constrained in `verify()` ✅ FIXED
**Severity:** Medium → Resolved  
**Fixed in:** commit `85a1a8a`  
**File:** `backend/src/middleware/auth.middleware.ts:24-26`

```typescript
// Current state — correctly pinned:
const decoded = jwt.verify(token, secret, {
  algorithms: ["HS256"],
}) as unknown as JwtPayload;
```
Algorithm-confusion window is closed. No further action required.

---

### S-05 — `backend/.env.example` Removed from Repository
**Severity:** Medium  
**CWE:** CWE-1188 (Insecure Default Initialization)  
**Git evidence:** Added in `ffcb2e9` (2026-03-10), deleted in `abcc3cc` (2026-04-23)

**Evidence**  
The file was deleted as an incidental side-effect of a feature commit. No `.env.example` exists at any path in the working tree. With no startup validation (S-03) and no example file, a second deployment environment has no machine-readable record of which secrets are required.

**Current required surface (as of `85a1a8a`):**

| Variable | Used by |
|---|---|
| `MONGO_URI` | `config/database.ts` |
| `PORT` | `index.ts` |
| `NODE_ENV` | `utils/handleError.ts`, `controllers/auth.controller.ts` |
| `JWT_SECRET` | `controllers/auth.controller.ts`, `middleware/auth.middleware.ts` |
| `CLOUDINARY_CLOUD_NAME` | `config/cloudinary.ts` |
| `CLOUDINARY_API_KEY` | `config/cloudinary.ts` |
| `CLOUDINARY_API_SECRET` | `config/cloudinary.ts` |
| `FRONTEND_URL` | `app.ts` (defaults to `http://localhost:5173`) |

**Remediation**
```bash
# backend/.env.example  (commit this file)
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<database>
PORT=3000
NODE_ENV=development
JWT_SECRET=<generate: openssl rand -base64 48>
CLOUDINARY_CLOUD_NAME=<your cloud name>
CLOUDINARY_API_KEY=<your api key>
CLOUDINARY_API_SECRET=<your api secret>
FRONTEND_URL=http://localhost:5173
```

---

### S-06 — JWT Secret Entropy Below Recommended Floor
**Severity:** Low  
**CWE:** CWE-331 (Insufficient Entropy)  
**File:** `backend/.env:3`

**Evidence**  
Current `JWT_SECRET` is 30 characters of mixed-case alphanumeric (`[A-Za-z0-9]`). Theoretical entropy: `log₂(62³⁰) ≈ 178 bits`. This meets the mathematical floor for HS256 (≥256-bit key) only if generated by a CSPRNG. The generation method is undocumented. If typed by hand or copied from a tutorial, effective entropy is far lower.

**NIST SP 800-131A / RFC 7518:** HS256 keys should be ≥ 32 bytes of cryptographically random material.

**Remediation**
```bash
# Generate a compliant secret (48 bytes = 384-bit entropy, base64url-encoded):
openssl rand -base64 48
# or:
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```
Replace `JWT_SECRET` in `.env` and all deployment environments. All active sessions will be invalidated.

---

### S-07 — `NODE_ENV` Not Set — Error Leak + Non-Secure Cookies
**Severity:** Medium  
**CWE:** CWE-215 (Insertion of Sensitive Information Into Debugging Code)  
**Files:** `backend/.env`, `backend/src/utils/handleError.ts:7`, `backend/src/controllers/auth.controller.ts:10`

**Evidence**
```typescript
// handleError.ts:7 — full errors returned when NODE_ENV !== "production"
const message =
  process.env.NODE_ENV === "production"
    ? "Internal server error."
    : error instanceof Error ? error.message : "An unknown error occurred.";

// auth.controller.ts:10 — cookie Secure flag gated on NODE_ENV
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",  // false if NODE_ENV unset
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
```
`backend/.env` has no `NODE_ENV` entry. Any deployment sourcing this file as-is gets both: full internal error messages in API responses, and auth cookies without the `Secure` flag (transmittable over HTTP, even on an HTTPS host).

**Remediation**
```bash
# backend/.env — add for local development:
NODE_ENV=development

# Production deployment environment variables — set:
NODE_ENV=production
```

---

### S-08 — No Secret Rotation Runbook
**Severity:** Low  
**CWE:** CWE-324 (Use of a Key Past its Expiration Date)  
**Files:** N/A — operational gap

**Evidence**  
No documented rotation procedure exists. The app has three rotatable secret surfaces with different rotation impacts:

| Secret | Rotation location | Session impact | Steps |
|---|---|---|---|
| `MONGO_URI` password | MongoDB Atlas → Database Access | None if atomic | Create new DB user → update all envs → verify → delete old user |
| Cloudinary API key/secret | Cloudinary Console → Access Keys | None | Generate new key → update envs → verify → delete old key |
| `JWT_SECRET` | Generate locally | **All sessions invalidated** — users re-login | Generate new value → deploy → monitor |

**Remediation**  
Document this table in the project README or wiki. Run a rotation drill for at least one secret to verify the process works end-to-end before it is needed under pressure.

---

## Checklist

| Category | Item | Status |
|---|---|---|
| Hardcoded secrets | API keys in source code | PASS |
| Hardcoded secrets | Database passwords in source | PASS |
| Hardcoded secrets | JWT secret in source | PASS |
| Hardcoded secrets | Secrets in git history (115 commits verified) | PASS |
| Env var usage | All secrets loaded from `process.env` | PASS |
| Env var usage | `.env` excluded from git | PASS |
| Env var usage | Startup validation of all required vars | FAIL → S-03 |
| Env var usage | `.env.example` documents required vars | FAIL → S-05 |
| Env var usage | `NODE_ENV` set explicitly | FAIL → S-07 |
| Env var usage | Frontend `.env` contains no backend secrets | PASS — only `VITE_API_URL=/api` |
| Secret scanning | Pre-commit hook scans staged files | FAIL → S-02 |
| Secret scanning | CI pipeline scans on push | Unable to verify — no CI config found |
| Rotation | MongoDB password rotation documented | FAIL → S-08 |
| Rotation | API key rotation documented | FAIL → S-08 |
| Rotation | JWT secret rotation documented | FAIL → S-08 |
| Key management | Passwords hashed (bcrypt, cost 10) | PASS |
| Key management | bcrypt salt auto-generated per password | PASS |
| Key management | JWT algorithm pinned to HS256 in `verify()` | PASS ✅ fixed in `85a1a8a` |
| Key management | JWT secret entropy ≥ 256 bits (CSPRNG) | UNVERIFIED → S-06 |
| Key management | Cloudinary vars validated at startup | FAIL → S-03 |
| Key management | Auth cookie has `Secure` flag in production | FAIL (requires NODE_ENV) → S-07 |
| Key management | Auth cookie is `httpOnly` | PASS ✅ fixed in `85a1a8a` |
| Key management | Credential files encrypted at rest | FAIL → S-01 |
