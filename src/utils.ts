namespace AwesomeInput {
  export function currentHostname(): string {
    return window.location.hostname.toLowerCase();
  }

  export function isMac(): boolean {
    return /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent);
  }

  export function isSendShortcut(event: KeyboardEvent): boolean {
    if (event.shiftKey || event.altKey || event.isComposing) return false;

    if (isMac()) {
      return event.metaKey && !event.ctrlKey;
    }

    return event.ctrlKey && !event.metaKey;
  }
}
