'use client';
import {useI18n} from '@/lib/i18n-client';

import {useEffect,useState} from 'react';
import {useRouter} from '@/lib/locale-router';
import {BookOpen,Check,KeyRound,Languages,LogOut,Palette,UserCircle} from 'lucide-react';

import {useAuth} from '@/lib/auth-client';
import {useBookmarks} from '@/lib/bookmarks';
import {useLearningHistory} from '@/lib/learning-history';
import {usePreferredLanguage, type PreferredLanguage} from '@/lib/use-preferred-language';
import {useSourceFollows} from '@/lib/source-follows';
import {useTheme} from '@/lib/use-theme';
import {SourceDirectory} from './SourceDirectory';
import {AccountSecurity} from './AccountSecurity';

const sections=[{id:'account',label:'アカウント',icon:UserCircle},{id:'language',label:'言語',icon:Languages},{id:'appearance',label:'外観',icon:Palette},{id:'sources',label:'ソース',icon:BookOpen},{id:'security',label:'セキュリティ',icon:KeyRound}] as const;
type Section=typeof sections[number]['id'];

const sectionCopy:Record<Section,{title:string;description:string}>= {
  account:{title:'アカウント',description:'登録情報と保存状況を確認できます。'},
  language:{title:'コンテンツの優先言語',description:'記事や動画を探すときの優先言語を選べます。'},
  appearance:{title:'外観',description:'明るい画面と暗い画面を、いつでも切り替えられます。'},
  sources:{title:'ソース',description:'気になる情報源をフォローして、学びたい記事を見つけやすくします。'},
  security:{title:'セキュリティ',description:'パスワードの変更とアカウントの削除ができます。'},
};

/** One-tap choice list used for the language and theme settings. */
function ChoiceList<T extends string>({label,value,options,onChange}:{label:string;value:T;options:{value:T;label:string}[];onChange:(value:T)=>void}){
  const {t:uiText}=useI18n();
  return <div className="account-choices" role="radiogroup" aria-label={uiText(label)}>
    {options.map(option=><button key={option.value} type="button" role="radio" aria-checked={value===option.value} onClick={()=>onChange(option.value)}>
      <span>{uiText(option.label)}</span>{value===option.value&&<Check size={17} aria-hidden="true"/>}
    </button>)}
  </div>;
}

export function AccountSettings(){
  const {t:uiText}=useI18n();
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
  const stats=[
    {label:'ブックマーク',value:bookmarksLoading?'—':slugs.length},
    {label:'学習済み',value:historyLoading?'—':events.length},
    {label:'フォロー中',value:sourceLoading?'—':followedSources.size},
  ];
  return <div className="account-layout account-simple">
    <aside className="account-nav">
      <nav aria-label={uiText("アカウント設定")}>
        {sections.map(({id,label,icon:Icon})=><button key={id} type="button" aria-current={section===id?'page':undefined} onClick={()=>setSection(id)}><Icon size={19} strokeWidth={1.7}/><span>{uiText(label)}</span></button>)}
      </nav>
    </aside>
    <section className="account-panel" aria-labelledby="account-title">
      <header className="account-page-heading">
        <div><h1 id="account-title">{uiText(copy.title)}</h1><p className="account-description">{uiText(copy.description)}</p></div>
      </header>

      {section==='account'&&<>
        <div className="account-profile-card">
          <span className="account-profile-avatar"><UserCircle size={30} strokeWidth={1.5}/></span>
          <div className="account-profile-copy"><strong>{uiText(user.email)}</strong><small>{uiText("学習履歴と設定がこのアカウントに保存されます。")}</small></div>
          <button type="button" className="account-logout" onClick={signOut} disabled={signingOut}><LogOut size={15}/>{uiText(signingOut?'ログアウト中…':'ログアウト')}</button>
        </div>
        <div className="account-stat-grid" aria-label={uiText("アカウントの利用状況")}>
          {stats.map(({label,value})=><div className="account-stat" key={label}><strong>{uiText(value)}</strong><small>{uiText(label)}</small></div>)}
        </div>
      </>}
      {section==='language'&&<ChoiceList label="コンテンツの優先言語" value={language} onChange={value=>void setLanguage(value as PreferredLanguage)} options={[{value:'Japanese',label:'日本語'},{value:'English',label:'English'}]}/>}
      {section==='appearance'&&<ChoiceList label="表示テーマ" value={dark?'dark':'light'} onChange={value=>void setTheme(value)} options={[{value:'light',label:'ライト'},{value:'dark',label:'ダーク'}]}/>}
      {section==='sources'&&<div className="account-source-directory"><SourceDirectory compact/></div>}
      {section==='security'&&<AccountSecurity/>}
    </section>
  </div>;
}
