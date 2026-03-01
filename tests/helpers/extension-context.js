const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { chromium } = require("@playwright/test");

const EXTENSION_PATH = path.resolve(__dirname, "..", "..", "out");
const SEND_SHORTCUT = process.platform === "darwin" ? "Meta+Enter" : "Control+Enter";

async function launchExtensionContext() {
  const userDataDir = await fs.mkdtemp(path.join(os.tmpdir(), "awesome-input-e2e-"));
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    env: {
      ...process.env,
      HOME: userDataDir,
    },
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
    ],
  });

  return {
    context,
    async cleanup() {
      await context.close();
      await fs.rm(userDataDir, { recursive: true, force: true });
    },
  };
}

module.exports = {
  SEND_SHORTCUT,
  launchExtensionContext,
};
