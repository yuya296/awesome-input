# Testing Strategy

## Purpose

The E2E suite protects the extension's core promise on supported AI chat sites:

- `Enter` inserts a newline
- `Cmd+Enter` / `Ctrl+Enter` triggers send

It is designed to catch regressions in the extension itself and breakage caused by ChatGPT or Gemini UI changes.

## Strategy

The repository uses two E2E layers:

- Fixture E2E (`npm run test:e2e`): stable regression coverage with controlled HTML fixtures. Use this as the baseline signal in CI.
- Live E2E (`npm run test:e2e:live`): smoke coverage against the real ChatGPT and Gemini DOM. Use this to detect selector drift and product-flow changes early.

## Failure Model

- Fixture failures usually mean the extension logic regressed.
- Live failures usually mean either the extension no longer matches the real site DOM, or the target site changed its product flow in a way that blocks the expected composer/send controls.

Live tests intentionally fail when the expected composer or send button is missing. That failure is the signal.
