'use client';
import {useI18n} from '@/lib/i18n-client';

import {useEffect,useState} from 'react';
import Link from '@/components/LocaleLink';
import {useRouter} from '@/lib/locale-router';
import {ArrowRight,BadgeCheck,BookOpen,Languages,LogOut,Mail,Palette,ShieldCheck,UserCircle} from 'lucide-react';

import {useAuth} from '@/lib/auth-client';
import {useBookmarks} from '@/lib/bookmarks';
import {useLearningHistory} from '@/lib/learning-history';
import {usePreferredLanguage, type PreferredLanguage} from '@/lib/use-preferred-language';
import {useSourceFollows} from '@/lib/source-follows';
import {useTheme} from '@/lib/use-theme';
import {SelectMenu} from './SelectMenu';
import {SourceDirectory} from './SourceDirectory';
import {AccountSecurity} from './AccountSecurity';

const sections=[{id:'account',label:'アカウント',icon:UserCircle},{id:'language',label:'コンテンツの優先言語',icon:Languages},{id:'appearance',label:'外観',icon:Palette},{id:'sources',label:'ソース',icon:BookOpen}] as const;
type Section=typeof sections[number]['id'];

const sectionCopy:Record<Section,{title:string;description:string}>= {
  account:{title:'アカウント',description:'登録情報と保存状況を確認できます。'},
  language:{title:'コンテンツの優先言語',description:'Potoverで表示するコンテンツの言語を選択できます。'},
  appearance:{title:'外観',description:'読みやすさに合わせてPotoverの表示テーマを選択できます。'},
  sources:{title:'ソース',description:'気になる情報源をフォローして、学びたい記事を見つけやすくします。'},
};

function SettingCard({icon:Icon,title,description,children,hint}:{icon:typeof Languages;title:string;description:string;children:React.ReactNode;hint:string}){
  const {t:uiText}=useI18n();
  return <article className="account-setting-card">
    <div className="account-setting-icon"><Icon size={22} strokeWidth={1.7}/></div>
    <div className="account-setting-copy">

      <h2>{uiText(title)}</h2>
      <p>{uiText(description)}</p>
      <div className="account-setting-control">{children}</div>
      <span className="account-hint">{uiText(hint)}</span>
    </div>
  </article>;
}

export function AccountSettings(){
  const {t:uiText,href:localPath}=useI18n();
  const {user,loading,logout}=useAuth();
  const router=useRouter();
  const [section,setSection]=useState<Section>('account');
  const [language,setLanguage]=usePreferredLanguage();
  const {dark,setTheme}=useTheme();
  const {slugs,loading:bookmarksLoading}=useBookmarks();
  const {events,loading:historyLoading}=useLearningHistory();
  const {followedSources,loading:sourceLoading}=useSourceFollows();
  const [signingOut,setSigningOut]=useState(false);
  useEffect(()=>{if(!loading&&!user)router.replace('/login')},[loading,user,router]);
  if(loading||!user)return <div className="account-loading" role="status">{uiText("読み込み中…")}</div>;
  const signOut=async()=>{
    setSigningOut(true);
    try{await logout()}finally{router.replace('/login')}
  };
  const copy=sectionCopy[section];
  const hasActivity=slugs.length>0||events.length>0||followedSources.size>0;
  const stats=[
    {label:'ブックマーク',value:bookmarksLoading?'—':slugs.length},
    {label:'学習済み',value:historyLoading?'—':events.length},
    {label:'フォロー中',value:sourceLoading?'—':followedSources.size},
  ];
  return <div className="account-layout">
    <aside className="account-nav">
      <div className="account-nav-profile">
        <span className="account-nav-avatar"><UserCircle size={25} strokeWidth={1.5}/></span>
        <span><strong>{uiText("アカウント")}</strong><small>{uiText("設定を管理")}</small></span>
      </div>

      <nav aria-label={uiText("アカウント設定")}>
        {sections.map(({id,label,icon:Icon})=><button key={id} type="button" aria-current={section===id?'page':undefined} onClick={()=>setSection(id)}><Icon size={21} strokeWidth={1.7}/><span>{uiText(label)}</span></button>)}
      </nav>
      <div className="account-nav-note"><ShieldCheck size={16}/><span>{uiText("設定はアカウントに保存されます。")}</span></div>
    </aside>
    <section className="account-panel" aria-labelledby="account-title">
      <header className="account-page-heading">
        <div><h1 id="account-title">{uiText(copy.title)}</h1><p className="account-description">{uiText(copy.description)}</p></div>
        <span className="account-status"><BadgeCheck size={15}/>{uiText("ログイン中")}</span>
      </header>

      <div className="account-profile-card">
        <span className="account-profile-avatar"><UserCircle size={34} strokeWidth={1.5}/></span>
        <div className="account-profile-copy"><strong>{uiText(user.email)}</strong><small>{uiText("学習履歴と設定がこのアカウントに保存されます。")}</small></div>
        <button type="button" className="account-logout" onClick={signOut} disabled={signingOut}><LogOut size={15}/>{uiText(signingOut?'ログアウト中…':'ログアウト')}</button>
      </div>

      <div className="account-stat-grid" aria-label={uiText("アカウントの利用状況")}>
        {stats.map(({label,value})=><div className="account-stat" key={label}><strong>{uiText(value)}</strong><small>{uiText(label)}</small></div>)}
      </div>

      {section==='account'&&<>
      <div className="account-content-grid">
        <article className="account-info-card"><span className="account-setting-icon"><Mail size={22}/></span><div><h2>{uiText("メールアドレス")}</h2><p>{uiText("ログインやアカウントの確認に使用します。")}</p><strong className="account-email">{uiText(user.email)}</strong></div></article>
        <aside className="account-help-card"><ShieldCheck size={21}/><div><h2>{uiText("安心して学習を続けられます")}</h2><p>{uiText("ブックマークや学習履歴は、ログインした端末で同期されます。")}</p></div></aside>
      </div>
      <section className="account-next-step" aria-labelledby="account-next-step-title">
        <div><h2 id="account-next-step-title">{uiText(hasActivity?'次の学びを続ける':'最初の学びを見つける')}</h2><p>{uiText(hasActivity?'保存した記事や気になるテーマから、次に学ぶ内容を探せます。':'記事・動画や用語集から気になるテーマを選ぶと、ここに学習の記録が残ります。')}</p></div>
        <div className="account-next-actions"><Link href={localPath("/explore")}>{uiText("記事・動画を探す ")}<ArrowRight size={15}/></Link><Link href={localPath("/glossary")}>{uiText("用語集を見る ")}<ArrowRight size={15}/></Link></div>
      </section>
      <AccountSecurity/>
      </>}
      {section==='language'&&<SettingCard icon={Languages} title={uiText("コンテンツの優先言語")} description={uiText("記事や動画を探すときの優先言語を選べます。")} hint={uiText("変更内容はアカウントに保存され、ログインした端末で同期されます。")}><SelectMenu ariaLabel={uiText("コンテンツの優先言語")} value={language} onChange={value=>void setLanguage(value as PreferredLanguage)} options={[{value:'Japanese',label:'日本語'},{value:'English',label:'English'}]}/></SettingCard>}
      {section==='appearance'&&<SettingCard icon={Palette} title={uiText("テーマ")} description={uiText("明るい画面と暗い画面を、いつでも切り替えられます。")} hint={uiText("テーマの設定はアカウントに保存され、次回ログイン時にも引き継がれます。")}><SelectMenu ariaLabel={uiText("表示テーマ")} value={dark?'dark':'light'} onChange={value=>void setTheme(value as 'light'|'dark')} options={[{value:'light',label:'ライト'},{value:'dark',label:'ダーク'}]}/></SettingCard>}
      {section==='sources'&&<div className="account-source-directory"><SourceDirectory compact/></div>}
    </section>
  </div>;
}
