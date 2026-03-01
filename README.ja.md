# Awesome Input

[English README](./README.md)

Awesome Input は、AI チャットサービスの入力体験を改善する Chrome 拡張です。現在は ChatGPT、Claude、Gemini を対象にしています。

## できること

- `Enter` で改行
- `Cmd+Enter` / `Ctrl+Enter` で送信

## インストール

1. このリポジトリを取得します。
2. `npm install` を実行します。
3. `npm run build` を実行します。
4. Chrome で `chrome://extensions` を開きます。
5. **デベロッパーモード** を有効にします。
6. **パッケージ化されていない拡張機能を読み込む** をクリックします。
7. `out/` ディレクトリを選択します。

## 開発

- ソースコードは `src/` 配下で管理します。
- ビルド成果物は `out/` に出力されます。
- 変更後は `npm run build` を実行し、Chrome で拡張を再読み込みしてください。
- E2E テストは `npm run test:e2e` で実行できます。

## 対象 URL

- `https://chatgpt.com/*`
- `https://chat.openai.com/*`
- `https://claude.ai/*`
- `https://gemini.google.com/*`

## 注意

- 対象サービスの DOM 構造に依存しているため、UI 変更で入力欄や送信ボタンの検出が壊れる可能性があります。

## v0.1

- `<br>` 依存の不具合を避けるよう改行処理を調整
- 複数行テキストの投入挙動を改善
