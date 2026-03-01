namespace AwesomeInput {
  /**
   * Shared fallback implementation for sites that do not have a dedicated adapter.
   *
   * This adapter is intentionally conservative:
   * - It is never treated as a "registered" site.
   * - It provides the lowest-common-denominator behavior built from generic DOM
   *   heuristics.
   * - Dedicated adapters should override this behavior whenever a target site
   *   has editor-specific or send-button-specific requirements.
   *
   * In practice, this object serves two purposes:
   * 1. It is the default runtime behavior when no site-specific adapter matches.
   * 2. It acts as the reference implementation for future adapters to copy from
   *    and selectively refine.
   */
  export const baseAdapter: SiteAdapter = {
    id: "base",
    /**
     * The base adapter never explicitly matches a hostname.
     *
     * Adapter resolution falls back to this object only after all registered
     * site adapters fail to match. Returning `false` here prevents the base
     * adapter from being treated as a first-class supported site.
     */
    matches(_hostname: string): boolean {
      return false;
    },
    /**
     * Locate an editable composer using generic selectors only.
     *
     * This should work for common shapes such as:
     * - `textarea`
     * - `input[type="text" | "search"]`
     * - `contenteditable` elements, especially those using `role="textbox"`
     *
     * Site adapters should override this when they need stronger selectors
     * (for example ProseMirror, Quill, or other editor-specific hooks).
     */
    findComposer(): EditableElement | null {
      return findComposerWithSelectors();
    },
    /**
     * Locate a send control using shared button heuristics.
     *
     * The base implementation intentionally ignores site-specific CSS classes
     * and relies on broadly reusable attributes such as:
     * - `data-testid*="send"`
     * - `aria-label*="send"`
     * - `type="submit"`
     *
     * The `composer` parameter is part of the common adapter contract even
     * though the base implementation does not currently need it.
     */
    findSendButton(_composer: EditableElement | null): HTMLButtonElement | null {
      return findSendButtonWithSelectors();
    },
    /**
     * Insert a newline using the safest generic strategy available.
     *
     * The execution order is deliberate:
     * 1. For text inputs, insert a literal `\n`.
     * 2. For contenteditable hosts, prefer the explicit line-break fallback.
     * 3. As a last resort, try a synthetic `Shift+Enter`.
     *
     * This ordering favors predictable DOM mutation over editor-specific magic.
     * Dedicated adapters should replace this when a site requires a more exact
     * input path, such as ChatGPT's synthetic path or Gemini's paragraph-based
     * insertion.
     */
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
