export interface Env {
  ENVIRONMENT?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const json = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders, ...(init.headers || {}) },
  });

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
    const url = new URL(request.url);
    if (url.pathname === "/health") return json({ ok: true, service: "potover-api", environment: env.ENVIRONMENT ?? "production" });
    if (url.pathname === "/api") return json({ name: "Potover API", version: "1.0.0", endpoints: ["/health", "/api/articles"] });
    if (url.pathname === "/api/articles") {
      return json({ articles: [], total: 0, message: "記事コレクター接続待ち" });
    }
    return json({ error: "Not Found" }, { status: 404 });
  },
};
