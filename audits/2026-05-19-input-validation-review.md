# Input Validation Review — Trading Journal
**Date:** 2026-05-19  
**Scope:** All backend controllers, middleware, models, and frontend form validation  
**Auditor:** Claude Code (claude-sonnet-4-6)  
**Codebase state:** Post authz-review commit `404d358`  
**Overall Risk Score:** 3 / 10

---

## Executive Summary

The most significant gap is that HTML produced by the Tiptap rich text editor is stored in MongoDB without any server-side sanitization. For a personal single-user app, the practical exploitability is zero — a user can only XSS themselves — but the pattern means any future rendering of that content outside the Tiptap context would be a stored XSS vector. Everything else is low severity: Mongoose validation errors return 500 instead of 400 (leaking error detail in development), and a few fields lack server-side length limits.

No SQL injection surface exists (MongoDB). NoSQL injection is addressed by `sanitizeFilter: true` and `typeof` input guards added in a prior commit. No command injection, XXE, or path traversal surfaces exist anywhere in the codebase.

---

## Top 3 Prioritized Fixes

1. **Add server-side HTML sanitization for the `notes` field** — strip unknown tags and event handlers before persisting to MongoDB (IV-01)
2. **Handle Mongoose `ValidationError` as 400 not 500** — in `handleError.ts`, catch `ValidationError` specifically and return the validation message as a 400 (IV-02)
3. **Add `maxLength` to `accountName` in the Mongoose schema** — closes an unbounded string write on an authenticated endpoint (IV-03)

---

## Findings

---

### IV-01 — Rich Text HTML Stored Without Server-Side Sanitization
**Severity:** Medium  
**CWE:** CWE-79 (Improper Neutralization of Input During Web Page Generation — Stored XSS)  
**Files:** `backend/src/controllers/tradeEntry.controller.ts:115-132`, `backend/src/controllers/noTradeEntry.controller.ts:81-88`, `frontend/src/components/TextEditor.tsx:19-21`

**Evidence**
```typescript
// TextEditor.tsx:19-21 — editor outputs raw HTML
onBlur({ editor }) {
  if (onSave) onSave(editor.getHTML(), "notes");  // returns "<p>text</p>" etc.
},
onUpdate({ editor }) {
  if (onChange) onChange(editor.getHTML());
},

// tradeEntry.controller.ts:115-132 — notes stored directly from req.body, no sanitization
const newTradeEntry = new TradeEntry({
  userId,
  accountId,
  ...
  notes,          // raw HTML string, no sanitization
  images: images ?? [],
});
```

The Tiptap editor serializes its content as HTML (`editor.getHTML()`) and the backend persists it as-is. When the detail views load, this HTML is passed back to a new Tiptap instance via `content={notes}`, where ProseMirror's schema-based parser filters out nodes/marks not in the StarterKit schema (no `<script>`, `<img>`, `<iframe>` — these are stripped client-side).

**Why the client-side filtering is not sufficient**  
ProseMirror's schema filtering is a browser-side rendering defense, not a data integrity guarantee. The `notes` field in MongoDB contains raw HTML. Any future code path that renders it differently — `dangerouslySetInnerHTML`, an email notification, a PDF export, a server-side render — would be exposed to the stored payload without any protection. Additionally, the API endpoint accepts `notes` as any string; a request crafted to bypass the frontend can store arbitrary HTML:

```bash
# PoC: store XSS payload via direct API call (bypasses Tiptap schema)
curl -X POST http://localhost:3000/api/trades-entry \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<valid_token>" \
  -d '{"notes":"<img src=x onerror=alert(1)>","accountId":"...","result":"Win",...}'
```

When this entry is loaded and the `notes` value is rendered by `<TextEditor content={notes} />`, ProseMirror will strip the `<img>` (not in StarterKit schema). But if it were ever passed to `dangerouslySetInnerHTML` — a common pattern in React — it would execute.

**Remediation**

Add server-side sanitization before persisting. The lightest-weight approach is the `sanitize-html` package with a tight allowlist matching the StarterKit schema:

```bash
npm install sanitize-html
npm install --save-dev @types/sanitize-html
```

```typescript
// backend/src/utils/sanitizeHtml.ts
import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "s", "code", "pre",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "blockquote", "hr",
];

export function sanitizeNotes(html: string | undefined): string | undefined {
  if (html === undefined) return undefined;
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {},   // no attributes allowed — strips class, style, event handlers
    disallowedTagsMode: "discard",
  });
}
```

```typescript
// tradeEntry.controller.ts — in createTradeEntry and updateTradeEntry
import { sanitizeNotes } from "../utils/sanitizeHtml.js";

const newTradeEntry = new TradeEntry({
  ...
  notes: sanitizeNotes(notes),
  ...
});
```

Apply the same to `noTradeEntry.controller.ts`.

---

### IV-02 — Mongoose `ValidationError` Returns 500 Instead of 400
**Severity:** Low  
**CWE:** CWE-209 (Generation of Error Message Containing Sensitive Information)  
**File:** `backend/src/utils/handleError.ts:1-14`

**Evidence**
```typescript
// handleError.ts:3-14 — no distinction between client errors and server errors
export function handleServerError(res: Response<any>, error: unknown) {
  console.error(error);

  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error."
      : error instanceof Error
        ? error.message     // ← returns full Mongoose ValidationError in development
        : "An unknown error occurred.";

  return res.status(500).json({ message });
}
```

When a request sends an invalid enum value (e.g., `result: "Winning"`), Mongoose throws a `ValidationError`. This is caught by `handleServerError` and returned as a 500. In development (`NODE_ENV !== "production"`), the full error message is returned:

```
ValidationError: Trade validation failed: result: `Winning` is not a valid enum value for path `result`.
```

This leaks the internal model name (`Trade`), the field name (`result`), and the invalid value. In production it returns "Internal server error." with a 500 — which is technically accurate but misleading for a client-caused error.

**Why it matters**  
500 tells clients "the server broke" rather than "your request was invalid." This makes client-side error handling harder and leaks model internals in development.

**Minimal PoC**
```bash
# Invalid enum value — should return 400, returns 500
curl -X POST http://localhost:3000/api/trades-entry \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<valid_token>" \
  -d '{"result":"Winning","accountId":"...","contract":"NQ",...}'
# → 500: "Trade validation failed: result: `Winning` is not a valid enum value..."
```

**Remediation**

Detect Mongoose `ValidationError` in `handleServerError` and return 400:

```typescript
// backend/src/utils/handleError.ts
import mongoose from "mongoose";
import type { Response } from "express";

export function handleServerError(res: Response<any>, error: unknown) {
  if (error instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(error.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(", ") });
  }

  console.error(error);

  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error."
      : error instanceof Error
        ? error.message
        : "An unknown error occurred.";

  return res.status(500).json({ message });
}
```

This also correctly handles `CastError` (invalid ObjectId) — `CastError` is a subclass of `mongoose.Error` but not `ValidationError`, so it would still return 500. Add a separate `CastError` check if AZ-03 is addressed:

```typescript
if (error instanceof mongoose.Error.CastError) {
  return res.status(400).json({ message: "Invalid ID format." });
}
```

---

### IV-03 — No `maxLength` on `accountName` Field
**Severity:** Low  
**CWE:** CWE-770 (Allocation of Resources Without Limits or Throttling)  
**Files:** `backend/src/models/account.model.ts:6`, `backend/src/controllers/account.controller.ts:70`

**Evidence**
```typescript
// account.model.ts:6 — no maxLength
accountName: { type: String, required: true },

// account.controller.ts:70 — no length check in the handler either
const { accountName, startingBalance, type } = req.body;
if (!accountName || !startingBalance || !type) { ... }
```

An authenticated user can submit an `accountName` of arbitrary length. The `express.json()` 100kb body limit provides an upper bound, but a single field could still be up to ~100kb.

Compare to the User model which correctly bounds `username` to 30 characters and `password` to 100 characters.

**Remediation**
```typescript
// account.model.ts
accountName: { type: String, required: true, trim: true, maxLength: 100 },
```

---

### IV-04 — Upload MIME Type Validated by Client-Supplied Header Only
**Severity:** Low  
**CWE:** CWE-434 (Unrestricted Upload of File with Dangerous Type)  
**File:** `backend/src/middleware/upload.middleware.ts:6-12`

**Evidence**
```typescript
fileFilter: (_req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed."));
  }
},
```

`file.mimetype` is sourced from the `Content-Type` header of the multipart part, which is set by the client. A client can send a JavaScript or HTML file with `Content-Type: image/jpeg` and multer will accept it.

**Why this is Low (not Higher)**  
The file never touches the server's filesystem — multer uses `memoryStorage()` and the bytes go directly to Cloudinary's upload API. Cloudinary validates the actual file content and rejects non-image data at their end. The worst case is a wasted network round trip.

**Defense-in-depth remediation**  
Use the `file-type` package to inspect the file's magic bytes before accepting it:

```bash
npm install file-type
```

```typescript
// upload.controller.ts
import { fileTypeFromBuffer } from "file-type";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function uploadImage(req: Request, res: Response) {
  if (!req.file) return res.status(400).json({ message: "No file provided." });

  const detected = await fileTypeFromBuffer(req.file.buffer);
  if (!detected || !ALLOWED_MIME_TYPES.has(detected.mime)) {
    return res.status(400).json({ message: "Only image files are allowed." });
  }
  // ... rest of upload
}
```

---

### IV-05 — No Server-Side Length Limit on `notes` Field
**Severity:** Low**  
**CWE:** CWE-770 (Allocation of Resources Without Limits or Throttling)  
**Files:** `backend/src/models/tradeEntry.model.ts:42`, `backend/src/models/noTradeEntry.model.ts:13`

**Evidence**
```typescript
// tradeEntry.model.ts:42 — no maxLength
notes: { type: String },

// noTradeEntry.model.ts:13 — same
notes: { type: String },
```

The `notes` field stores HTML from the Tiptap editor. There is no server-side length constraint. An authenticated user can submit arbitrarily large HTML content, bounded only by the 100kb `express.json()` default.

**Remediation**

Add a reasonable max length in the Mongoose schema. Tiptap's typical output for a dense journal entry is well under 64kb:

```typescript
// tradeEntry.model.ts and noTradeEntry.model.ts
notes: { type: String, maxLength: 65536 },   // 64kb — generous for a journal entry
```

---

## Validation Matrix

| Endpoint | Body size limit | Type guards | Enum validation | Length limits | HTML sanitization | Notes |
|---|---|---|---|---|---|---|
| `POST /api/auth/signup` | 100kb (default) | ✅ typeof guards | N/A | username 1–30, password 6–100 | N/A | ✅ |
| `POST /api/auth/login` | 100kb (default) | ✅ typeof guards | N/A | None server-side | N/A | ✅ |
| `POST /api/accounts` | 100kb (default) | ❌ | N/A | ❌ accountName unbounded | N/A | IV-03 |
| `PATCH /api/accounts/:id` | 100kb (default) | ❌ | type enum (Mongoose) | ❌ accountName unbounded | N/A | IV-03 |
| `POST /api/trades-entry` | 100kb (default) | ❌ | result/contract/direction (Mongoose) → 500 | ❌ notes unbounded | ❌ IV-01 | IV-01, IV-02, IV-05 |
| `PATCH /api/trades-entry/:id` | 100kb (default) | ❌ | result/contract/direction (Mongoose) → 500 | ❌ notes unbounded | ❌ IV-01 | IV-01, IV-02, IV-05 |
| `POST /api/no-trade-entries` | 100kb (default) | ❌ | N/A | ❌ notes unbounded | ❌ IV-01 | IV-01, IV-05 |
| `PATCH /api/no-trade-entries/:id` | 100kb (default) | ❌ | N/A | ❌ notes unbounded | ❌ IV-01 | IV-01, IV-05 |
| `POST /api/upload` | 10MB (multer) | ❌ MIME header only | N/A | ✅ 10MB cap | N/A | IV-04 |

---

## Checklist

| # | Check | Status | Notes |
|---|---|---|---|
| **SQL Injection** | Raw SQL queries without parameterization | **N/A** | MongoDB only — no SQL |
| **SQL Injection** | Dynamic query building | **N/A** | — |
| **NoSQL Injection** | Unvalidated query operators (`$where`, `$gt`, etc.) | **PASS** | `mongoose.set('sanitizeFilter', true)` + typeof guards |
| **NoSQL Injection** | JavaScript execution in queries | **PASS** | No `$where` usage; `sanitizeFilter` blocks it |
| **Command Injection** | `child_process`, `exec`, `spawn`, `eval` | **PASS** | None found anywhere in codebase |
| **XSS** | Input sanitization on rich text | **FAIL** | Notes HTML stored unsanitized → IV-01 |
| **XSS** | Output encoding | **PASS** | React escapes all JSX text nodes; Tiptap uses schema filtering |
| **XSS** | `dangerouslySetInnerHTML` usage | **PASS** | Not used anywhere in the frontend |
| **XSS** | `Content-Type` headers on API responses | **PASS** | Express defaults to `application/json`; Helmet adds `X-Content-Type-Options: nosniff` |
| **XXE** | XML parsing configuration | **N/A** | No XML parsing anywhere in the codebase |
| **XXE** | File upload XML handling | **N/A** | Images only; no XML/SVG parsing |
| **Path Traversal** | Filesystem operations with user input | **PASS** | No `fs.*` operations; multer uses `memoryStorage()` |
| **Path Traversal** | Directory listing | **N/A** | No static file serving |
| **Request validation** | Body size limits | **PASS (partial)** | 100kb global default; 10MB on upload; no tighter per-endpoint limit |
| **Request validation** | Parameter pollution | **PASS** | JSON-only API; no URL-encoded form parsing |
| **Request validation** | Type checking on auth inputs | **PASS** | `typeof` guards on login/signup |
| **Request validation** | Type checking on data endpoints | **FAIL (low)** | No `typeof` guards; Mongoose catches type errors but returns 500 → IV-02 |
| **Request validation** | Required field validation | **PASS (partial)** | Mongoose `required: true` on models; errors return 500 not 400 → IV-02 |
| **Request validation** | Enum validation | **PASS (partial)** | Mongoose enforces enums; errors return 500 not 400 → IV-02 |
| **Request validation** | Length limits on all string fields | **FAIL (low)** | `accountName` and `notes` unbounded → IV-03, IV-05 |
| **File upload** | MIME type validation | **PASS (partial)** | Client-supplied header only; Cloudinary provides real validation → IV-04 |
| **File upload** | File size limit | **PASS** | 10MB multer limit |
| **File upload** | No filesystem write from user-controlled path | **PASS** | `memoryStorage()` — no disk writes |
