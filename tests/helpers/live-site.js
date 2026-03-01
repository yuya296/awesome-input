const DEFAULT_NAV_TIMEOUT_MS = Number.parseInt(process.env.LIVE_E2E_NAV_TIMEOUT_MS || "20000", 10);

function isFinitePositiveNumber(value) {
  return Number.isFinite(value) && value > 0;
}

function getNavTimeoutMs() {
  return isFinitePositiveNumber(DEFAULT_NAV_TIMEOUT_MS) ? DEFAULT_NAV_TIMEOUT_MS : 20000;
}

async function openLivePage(context, url, timeoutMs = getNavTimeoutMs()) {
  const page = await context.newPage();
  page.setDefaultTimeout(timeoutMs);
  await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: timeoutMs,
  });
  return page;
}

async function findFirstVisibleSelector(page, selectors, timeoutMs = getNavTimeoutMs()) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    for (const selector of selectors) {
      const visible = await page.locator(selector).first().isVisible().catch(() => false);
      if (visible) return selector;
    }

    await page.waitForTimeout(250);
  }

  return null;
}

async function requireVisibleSelector(page, selectors, errorMessage, timeoutMs = getNavTimeoutMs()) {
  const selector = await findFirstVisibleSelector(page, selectors, timeoutMs);
  if (selector) return selector;

  const title = await page.title().catch(() => "");
  throw new Error(`${errorMessage} Current URL: ${page.url()} Title: ${title}`);
}

async function findFirstUsableButtonSelector(page, selectors, timeoutMs = getNavTimeoutMs()) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    for (const selector of selectors) {
      const button = page.locator(selector).first();
      const isUsable = await button.evaluate((el) => {
        if (!(el instanceof HTMLButtonElement)) return false;

        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        const visible =
          rect.width > 0 &&
          rect.height > 0 &&
          style.visibility !== "hidden" &&
          style.display !== "none";

        return visible && !el.disabled;
      }).catch(() => false);

      if (isUsable) return selector;
    }

    await page.waitForTimeout(250);
  }

  return null;
}

async function requireUsableButtonSelector(page, selectors, errorMessage, timeoutMs = getNavTimeoutMs()) {
  const selector = await findFirstUsableButtonSelector(page, selectors, timeoutMs);
  if (selector) return selector;

  const title = await page.title().catch(() => "");
  throw new Error(`${errorMessage} Current URL: ${page.url()} Title: ${title}`);
}

async function typeIntoComposer(page, selector, text) {
  await page.locator(selector).first().click();
  await page.keyboard.type(text);
}

async function readComposerText(page, selector) {
  return page.locator(selector).first().evaluate((el) => el.innerText);
}

async function installSendClickProbe(page, selectors, options = {}) {
  const allowRealSend = options.allowRealSend === true;

  await page.evaluate(({ selectorList, shouldAllowRealSend }) => {
    window.__awesomeInputSendClicks = 0;

    if (window.__awesomeInputClickProbeInstalled) {
      window.__awesomeInputClickProbeSelectors = selectorList;
      window.__awesomeInputAllowRealSend = shouldAllowRealSend;
      return;
    }

    document.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;

      const matchedButton = (window.__awesomeInputClickProbeSelectors || []).reduce((matched, selector) => {
        if (matched) return matched;

        try {
          return target.closest(selector);
        } catch {
          return null;
        }
      }, null);

      if (!(matchedButton instanceof HTMLButtonElement)) return;

      window.__awesomeInputSendClicks += 1;
      if (window.__awesomeInputAllowRealSend) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
    }, true);

    window.__awesomeInputClickProbeInstalled = true;
    window.__awesomeInputClickProbeSelectors = selectorList;
    window.__awesomeInputAllowRealSend = shouldAllowRealSend;
  }, {
    selectorList: selectors,
    shouldAllowRealSend: allowRealSend,
  });
}

async function readSendClickCount(page) {
  return page.evaluate(() => window.__awesomeInputSendClicks || 0);
}

module.exports = {
  getNavTimeoutMs,
  installSendClickProbe,
  openLivePage,
  readComposerText,
  readSendClickCount,
  requireUsableButtonSelector,
  requireVisibleSelector,
  typeIntoComposer,
};
