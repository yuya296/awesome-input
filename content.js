(() => {
  if (window.__CHATGPT_KEYFLOW_LOADED__) return;
  window.__CHATGPT_KEYFLOW_LOADED__ = true;

  const OVERLAY_ID = 'cgk-overlay-root';
  const STYLE_SCOPE = 'cgk';

  const state = {
    overlay: null,
    list: null,
    queueRunning: false,
    queueCanceled: false,
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function isMac() {
    return /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent);
  }

  function isOurElement(el) {
    return !!(el && el.closest && el.closest(`#${OVERLAY_ID}`));
  }

  function isEditable(el) {
    if (!(el instanceof HTMLElement)) return false;
    if (isOurElement(el)) return false;
    if (el instanceof HTMLTextAreaElement) return true;
    if (el instanceof HTMLInputElement) {
      const type = (el.type || '').toLowerCase();
      return type === 'text' || type === 'search';
    }
    return el.isContentEditable || el.getAttribute('contenteditable') === 'true' || el.getAttribute('role') === 'textbox';
  }

  function findComposer() {
    const active = document.activeElement;
    if (isEditable(active)) return active;

    const selectors = [
      'main form [contenteditable="true"][role="textbox"]',
      'form [contenteditable="true"][role="textbox"]',
      'main [contenteditable="true"]',
      'form textarea',
      'textarea'
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (isEditable(el)) return el;
    }
    return null;
  }

  function dispatchInput(el) {
    el.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true, data: null, inputType: 'insertText' }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function placeCaretAtEnd(el) {
    if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
      const end = el.value.length;
      el.setSelectionRange(end, end);
      return;
    }
    if (!(el instanceof HTMLElement) || !el.isContentEditable) return;

    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function insertNewline(el) {
    if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
      const start = el.selectionStart ?? el.value.length;
      const end = el.selectionEnd ?? el.value.length;
      const next = `${el.value.slice(0, start)}\n${el.value.slice(end)}`;
      el.value = next;
      el.setSelectionRange(start + 1, start + 1);
      dispatchInput(el);
      return;
    }

    if (!(el instanceof HTMLElement)) return;
    el.focus();

    let inserted = false;
    try {
      inserted = document.execCommand('insertText', false, '\n');
    } catch (_) {
      inserted = false;
    }

    if (!inserted) {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const text = document.createTextNode('\n');
      range.insertNode(text);
      range.setStartAfter(text);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }

    el.dispatchEvent(new InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      data: '\n',
      inputType: 'insertLineBreak'
    }));
    el.dispatchEvent(new InputEvent('input', {
      bubbles: true,
      cancelable: false,
      data: '\n',
      inputType: 'insertLineBreak'
    }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function setComposerText(text) {
    const el = findComposer();
    if (!el) return false;

    el.focus();

    if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
      el.value = text;
      dispatchInput(el);
      placeCaretAtEnd(el);
      return true;
    }

    if (!(el instanceof HTMLElement)) return false;

    let inserted = false;
    try {
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      inserted = document.execCommand('insertText', false, String(text));
    } catch (_) {
      inserted = false;
    }

    if (!inserted) {
      el.textContent = String(text);
      dispatchInput(el);
    } else {
      el.dispatchEvent(new InputEvent('beforeinput', {
        bubbles: true,
        cancelable: true,
        data: String(text),
        inputType: 'insertText'
      }));
      el.dispatchEvent(new InputEvent('input', {
        bubbles: true,
        cancelable: false,
        data: String(text),
        inputType: 'insertText'
      }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }

    placeCaretAtEnd(el);
    return true;
  }

  function isVisible(el) {
    if (!(el instanceof HTMLElement)) return false;
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
  }

  function isLikelySendButton(btn) {
    if (!(btn instanceof HTMLButtonElement)) return false;
    if (btn.disabled || !isVisible(btn) || isOurElement(btn)) return false;
    const label = `${btn.getAttribute('aria-label') || ''} ${btn.getAttribute('data-testid') || ''} ${btn.textContent || ''}`.toLowerCase();
    if (/stop|停止|regenerate|retry|voice|record|attach|upload|search|reason/.test(label)) return false;
    if (/send|送信/.test(label)) return true;
    if (btn.type === 'submit') return true;
    return false;
  }

  function findSendButton() {
    const selectors = [
      'button[data-testid="send-button"]',
      'button[data-testid*="send"]',
      'button[aria-label*="Send"]',
      'button[aria-label*="send"]',
      'button[aria-label*="送信"]',
      'form button[type="submit"]'
    ];

    for (const selector of selectors) {
      const buttons = Array.from(document.querySelectorAll(selector));
      const btn = buttons.find(isLikelySendButton);
      if (btn) return btn;
    }

    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(isLikelySendButton) || null;
  }

  function findStopButton() {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find((btn) => {
      if (!(btn instanceof HTMLButtonElement) || !isVisible(btn) || isOurElement(btn)) return false;
      const label = `${btn.getAttribute('aria-label') || ''} ${btn.getAttribute('data-testid') || ''} ${btn.textContent || ''}`.toLowerCase();
      return /stop|停止/.test(label);
    }) || null;
  }

  function sendCurrentDraft() {
    const composer = findComposer();
    if (!composer) return false;
    const sendButton = findSendButton();
    if (sendButton) {
      sendButton.click();
      return true;
    }

    const form = composer.closest('form');
    if (form && typeof form.requestSubmit === 'function') {
      form.requestSubmit();
      return true;
    }

    return false;
  }

  async function waitUntilReady(timeoutMs = 15 * 60 * 1000) {
    const started = Date.now();
    let busySeen = false;

    while (Date.now() - started < timeoutMs) {
      if (state.queueCanceled) return false;

      const stop = findStopButton();
      const send = findSendButton();
      if (stop) busySeen = true;

      if (busySeen) {
        if (!stop && !!send) return true;
      } else if (Date.now() - started > 1500 && !!send) {
        return true;
      }

      await sleep(700);
    }

    return false;
  }

  function createButton(label, className, onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `${STYLE_SCOPE}-btn ${className || ''}`.trim();
    button.textContent = label;
    button.addEventListener('click', onClick);
    return button;
  }

  function createRow(value = '') {
    const row = document.createElement('div');
    row.className = `${STYLE_SCOPE}-row`;

    const textarea = document.createElement('textarea');
    textarea.className = `${STYLE_SCOPE}-textarea`;
    textarea.placeholder = '1行目のプロンプト';
    textarea.value = value;
    textarea.rows = 3;

    textarea.addEventListener('keydown', async (event) => {
      const isSendKey = event.key === 'Enter' && !event.shiftKey && !event.altKey && !event.isComposing && (event.metaKey || event.ctrlKey);
      if (!isSendKey) return;
      event.preventDefault();
      await sendSingleRow(textarea);
    });

    const controls = document.createElement('div');
    controls.className = `${STYLE_SCOPE}-row-controls`;

    const sendOne = createButton('送信', `${STYLE_SCOPE}-btn-primary`, async () => {
      await sendSingleRow(textarea);
    });

    const duplicate = createButton('複製', '', () => {
      const next = createRow(textarea.value);
      row.insertAdjacentElement('afterend', next);
      textarea.focus();
    });

    const remove = createButton('削除', '', () => {
      const siblings = state.list?.querySelectorAll(`.${STYLE_SCOPE}-row`) || [];
      if (siblings.length <= 1) {
        textarea.value = '';
        textarea.focus();
        return;
      }
      row.remove();
    });

    controls.append(sendOne, duplicate, remove);
    row.append(textarea, controls);
    return row;
  }

  function getRowTextareas() {
    return Array.from(state.list?.querySelectorAll(`.${STYLE_SCOPE}-textarea`) || []);
  }

  async function sendSingleRow(textarea) {
    const text = textarea.value.trimEnd();
    if (!text || state.queueRunning) return;

    const ok = setComposerText(text);
    if (!ok) {
      showToast('ChatGPT の入力欄が見つかりませんでした');
      return;
    }

    const sent = sendCurrentDraft();
    if (!sent) {
      showToast('送信ボタンが見つかりませんでした');
      return;
    }

    showToast('1件送信しました');
  }

  async function sendAllRows() {
    if (state.queueRunning) return;

    const items = getRowTextareas()
      .map((el) => el.value.trimEnd())
      .filter(Boolean);

    if (items.length === 0) {
      showToast('送信するテキストがありません');
      return;
    }

    state.queueRunning = true;
    state.queueCanceled = false;
    setQueueUi(true);

    try {
      for (let i = 0; i < items.length; i += 1) {
        if (state.queueCanceled) break;

        const ok = setComposerText(items[i]);
        if (!ok) throw new Error('ChatGPT の入力欄が見つかりませんでした');

        const sent = sendCurrentDraft();
        if (!sent) throw new Error('送信ボタンが見つかりませんでした');

        showToast(`${i + 1}/${items.length} を送信しました`);
        const ready = await waitUntilReady();
        if (!ready && !state.queueCanceled) {
          throw new Error('次の送信待ちでタイムアウトしました');
        }
      }

      if (state.queueCanceled) {
        showToast('連続送信を中断しました');
      } else {
        showToast('すべて送信しました');
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : '送信中にエラーが発生しました');
    } finally {
      state.queueRunning = false;
      state.queueCanceled = false;
      setQueueUi(false);
    }
  }

  function setQueueUi(running) {
    const sendAll = document.getElementById(`${STYLE_SCOPE}-send-all`);
    const cancel = document.getElementById(`${STYLE_SCOPE}-cancel-all`);
    const allButtons = state.overlay?.querySelectorAll(`.${STYLE_SCOPE}-btn`) || [];

    allButtons.forEach((btn) => {
      if (!(btn instanceof HTMLButtonElement)) return;
      if (btn.id === `${STYLE_SCOPE}-cancel-all`) {
        btn.disabled = !running;
      } else if (btn.id === `${STYLE_SCOPE}-close`) {
        btn.disabled = running;
      } else {
        btn.disabled = running;
      }
    });

    if (sendAll instanceof HTMLButtonElement) sendAll.disabled = running;
    if (cancel instanceof HTMLButtonElement) cancel.disabled = !running;
  }

  function showToast(message) {
    let toast = document.getElementById(`${STYLE_SCOPE}-toast`);
    if (!toast) {
      toast = document.createElement('div');
      toast.id = `${STYLE_SCOPE}-toast`;
      toast.className = `${STYLE_SCOPE}-toast`;
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add(`${STYLE_SCOPE}-toast-visible`);
    clearTimeout(showToast._timer);
    showToast._timer = window.setTimeout(() => {
      toast.classList.remove(`${STYLE_SCOPE}-toast-visible`);
    }, 2200);
  }
  showToast._timer = 0;

  function buildOverlay() {
    const root = document.createElement('div');
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

    state.list = list;
    list.append(createRow(''), createRow(''), createRow(''));

    const addRow = createButton('＋追加', '', () => {
      const row = createRow('');
      state.list.appendChild(row);
      row.querySelector(`.${STYLE_SCOPE}-textarea`)?.focus();
    });

    const sendAll = createButton('すべて送信', `${STYLE_SCOPE}-btn-primary`, async () => {
      await sendAllRows();
    });
    sendAll.id = `${STYLE_SCOPE}-send-all`;

    const cancel = createButton('中断', '', () => {
      state.queueCanceled = true;
    });
    cancel.id = `${STYLE_SCOPE}-cancel-all`;
    cancel.disabled = true;

    const close = createButton('閉じる', '', () => {
      closeOverlay();
    });
    close.id = `${STYLE_SCOPE}-close`;

    left.append(addRow);
    right.append(cancel, sendAll, close);

    root.querySelector(`.${STYLE_SCOPE}-backdrop`).addEventListener('click', () => {
      if (!state.queueRunning) closeOverlay();
    });

    root.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !state.queueRunning) {
        event.preventDefault();
        closeOverlay();
      }
    });

    document.body.appendChild(root);
    state.overlay = root;
  }

  function openOverlay() {
    if (!state.overlay) buildOverlay();
    state.overlay.classList.remove(`${STYLE_SCOPE}-hidden`);
    const first = state.overlay.querySelector(`.${STYLE_SCOPE}-textarea`);
    first?.focus();
  }

  function closeOverlay() {
    if (!state.overlay) return;
    state.overlay.classList.add(`${STYLE_SCOPE}-hidden`);
  }

  function toggleOverlay() {
    if (!state.overlay || state.overlay.classList.contains(`${STYLE_SCOPE}-hidden`)) {
      openOverlay();
    } else {
      closeOverlay();
    }
  }

  document.addEventListener('keydown', (event) => {
    if (event.defaultPrevented) return;

    const target = event.target;
    const targetNode = target instanceof Node ? target : null;

    if (event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey && !event.isComposing && event.key.toLowerCase() === 'g') {
      event.preventDefault();
      toggleOverlay();
      return;
    }

    if (isOurElement(target)) return;

    const composer = findComposer();
    const targetIsComposer = !!(composer && targetNode && (targetNode === composer || composer.contains(targetNode)));
    if (!composer || !targetIsComposer) return;
    if (event.key !== 'Enter' || event.isComposing || event.keyCode === 229) return;

    const isSendKey = !event.shiftKey && !event.altKey && (event.metaKey || (!isMac() && event.ctrlKey) || (isMac() && event.ctrlKey));
    if (isSendKey) {
      event.preventDefault();
      sendCurrentDraft();
      return;
    }

    const plainEnter = !event.shiftKey && !event.altKey && !event.metaKey && !event.ctrlKey;
    if (plainEnter) {
      event.preventDefault();
      insertNewline(composer);
    }
  }, true);
})();
