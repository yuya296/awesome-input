namespace AwesomeInput {
  export function findSendButton(composer: EditableElement | null = findComposer()): HTMLButtonElement | null {
    return resolveSiteAdapter().findSendButton(composer);
  }

  export function canSendCurrentDraft(composer: EditableElement | null = findComposer()): boolean {
    if (!composer) return false;
    if (findSendButton(composer)) return true;

    const form = composer.closest("form");
    return !!(form && typeof form.requestSubmit === "function");
  }

  export function sendCurrentDraft(): boolean {
    const composer = findComposer();
    if (!composer) return false;

    const sendButton = findSendButton(composer);
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
