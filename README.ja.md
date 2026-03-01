# Awesome Input

[English](./README.md) | 日本語

Awesome Input は、AI チャットサービスの入力体験を改善する Chrome 拡張です。現在は ChatGPT と Gemini を対象にしています。

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
- fixture E2E は `npm run test:e2e` で実行できます。
- 実サイト smoke E2E は `npm run test:e2e:live` で実行できます。
- 両方まとめて実行する場合は `npm run test:e2e:all` を使います。
- テストの目的と戦略は [docs/testing.md](./docs/testing.md) を参照してください。

## 対象 URL

- `https://chatgpt.com/*`
- `https://chat.openai.com/*`
- `https://gemini.google.com/*`

## 注意

- 対象サービスの DOM 構造に依存しているため、UI 変更で入力欄や送信ボタンの検出が壊れる可能性があります。
- `tests/extension.fixture.e2e.spec.js` は安定した fixture 回帰、`tests/live/*.e2e.spec.js` は ChatGPT/Gemini の実サイト DOM を検証します。
- live E2E は composer や send button が見つからない場合に失敗します。対象サイトの導線や DOM 変更を早く検知するためです。
- live E2E はデフォルトで送信ボタンを差し替えて実送信を抑止します。実送信が必要なローカル確認時だけ `LIVE_E2E_ALLOW_REAL_SEND=1` を使ってください。
- `claude.ai` は現在未対応で、拡張の `matches` に含めていません。

## v0.1

- ChatGPT と Gemini に対応
