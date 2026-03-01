namespace AwesomeInput {
  export function hasEditableContent(el: HTMLElement): boolean {
    const contentEditable = el.getAttribute("contenteditable");
    if (contentEditable === null) return false;
    return contentEditable.toLowerCase() !== "false";
  }

  export function isOurElement(_el: Element | null): boolean {
    return false;
  }

  export function isEditable(el: Element | null): el is EditableElement {
    if (!(el instanceof HTMLElement)) return false;
    if (isOurElement(el)) return false;
    if (el instanceof HTMLTextAreaElement) return true;
    if (el instanceof HTMLInputElement) {
      const type = (el.type || "").toLowerCase();
      return type === "text" || type === "search";
    }

    return el.isContentEditable || hasEditableContent(el);
  }

  export function isTextInput(el: EditableElement): el is HTMLTextAreaElement | HTMLInputElement {
    return el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement;
  }

  export function isEditingHost(el: Element | null): el is EditableElement {
    if (!(el instanceof HTMLElement)) return false;
    if (isOurElement(el)) return false;

    if (el instanceof HTMLTextAreaElement) return true;
    if (el instanceof HTMLInputElement) {
      const type = (el.type || "").toLowerCase();
      return type === "text" || type === "search";
    }

    if (hasEditableContent(el)) return true;
    if (el.getAttribute("role") === "textbox" && el.isContentEditable) return true;

    const parentIsEditable = el.parentElement?.isContentEditable ?? false;
    return el.isContentEditable && !parentIsEditable;
  }

  export function findEditableHost(node: Node | null): EditableElement | null {
    let current: Element | null = null;

    if (node instanceof Element) {
      current = node;
    } else if (node instanceof Text) {
      current = node.parentElement;
    }

    while (current) {
      if (isEditingHost(current)) return current;
      current = current.parentElement;
    }

    return null;
  }

  export function findComposerWithSelectors(selectors: string[] = []): EditableElement | null {
    const active = document.activeElement;
    if (active instanceof Element) {
      const activeHost = findEditableHost(active);
      if (activeHost) return activeHost;
    }

    const selectionHost = findEditableHost(window.getSelection()?.anchorNode || null);
    if (selectionHost) return selectionHost;

    const fallbackSelectors = [
      'main form [role="textbox"][contenteditable]:not([contenteditable="false"])',
      'form [role="textbox"][contenteditable]:not([contenteditable="false"])',
      '[role="textbox"][contenteditable]:not([contenteditable="false"])',
      'main [contenteditable]:not([contenteditable="false"])',
      "form textarea",
      "textarea",
    ];

    for (const selector of [...selectors, ...fallbackSelectors]) {
      const el = document.querySelector(selector);
      if (isEditable(el)) return el;
    }

    return null;
  }

  export function dispatchInput(
    el: EditableElement,
    inputType: string = "insertText",
    data: string | null = null,
  ): void {
    el.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        cancelable: false,
        data,
        inputType,
      }),
    );
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  export function dispatchBeforeInput(
    el: EditableElement,
    inputType: string,
    data: string | null = null,
  ): boolean {
    return el.dispatchEvent(
      new InputEvent("beforeinput", {
        bubbles: true,
        cancelable: true,
        data,
        inputType,
      }),
    );
  }

  export function dispatchPlainInput(el: EditableElement): void {
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  export function snapshotEditableValue(el: EditableElement): string {
    if (isTextInput(el)) {
      return el.value;
    }

    return el.innerHTML;
  }

  export function readEditableText(el: EditableElement): string {
    if (isTextInput(el)) {
      return el.value;
    }

    return el.innerText.replace(/\u00a0/g, " ");
  }

  export function placeCaretAtEnd(el: EditableElement): void {
    if (isTextInput(el)) {
      const end = el.value.length;
      el.setSelectionRange(end, end);
      return;
    }

    if (!el.isContentEditable) return;

    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  export function dispatchSyntheticEnter(
    el: EditableElement,
    eventType: "keydown" | "keypress" | "keyup",
  ): boolean {
    return el.dispatchEvent(
      new KeyboardEvent(eventType, {
        key: "Enter",
        code: "Enter",
        bubbles: true,
        cancelable: true,
        composed: true,
        shiftKey: true,
      }),
    );
  }

  export function insertTextInputLineBreak(el: EditableElement): boolean {
    if (!isTextInput(el)) return false;

    dispatchBeforeInput(el, "insertText", "\n");

    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    if (typeof el.setRangeText === "function") {
      el.setRangeText("\n", start, end, "end");
    } else {
      el.value = `${el.value.slice(0, start)}\n${el.value.slice(end)}`;
      el.setSelectionRange(start + 1, start + 1);
    }

    dispatchInput(el, "insertText", "\n");
    dispatchPlainInput(el);
    return true;
  }

  export function insertSyntheticShiftEnterLineBreak(el: EditableElement): boolean {
    if (isTextInput(el)) return false;

    el.focus();
    const before = snapshotEditableValue(el);

    dispatchSyntheticEnter(el, "keydown");
    dispatchSyntheticEnter(el, "keypress");
    dispatchSyntheticEnter(el, "keyup");

    return snapshotEditableValue(el) !== before;
  }

  export function insertParagraphLineBreak(el: EditableElement): boolean {
    if (isTextInput(el)) return false;

    el.focus();
    const before = snapshotEditableValue(el);

    let inserted = false;
    try {
      inserted = document.execCommand("insertParagraph");
    } catch {
      inserted = false;
    }

    return inserted && snapshotEditableValue(el) !== before;
  }

  export function insertContentEditableLineBreakFallback(el: EditableElement): boolean {
    if (isTextInput(el)) {
      return insertTextInputLineBreak(el);
    }

    const beforeAllowed = dispatchBeforeInput(el, "insertLineBreak", "\n");
    if (!beforeAllowed) return false;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    const range = selection.getRangeAt(0);
    range.deleteContents();
    const br = document.createElement("br");
    range.insertNode(br);
    range.setStartAfter(br);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);

    dispatchInput(el, "insertLineBreak", "\n");
    return true;
  }

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

  export function findSendButtonWithSelectors(selectors: string[] = []): HTMLButtonElement | null {
    const fallbackSelectors = [
      'button[data-testid*="send"]',
      'button[aria-label*="Send"]',
      'button[aria-label*="send"]',
      'button[aria-label*="送信"]',
      'form button[type="submit"]',
    ];

    for (const selector of [...selectors, ...fallbackSelectors]) {
      const buttons = Array.from(document.querySelectorAll(selector));
      const button = buttons.find(isLikelySendButton);
      if (button) return button;
    }

    return Array.from(document.querySelectorAll("button")).find(isLikelySendButton) || null;
  }
}
