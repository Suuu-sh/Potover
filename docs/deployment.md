# Deployment

`main` への push（プルリクエストのマージを含む）で、GitHub Actions がFrontendとBackendを自動デプロイします。

## GitHub Secrets

リポジトリの Settings > Secrets and variables > Actions に以下を登録します。

- `CLOUDFLARE_API_TOKEN`: Workers と Pages のデプロイ権限を持つAPI Token
- `CLOUDFLARE_ACCOUNT_ID`: `648687d1fdb3e6b3e539ebca5c4415a7`

`CLOUDFLARE_API_TOKEN` はファイルやソースコードには保存しません。
