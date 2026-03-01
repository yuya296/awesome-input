namespace AwesomeInput {
  function resolveSendAction(
    composer: EditableElement | null,
  ): { type: "button"; button: HTMLButtonElement } | { type: "form"; form: HTMLFormElement } | null {
    if (!composer) return null;

    const sendButton = findSendButton(composer);
    if (sendButton) {
      return { type: "button", button: sendButton };
    }

    const form = composer.closest("form");
    if (form && typeof form.requestSubmit === "function") {
      return { type: "form", form };
    }

    return null;
  }

  export function findSendButton(composer: EditableElement | null = findComposer()): HTMLButtonElement | null {
    return resolveSiteAdapter().findSendButton(composer);
  }

  export function canSendCurrentDraft(composer: EditableElement | null = findComposer()): boolean {
    return !!resolveSendAction(composer);
  }

  export function sendCurrentDraft(): boolean {
    const composer = findComposer();
    const sendAction = resolveSendAction(composer);
    if (!sendAction) return false;

    if (sendAction.type === "button") {
      sendAction.button.click();
      return true;
    }

    sendAction.form.requestSubmit();
    return true;

  }
}
