# Source調査（MVP）

MVPでは本文を保存せず、公開されているタイトル・URL・著者等のメタデータのみ扱う。自動収集は利用規約とrobots.txtを確認したSourceに限定する。

| Source | RSS/Sitemap | MVP方針 |
|---|---|---|
| Upswing Poker | 要確認 | RSSまたは公開一覧のメタデータのみ。実装前にTerms/robotsを確認 |
| PokerNews | 要確認 | 公開フィード優先。本文取得なし |
| GTO Wizard | 要確認 | Blogの公開メタデータのみ |
| GTO Wizard Japan | WordPress Sitemap | 日本語版の公開記事メタデータとOG画像を収集 |
| Poker Lab | RSS / Sitemap | 日本語記事のタイトル・概要・公開日・OG画像を収集 |
| ポーカーアカデミー | RSS / Sitemap | 日本語記事のタイトル・概要・公開日・OG画像を収集 |
| ポーカー道 | RSS / Sitemap | 日本語記事のタイトル・概要・公開日・OG画像を収集 |
| m Portal | Sitemap | `forbeginners` 配下の解説記事メタデータとOG画像を収集 |
| AJPC | RSS / Sitemap | 公式記事のメタデータとOG画像を収集 |
| LasVegas.co.jp | Sitemap | 日本語ポーカー解説のメタデータとOG画像を収集 |

noteは現段階では収集対象にしない。GitHub Actionsの定期実行では毎日12:00（日本時間）にSitemapを確認し、新規・更新記事と各記事の代表画像を更新する。本文は保存しない。


## GTO Wizard 実測結果（2026-08-31）

- `robots.txt`: `https://blog.gtowizard.com/sitemap.xml` を指定。`/ghost/` 等の管理・API系パスのみDisallow。
- RSS: `https://blog.gtowizard.com/feed/` を確認。
- Sitemap: `https://blog.gtowizard.com/sitemap.xml` → `sitemap-posts.xml` を確認。
- Collector: RSS本文は保存せず、posts sitemapの各公開記事HTMLから title / description / author / publishedAt / og:image / URL のメタデータだけを取得。
- 実行結果: 発見365件、新規365件、重複0件、失敗0件、約130秒。
- 出力: `data/gtowizard-articles.json`
- 記事本文（`content:encoded`）は保存していない。

利用規約上の自動収集可否は、運用開始前にGTO Wizardへ確認する。
