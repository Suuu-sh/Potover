// Local-only entry point. Production keeps src/index.ts and its existing CORS policy.
import worker, {type Env} from './index';

const origins = new Set(['http://localhost:3001', 'http://127.0.0.1:3001']);

export default {
  async fetch(request: Request, env: Env) {
    const response = await worker.fetch(request, env);
    const headers = new Headers(response.headers);
    const origin = request.headers.get('Origin') || '';
    headers.delete('Access-Control-Allow-Origin');
    if (origins.has(origin)) headers.set('Access-Control-Allow-Origin', origin);
    return new Response(response.body, {status: response.status, headers});
  },
};
