# Awesome Input

AI チャットの入力を快適にする Chrome 拡張です。現在は ChatGPT 系 URL を対象にしています。

## できること

- `Enter` で改行
- `Cmd+Enter` / `Ctrl+Enter` で送信

## インストール

1. このフォルダをローカルに保存
2. `npm install`
3. `npm run build`
4. Chrome で `chrome://extensions` を開く
5. 右上の **デベロッパーモード** を ON
6. **パッケージ化されていない拡張機能を読み込む** を押す
7. `out/` ディレクトリを選ぶ

## 開発

- ソースコードは `src/` 配下で管理します。
- TypeScript のビルド成果物は `out/` に出力されます。
- 修正後は `npm run build` を実行し、Chrome 側で拡張機能を再読み込みしてください。

## 対象URL

- `https://chatgpt.com/*`
- `https://chat.openai.com/*`

## 注意

- ChatGPT 側の DOM / ボタン構造が変わると送信ボタン検出が壊れる可能性があります。


## v0.1.1

- Enter の改行処理を `<br>` 挿入から `\n` 挿入寄りに修正
- 複数行テキスト投入も `<br>` ベースから改行文字ベースに修正
