namespace AwesomeInput {
  export const baseAdapter: SiteAdapter = {
    id: "base",
    matches(): boolean {
      return false;
    },
    findComposer(): EditableElement | null {
      return findComposerWithSelectors();
    },
    findSendButton(_composer: EditableElement | null): HTMLButtonElement | null {
      return findSendButtonWithSelectors();
    },
    insertNewline(composer: EditableElement): boolean {
      if (insertTextInputLineBreak(composer)) {
        return true;
      }

      if (insertContentEditableLineBreakFallback(composer)) {
        return true;
      }

      return insertSyntheticShiftEnterLineBreak(composer);
    },
  };
}
