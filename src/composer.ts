namespace AwesomeInput {
  export function findComposer(): EditableElement | null {
    return resolveSiteAdapter().findComposer();
  }

  export function insertNewline(el: EditableElement): boolean {
    return resolveSiteAdapter().insertNewline(el);
  }

  export function setComposerText(text: string): boolean {
    const el = findComposer();
    if (!el) return false;

    el.focus();

    if (isTextInput(el)) {
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

  export function getComposerText(): string {
    const el = findComposer();
    if (!el) return "";
    return readEditableText(el);
  }
}
