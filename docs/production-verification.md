# 本番化検証（2026-10-03）

## この変更の範囲

既存developmentのD1正本化、認証防御、保持期間、法的ページ、公開ゲートを採用し、mainの最新1,406記事を保持したリリース候補です。クイズPR #49、用語集PR #48は含みません。既存データの削除、mainへの反映、本番DB書込、secret設定、デプロイは行っていません。

追加修正:

- 初回移行後のslugを保持。再同期・並び替え・タイトル変更でブックマーク先を変えない
- D1 Freeのクエリ上限を考慮した5件バッチ、短いページのexport、収集日時の不整合検出
- JSON構造・ストリーム本文サイズ上限、認証と取り込みの失敗時閉鎖
- `/me`一時障害でトークンを消さず再試行。パスワード変更・退会はD1トランザクション
- デプロイ認証環境変数の補完、途中キャンセル抑止、初回seedにも収集承認ゲート
- Next.js 15.5.27、Node.js 24、検証ツール更新。CIにlint・本番build・ローカルD1統合試験を追加
- 本文冒頭の抽出とYouTube watch HTML取得を停止。既存保存済みデータは保持

## 実施済み

- `npm run verify`: 型生成・型検査、lint（エラー0）、92単体テスト、実workerd/一時D1統合試験、静的build成功
- `npm run test:integration`: 全6 migrationと32 API/DBチェック成功。認証、保存・復元、slug再同期、パスワード変更、退会後の関連データ削除を含む
- 本番build: 1,406記事を含む1,427静的ページを生成
- `npm run theme:check`と`git diff --check`: 成功
- `npm audit --omit=dev`: 0件
- 全依存audit: 開発用lint依存のbracesに由来するHigh 5件（依存経路を含む）が残る。registryの最新版braces 3.0.3も対象のため、無関係なmajor downgradeは行っていない。本番静的配信には含まれないが、lintへ信頼できないglob入力を渡さず上流修正を追う
- lintには既存のhook依存配列等の警告が残る。エラーはない

## 稼働中サービスの読み取り確認

- API `/health`: 200。`/api/articles?limit=1`: 200、旧レスポンス形式。`/api/sources`: 404。新D1配信APIは未反映
- `potover.pages.dev`の既存公開画面は別途確認可能。今回の未公開静的buildについては、この検証環境のブラウザがloopbackアクセスを拒否したため、ブラウザでの新UI確認は未完
- `potover.com`は確認経路で502（Connection refused）。この経路だけで全利用者への障害とは断定しない。DNS/カスタムドメインとcanonical URLの最終確認が必要
- Potover_Batchの日次runはAPI URL/ingest tokenが未設定で同期に失敗。本体との二重collector方針を確定するまで独自修復・再実行はしない

## 公開前に残る確認

1. 情報源ごとの取得方式・掲載項目を利用規約、公式RSS/API、ライセンスに照らして記録。個別許諾は必要な場合に取得する
2. プライバシー・利用条件・問い合わせ先を運営者が最終確認
3. Cloudflare/GitHubのsecret・環境変数、D1復旧方法、現在のDB内容を確認
4. 承認のうえmain反映 → migration/Worker → 許可された初期データ同期 → Pages buildの順に実施
5. 対象commitのCIと本番デプロイを確認し、本番相当の隔離環境で認証再試行UIを含むブラウザQAを完了
6. Potover_Batch #1の停止方針を承認・反映するか決定

コードの検証成功は、公開承認・本番動作・収集条件の確認完了を意味しません。
