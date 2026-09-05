'use client';

import Link from 'next/link';
import {ArrowRight,BookOpen,Bookmark,Check,Clock3,ExternalLink,Languages,LogOut,PenLine,Route,Settings2,UserCircle} from 'lucide-react';
import {useEffect,useMemo,useState} from 'react';
import {useRouter} from 'next/navigation';

import {articles} from '@/lib/data';
import {SelectMenu} from '@/components/SelectMenu';
import {getLearningHistory,LearningEvent} from '@/lib/learning-history';
import {usePreferredLanguage} from '@/lib/use-preferred-language';
import {useAuth} from '@/lib/auth-client';
import ArticleLink from '@/components/ArticleLink';

const interests=['GTO','プリフロップ','トーナメント','ブラフキャッチ'];

export function ProfileDashboard(){
  const {user,loading,logout}=useAuth();const router=useRouter();
  const [history,setHistory]=useState<LearningEvent[]>([]);
  const [language,setLanguage]=usePreferredLanguage();
  useEffect(()=>{if(!loading&&!user)router.replace('/login')},[loading,user,router]);
  useEffect(()=>{const refresh=()=>setHistory(getLearningHistory());refresh();window.addEventListener('potover-learning-changed',refresh);return()=>window.removeEventListener('potover-learning-changed',refresh)},[]);
  const stats=useMemo(()=>{
    const now=new Date();const monday=new Date(now);monday.setHours(0,0,0,0);monday.setDate(now.getDate()-((now.getDay()+6)%7));
    const uniqueSlugs=Array.from(new Set(history.map(event=>event.slug)));
    const weekly=new Set(history.filter(event=>new Date(event.openedAt)>=monday).map(event=>event.slug)).size;
    const minutes=uniqueSlugs.reduce((sum,slug)=>sum+(articles.find(article=>article.slug===slug)?.minutes||0),0);
    return{total:uniqueSlugs.length,weekly,minutes};
  },[history]);
  const recentItems=history.map(event=>({event,article:articles.find(article=>article.slug===event.slug)})).filter(item=>item.article).slice(0,8);

  if(loading||!user)return <main className="profile-auth-loading">読み込み中…</main>;
  return <div className="profile-dashboard profile-simple-dashboard"><div className="profile-dashboard-grid">
    <aside className="profile-settings-sidebar" aria-label="プロフィール設定"><div className="profile-settings-label">アカウント</div><Link className="profile-settings-link is-active" href="/profile"><UserCircle size={17}/>プロフィール</Link><div className="profile-settings-label">設定</div><div className="profile-language-setting"><span><Languages size={17}/>表示言語</span><SelectMenu className="profile-language-select" ariaLabel="コンテンツの表示言語" value={language} onChange={value=>setLanguage(value as 'Japanese'|'English')} options={[{value:'Japanese',label:'日本語'},{value:'English',label:'English'}]}/></div><Link className="profile-settings-link" href="/bookmarks"><Bookmark size={17}/>ブックマーク</Link><Link className="profile-settings-link" href="/roadmap"><Route size={17}/>学習ロードマップ</Link><div className="profile-settings-label">その他</div><button className="profile-settings-link" type="button"><Settings2 size={17}/>設定</button><button className="profile-settings-link" onClick={async()=>{await logout();router.replace('/login')}} type="button"><LogOut size={17}/>ログアウト</button></aside>
    <div className="profile-simple-main">
      <section className="profile-identity-simple"><div className="profile-identity-copy"><UserCircle size={52} strokeWidth={1.5}/><div><h1>ポーカープレイヤー</h1><p>{user.email}</p></div></div><button className="edit-profile"><PenLine size={14}/>編集</button></section>
      <section className="profile-learning-summary" aria-label="学習状況"><div><strong>{stats.total}</strong><span>学習済み</span></div><div><strong>{stats.weekly}</strong><span>今週</span></div><div><strong>{stats.minutes}<small>分</small></strong><span>学習時間</span></div></section>
      <section className="profile-topic-card"><div className="profile-section-title"><h2>関心のあるテーマ</h2><button>編集</button></div><div className="interest-list">{interests.map(item=><span key={item}><Check size={15}/>{item}</span>)}</div></section>
      <section className="profile-recent-card profile-history-card"><div className="profile-section-title"><h2>学習履歴</h2><Link href="/docs">探す <ArrowRight size={14}/></Link></div>{recentItems.length?<div>{recentItems.map(({article,event})=><ArticleLink slug={article!.slug} className="profile-learning-row" key={`${article!.slug}-${event.openedAt}`}><BookOpen size={17}/><div><strong>{article!.title}</strong><span>{article!.source}</span></div><em>{article!.tags[0]||'Poker'}</em><span><Clock3 size={13}/>{article!.minutes}分</span><time>{new Date(event.openedAt).toLocaleDateString('ja-JP',{month:'numeric',day:'numeric'})}</time><ExternalLink size={15}/></ArticleLink>)}</div>:<div className="profile-history-empty"><BookOpen size={22}/><div><strong>まだ学習履歴はありません</strong><p>記事や動画を開くと、ここに履歴が残ります。</p></div><Link href="/docs">コンテンツを探す</Link></div>}</section>
    </div>
  </div></div>;
}
