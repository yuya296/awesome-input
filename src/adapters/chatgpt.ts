namespace AwesomeInput {
  export const chatgptAdapter: SiteAdapter = {
    id: "chatgpt",
    matches(hostname: string): boolean {
      return hostname === "chatgpt.com" || hostname === "chat.openai.com";
    },
    findComposer(): EditableElement | null {
      return findComposerWithSelectors([
        'fieldset .ProseMirror[contenteditable]:not([contenteditable="false"])',
        '.ProseMirror[contenteditable]:not([contenteditable="false"])',
        '[data-placeholder][contenteditable]:not([contenteditable="false"])',
        'rich-textarea [contenteditable]:not([contenteditable="false"])',
      ]);
    },
    findSendButton(_composer: EditableElement | null): HTMLButtonElement | null {
      return findSendButtonWithSelectors([
        'button[data-testid="send-button"]',
      ]);
    },
    insertNewline(composer: EditableElement): boolean {
      if (insertTextInputLineBreak(composer)) {
        return true;
      }

      if (insertSyntheticShiftEnterLineBreak(composer)) {
        return true;
      }

      return insertContentEditableLineBreakFallback(composer);
    },
  };
}
