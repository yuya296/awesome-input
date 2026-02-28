interface Window {
  __AWESOME_INPUT_LOADED__?: boolean;
}

namespace AwesomeInput {

  function handleGlobalKeydown(event: KeyboardEvent): void {
    if (event.defaultPrevented) return;

    const targetNode = event.target instanceof Node ? event.target : null;

    if (
      event.ctrlKey &&
      !event.metaKey &&
      !event.altKey &&
      !event.shiftKey &&
      !event.isComposing &&
      event.key.toLowerCase() === "g"
    ) {
      event.preventDefault();
      toggleOverlay();
      return;
    }

    if (event.target instanceof Element && isOurElement(event.target)) return;

    const composer = findComposer();
    const targetIsComposer = Boolean(
      composer && targetNode && (targetNode === composer || composer.contains(targetNode)),
    );
    if (!composer || !targetIsComposer) return;
    if (event.key !== "Enter" || event.isComposing || event.keyCode === 229) return;

    const isSendKey =
      !event.shiftKey &&
      !event.altKey &&
      (event.metaKey || (!isMac() && event.ctrlKey) || (isMac() && event.ctrlKey));

    if (isSendKey) {
      event.preventDefault();
      sendCurrentDraft();
      return;
    }

    const plainEnter =
      !event.shiftKey &&
      !event.altKey &&
      !event.metaKey &&
      !event.ctrlKey;

    if (plainEnter) {
      event.preventDefault();
      insertNewline(composer);
    }
  }

  export function init(): void {
    if (window.__AWESOME_INPUT_LOADED__) return;
    window.__AWESOME_INPUT_LOADED__ = true;
    document.addEventListener("keydown", handleGlobalKeydown, true);
  }
}

AwesomeInput.init();
