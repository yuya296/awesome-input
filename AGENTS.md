# Repository Guidelines

## プロジェクト構成
このリポジトリは、Manifest V3 ベースの Chrome 拡張です。構成はフラットで、主要ファイルは次のとおりです。

- `manifest.json`: 拡張機能の設定、対象 URL、読み込むスクリプトと CSS を定義します。
- `content.js`: キー操作、ポップアップ UI、複数送信キュー、ChatGPT の DOM 操作を扱う本体です。
- `styles.css`: オーバーレイとポップアップの見た目を定義します。
- `README.md`: インストール手順、対象 URL、変更履歴を記載しています。

現状、`src/`、ビルド成果物、テスト用ディレクトリはありません。新規ファイル追加は最小限にしてください。

## ビルド・テスト・開発コマンド
このリポジトリにビルド工程はありません。開発は Chrome 上で直接確認します。

- `open chrome://extensions`
  Chrome の拡張機能管理画面を開きます。
- `Developer mode` を有効化し、`Load unpacked` でこのフォルダを読み込みます。
- 修正後は拡張機能カードの `Reload` を押して反映を確認します。

補助的に `git status` と `git diff` を使って差分確認を行ってください。

## コーディング規約と命名
JSON、JavaScript、CSS は既存コードに合わせて 2 スペースインデントを使います。JavaScript は Chrome の content script でそのまま動く素の ES 構文を維持してください。

- 関数・変数は `camelCase` (`findSendButton`)
- 定数は `UPPER_SNAKE_CASE` (`OVERLAY_ID`)
- CSS クラスと DOM ID は `cgk-` 接頭辞で衝突を避ける

ChatGPT 側の DOM 変更に弱いため、セレクタは明示的かつ防御的に書いてください。

## テスト方針
自動テストは未整備です。以下の URL で手動確認を行います。

- `https://chatgpt.com/*`
- `https://chat.openai.com/*`

最低限、`Enter` で改行、`Cmd/Ctrl+Enter` で送信、`Ctrl+G` でポップアップ開閉、行単位送信、「すべて送信」を確認してください。送信ボタン検出まわりを触る場合は、ChatGPT の応答完了後の再送信可否も確認します。

## コミット・PR ガイド
履歴はまだ少ないため、コミットメッセージは短く、命令形で変更内容が分かる形にしてください。例: `送信ボタン検出を修正`、`ポップアップ余白を調整`

Pull Request には以下を含めてください。

- 変更内容の要約
- 手動確認手順と確認した URL
- UI 変更時のスクリーンショットまたは録画
- 追加した DOM 依存や壊れやすい前提の説明

## セキュリティと設定
この拡張は ChatGPT ドメイン上でのみ動作します。`manifest.json` の `matches` は、必要性が明確な場合を除き拡大しないでください。入力内容を不要に保存・送信する実装は避けてください。
