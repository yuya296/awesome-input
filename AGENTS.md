# Repository Guidelines

[日本語版](./AGENTS.ja.md)

## Project Structure
This repository is a Manifest V3 Chrome extension. Keep source files in `src/` and treat `out/` as generated build output.

- `src/*.ts`: content script implementation split by responsibility
- `src/manifest.json`: source manifest copied into the build output
- `scripts/copy-assets.mjs`: copies `manifest.json` into `out/`
- `tests/`: Playwright E2E coverage for extension behavior

## Build, Test, and Dev Commands

- `npm install`: install development dependencies
- `npm run build`: compile TypeScript and emit the unpacked extension into `out/`
- `npm run test:e2e`: rebuild and run fixture Playwright E2E tests
- `npm run test:e2e:live`: rebuild and run live-site Playwright smoke tests
- `npm run test:e2e:all`: run both fixture and live E2E suites
- Load `out/` from `chrome://extensions`, then use `Reload` after each rebuild

## Coding Style and Naming
Use 2-space indentation in JSON and TypeScript. Keep the output compatible with plain `tsc` without adding a bundler unless the project explicitly changes direction.

- Use `camelCase` for functions and variables
- Keep shared browser logic under the `AwesomeInput` namespace
- Write defensive selectors because ChatGPT and Gemini DOM structures change often

## Testing Guidelines
Run `npm run test:e2e` for stable automated regression checks. Use `npm run test:e2e:live` when you need live DOM coverage against ChatGPT and Gemini. Also do manual verification on the supported services and confirm:

- `Enter` inserts a newline
- `Cmd+Enter` / `Ctrl+Enter` sends
- send button detection still works after response completion
- live E2E should fail if the expected composer or send button is missing on the real site
- `claude.ai` is currently unsupported and should be treated as out of scope

## Commit and PR Guidelines
Use short, specific commit messages. Pull requests should include a change summary, tested URLs, manual verification steps, and screenshots or recordings for visible UI changes.

## Security and Config
Only expand `matches` in `src/manifest.json` when there is a clear product need. Do not add unnecessary storage or transmission of user input.
