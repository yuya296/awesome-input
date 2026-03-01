# テスト戦略

## 目的

E2E テストは、対応サービス上でこの拡張の中核動作を守るためのものです。

- `Enter` で改行
- `Cmd+Enter` / `Ctrl+Enter` で送信

拡張自身の回帰だけでなく、ChatGPT や Gemini 側の UI 変更で壊れたケースも検知することを目的にしています。

## 戦略

このリポジトリでは、E2E を 2 層で運用します。

- fixture E2E (`npm run test:e2e`): 制御しやすい HTML fixture を使う安定回帰。CI の基準信号として使います。
- live E2E (`npm run test:e2e:live`): 実際の ChatGPT / Gemini DOM を叩く smoke テスト。セレクタずれや導線変更の早期検知に使います。

## 失敗の意味

- fixture の失敗は、拡張ロジックの回帰であることが多いです。
- live の失敗は、拡張が実サイト DOM に追従できていないか、対象サイトの導線が変わって期待する composer / send button に到達できなくなった可能性が高いです。

live テストでは、期待する composer や send button が見つからない場合も意図的に失敗させます。その失敗自体が検知したいシグナルです。
