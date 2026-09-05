'use client';

import {FormEvent,useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {Eye,EyeOff,LockKeyhole,Mail} from 'lucide-react';
import {useAuth} from '@/lib/auth-client';

export default function LoginPage(){
  const {login,register}=useAuth();const router=useRouter();
  const [mode,setMode]=useState<'login'|'register'>('login');const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [visible,setVisible]=useState(false);const [error,setError]=useState('');const [submitting,setSubmitting]=useState(false);
  async function submit(event:FormEvent){event.preventDefault();setError('');setSubmitting(true);try{await (mode==='login'?login(email,password):register(email,password));router.push('/profile')}catch(reason){setError(reason instanceof Error?reason.message:'処理に失敗しました。')}finally{setSubmitting(false)}}
  return <main className="auth-page"><section className="auth-card"><Link className="auth-brand" href="/">Potover</Link><div className="auth-tabs" role="tablist"><button className={mode==='login'?'is-active':''} onClick={()=>{setMode('login');setError('')}} type="button">ログイン</button><button className={mode==='register'?'is-active':''} onClick={()=>{setMode('register');setError('')}} type="button">新規登録</button></div><header><h1>{mode==='login'?'おかえりなさい':'アカウントを作成'}</h1><p>{mode==='login'?'学習の続きを始めましょう。':'学習履歴やブックマークを保存できます。'}</p></header><form onSubmit={submit}><label><span>メールアドレス</span><div><Mail size={18}/><input autoComplete="email" inputMode="email" required type="email" value={email} onChange={event=>setEmail(event.target.value)} placeholder="you@example.com"/></div></label><label><span>パスワード</span><div><LockKeyhole size={18}/><input autoComplete={mode==='login'?'current-password':'new-password'} minLength={8} required type={visible?'text':'password'} value={password} onChange={event=>setPassword(event.target.value)} placeholder="8文字以上"/><button aria-label={visible?'パスワードを隠す':'パスワードを表示'} onClick={()=>setVisible(value=>!value)} type="button">{visible?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label>{error&&<p className="auth-error" role="alert">{error}</p>}<button className="auth-submit" disabled={submitting} type="submit">{submitting?'処理中…':mode==='login'?'ログイン':'登録して始める'}</button></form><Link className="auth-back" href="/">ホームへ戻る</Link></section></main>;
}
