# 本番公開チェックリスト

このアプリは、利用者データの保存方針とコンテンツ収集許諾が決まるまで本番公開しない。

## 運営者が決定・確認すること

- [ ] アカウント情報、ブックマーク、学習履歴、設定の保存期間と、退会時の削除時期を決定する。
- [ ] 一時的なIP由来レート制限データの具体的な保存期間を決定する。
- [ ] `docs/sources.md`に列挙した各情報源について利用規約、robots.txt、RSS/APIの条件を確認し、収集可否を記録する。
- [ ] 保存期間・外部委託先・問い合わせ先を含むプライバシーポリシーを最終確認する。
- [ ] 公開する機能にクイズが含まれていないことを確認する。現在のサイトマップとアプリルートにはクイズを含めない。

## 公開前の運用設定

- [ ] Cloudflare D1の`potover`に全マイグレーションを適用する。
- [ ] Worker secret `BATCH_INGEST_TOKEN`とGitHub Secret `POTOVER_INGEST_TOKEN`に同じランダム値を登録する。
- [ ] GitHub Secrets `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID`と、Pages production環境変数`POTOVER_API_URL`を設定する。
- [ ] 上の確認を完了するまで、GitHub Actions VariablesとCloudflare Pages production Variablesの`POTOVER_PUBLICATION_READY`を未設定のままにする。
- [ ] 情報源の許諾を確認するまで、GitHub Actions Variable `POTOVER_COLLECTION_APPROVED`を未設定のままにする。
- [ ] 許諾済みの初期記事データをD1に取り込み、D1から生成された配信スナップショットと記事件数を照合する。
- [ ] Pages/Workerのhealth、登録・ログイン・パスワード変更・退会、ブックマーク・学習履歴・設定の保存と復元を本番相当環境で確認する。
- [ ] 確認後にだけ公開・収集の各ゲートを個別に有効化し、PagesとWorkerのproductionデプロイを確認する。

公開ゲートは安全策であり、運営者の法的判断や各提供元からの許諾の代わりにはならない。
