namespace AwesomeInput {
  let toastTimer = 0;

  export function showToast(message: string): void {
    let toast = document.getElementById(`${STYLE_SCOPE}-toast`);
    if (!(toast instanceof HTMLDivElement)) {
      toast = document.createElement("div");
      toast.id = `${STYLE_SCOPE}-toast`;
      toast.className = `${STYLE_SCOPE}-toast`;
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add(`${STYLE_SCOPE}-toast-visible`);
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast?.classList.remove(`${STYLE_SCOPE}-toast-visible`);
    }, 2200);
  }
}
