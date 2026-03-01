# Awesome Input

English | [日本語](./README.ja.md)

Awesome Input is a Chrome extension that improves text input for AI chat services. It currently targets ChatGPT and Gemini.

## Features

- `Enter` inserts a newline
- `Cmd+Enter` / `Ctrl+Enter` sends the current draft

## Installation

1. Clone or download this repository.
2. Run `npm install`.
3. Run `npm run build`.
4. Open `chrome://extensions` in Chrome.
5. Enable **Developer mode**.
6. Click **Load unpacked**.
7. Select the `out/` directory.

## Chrome Web Store Readiness

- The extension package now includes store-ready icons in `src/assets/`.
- For store submissions, upload a zip whose root is the built `out/` directory contents.
- Prepare screenshots for ChatGPT and Gemini that show both newline insertion and send behavior.

## Development

- Source files live under `src/`.
- Build output is generated into `out/`.
- Rebuild with `npm run build` after changes, then reload the extension in Chrome.
- Run fixture E2E checks with `npm run test:e2e`.
- Run live site smoke checks with `npm run test:e2e:live`.
- Run both suites with `npm run test:e2e:all`.
- See [docs/testing.md](/Users/yuya/dev/chatgpt-keyflow-extension/docs/testing.md) for the testing purpose and strategy.

## Supported URLs

- `https://chatgpt.com/*`
- `https://chat.openai.com/*`
- `https://gemini.google.com/*`

## Notes

- The extension depends on site-specific DOM structure. Input and send-button detection may break if the target services change their UI.
- `tests/extension.fixture.e2e.spec.js` provides stable fixture coverage, while `tests/live/*.e2e.spec.js` checks the live ChatGPT/Gemini DOM.
- Live E2E fails when the expected composer or send button is missing, because that likely means the target product flow or DOM changed.
- Live E2E patches the send button by default so it verifies the shortcut trigger without actually sending a prompt. Set `LIVE_E2E_ALLOW_REAL_SEND=1` only for local debugging.
- `claude.ai` is currently unsupported and is excluded from the extension manifest `matches`.

## Privacy

- Awesome Input does not collect, store, or transmit user prompts or chat content.
- The extension does not use analytics, ads, or third-party tracking.
- See [docs/privacy.md](/Users/yuya/dev/chatgpt-keyflow-extension/docs/privacy.md) for the publishable privacy statement.

## v0.1

- Added support for ChatGPT and Gemini
