# Deployment

FrontendはCloudflare PagesのGit連携で、`main` へのpush（プルリクエストのマージを含む）時に自動デプロイします。BackendのWorkerのみ、`main`へのpushでGitHub Actionsが自動デプロイします。

## Cloudflare PagesのGit連携

Cloudflare Dashboardの Workers & Pages から `potover` を開き、Settings > Builds > Git repository でGitHubの `Suuu-sh/Potover` を接続してください。

- Production branch: `main`
- Build command: `npm run build:pages`
- Build output directory: `out`
- Root directory: `/`

## GitHub Secrets

リポジトリの Settings > Secrets and variables > Actions に以下を登録します。

- `CLOUDFLARE_API_TOKEN`: Workers と Pages のデプロイ権限を持つAPI Token
- `CLOUDFLARE_ACCOUNT_ID`: `648687d1fdb3e6b3e539ebca5c4415a7`

`CLOUDFLARE_API_TOKEN` はファイルやソースコードには保存しません。
