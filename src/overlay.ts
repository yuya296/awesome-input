namespace AwesomeInput {
  function createButton(
    label: string,
    className: string,
    onClick: () => void | Promise<void>,
  ): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `${STYLE_SCOPE}-btn ${className}`.trim();
    button.textContent = label;
    button.addEventListener("click", () => {
      void onClick();
    });
    return button;
  }

  function getRowTextareas(): HTMLTextAreaElement[] {
    return Array.from(
      state.list?.querySelectorAll(`.${STYLE_SCOPE}-textarea`) || [],
    ).filter((el): el is HTMLTextAreaElement => el instanceof HTMLTextAreaElement);
  }

  async function sendSingleRow(textarea: HTMLTextAreaElement): Promise<void> {
    const text = textarea.value.trimEnd();
    if (!text || state.queueRunning) return;

    if (!setComposerText(text)) {
      showToast("ChatGPT の入力欄が見つかりませんでした");
      return;
    }

    if (!sendCurrentDraft()) {
      showToast("送信ボタンが見つかりませんでした");
      return;
    }

    showToast("1件送信しました");
  }

  async function sendAllRows(): Promise<void> {
    if (state.queueRunning) return;

    const items = getRowTextareas()
      .map((el) => el.value.trimEnd())
      .filter(Boolean);

    if (items.length === 0) {
      showToast("送信するテキストがありません");
      return;
    }

    state.queueRunning = true;
    state.queueCanceled = false;
    setQueueUi(true);

    try {
      for (let index = 0; index < items.length; index += 1) {
        if (state.queueCanceled) break;

        if (!setComposerText(items[index])) {
          throw new Error("ChatGPT の入力欄が見つかりませんでした");
        }

        if (!sendCurrentDraft()) {
          throw new Error("送信ボタンが見つかりませんでした");
        }

        showToast(`${index + 1}/${items.length} を送信しました`);
        const ready = await waitUntilReady();
        if (!ready && !state.queueCanceled) {
          throw new Error("次の送信待ちでタイムアウトしました");
        }
      }

      showToast(state.queueCanceled ? "連続送信を中断しました" : "すべて送信しました");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "送信中にエラーが発生しました");
    } finally {
      state.queueRunning = false;
      state.queueCanceled = false;
      setQueueUi(false);
    }
  }

  function setQueueUi(running: boolean): void {
    const allButtons = state.overlay?.querySelectorAll(`.${STYLE_SCOPE}-btn`) || [];
    for (const button of Array.from(allButtons)) {
      if (!(button instanceof HTMLButtonElement)) continue;

      if (button.id === `${STYLE_SCOPE}-cancel-all`) {
        button.disabled = !running;
      } else {
        button.disabled = running;
      }
    }
  }

  function createRow(value: string = ""): HTMLDivElement {
    const row = document.createElement("div");
    row.className = `${STYLE_SCOPE}-row`;

    const textarea = document.createElement("textarea");
    textarea.className = `${STYLE_SCOPE}-textarea`;
    textarea.placeholder = "1行目のプロンプト";
    textarea.value = value;
    textarea.rows = 3;

    textarea.addEventListener("keydown", (event) => {
      const isSendKey =
        event.key === "Enter" &&
        !event.shiftKey &&
        !event.altKey &&
        !event.isComposing &&
        (event.metaKey || event.ctrlKey);

      if (!isSendKey) return;
      event.preventDefault();
      void sendSingleRow(textarea);
    });

    const controls = document.createElement("div");
    controls.className = `${STYLE_SCOPE}-row-controls`;

    const sendOne = createButton("送信", `${STYLE_SCOPE}-btn-primary`, () =>
      sendSingleRow(textarea),
    );
    const duplicate = createButton("複製", "", () => {
      const nextRow = createRow(textarea.value);
      row.insertAdjacentElement("afterend", nextRow);
      textarea.focus();
    });
    const remove = createButton("削除", "", () => {
      const siblings = state.list?.querySelectorAll(`.${STYLE_SCOPE}-row`) || [];
      if (siblings.length <= 1) {
        textarea.value = "";
        textarea.focus();
        return;
      }

      row.remove();
    });

    controls.append(sendOne, duplicate, remove);
    row.append(textarea, controls);
    return row;
  }

  function buildOverlay(): void {
    const root = document.createElement("div");
    root.id = OVERLAY_ID;
    root.className = `${STYLE_SCOPE}-hidden`;

    root.innerHTML = `
      <div class="${STYLE_SCOPE}-backdrop"></div>
      <div class="${STYLE_SCOPE}-panel" role="dialog" aria-modal="true" aria-label="複数入力ポップアップ">
        <div class="${STYLE_SCOPE}-header">
          <div>
            <div class="${STYLE_SCOPE}-title">複数入力</div>
            <div class="${STYLE_SCOPE}-subtitle">Ctrl+G で開閉 / Cmd(Ctrl)+Enter で行単位送信</div>
          </div>
        </div>
        <div class="${STYLE_SCOPE}-list"></div>
        <div class="${STYLE_SCOPE}-footer">
          <div class="${STYLE_SCOPE}-left-actions"></div>
          <div class="${STYLE_SCOPE}-right-actions"></div>
        </div>
      </div>
    `;

    const list = root.querySelector(`.${STYLE_SCOPE}-list`);
    const left = root.querySelector(`.${STYLE_SCOPE}-left-actions`);
    const right = root.querySelector(`.${STYLE_SCOPE}-right-actions`);
    if (
      !(list instanceof HTMLDivElement) ||
      !(left instanceof HTMLDivElement) ||
      !(right instanceof HTMLDivElement)
    ) {
      return;
    }

    state.list = list;
    state.list.append(createRow(""), createRow(""), createRow(""));

    const addRow = createButton("＋追加", "", () => {
      const row = createRow("");
      state.list?.appendChild(row);
      row.querySelector("textarea")?.focus();
    });

    const sendAll = createButton("すべて送信", `${STYLE_SCOPE}-btn-primary`, () =>
      sendAllRows(),
    );
    sendAll.id = `${STYLE_SCOPE}-send-all`;

    const cancel = createButton("中断", "", () => {
      state.queueCanceled = true;
    });
    cancel.id = `${STYLE_SCOPE}-cancel-all`;
    cancel.disabled = true;

    const close = createButton("閉じる", "", () => {
      closeOverlay();
    });
    close.id = `${STYLE_SCOPE}-close`;

    left.append(addRow);
    right.append(cancel, sendAll, close);

    root.querySelector(`.${STYLE_SCOPE}-backdrop`)?.addEventListener("click", () => {
      if (!state.queueRunning) closeOverlay();
    });

    root.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !state.queueRunning) {
        event.preventDefault();
        closeOverlay();
      }
    });

    document.body.appendChild(root);
    state.overlay = root;
  }

  export function openOverlay(): void {
    if (!state.overlay) buildOverlay();
    state.overlay?.classList.remove(`${STYLE_SCOPE}-hidden`);
    state.overlay?.querySelector("textarea")?.focus();
  }

  export function closeOverlay(): void {
    state.overlay?.classList.add(`${STYLE_SCOPE}-hidden`);
  }

  export function toggleOverlay(): void {
    if (!state.overlay || state.overlay.classList.contains(`${STYLE_SCOPE}-hidden`)) {
      openOverlay();
      return;
    }

    closeOverlay();
  }
}
