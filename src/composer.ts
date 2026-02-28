namespace AwesomeInput {
  function hasEditableContent(el: HTMLElement): boolean {
    const contentEditable = el.getAttribute("contenteditable");
    if (contentEditable === null) return false;
    return contentEditable.toLowerCase() !== "false";
  }

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

    return el.isContentEditable || hasEditableContent(el);
  }

  export function findEditableHost(node: Node | null): EditableElement | null {
    let current: Element | null = null;

    if (node instanceof Element) {
      current = node;
    } else if (node instanceof Text) {
      current = node.parentElement;
    }

    while (current) {
      if (isEditable(current)) return current;
      current = current.parentElement;
    }

    return null;
  }

  export function findComposer(): EditableElement | null {
    const active = document.activeElement;
    if (active instanceof Element) {
      const activeHost = findEditableHost(active);
      if (activeHost) return activeHost;
    }

    const selectionHost = findEditableHost(window.getSelection()?.anchorNode || null);
    if (selectionHost) return selectionHost;

    const selectors = [
      'main form [role="textbox"][contenteditable]:not([contenteditable="false"])',
      'form [role="textbox"][contenteditable]:not([contenteditable="false"])',
      '[role="textbox"][contenteditable]:not([contenteditable="false"])',
      'main [contenteditable]:not([contenteditable="false"])',
      "form textarea",
      "textarea",
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (isEditable(el)) return el;
    }

    return null;
  }

  function dispatchInput(
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

  function dispatchBeforeInput(
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

  function dispatchSyntheticEnter(
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

  export function dispatchNativeLineBreak(el: EditableElement): boolean {
    if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
      const start = el.selectionStart ?? el.value.length;
      const end = el.selectionEnd ?? el.value.length;
      el.value = `${el.value.slice(0, start)}\n${el.value.slice(end)}`;
      el.setSelectionRange(start + 1, start + 1);
      dispatchInput(el, "insertLineBreak", "\n");
      return true;
    }

    el.focus();

    const keydownAllowed = dispatchSyntheticEnter(el, "keydown");
    const keypressAllowed = dispatchSyntheticEnter(el, "keypress");
    dispatchSyntheticEnter(el, "keyup");

    return keydownAllowed || keypressAllowed;
  }

  export function insertNewline(el: EditableElement): void {
    if (dispatchNativeLineBreak(el)) {
      return;
    }

    if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
      return;
    }

    const beforeAllowed = dispatchBeforeInput(el, "insertLineBreak", "\n");
    if (!beforeAllowed) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    range.deleteContents();
    const br = document.createElement("br");
    range.insertNode(br);
    range.setStartAfter(br);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);

    dispatchInput(el, "insertLineBreak", "\n");
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

    el.innerHTML = "";
    const fragment = document.createDocumentFragment();
    const lines = String(text).split("\n");

    lines.forEach((line, index) => {
      if (line.length > 0) {
        fragment.appendChild(document.createTextNode(line));
      }
      if (index < lines.length - 1) {
        fragment.appendChild(document.createElement("br"));
      }
    });

    el.appendChild(fragment);
    dispatchInput(el);

    placeCaretAtEnd(el);
    return true;
  }
}
