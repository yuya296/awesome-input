namespace AwesomeInput {
  function isVisible(el: Element | null): el is HTMLElement {
    if (!(el instanceof HTMLElement)) return false;

    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.visibility !== "hidden" &&
      style.display !== "none"
    );
  }

  function isLikelySendButton(btn: Element): btn is HTMLButtonElement {
    if (!(btn instanceof HTMLButtonElement)) return false;
    if (btn.disabled || !isVisible(btn) || isOurElement(btn)) return false;

    const label = [
      btn.getAttribute("aria-label") || "",
      btn.getAttribute("data-testid") || "",
      btn.textContent || "",
    ]
      .join(" ")
      .toLowerCase();

    if (/stop|停止|regenerate|retry|voice|record|attach|upload|search|reason/.test(label)) {
      return false;
    }

    return /send|送信/.test(label) || btn.type === "submit";
  }

  export function findSendButton(): HTMLButtonElement | null {
    const selectors = [
      'button[data-testid="send-button"]',
      'button[data-testid*="send"]',
      'button[aria-label="Send Message"]',
      'button[aria-label="Send message"]',
      'button[aria-label="Send"]',
      'button[aria-label*="Send"]',
      'button[aria-label*="send"]',
      'button[aria-label*="送信"]',
      'button[mattooltip*="Send"]',
      'button.send-button',
      'form button[type="submit"]',
    ];

    for (const selector of selectors) {
      const buttons = Array.from(document.querySelectorAll(selector));
      const button = buttons.find(isLikelySendButton);
      if (button) return button;
    }

    return Array.from(document.querySelectorAll("button")).find(isLikelySendButton) || null;
  }

  export function findStopButton(): HTMLButtonElement | null {
    return (
      Array.from(document.querySelectorAll("button")).find((btn) => {
        if (!(btn instanceof HTMLButtonElement) || !isVisible(btn) || isOurElement(btn)) {
          return false;
        }

        const label = [
          btn.getAttribute("aria-label") || "",
          btn.getAttribute("data-testid") || "",
          btn.textContent || "",
        ]
          .join(" ")
          .toLowerCase();

        return /stop|停止/.test(label);
      }) || null
    );
  }

  export function sendCurrentDraft(): boolean {
    const composer = findComposer();
    if (!composer) return false;

    const sendButton = findSendButton();
    if (sendButton) {
      sendButton.click();
      return true;
    }

    const form = composer.closest("form");
    if (form && typeof form.requestSubmit === "function") {
      form.requestSubmit();
      return true;
    }

    return false;
  }

}
