# Repository Guidelines

## プロジェクト構成
このリポジトリは、Manifest V3 ベースの Chrome 拡張です。ソースは `src/` に集約し、ビルド成果物は `out/` に出力します。

- `src/*.ts`: content script の TypeScript 実装です。機能ごとに分割します。
- `src/manifest.json`: 配布用 manifest のソースです。
- `scripts/copy-assets.mjs`: manifest を `out/` にコピーします。
- `README.md`: インストール手順、対象 URL、変更履歴を記載しています。

新しい実装コードは `src/` に追加し、`out/` は常に生成物として扱ってください。

## ビルド・テスト・開発コマンド
TypeScript をビルドしてから Chrome 上で確認します。

- `npm install`
  開発依存をインストールします。
- `npm run build`
  `tsc` を実行し、成果物を `out/` に出力します。
- `npm run test:e2e`
  拡張をビルドし、ChatGPT / Gemini 向けの E2E 回帰テストを実行します。
- `open chrome://extensions`
  Chrome の拡張機能管理画面を開きます。
- `Developer mode` を有効化し、`Load unpacked` で `out/` を読み込みます。
- 修正後は再度 `npm run build` を実行し、拡張機能カードの `Reload` を押して反映を確認します。

補助的に `git status` と `git diff` を使って差分確認を行ってください。

## コーディング規約と命名
JSON と TypeScript は既存コードに合わせて 2 スペースインデントを使います。TypeScript は bundler なしで `tsc` だけで出力できる構成を維持してください。

- 関数・変数は `camelCase` (`findSendButton`)
- 名前空間は `AwesomeInput` に統一する

ChatGPT / Claude / Gemini 側の DOM 変更に弱いため、セレクタは明示的かつ防御的に書いてください。

## テスト方針
自動テストは未整備です。以下の URL で手動確認を行います。

- `https://chatgpt.com/*`
- `https://chat.openai.com/*`
- `https://claude.ai/*`
- `https://gemini.google.com/*`

最低限、`Enter` で改行、`Cmd/Ctrl+Enter` で送信を確認してください。送信ボタン検出まわりを触る場合は、各対象サービスの応答完了後の再送信可否も確認します。

## コミット・PR ガイド
履歴はまだ少ないため、コミットメッセージは短く、命令形で変更内容が分かる形にしてください。例: `送信ボタン検出を修正`、`ポップアップ余白を調整`

Pull Request には以下を含めてください。

- 変更内容の要約
- 手動確認手順と確認した URL
- UI 変更時のスクリーンショットまたは録画
- 追加した DOM 依存や壊れやすい前提の説明

## セキュリティと設定
この拡張は対象 AI チャットのドメイン上でのみ動作します。`manifest.json` の `matches` は、必要性が明確な場合を除き拡大しないでください。入力内容を不要に保存・送信する実装は避けてください。
