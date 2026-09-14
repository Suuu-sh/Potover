'use client';
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import {Languages,Palette,UserCircle} from 'lucide-react';
import {useAuth} from '@/lib/auth-client';
import {usePreferredLanguage, type PreferredLanguage} from '@/lib/use-preferred-language';
import {useTheme} from '@/lib/use-theme';
import {SelectMenu} from './SelectMenu';

const sections=[{id:'account',label:'アカウント',icon:UserCircle},{id:'language',label:'表示言語',icon:Languages},{id:'appearance',label:'外観',icon:Palette}] as const;
type Section=typeof sections[number]['id'];

export function AccountSettings(){
  const {user,loading,logout}=useAuth();
  const router=useRouter();
  const [section,setSection]=useState<Section>('account');
  const [language,setLanguage]=usePreferredLanguage();
  const {dark,setTheme}=useTheme();
  const [signingOut,setSigningOut]=useState(false);
  useEffect(()=>{if(!loading&&!user)router.replace('/login')},[loading,user,router]);
  if(loading||!user)return <div className="account-loading" role="status">読み込み中…</div>;
  const signOut=async()=>{
    setSigningOut(true);
    try{await logout()}finally{router.replace('/login')}
  };
  return <div className="account-layout">
    <nav className="account-nav" aria-label="アカウント設定">
      {sections.map(({id,label,icon:Icon})=><button key={id} type="button" aria-current={section===id?'page':undefined} onClick={()=>setSection(id)}><Icon size={27} strokeWidth={1.5}/><span>{label}</span></button>)}
    </nav>
    <section className="account-panel" aria-labelledby="account-title">
      <h1 id="account-title">{section==='account'?'Account':section==='language'?'表示言語':'外観'}</h1>
      <p className="account-description">{section==='account'?'アカウント情報を確認・管理できます。':section==='language'?'表示するコンテンツの言語を選択できます。':'Potoverの表示テーマを選択できます。'}</p>
      <dl className="account-fields">
        {section==='account'&&<><div className="account-field"><dt>メールアドレス</dt><dd>{user.email}</dd></div><div className="account-field"><dt>セッション</dt><dd><button type="button" className="account-logout" onClick={signOut} disabled={signingOut}>{signingOut?'ログアウト中…':'ログアウト'}</button></dd></div></>}
        {section==='language'&&<div className="account-field"><dt>コンテンツの表示言語</dt><dd><SelectMenu ariaLabel="コンテンツの表示言語" value={language} onChange={value=>setLanguage(value as PreferredLanguage)} options={[{value:'Japanese',label:'日本語'},{value:'English',label:'English'}]}/><p className="account-hint">変更はこのブラウザに自動保存されます。</p></dd></div>}
        {section==='appearance'&&<div className="account-field"><dt>テーマ</dt><dd><SelectMenu ariaLabel="表示テーマ" value={dark?'dark':'light'} onChange={value=>setTheme(value as 'light'|'dark')} options={[{value:'light',label:'ライト'},{value:'dark',label:'ダーク'}]}/><p className="account-hint">変更はこのブラウザに自動保存されます。</p></dd></div>}
      </dl>
    </section>
  </div>;
}
