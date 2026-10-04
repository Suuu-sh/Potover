'use client';
import {useI18n} from '@/lib/i18n-client';

import {FormEvent,useEffect,useState} from 'react';
import Link from '@/components/LocaleLink';
import Image from 'next/image';
import {useRouter} from '@/lib/locale-router';
import {Eye,EyeOff,LockKeyhole,Mail} from 'lucide-react';
import {useAuth} from '@/lib/auth-client';
import {safeReturnPath} from '@/lib/i18n';
import {AuthRequestError} from '@/lib/auth-request';
import styles from '@/app/(ja)/login/Login.module.css';

type FormError={message:string;retryable:boolean};

export default function LoginPage(){
  const {t:uiText,href:localPath,locale}=useI18n();
  const {login,register}=useAuth();
  const router=useRouter();
  const [returnTo,setReturnTo]=useState(localPath('/profile'));
  const [bookmarkNotice,setBookmarkNotice]=useState(false);
  const [preferenceNotice,setPreferenceNotice]=useState(false);
  const [sourceNotice,setSourceNotice]=useState(false);
  const [mode,setMode]=useState<'login'|'register'>('login');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [visible,setVisible]=useState(false);
  const [error,setError]=useState<FormError|null>(null);
  const [submitting,setSubmitting]=useState(false);

  useEffect(()=>{
    const params=new URLSearchParams(location.search);
    const next=params.get('next');
    setReturnTo(safeReturnPath(next,locale));
    setBookmarkNotice(params.get('reason')==='bookmark');
    setPreferenceNotice(params.get('reason')==='preferences');
    setSourceNotice(params.get('reason')==='source');
  },[locale]);

  async function submitForm(){
    setError(null);setSubmitting(true);
    try{await (mode==='login'?login(email,password):register(email,password));router.push(returnTo)}
    catch(reason){
      setError({
        message:reason instanceof Error?reason.message:'処理に失敗しました。',
        retryable:reason instanceof AuthRequestError&&reason.retryable,
      });
    }finally{setSubmitting(false)}
  }

  async function submit(event:FormEvent){
    event.preventDefault();
    await submitForm();
  }

  return <main className={styles.page}>
    <Image className={styles.illustration} src="/login/poker-learners.png" alt="" fill priority sizes="100vw"/>
    <section className={styles.panel} aria-labelledby="auth-heading">
      <div className={styles.content}>

        <div className={styles.tabs} aria-label={uiText("アカウント操作")}>
          <button aria-pressed={mode==='login'} disabled={submitting} onClick={()=>{setMode('login');setError(null)}} type="button">{uiText("ログイン")}</button>
          <button aria-pressed={mode==='register'} disabled={submitting} onClick={()=>{setMode('register');setError(null)}} type="button">{uiText("新規登録")}</button>
        </div>
        <header className={styles.heading}>
          <h1 id="auth-heading">{uiText(mode==='login'?'おかえりなさい':'アカウントを作成')}</h1>
          <p>{uiText(bookmarkNotice?'ブックマークを使うにはログインが必要です。':preferenceNotice?'設定をアカウントに保存するにはログインが必要です。':sourceNotice?'ソースをフォローするにはログインが必要です。':mode==='login'?'保存した記事や学習の続きを始めましょう。':'学習履歴やブックマークを保存できます。')}</p>
        </header>
        <form className={styles.form} onSubmit={submit} aria-busy={submitting}>
          <label><span>{uiText("メールアドレス")}</span><div className={styles.input}><Mail size={20} aria-hidden="true"/><input autoComplete="email" inputMode="email" required type="email" value={email} onChange={event=>setEmail(event.target.value)} placeholder={uiText("you@example.com")} disabled={submitting}/></div></label>
          <label><span>{uiText("パスワード")}</span><div className={styles.input}><LockKeyhole size={20} aria-hidden="true"/><input autoComplete={mode==='login'?'current-password':'new-password'} minLength={8} required type={visible?'text':'password'} value={password} onChange={event=>setPassword(event.target.value)} placeholder={uiText("8文字以上")} disabled={submitting}/><button aria-label={uiText(visible?'パスワードを隠す':'パスワードを表示')} aria-pressed={visible} onClick={()=>setVisible(value=>!value)} type="button">{visible?<EyeOff size={20}/>:<Eye size={20}/>}</button></div></label>
          {error&&<div className={styles.error} role="alert"><p>{uiText(error.message)}</p>{error.retryable&&<button className={styles.retry} type="button" onClick={()=>void submitForm()} disabled={submitting}>{uiText("もう一度試す")}</button>}</div>}
          <button className={styles.submit} disabled={submitting} type="submit">{uiText(submitting?'処理中…':mode==='login'?'ログイン':'登録して始める')}</button>
        </form>
        <Link className={styles.back} href={localPath("/")}>{uiText("ホームへ戻る")}</Link>
      </div>
    </section>
  </main>;
}
