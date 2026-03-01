interface Window {
  __AWESOME_INPUT_LOADED__?: boolean;
}

namespace AwesomeInput {
  function handleGlobalKeydown(event: KeyboardEvent): void {
    const targetNode = event.target instanceof Node ? event.target : null;

    const composer = findEditableHost(targetNode) || findComposer();
    const targetIsComposer =
      composer &&
      targetNode &&
      (targetNode === composer || composer.contains(targetNode));

    if (!composer || !targetIsComposer) return;
    if (event.key !== "Enter" || event.isComposing || event.keyCode === 229) return;

    if (isSendShortcut(event)) {
      if (event.defaultPrevented) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
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
      event.stopPropagation();
      event.stopImmediatePropagation();
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
