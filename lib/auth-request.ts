import {handleLocalGuestRequest,isLocalGuestRequest} from './local-guest';

export type AuthRequestErrorKind='network'|'invalid-response'|'server'|'client';

export class AuthRequestError extends Error {
  readonly kind:AuthRequestErrorKind;
  readonly retryable:boolean;
  readonly status:number|undefined;

  constructor(message:string,kind:AuthRequestErrorKind,status?:number){
    super(message);
    this.name='AuthRequestError';
    this.kind=kind;
    this.status=status;
    this.retryable=kind==='network'||kind==='server'||(status!==undefined&&status>=500);
  }
}

export async function authRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    if (isLocalGuestRequest(options)) {
      const result = handleLocalGuestRequest(url, options, localStorage);
      response = new Response(JSON.stringify(result.body), {status: result.status, headers: {'Content-Type': 'application/json'}});
    } else response = await fetch(url, options);
  } catch {
    throw new AuthRequestError('認証サービスに接続できませんでした。少し待ってから、もう一度お試しください。','network');
  }
  let body: T & {error?: string};
  try {
    body = await response.json();
  } catch {
    throw new AuthRequestError('認証サービスから正しい応答を受け取れませんでした。時間をおいて再度お試しください。','invalid-response',response.status);
  }
  if (!response.ok) {
    if (response.status>=500) throw new AuthRequestError('認証サービスで問題が発生しました。時間をおいて再度お試しください。','server',response.status);
    const message=body&&typeof body==='object'&&typeof body.error==='string'?body.error:'入力内容を確認してください。';
    throw new AuthRequestError(message,'client',response.status);
  }
  return body;
}
