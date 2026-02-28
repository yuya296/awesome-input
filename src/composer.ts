namespace AwesomeInput {
  export function isOurElement(el: Element | null): boolean {
    return Boolean(el?.closest?.(`#${OVERLAY_ID}`));
  }

  export function isEditable(el: Element | null): el is EditableElement {
    if (!(el instanceof HTMLElement)) return false;
    if (isOurElement(el)) return false;
    if (el instanceof HTMLTextAreaElement) return true;
    if (el instanceof HTMLInputElement) {
      const type = (el.type || "").toLowerCase();
      return type === "text" || type === "search";
    }

    return (
      el.isContentEditable ||
      el.getAttribute("contenteditable") === "true" ||
      el.getAttribute("role") === "textbox"
    );
  }

  export function findComposer(): EditableElement | null {
    const active = document.activeElement;
    if (active instanceof Element && isEditable(active)) return active;

    const selectors = [
      'main form [contenteditable="true"][role="textbox"]',
      'form [contenteditable="true"][role="textbox"]',
      'main [contenteditable="true"]',
      "form textarea",
      "textarea",
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (isEditable(el)) return el;
    }

    return null;
  }

  function dispatchInput(el: EditableElement): void {
    el.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        cancelable: true,
        data: null,
        inputType: "insertText",
      }),
    );
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function placeCaretAtEnd(el: EditableElement): void {
    if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
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

  export function insertNewline(el: EditableElement): void {
    if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
      const start = el.selectionStart ?? el.value.length;
      const end = el.selectionEnd ?? el.value.length;
      el.value = `${el.value.slice(0, start)}\n${el.value.slice(end)}`;
      el.setSelectionRange(start + 1, start + 1);
      dispatchInput(el);
      return;
    }

    el.focus();

    let inserted = false;
    try {
      inserted = document.execCommand("insertText", false, "\n");
    } catch {
      inserted = false;
    }

    if (!inserted) {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      range.deleteContents();
      const text = document.createTextNode("\n");
      range.insertNode(text);
      range.setStartAfter(text);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    el.dispatchEvent(
      new InputEvent("beforeinput", {
        bubbles: true,
        cancelable: true,
        data: "\n",
        inputType: "insertLineBreak",
      }),
    );
    el.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        cancelable: false,
        data: "\n",
        inputType: "insertLineBreak",
      }),
    );
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  export function setComposerText(text: string): boolean {
    const el = findComposer();
    if (!el) return false;

    el.focus();

    if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
      el.value = text;
      dispatchInput(el);
      placeCaretAtEnd(el);
      return true;
    }

    let inserted = false;
    try {
      const range = document.createRange();
      range.selectNodeContents(el);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      inserted = document.execCommand("insertText", false, String(text));
    } catch {
      inserted = false;
    }

    if (!inserted) {
      el.textContent = String(text);
      dispatchInput(el);
    } else {
      el.dispatchEvent(
        new InputEvent("beforeinput", {
          bubbles: true,
          cancelable: true,
          data: String(text),
          inputType: "insertText",
        }),
      );
      el.dispatchEvent(
        new InputEvent("input", {
          bubbles: true,
          cancelable: false,
          data: String(text),
          inputType: "insertText",
        }),
      );
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }

    placeCaretAtEnd(el);
    return true;
  }
}
