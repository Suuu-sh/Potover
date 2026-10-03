# Deployment

## 現在の公開状態

記事データの正本はCloudflare D1です。リポジトリの`data/articles.json`は従来の収集・内部同期データとして保持します。フロントエンドは直接importせず、許可項目だけを抽出した`data/articles.public.json`を使用します。この生成ファイルはGit管理外です。

初回公開ではタイトル・元記事リンク・情報源・カテゴリ・日付等だけを配信します。Next.js設定の読込時に公開用JSONを生成し、Pagesでは匿名公開APIから別ファイルへ取得したスナップショットを再度許可項目に絞ってビルドします。概要・本文抜粋・見出し・画像URL等を画面上だけで隠してブラウザ用データへ残す設計にはしません。

利用者データの保持方針はプライバシーポリシーに記載しています。初回公開は`data/publication-scope.json`に固定した9情報源・1,244件のタイトル/リンク一覧です。PokerNewsとm Portalの計162件は保留し、元データは削除しません。公開・収集のゲートは別々に管理し、初回公開の承認を自動収集の承認として扱いません。

- `POTOVER_PUBLICATION_READY=true`: GitHub ActionsのVariablesとCloudflare Pagesのproduction環境変数の両方に設定すると、Worker/Pagesの本番ビルドを許可します。
- `POTOVER_COLLECTION_APPROVED=true`: GitHub ActionsのVariablesに設定すると、日次コンテンツ収集とD1更新を許可します。公開承認と収集対象ごとの利用条件・robots.txtを確認してから設定してください。

ビルドスクリプトは公開ゲートがない場合に失敗し、本番APIへの同期スクリプトは`POTOVER_API_URL`を明示しない限り実行しません。誤った本番更新を防ぐための意図的な動作です。

Cloudflare PagesのPreviewも同じ`npm run build:pages`を使う場合は公開ゲートで停止します。公開アクセス可能なPreviewへのデプロイも公開に当たるため、未承認の実記事データを掲載する目的でPreview環境に`POTOVER_PUBLICATION_READY=true`を設定しないでください。承認前の画面・認証検証は`docs/local-development.md`のローカルUIとローカルD1で行います。

## デプロイ構成

FrontendはCloudflare PagesのGit連携で、`main`へのpush時に`npm run build:pages`を実行します。Pagesビルドは公開ゲート通過後にD1から記事スナップショットを取得してビルドします。BackendのWorkerは、`main`へのpush時にGitHub Actionsがマイグレーションを適用してからデプロイします。`workflow_dispatch`を`main`以外で実行しても本番デプロイしません。

初回の公開URLは`https://potover.pages.dev`です。sitemapとrobotsは`lib/site-url.ts`の同じ値を使います。独自ドメインは初回公開の必須条件ではありません。将来ドメインを切り替える場合は、Pagesの接続・疎通を確認してからこの定義も更新します。

### Cloudflare PagesのGit連携

Cloudflare Dashboardの Workers & Pages から `potover` を開き、Settings > Builds > Git repository でGitHubの `Suuu-sh/Potover` を接続してください。

- Production branch: `main`
- Build command: `npm run build:pages`
- Build output directory: `out`
- Root directory: `/`
- Production environment variables: `POTOVER_API_URL=https://potover-api.suuu-sh.workers.dev`、`POTOVER_PUBLICATION_READY=true`（承認後のみ）

### GitHub Secrets / Variables

リポジトリの Settings > Secrets and variables > Actions に以下を登録します。

**Secrets**

- `CLOUDFLARE_API_TOKEN`: Workers と Pages のデプロイ権限を持つAPI Token
- `CLOUDFLARE_ACCOUNT_ID`: `648687d1fdb3e6b3e539ebca5c4415a7`
- `POTOVER_INGEST_TOKEN`: 記事同期用のランダムな秘密値。Workerの`BATCH_INGEST_TOKEN`にも同じ値を設定します。

**Variables（運営者の確認完了後のみ）**

- `POTOVER_PUBLICATION_READY=true`: 本番公開の承認後に設定します。Cloudflare Pages production環境にも設定が必要です。
- `POTOVER_COLLECTION_APPROVED=true`: `docs/sources.md`の収集対象ごとの利用条件を確認した後に設定します。

`CLOUDFLARE_API_TOKEN`と`POTOVER_INGEST_TOKEN`はファイルやソースコードには保存しません。

### 初回セットアップと記事同期

1. Cloudflare Pages/Workersの接続、D1の`potover`データベース、GitHub Secretsを設定します。
2. `main`への反映でWorkerのD1マイグレーションを適用し、Worker secretを登録します。
3. Workerが稼働したら、`main`のDeploy Potoverを`workflow_dispatch`で一度実行し、`seed_approved_snapshot=true`を明示します。`npm run seed:d1:approved`が、元の保存データから承認済み1,244件と9情報源だけを一時ファイルへ選別してupsertします。続けて匿名公開APIのURL・slug・sourceSlug集合と情報源集合がマニフェストに完全一致することを検証します。元の`data/articles.json`や対象外のD1行は削除せず、Gitへのsnapshot自動pushも行いません。通常のpushによるdeployはseedしません。
4. PagesはD1の匿名公開APIを読み出して`data/articles.public.json`を作り、記事ページをビルドします。元の`data/articles.json`は上書きしません。`POTOVER_PUBLIC_DATA_INPUT`はこのビルド内部で設定する入力パスで、本番ダッシュボードへ追加する変数ではありません。記事JSONを手編集しても正本には反映されません。

内部の`sync:d1:export`と`sync:d1`は、既存の`POTOVER_INGEST_TOKEN`を使って認証付き`GET /api/articles/export`と`GET /api/sources/export`から全保存項目を取得します。匿名の`GET /api/articles`と`GET /api/sources`は初回公開マニフェストの範囲だけを返します。公開exportは1,406件という元データの総数ではなく、承認済み1,244件のURL・slug・sourceSlug集合を照合します。同数の別記事・欠落・余分な記事も拒否し、件数減少ガードを単に無効化しません。内部export用tokenをPagesや公開URLへ渡す必要はありません。

`POTOVER_PUBLICATION_READY`が未設定の間、Pagesの本番ビルドとWorker本番デプロイは意図的に停止します。初回公開範囲と本番移行手順の確認後にだけ公開ゲートを解除してください。初回seedにも自動収集ゲートを使わず、`POTOVER_COLLECTION_APPROVED`は未設定を維持します。

### 会員データの自動削除

会員の自動削除は、Worker変数`POTOVER_ACCOUNT_RETENTION_ENABLED`が文字列`true`と完全一致する場合だけ実行します。既定は停止です。公開・収集のゲートとは独立しており、公開承認だけでこの変数を有効化しないでください。期限切れセッションとレート制限記録の掃除、本人が実行する退会は従来どおりです。

`0007_verified_user_activity.sql`は既存のmigrationを変更せず、全既存会員の`last_activity_verified`を0で追加します。`0006`で登録日からコピーした日時を実利用日時として扱いません。以後の正常な認証利用だけが1へ更新し、自動削除を承認して有効化した場合も、確認済みの最終利用から2年を超える会員だけが対象です。未確認の既存会員の移行猶予・保持方針を別途確定し、本番公開前にポリシーとの整合を確認してください。

このガードを持たない旧Workerは新しい変数を無視します。migration単独では旧Workerの削除を止められません。本番移行前に稼働中Workerのcronと復旧先を確認し、必要な停止措置を別途承認してください。ガードのない版や公開データの項目制限を持たない版へ、単純にロールバックしないでください。

### Google AdSense

初回公開から広告を有効にする方針です。既存のPublisher IDの既定動作を維持します。ローカルQAだけでは`NEXT_PUBLIC_ADSENSE_DISABLED=true`で外部広告スクリプトを止められます。本変更で本番環境変数やAdSenseの審査状態を変更・確認したことにはなりません。

AdSenseを有効にする場合は、Cloudflare Pagesのビルド環境変数とローカルの`.env.local`に以下を設定します。

- `NEXT_PUBLIC_ADSENSE_CLIENT`: AdSenseのPublisher ID（`ca-pub-...`）
- `NEXT_PUBLIC_ADSENSE_SLOT`: 表示用広告ユニットのスロットID（任意。空欄の場合はAdSenseのAuto adsを使用）

サイトをAdSenseに登録して審査を申請し、ステータスが`Ready`になってから配信が始まります。ビルド時にPublisher IDが設定されている場合は、`/ads.txt`も自動生成されます。

## リリースの検証と順序

- `npm ci && npm run verify` で型・lint・unit・本番静的exportを確認します。
- `npm run test:integration` は一時的なworkerd/SQLite D1に全7 migrationを適用し、登録・ログイン・ユーザーデータ・パスワード変更・退会・記事再同期を確認します。本番には接続しません。
- `build:production` は`.env.local`にローカルAPI URLがあっても本番APIへ固定します。変更先はHTTPS originの`POTOVER_API_URL`で明示します。
- D1未移行時のPages先行ビルドは失敗します。公開承認後はWorker migration/deploy → 承認済みseed → Pages再ビルドの順です。Pagesの失敗を成功扱いにしないでください。
- 初回seedは`main`での手動dispatchと`seed_approved_snapshot=true`がある場合だけ実行します。公開ゲート単独では記事を取り込まず、自動収集の承認ゲートも変更しません。
- PagesのGit連携buildはWorker workflowと並行するため、Pages側の公開ゲートはWorker/seed検証完了まで未設定にします。その後にPages側を設定して再ビルドし、公開URL・sitemap・匿名APIを確認します。
- 初回seedは現在の公開slugを維持します。以後はexportされたslugを保存し、新規記事だけURL由来IDを割り当てます。同期バッチはD1 Freeのquery上限も考慮して5件です。
- 本番反映前にD1の復旧ポイントと既存データを確認します。失敗時は先行migrationをむやみに巻き戻さず、Workerの直前versionとPagesの直前deploymentへ戻せることを確認します。
- `Potover_Batch`の別日次collectorは本体と二重実行になるため、運営者承認のうえ既存PR #1の停止方針と整合させます。

本番設定変更、secret生成/登録、migration実行、main mergeおよびdeploymentはこの検証とは別の承認対象です。
