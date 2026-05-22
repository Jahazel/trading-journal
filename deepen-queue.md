# Deepen Queue

Architectural flags queued by `/cleanup` passes. Review with `/deepen`.

---

## 2026-05-21 — deepen session (feat/query-key-factories)

**Candidate:** #3 — Add error transformation to the API module
**Files:** `frontend/src/api/api.ts`
**Strength:** Worth exploring
**Problem type:** Shallow module
**Description:** 24 functions are direct axios pass-throughs with identical `console.error + re-throw` error handling. Callers still receive raw `AxiosError`; moving error handling to an axios response interceptor would give callers a stable typed interface.

---

**Candidate:** #4 — Extract `useNewEntryForm` hook
**Files:** `frontend/src/components/NewTradeEntry.tsx`, `frontend/src/components/NewNoTradeEntry.tsx`
**Strength:** Worth exploring
**Problem type:** Parallel implementations
**Description:** Form setup, account modal state, cancel confirmation flow, mutation wiring, and the `"__new__"` account sentinel are duplicated across both new-entry components; only the rendered fields differ.

---

**Candidate:** #5 — Extract `getPnl` from the trade entry controller
**Files:** `backend/src/controllers/tradeEntry.controller.ts:71–86`
**Strength:** Worth exploring
**Problem type:** Low locality
**Description:** Financial math (`getPnl`) lives inside the HTTP controller, making it unreusable and untestable without importing HTTP concerns. Move to `backend/src/lib/tradeCalc.ts` as a pure function.
