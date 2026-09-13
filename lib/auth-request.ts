export async function authRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, options);
  } catch {
    throw new Error('認証サーバーに接続できません。通信環境を確認してください。ローカル検証では認証APIも起動してください。');
  }
  let body: T & {error?: string};
  try {
    body = await response.json();
  } catch {
    throw new Error('認証サーバーから正しい応答を受信できませんでした。時間をおいて再度お試しください。');
  }
  if (!response.ok) throw new Error(body.error || '処理に失敗しました。');
  return body;
}
