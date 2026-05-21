# Deepen Queue

Architectural flags queued by `/cleanup` passes. Review with `/deepen`.

---

## 2026-05-21 — feat/issue-9-account-scoped-stats

**File:** `frontend/src/components/StatsDashboard.tsx:110–125`
**Problem type:** Low locality
**Description:** Query cache keys for the stats and trades queries (`["stats", effectiveAccountId]`, `["trades", effectiveAccountId]`) are defined inline in the component. Any code that needs to invalidate these keys (e.g., after a trade mutation) must know the key shape, coupling callers to implementation details. Consider colocating key factories with the API functions in `api.ts` or a dedicated query-keys file.
