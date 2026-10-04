# ローカル開発・認証の検証

本番の認証API・D1から分離して検証します。プロジェクトに含まれるWrangler 4を利用します。

1. `npm run db:local`でローカルDBにマイグレーションを適用します。
2. (任意) `worker/.dev.vars`にローカル専用のランダムな`BATCH_INGEST_TOKEN`を記述すると、ローカルWorkerで記事同期APIも試せます。このファイルはGit管理対象外です。本番用tokenを置かないでください。
3. `npm run dev:all`で認証APIと画面をまとめて起動します（127.0.0.1:8787 / 127.0.0.1:3000）。
4. `/login/`の新規登録でテストアカウントを作成します。

`dev:all`はAPIと画面を同じコマンドで起動し、画面側のAPI URLもローカルへ固定します。ローカルと本番のアカウントは共有されません。

ローカルQAでGoogle AdSenseへの通信を止める場合は、`NEXT_PUBLIC_ADSENSE_DISABLED=true npm run dev:all`（画面を個別起動する場合は`NEXT_PUBLIC_ADSENSE_DISABLED=true npm run dev:local`）を使用します。値が`true`と完全一致するときだけ広告スクリプトを挿入しません。未設定または`false`では既存の広告設定を維持します。フラグ変更後は画面の開発サーバーを再起動してください。本番環境の変数は変更しません。

個別に起動したい場合は、`npm run dev:api`と`npm run dev:local`（127.0.0.1:3001）を使えます。本番用の静的ビルドは`npm run build:production`を使ってください。ローカル用の`.env.local`が本番ビルドへ混ざらないようにAPI URLを明示しています。

`npm run sync:d1:upload` / `npm run sync:d1:export` / `npm run sync:d1`は接続先`POTOVER_API_URL`を必須とし、未指定時に本番APIへ接続しません。ローカルD1へ同期するときは、`POTOVER_API_URL=http://127.0.0.1:8787`とローカル専用`POTOVER_INGEST_TOKEN`を設定します。`npm run build:pages`は本番公開用で、公開承認ゲートとD1 URLが設定されていない場合に停止します。

正本は`worker/wrangler.local.jsonc`、DBスキーマは`worker/migrations/`です。ローカル起動は必ず`--local`を使い、`--remote`やデプロイは行いません。ローカルDBは`.wrangler/`以下に保持されます。

Next.js起動時に元データから`data/articles.public.json`を自動生成します。これはタイトル・リンク等とPotover用の分野別イラスト情報だけの配信用データで、元の`data/articles.json`は変更しません。内部D1 exportにはローカル専用`POTOVER_INGEST_TOKEN`が必要です。初回公開方針のQAでは、記事詳細・モーダルに概要/抽出見出し/元画像がないこと、一覧・おすすめ・ホームのイラストが自サイト配信の8画像に限定されることと、元リンク・ブックマーク・学習履歴が引き続き使えることを確認します。

## ゲストで画面を確認する

認証APIを起動せずにログイン後の画面を確認したいときは、`npm run dev`などの開発サーバーで`/login/`を開き、「ゲストで試す」を押します。`guest@localhost`としてログインした状態になり、ブックマーク・学習履歴・設定・フォローはこのブラウザのlocalStorage（`potover-local-guest`）にだけ保存されます。APIへは通信しません。

この機能は`NODE_ENV=development`のときだけ有効で、本番ビルドではボタンも処理も含まれません。実装は`lib/local-guest.ts`です。

ログイン画面で接続エラーが出た場合は、まず`npm run dev:all`が起動しているか確認してください。ローカル専用エントリは`localhost:3000` / `127.0.0.1:3000`と`localhost:3001` / `127.0.0.1:3001`を許可し、本番のCORSは変更しません。

## 必要なランタイム

Node.js 24（`.nvmrc`）を使用します。`npm ci`後に`npm run verify`でCIと同じ検証、`npm run test:integration`で本番を使用しないworkerd/D1テストを実行できます。
