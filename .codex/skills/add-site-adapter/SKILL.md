---
name: add-site-adapter
description: Add support for a new AI chat site in the Awesome Input repository by following the project-specific adapter workflow. Use when the task is to add, update, or review support for another site, plugin-like target, hostname, or editor implementation in this codebase.
---

# Add Site Adapter

## Overview

Add new supported sites through the adapter model in this repository. Keep shared behavior in the base adapter, and put site-specific selectors or editor quirks in a dedicated adapter file.

## Rules

- Treat `src/adapters/base.ts` as the generic fallback only. Do not put site-specific hostnames, selectors, or editor quirks there unless the behavior is truly reusable across multiple sites.
- Create one adapter file per site under `src/adapters/`.
- Keep site-specific logic inside the adapter:
  - `matches(hostname)`
  - `findComposer()`
  - `findSendButton()`
  - `insertNewline()`
- Keep shared DOM helpers in `src/dom.ts`.
- Keep `src/content.ts` limited to global key orchestration. Do not add hostname branching there.

## Required Workflow

### 1. Inspect existing adapters

Read:

- `src/adapters/base.ts`
- `src/adapters/chatgpt.ts`
- `src/adapters/gemini.ts`
- `src/adapters/index.ts`

Copy the closest existing adapter and adjust only the parts required by the new site.

### 2. Create the new adapter

Add `src/adapters/<site>.ts` and export a `SiteAdapter`.

Implementation requirements:

- Match only the intended hostname(s).
- Prefer explicit selectors for the site’s editor implementation.
- Prefer explicit send-button selectors before falling back to generic heuristics.
- Make `insertNewline()` preserve the site’s native newline behavior as closely as possible.

### 3. Register the adapter

Update `src/adapters/index.ts`.

- Add the new adapter to `registeredAdapters`.
- Keep `baseAdapter` as fallback only.
- Place the new adapter in a sensible order if hostname patterns could overlap.

### 4. Update extension scope only when the site should ship now

If the site is meant to be enabled immediately, add its URL pattern to `src/manifest.json`.

- Do not add `matches` entries for speculative or incomplete support.
- If the site is intentionally unsupported, keep it out of `matches` and document that status instead.

### 5. Update tests

Update `tests/extension.e2e.spec.js`.

- Add or extend a fixture for the new site.
- Verify:
  - `Enter` inserts a newline
  - `Cmd+Enter` / `Ctrl+Enter` sends
  - the site-specific send button is detected

Keep existing ChatGPT and Gemini coverage passing.

### 6. Update docs when support changes

If the supported-site list changes, update:

- `README.md`
- `README.ja.md`
- `AGENTS.md`
- `AGENTS.ja.md`

Keep English and Japanese docs consistent.

### 7. Validate before finishing

Always run:

- `npm run build`
- `npm run test:e2e`

On macOS in this repository, `npm run test:e2e` may need to run outside the sandbox because Playwright can fail on Chromium Crashpad permissions.

## Acceptance Checklist

Before finishing, confirm all of the following:

- The new adapter is isolated to its own file.
- `src/content.ts` does not gain site-specific branching.
- `src/dom.ts` remains generic.
- `src/manifest.json` only includes sites that are intentionally supported now.
- E2E covers the new site or the unsupported decision is explicitly documented.
