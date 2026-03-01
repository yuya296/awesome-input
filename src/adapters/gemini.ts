namespace AwesomeInput {
  export const geminiAdapter: SiteAdapter = {
    id: "gemini",
    matches(hostname: string): boolean {
      return hostname === "gemini.google.com";
    },
    findComposer(): EditableElement | null {
      return findComposerWithSelectors([
        '.ql-editor[contenteditable]:not([contenteditable="false"])',
      ]);
    },
    findSendButton(_composer: EditableElement | null): HTMLButtonElement | null {
      return findSendButtonWithSelectors([
        'button[aria-label="Send Message"]',
        'button[aria-label="Send message"]',
        'button[aria-label="Send"]',
        'button[mattooltip*="Send"]',
        "button.send-button",
      ]);
    },
    insertNewline(composer: EditableElement): boolean {
      if (insertTextInputLineBreak(composer)) {
        return true;
      }

      if (insertParagraphLineBreak(composer)) {
        return true;
      }

      return insertContentEditableLineBreakFallback(composer);
    },
  };
}
