# Chatbot UI 開発者ガイド

開発者向けの簡単なガイドを記載します。
本ソフトウェアは [Chatbot UI の legacy ブランチ](https://github.com/mckaywrigley/chatbot-ui/tree/legacy) を母体として開発しています。

## 技術スタック

- フロントエンド:
  - Next.js / React
  - Tailwind CSS
- バックエンド:
  - Next.js (SSR)

他、本プロジェクトでは、 Podman の利用を前提としています。

## 環境構築

[README](../README.md) を参照して環境を構築してください。

## プロジェクト構造

### ディレクトリ毎の役割

- `app/`: [Next.js における App Router](https://nextjs.org/docs/getting-started/project-structure)
- `components/`: React コンポーネントを格納する
- `dev/`: 社内にhttps接続する際に利用する証明書等を格納する
- `docs/`: ドキュメント類を格納する
- `k8s/`: 未使用
- `public/`: [Next.js サーバから静的ファイルを配信する場合ここにファイルを格納する](https://nextjs.org/docs/getting-started/project-structure)
- `styles/`: ページ全体に適用する CSS
- `types/`: TypeScript 型定義ファイル
- `utils/`: React コンポーネントから独立した処理を定義する

### ソースコードの構造
`index.tsx` の `handleSend` 関数が esre-ui の API を実行している部分です。
`handleSend` はユーザのメッセージ送信ボタン (メッセージ入力欄右にある紙飛行機アイコン) をクリックした際に実行されます。

関数内の `fetch` 関数を呼び出している箇所で、REST API の呼び出しが実行されますが、
直接 LangServe の API を実行するのではなく、Next.js 上でラップした REST API が実行されます。

例えば、モデルに `llm-only` を選択している場合、fetch 関数からまず `POST /api/langchain/llm` が呼ばれます。
この `/api/langchain/llm` に相当する部分は、Next.js の規約に従って `app/api/langchain/llm` ディレクトリの中の`route.ts`
ファイルに 実装されています。
`route.ts` ファイルの中では、esre-ui サーバに対して再度 `fetch` 関数を呼んでおり、esre-ui
から返ってきたレスポンスを `POST /api/langchain/llm` のレスポンスとして返しています 。

モデルとどの REST API が実行されるかの対応は、 `types/chat.ts` ファイルの、`Models` オブジェクトに定義しています。

## 実行方法

以下のコマンドでサーバが起動します。

```shell
$ npm run dev
```

## FAQ
随時記載する。
