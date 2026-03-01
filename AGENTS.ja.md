# Repository Guidelines

[English](./AGENTS.md)

## プロジェクト構成
このリポジトリは Manifest V3 ベースの Chrome 拡張です。ソースは `src/` に置き、`out/` は生成物として扱ってください。

- `src/*.ts`: 責務ごとに分割した content script 実装
- `src/manifest.json`: ビルド時にコピーする manifest のソース
- `scripts/copy-assets.mjs`: `manifest.json` を `out/` にコピー
- `tests/`: 拡張の挙動を確認する Playwright E2E

## ビルド・テスト・開発コマンド

- `npm install`: 開発依存をインストール
- `npm run build`: TypeScript をコンパイルして `out/` に展開
- `npm run test:e2e`: 再ビルドして Playwright E2E を実行
- `chrome://extensions` で `out/` を読み込み、ビルド後は `Reload` で反映

## コーディング規約と命名
JSON と TypeScript は 2 スペースインデントを使います。プロジェクト方針が変わらない限り、bundler なしで `tsc` だけで出力できる構成を維持してください。

- 関数・変数は `camelCase`
- 共有ロジックは `AwesomeInput` 名前空間に集約
- ChatGPT と Gemini の DOM 変更に備えて防御的なセレクタを書く

## テスト方針
自動回帰は `npm run test:e2e` を使います。加えて、対応サービス上で次を手動確認してください。

- `Enter` で改行
- `Cmd+Enter` / `Ctrl+Enter` で送信
- 応答完了後も送信ボタン検出が壊れていないこと
- `claude.ai` は現在サポート対象外として扱ってください

## コミット・PR ガイド
コミットメッセージは短く具体的に書いてください。PR には変更要約、確認した URL、手動確認手順、必要なら UI のスクリーンショットや録画を含めてください。

## セキュリティと設定
`src/manifest.json` の `matches` は、明確なプロダクト要件がある場合だけ拡張してください。入力内容を不要に保存・送信する実装は避けてください。
