const { test, expect } = require("@playwright/test");
const { SEND_SHORTCUT, launchExtensionContext } = require("../helpers/extension-context");
const {
  getNavTimeoutMs,
  installSendClickProbe,
  openLivePage,
  readComposerText,
  readSendClickCount,
  requireUsableButtonSelector,
  requireVisibleSelector,
  typeIntoComposer,
} = require("../helpers/live-site");

const CHATGPT_URL = process.env.LIVE_E2E_CHATGPT_URL || "https://chatgpt.com/";
const ALLOW_REAL_SEND = process.env.LIVE_E2E_ALLOW_REAL_SEND === "1";
const CHATGPT_COMPOSER_SELECTORS = [
  'fieldset .ProseMirror[contenteditable]:not([contenteditable="false"])',
  '.ProseMirror[contenteditable]:not([contenteditable="false"])',
  '[data-placeholder][contenteditable]:not([contenteditable="false"])',
  'rich-textarea [contenteditable]:not([contenteditable="false"])',
];
const CHATGPT_SEND_BUTTON_SELECTORS = [
  'button[data-testid="send-button"]',
  'button[data-testid*="send"]',
  'button[aria-label*="Send"]',
];

test.skip(
  process.platform === "linux" && !process.env.DISPLAY,
  "Extension E2E requires a display server (use xvfb-run in CI).",
);

test.describe("ChatGPT live E2E", () => {
  test("Enter inserts a newline and send shortcut triggers send", async () => {
    const { context, cleanup } = await launchExtensionContext();
    const timeoutMs = getNavTimeoutMs();

    try {
      const page = await openLivePage(context, CHATGPT_URL, timeoutMs);
      const composerSelector = await requireVisibleSelector(
        page,
        CHATGPT_COMPOSER_SELECTORS,
        "ChatGPT live E2E failed: composer not found. Possible DOM or product flow change.",
        timeoutMs,
      );
      await typeIntoComposer(page, composerSelector, "hello");
      await page.keyboard.press("Enter");

      await expect.poll(() => readSendClickCount(page)).toBe(0);
      await expect.poll(() => readComposerText(page, composerSelector)).toContain("\n");

      await requireUsableButtonSelector(
        page,
        CHATGPT_SEND_BUTTON_SELECTORS,
        "ChatGPT live E2E failed: usable send button not found after typing. Possible selector drift or disabled composer state.",
        timeoutMs,
      );
      await installSendClickProbe(page, CHATGPT_SEND_BUTTON_SELECTORS, { allowRealSend: ALLOW_REAL_SEND });

      await page.locator(composerSelector).first().click();
      await page.keyboard.press(SEND_SHORTCUT);

      await expect.poll(() => readSendClickCount(page)).toBe(1);
    } finally {
      await cleanup();
    }
  });
});
