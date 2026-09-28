# Source調査（MVP）

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

YouTubeは公式RSSからタイトル・URL・公開日・説明・サムネイルを取得し、動画ページから再生時間のみ補完する。動画本体は保存しない。対象は `GTO Wizard`（`UCXSg1srGpJ67HuPTMm4w72g`）と `GTO Wizard Japan`（`UCe9X7pQ5R0LduvBkhmOnj7Q`）。


## GTO Wizard 実測結果（2026-08-31）

- `robots.txt`: `https://blog.gtowizard.com/sitemap.xml` を指定。`/ghost/` 等の管理・API系パスのみDisallow。
- RSS: `https://blog.gtowizard.com/feed/` を確認。
- Sitemap: `https://blog.gtowizard.com/sitemap.xml` → `sitemap-posts.xml` を確認。
- Collector: RSS本文は保存せず、posts sitemapの各公開記事HTMLから title / description / author / publishedAt / og:image / URL のメタデータだけを取得。
- 実行結果: 発見365件、新規365件、重複0件、失敗0件、約130秒。
- 出力: `data/gtowizard-articles.json`
- 記事本文（`content:encoded`）は保存していない。

利用規約上の自動収集可否は、運用開始前にGTO Wizardへ確認する。robots.txtに明示的な拒否がないことだけでは、自動収集の許諾を意味しない。
