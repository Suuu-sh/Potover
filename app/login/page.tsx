'use client';

import {FormEvent,useEffect,useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {Eye,EyeOff,LockKeyhole,Mail} from 'lucide-react';
import {useAuth} from '@/lib/auth-client';
import styles from './Login.module.css';

export default function LoginPage(){
  const {login,register}=useAuth();
  const router=useRouter();
  const [returnTo,setReturnTo]=useState('/profile');
  const [bookmarkNotice,setBookmarkNotice]=useState(false);
  const [mode,setMode]=useState<'login'|'register'>('login');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [visible,setVisible]=useState(false);
  const [error,setError]=useState('');
  const [submitting,setSubmitting]=useState(false);

  useEffect(()=>{
    const params=new URLSearchParams(location.search);
    const next=params.get('next');
    if(next?.startsWith('/')&&!next.startsWith('//')&&!next.includes('\\'))setReturnTo(next);
    setBookmarkNotice(params.get('reason')==='bookmark');
  },[]);

  async function submit(event:FormEvent){
    event.preventDefault();setError('');setSubmitting(true);
    try{await (mode==='login'?login(email,password):register(email,password));router.push(returnTo)}
    catch(reason){setError(reason instanceof Error?reason.message:'処理に失敗しました。')}
    finally{setSubmitting(false)}
  }

  return <main className={styles.page}>
    <aside className={styles.visual} aria-label="あなたの学びを、次の一手へ。">
      <Image src="/login/spade-gallery.png" alt="" fill priority sizes="(max-width: 700px) 100vw, 55vw" className={styles.art}/>
      <div className={styles.visualCopy}><p>あなたの学びを、<br/>次の一手へ。</p><span>気になる記事を保存して、自分のペースで。</span></div>
    </aside>
    <section className={styles.panel} aria-labelledby="auth-heading">
      <div className={styles.content}>
        <Link className={styles.brand} href="/">Potover</Link>
        <div className={styles.tabs} aria-label="アカウント操作">
          <button aria-pressed={mode==='login'} disabled={submitting} onClick={()=>{setMode('login');setError('')}} type="button">ログイン</button>
          <button aria-pressed={mode==='register'} disabled={submitting} onClick={()=>{setMode('register');setError('')}} type="button">新規登録</button>
        </div>
        <header className={styles.heading}>
          <h1 id="auth-heading">{mode==='login'?'学習の続きを、ここから。':'あなたの学びを、ここから。'}</h1>
          <p>{bookmarkNotice?'ブックマークを使うにはログインが必要です。':mode==='login'?'知識を積み重ねて、もっと強くなろう。':'学習履歴やブックマークを保存できます。'}</p>
        </header>
        <form className={styles.form} onSubmit={submit} aria-busy={submitting}>
          <label><span>メールアドレス</span><div className={styles.input}><Mail size={20} aria-hidden="true"/><input autoComplete="email" inputMode="email" required type="email" value={email} onChange={event=>setEmail(event.target.value)} placeholder="you@example.com" disabled={submitting}/></div></label>
          <label><span>パスワード</span><div className={styles.input}><LockKeyhole size={20} aria-hidden="true"/><input autoComplete={mode==='login'?'current-password':'new-password'} minLength={8} required type={visible?'text':'password'} value={password} onChange={event=>setPassword(event.target.value)} placeholder="8文字以上" disabled={submitting}/><button aria-label={visible?'パスワードを隠す':'パスワードを表示'} aria-pressed={visible} onClick={()=>setVisible(value=>!value)} type="button">{visible?<EyeOff size={20}/>:<Eye size={20}/>}</button></div></label>
          {error&&<p className={styles.error} role="alert">{error}</p>}
          <button className={styles.submit} disabled={submitting} type="submit">{submitting?'処理中…':mode==='login'?'ログイン':'登録して始める'}</button>
        </form>
        <Link className={styles.back} href="/home">ホームへ戻る</Link>
      </div>
    </section>
  </main>;
}
