const { test, expect } = require("@playwright/test");
const { SEND_SHORTCUT, launchExtensionContext } = require("./helpers/extension-context");

function buildChatFixture({ serviceName, editorClass, sendButtonAttrs }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>${serviceName} Fixture</title>
    <style>
      body { font-family: sans-serif; padding: 24px; }
      #composer {
        min-height: 72px;
        border: 1px solid #ccc;
        padding: 12px;
        white-space: pre-wrap;
      }
    </style>
  </head>
  <body>
    <main>
      <form>
        <div
          id="composer"
          class="${editorClass}"
          role="textbox"
          aria-label="Prompt input"
          contenteditable="true"
        ></div>
        <button id="send" type="button" ${sendButtonAttrs}></button>
      </form>
    </main>
    <script>
      window.__sendCount = 0;
      const send = document.getElementById("send");
      const composer = document.getElementById("composer");
      send.addEventListener("click", () => {
        window.__sendCount += 1;
        window.__lastSent = composer.innerText;
      });
    </script>
  </body>
</html>`;
}

async function openFixturePage(context, url, html) {
  await context.route(url, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: html,
    });
  });

  const page = await context.newPage();
  await page.goto(url);
  await page.waitForSelector('[role="textbox"]');
  return page;
}

async function typeIntoComposer(page, text) {
  await page.locator('[role="textbox"]').click();
  await page.keyboard.type(text);
}

async function readComposerText(page) {
  return page.locator('[role="textbox"]').evaluate((el) => el.innerText);
}

async function readSendCount(page) {
  return page.evaluate(() => window.__sendCount);
}

test.skip(
  process.platform === "linux" && !process.env.DISPLAY,
  "Extension E2E requires a display server (use xvfb-run in CI).",
);

test.describe("Awesome Input extension fixtures", () => {
  test("ChatGPT fixture: Enter inserts a newline and send shortcut sends", async () => {
    const { context, cleanup } = await launchExtensionContext();

    try {
      const page = await openFixturePage(
        context,
        "https://chatgpt.com/test-fixture",
        buildChatFixture({
          serviceName: "ChatGPT",
          editorClass: "",
          sendButtonAttrs: 'data-testid="send-button" aria-label="Send"',
        }),
      );

      await typeIntoComposer(page, "hello");
      await page.keyboard.press("Enter");

      await expect.poll(() => readSendCount(page)).toBe(0);
      await expect.poll(() => readComposerText(page)).toContain("\n");

      await page.locator('[role="textbox"]').click();
      await page.keyboard.press(SEND_SHORTCUT);

      await expect.poll(() => readSendCount(page)).toBe(1);
    } finally {
      await cleanup();
    }
  });

  test("Gemini fixture: Enter inserts a newline and send shortcut sends", async () => {
    const { context, cleanup } = await launchExtensionContext();

    try {
      const page = await openFixturePage(
        context,
        "https://gemini.google.com/app",
        buildChatFixture({
          serviceName: "Gemini",
          editorClass: "ql-editor ql-blank textarea new-input-ui",
          sendButtonAttrs: 'class="send-button" aria-label="Send message"',
        }),
      );

      await typeIntoComposer(page, "hello");
      await page.keyboard.press("Enter");

      await expect.poll(() => readSendCount(page)).toBe(0);
      await expect.poll(() => readComposerText(page)).toContain("\n");

      await page.locator('[role="textbox"]').click();
      await page.keyboard.press(SEND_SHORTCUT);

      await expect.poll(() => readSendCount(page)).toBe(1);
    } finally {
      await cleanup();
    }
  });
});
