# ローカル認証の検証

本番の認証API・D1から分離して検証します。プロジェクトに含まれるWrangler 4を利用します。

1. `npm run db:local` でローカルDBにマイグレーションを適用します。
2. `npm run dev:all` で認証APIと画面をまとめて起動します（127.0.0.1:8787 / 127.0.0.1:3000）。
3. `/login/` の新規登録でテストアカウントを作成します。

`dev:all` はAPIと画面を同じコマンドで起動し、画面側のAPI URLもローカルへ固定します。ローカルと本番のアカウントは共有されません。

個別に起動したい場合は、`npm run dev:api` と `npm run dev:local`（127.0.0.1:3001）を使えます。本番用の静的ビルドは `npm run build:production` を使ってください。ローカル用の `.env.local` が本番ビルドへ混ざらないようにAPI URLを明示しています。

正本は `worker/wrangler.local.jsonc`、DBスキーマは既存の `worker/migrations/` です。ローカル起動は必ず `--local` を使い、`--remote` やデプロイは行いません。ローカルDBは `.wrangler/` 以下に保持されます。

ログイン画面で接続エラーが出た場合は、まず `npm run dev:all` が起動しているか確認してください。ローカル専用エントリは `localhost:3000` / `127.0.0.1:3000` と `localhost:3001` / `127.0.0.1:3001` を許可し、本番のCORSは変更しません。
