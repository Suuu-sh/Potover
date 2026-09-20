# ローカル認証の検証

本番の認証API・D1から分離して検証します。プロジェクトに含まれるWrangler 4を利用します。

1. `npm run db:local` でローカルDBにマイグレーションを適用します。
2. `npm run dev:api` でローカルAPIを起動します（127.0.0.1:8787）。
3. 別ターミナルで `npm run dev:local` を起動します（127.0.0.1:3001）。既存の3001の開発サーバーは先に停止します。
4. `/login/` の新規登録でテストアカウントを作成します。

`dev:local` はプロセス内でAPI URLを上書きするため、既存の `.env.local` と本番ビルド設定を変更しません。ローカルと本番のアカウントは共有されません。

正本は `worker/wrangler.local.jsonc`、DBスキーマは既存の `worker/migrations/` です。ローカル起動は必ず `--local` を使い、`--remote` やデプロイは行いません。ローカルDBは `.wrangler/` 以下に保持されます。

`Failed to fetch` はネットワークまたはCORSエラーです。フロントだけでなくAPIの起動、API URL、Originを確認してください。ローカル専用エントリは `localhost:3000` / `127.0.0.1:3000` と `localhost:3001` / `127.0.0.1:3001` を許可し、本番のCORSは変更しません。
