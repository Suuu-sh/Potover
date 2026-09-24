export type AuthRequestErrorKind='network'|'invalid-response'|'server';

export class AuthRequestError extends Error {
  readonly kind:AuthRequestErrorKind;
  readonly retryable:boolean;

  constructor(message:string,kind:AuthRequestErrorKind){
    super(message);
    this.name='AuthRequestError';
    this.kind=kind;
    this.retryable=kind==='network'||kind==='server';
  }
}

export async function authRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, options);
  } catch {
    throw new AuthRequestError('認証サービスに接続できませんでした。少し待ってから、もう一度お試しください。','network');
  }
  let body: T & {error?: string};
  try {
    body = await response.json();
  } catch {
    throw new AuthRequestError('認証サービスから正しい応答を受け取れませんでした。時間をおいて再度お試しください。','invalid-response');
  }
  if (!response.ok) {
    if (response.status>=500) throw new AuthRequestError('認証サービスで問題が発生しました。時間をおいて再度お試しください。','server');
    throw new Error(body.error || '入力内容を確認してください。');
  }
  return body;
}
