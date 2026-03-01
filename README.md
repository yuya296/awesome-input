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

## Development

- Source files live under `src/`.
- Build output is generated into `out/`.
- Rebuild with `npm run build` after changes, then reload the extension in Chrome.
- Run E2E checks with `npm run test:e2e`.

## Supported URLs

- `https://chatgpt.com/*`
- `https://chat.openai.com/*`
- `https://gemini.google.com/*`

## Notes

- The extension depends on site-specific DOM structure. Input and send-button detection may break if the target services change their UI.
- `claude.ai` is currently unsupported and is excluded from the extension manifest `matches`.

## v0.1

- Added support for ChatGPT and Gemini
