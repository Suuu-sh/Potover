# Source調査（MVP）

## 初回公開の掲載範囲（2026-10-03）

初回はタイトル・元記事/動画へのリンクを中心に、情報源名・カテゴリ・日付等の整理情報だけを配信します。収集済みの概要・本文抜粋・見出し・記事画像・動画サムネイルは、アプリの表示、静的HTML/ブラウザ用JSON、匿名公開APIから除外します。元の`data/articles.json`とD1保存データは削除しません。リポジトリ自体の公開範囲や過去の配信物を変更する処理ではありません。

タイトル・リンク中心でも、自動取得の条件や契約上の制限の確認は必要です。この掲載方針だけで全情報源の利用が承認されたとは扱いません。初回の固定一覧の公開承認と、自動収集再開の承認を分けて管理します。下表は情報源と収集方式の調査対象であり、自動収集の許可済み一覧ではありません。

## 承認された初回の固定一覧

`data/publication-scope.json`の9情報源・1,244件（記事1,208件、動画リンク36件）だけを公開します。GTO Wizard 387件、GTO Wizard Japan 179件、Upswing Poker 17件、PokerCoaching.com 123件、Poker Lab 40件、ポーカーアカデミー152件、ポーカー道218件、AJPC 124件、LasVegas.co.jp 4件です。PokerNews 46件とm Portal 116件は初回のタイトル表示を保留します。元の収集データと対象外のD1データは保持します。

[PokerNewsのコンテンツ利用条件](https://www.pokernews.com/terms-conditions.htm)と[m Portalの利用規約](https://mpj-portal.jp/terms/)にはコピー・公開等に関する制限があるため、現在のタイトル一覧への適用確認を分離しています。[PokerNewsのRSS例外](https://www.pokernews.com/disclaimer/)は通常の記事タイトル一覧全体へ自動的に適用したものではありません。これは通常のハイパーリンク自体が一律禁止という結論ではありません。

[PokerCoachingのリンク条件](https://pokercoaching.com/pages-legal-policies/)は提携・推奨を装わないリンクを認め、[ポーカー道](https://www.pokerdou.com/poker-link/link-bana/)にもリンク案内があります。GTO WizardのService内自動操作制限と、既存ブログへの通常リンク掲載は別に評価します。今回の公開範囲の承認は、各情報源の自動収集や全保存項目の再掲載の承認ではありません。

MVPでは本文を保存せず、公開されているタイトル・URL・著者等のメタデータのみ扱う。自動収集は利用規約とrobots.txtを確認し、運営者が利用可と判断したSourceに限定する。現時点では複数Sourceの許諾が未確認のため、本番の自動収集はGitHub Actionsの`POTOVER_PUBLICATION_READY`と`POTOVER_COLLECTION_APPROVED`の両変数が`true`になるまで停止する。

| Source | RSS/Sitemap | MVP方針 |
|---|---|---|
| Upswing Poker | 要確認 | RSSまたは公開一覧のメタデータのみ。実装前にTerms/robotsを確認 |
| PokerNews | 要確認 | 公開フィード優先。本文取得なし |
| GTO Wizard | 要確認 | Blogの公開メタデータのみ |
| PokerCoaching.com | 要確認 | RSS/APIの公開メタデータのみ |
| GTO Wizard Japan | WordPress Sitemap | 日本語版の公開記事メタデータとOG画像を収集 |
| GTO Wizard YouTube | YouTube公式RSS | 英語チャンネルの最新動画メタデータとサムネイルを収集 |
| GTO Wizard Japan YouTube | YouTube公式RSS | 日本語チャンネルの最新動画メタデータとサムネイルを収集 |
| Poker Lab | RSS / Sitemap | 日本語記事のタイトル・概要・公開日・OG画像を収集 |
| ポーカーアカデミー | RSS / Sitemap | 日本語記事のタイトル・概要・公開日・OG画像を収集 |
| ポーカー道 | RSS / Sitemap | 日本語記事のタイトル・概要・公開日・OG画像を収集 |
| m Portal | Sitemap | `forbeginners` 配下の解説記事メタデータとOG画像を収集 |
| AJPC | RSS / Sitemap | 公式記事のメタデータとOG画像を収集 |
| LasVegas.co.jp | Sitemap | 日本語ポーカー解説のメタデータとOG画像を収集 |

noteは現段階では収集対象にしない。許諾確認後のGitHub Actions定期実行は毎日12:00（日本時間）にSitemap/RSSを確認し、新規・更新記事と各記事の代表画像を更新する。本文は保存しない。

YouTubeは公式RSSからタイトル・URL・公開日・説明・サムネイルを取得する。動画ページHTMLによる再生時間の補完と動画本体の保存は行わない。対象は `GTO Wizard`（`UCXSg1srGpJ67HuPTMm4w72g`）と `GTO Wizard Japan`（`UCe9X7pQ5R0LduvBkhmOnj7Q`）。


## GTO Wizard 実測結果（2026-08-31）

- `robots.txt`: `https://blog.gtowizard.com/sitemap.xml` を指定。`/ghost/` 等の管理・API系パスのみDisallow。
- RSS: `https://blog.gtowizard.com/feed/` を確認。
- Sitemap: `https://blog.gtowizard.com/sitemap.xml` → `sitemap-posts.xml` を確認。
- Collector: RSS本文は保存せず、posts sitemapの各公開記事HTMLから title / description / author / publishedAt / og:image / URL のメタデータだけを取得。
- 実行結果: 発見365件、新規365件、重複0件、失敗0件、約130秒。
- 出力: `data/gtowizard-articles.json`
- 記事本文（`content:encoded`）は保存していない。

利用規約上の自動収集可否とブログへの適用範囲は、自動収集の再開前に確認する。必要に応じてGTO Wizardへ問い合わせる。robots.txtに明示的な拒否がないことだけでは、自動収集の許諾を意味しない。

## 収集方式の確認事項

自動収集に常に個別の書面許可が必要という意味ではありません。提供元の規約・ライセンス・公式RSS/APIの利用条件と、取得する行為・要約や画像を再掲載する行為を分けて確認します。robots.txtだけで再掲載権限を判断しません。

- WordPress APIは`excerpt.rendered`のみを概要に使い、記事本文`content.rendered`の冒頭抽出を行いません。既存保存データはこの変更では削除していません。
- YouTubeはチャンネルfeedにあるメタデータのみを収集し、再生時間のためにwatchページHTMLを取得しません。追加項目が必要なら利用条件を確認した公式APIを検討します。既存の再生時間は保持します。
- PokerNewsの公式RSS利用条件を、strategy記事HTML取得・画像掲載へそのまま適用できるとは限りません。現方式と掲載項目の確認が必要です。
- 自動収集の承認ゲートは全体単位で、初回は未設定を維持します。初回seed・Pages生成・匿名APIには同じ固定公開マニフェストを適用します。新しい記事や情報源を追加するときはマニフェスト更新と取得条件の確認を別途行い、未確認のまま全体収集ゲートを有効にしないでください。
