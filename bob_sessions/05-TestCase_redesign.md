# 05-TestCase_redesign.md

---

**Status:** active  **Date:** 2026-10-19

---

### 👤 User

is the emailTestCase good for what we are building ?

---

### 🤖 Assistant

> 🔧 called: read_file, read_file

Let me read the relevant files to understand what you're building and what the test cases look like.

> 🔧 **read_file** — components/dashboard/PriorityFocus.tsx

> 🔧 **read_file** — data/emailTestCases.ts

### 🤖 Assistant

> 🔧 called: read_file, read_file



> 🔧 **read_file** — data/emailTestCases.ts

> 🔧 **read_file** — app/page.tsx

### 🤖 Assistant

> 🔧 called: read_file, glob



> 🔧 **read_file** — data/emailTestCases.ts

> 🔧 **glob** — lib/emailIntelligence.ts

### 🤖 Assistant

> 🔧 called: glob, read_file



> 🔧 **read_file** — components/dashboard/PriorityFocus.tsx

> 🔧 **glob** — lib/emailIntelligence*

### 🤖 Assistant

> 🔧 called: glob, glob



> 🔧 **glob** — hooks/**/*.ts

> 🔧 **glob** — lib/**/*.ts

### 🤖 Assistant

> 🔧 called: list_files



> 🔧 **list_files** — .

### 🤖 Assistant

> 🔧 called: list_files, list_files, list_files



> 🔧 **list_files** — lib

> 🔧 **list_files** — hooks

> 🔧 **list_files** — types

### 🤖 Assistant

> 🔧 called: read_file, read_file



> 🔧 **read_file** — lib/emailIntelligence.ts

> 🔧 **read_file** — lib/detectAction.ts

### 🤖 Assistant

Yes, the test cases are well-designed and largely appropriate — but there are some meaningful gaps worth knowing about. Here's the full picture:

---

## ✅ What the test cases get right

**The structure is solid.** The `makeCase` factory correctly hides `requiresAction: false` on all inputs so the engine can't cheat off the label — the engine has to earn its answer by reading the text.

**Group coverage maps to `emailIntelligence.ts`'s actual design:**
- **Group A (urgent_action)** → exercises `requiresAction + score` path
- **Group B (routine_notification)** → exercises `type = "notification"` path
- **Group C (promotion)** → exercises the `-30` score penalty
- **Group D (spam)** → exercises the `needsReview` / exclusion path
- **Group E (tricky_case)** → the most valuable group — specifically targets weaknesses in [`detectAction.ts`](lib/detectAction.ts)'s keyword-only approach

**`evaluationEmails` is a clean convenience export** — ready to feed directly into `prioritizeEmails()`.

---

## ⚠️ Gaps and mismatches to be aware of

**1. Many Group A emails will fail `detectAction.ts` today.**
[`detectAction`](lib/detectAction.ts:10) only matches a narrow set of patterns (`please sign`, `please confirm`, `please reply`, `please review`, `approval needed`, `let me know`, `rsvp`). Several `urgent_action` cases use none of these:

| Case | Body | Will detect? |
|------|------|---|
| A04 | "We need your decision on the revised budget today." | ❌ |
| A06 | "Please respond today." | ✅ (`please respond`) |
| A07 | "The contractor invoice is awaiting your approval before payment." | ❌ |
| A09 | "Complete your benefits enrollment before the deadline tonight." | ❌ |
| A10 | "must be updated by Friday." | ❌ |
| A15 | "Please authorize the emergency plumbing repair today." | ❌ |

These are **intentional challenges** per the file's own comment ("deliberately avoid LUMA's current keyword patterns"), which is good design for a test file — but it means the engine will fail them, which is the point.

**2. `expectedType` for some Group A cases won't match `evaluateEmail`'s current classifier either.**
For example, `A03` (Pediatrician's "Please confirm your appointment") is `expectedType: "notification"`, but `emailIntelligence.ts` currently uses `"appointment confirmation"` as a keyword trigger for `type = "notification"` — so this one happens to pass. But `A07`, `A09`, `A15` are `expectedType: "communication"`, and `emailIntelligence.ts`'s classifier would likely land them as `"communication"` by default (the fallthrough), so those are fine too.

**3. Spam detection covers only 3 phrases** in [`emailIntelligence.ts`](lib/emailIntelligence.ts:40-44):
```ts
"you won a prize", "claim your reward", "verify your password"
```
Only **S01** and **S02** will be caught. S03 ("gift card code"), S04 ("provide your login credentials"), and S05 ("processing fee") will fall through as `"communication"`, so `expectedNeedsReview: true` will fail for those 3 cases.

**4. No `score` or `reason` assertions.** The test cases record `expectedAction` and `expectedType` but not expected scores or reason strings. That's fine for now — it matches what the engine produces cleanly — but it means you can't regression-test ranking order changes.

**5. `evaluationEmails` uses a fixed `receivedAt` of `2026-10-19T12:00:00Z`.** The recency bonus in `evaluateEmail` (`+5` for emails under 6 hours old) will never fire during evaluation unless `now` is set to match. Worth noting if you write an evaluation script.

---

## Bottom line

The test cases are **good for testing the architecture and tricky-case logic**, and the intentional failures in Group A are a fair stress test of `detectAction.ts`. The main thing to keep in mind is that **the spam group (D) will only partially pass** until [`emailIntelligence.ts`](lib/emailIntelligence.ts:40-44)'s suspicious-phrase list is expanded. Everything else is coherent and well-matched to what you're building.

---

### 👤 User

Open watsonx Orchestrate through your BOP portal.

---

### 🤖 Assistant

That's outside what I can do — I don't have access to a browser, BOP portal, or any external web UI. I can only work with the files in this workspace.

If you meant something code-related — like wiring up a watsonx Orchestrate API call, configuring an MCP server for it, or integrating it into the LUMA email intelligence pipeline — I'm happy to help with that.

---

### 👤 User

watsonx Orchestrate

---

### 🤖 Assistant

> 🔧 called: list_ibm_doc_libraries

Let me pull up the IBM documentation on watsonx Orchestrate for you.

> 🔧 **list_ibm_doc_libraries** — done

### 🤖 Assistant

> 🔧 called: search_ibm_docs

watsonx Orchestrate doesn't have a dedicated library in the IBM docs index — the closest available are `docs_ibm_watsonx` (the general watsonx platform) and `docs_ibm_watson_assistant`. Let me search both for Orchestrate-specific information.

> 🔧 **search_ibm_docs** — docs_ibm_watsonx

### 🤖 Assistant

The IBM docs index doesn't have a dedicated watsonx Orchestrate library — the results are mostly about governing Orchestrate agents from **watsonx.governance**, not Orchestrate itself. Here's what the docs do confirm about it:

---

## watsonx Orchestrate — what the docs say

**What it is:** An IBM AI product for building and deploying **AI agents** that can make decisions and perform tasks on behalf of users. It has its own **Agent Lab/builder** for authoring agents.

**Key facts from the documentation:**

- The **Agent Lab** that was in watsonx.ai (beta) is being **replaced** by the watsonx Orchestrate Agent Lab/builder. The watsonx.ai beta ends **13 August 2026**.
- Orchestrate agents can be **monitored and governed** through watsonx.governance — execution traces, metrics, dashboards, and compliance alerts.
- It's available on **IBM Cloud** (Dallas, Frankfurt, London, Tokyo, Sydney, Toronto) and **AWS**.
- Governance console can connect to Orchestrate to **import agents**, sync evaluation metrics, and track them against use cases.

---

**For the LUMA project specifically** — if you're looking to integrate watsonx Orchestrate into the email intelligence pipeline (e.g. replacing the rules-based [`detectAction.ts`](lib/detectAction.ts) with an Orchestrate agent), I can help design that. Just let me know what you're trying to do with it.

---

### 👤 User

Open watsonx Orchestrate

---

### 🤖 Assistant

I can't open applications or web browsers — I only work with code and files in this workspace.

To open watsonx Orchestrate, you'd go to **[ibm.com/products/watsonx-orchestrate](https://www.ibm.com/products/watsonx-orchestrate)** or log into your IBM Cloud account and navigate to the Orchestrate service from there.

Once you're in, come back here and let me know what you're building — I can help you integrate it with LUMA.