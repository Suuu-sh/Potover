'use client';

import Link from 'next/link';
import {ArrowRight,BookOpen,Bookmark,CalendarDays,Check,Clock3,ExternalLink,Flame,Languages,LogOut,PenLine,Route,Settings2,Sparkles,UserCircle} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';
import {useEffect,useMemo,useState} from 'react';
import {useRouter} from 'next/navigation';

import {articles} from '@/lib/data';
import {SelectMenu} from '@/components/SelectMenu';
import {getLearningHistory,LearningEvent} from '@/lib/learning-history';
import {usePreferredLanguage} from '@/lib/use-preferred-language';
import {useAuth} from '@/lib/auth-client';
import ArticleLink from '@/components/ArticleLink';

const interests=['GTO','プリフロップ','トーナメント','ブラフキャッチ'];

function DashboardStat({icon:Icon,value,label,description}:{icon:LucideIcon;value:React.ReactNode;label:string;description:string}){
  return <div className="profile-stat-card"><span className="profile-stat-icon"><Icon size={16}/></span><div><strong>{value}</strong><span>{label}</span><small>{description}</small></div></div>;
}

export function ProfileDashboard(){
  const {user,loading,logout}=useAuth();const router=useRouter();
  const [history,setHistory]=useState<LearningEvent[]>([]);
  const [language,setLanguage]=usePreferredLanguage();
  useEffect(()=>{if(!loading&&!user)router.replace('/login')},[loading,user,router]);
  useEffect(()=>{const refresh=()=>setHistory(getLearningHistory());refresh();window.addEventListener('potover-learning-changed',refresh);return()=>window.removeEventListener('potover-learning-changed',refresh)},[]);
  const stats=useMemo(()=>{
    const now=new Date();const monday=new Date(now);monday.setHours(0,0,0,0);monday.setDate(now.getDate()-((now.getDay()+6)%7));
    const uniqueSlugs=Array.from(new Set(history.map(event=>event.slug)));
    const weeklyEvents=history.filter(event=>new Date(event.openedAt)>=monday);
    const weekly=new Set(weeklyEvents.map(event=>event.slug)).size;
    const activeDays=new Set(weeklyEvents.map(event=>event.openedAt.slice(0,10))).size;
    const minutes=uniqueSlugs.reduce((sum,slug)=>sum+(articles.find(article=>article.slug===slug)?.minutes||0),0);
    return{total:uniqueSlugs.length,weekly,activeDays,minutes};
  },[history]);
  const recentItems=history.map(event=>({event,article:articles.find(article=>article.slug===event.slug)})).filter(item=>item.article).slice(0,8);
  const latestItem=recentItems[0];
  const weeklyProgress=Math.min(100,Math.round(stats.weekly/3*100));

  if(loading||!user)return <main className="profile-auth-loading">読み込み中…</main>;
  return <div className="profile-dashboard profile-simple-dashboard">
    <div className="profile-dashboard-grid">
      <aside className="profile-settings-sidebar" aria-label="プロフィール設定">
        <div className="profile-settings-label">アカウント</div>
        <Link className="profile-settings-link is-active" href="/profile"><UserCircle size={17}/>プロフィール</Link>
        <div className="profile-settings-label">設定</div>
        <div className="profile-language-setting"><span><Languages size={17}/>表示言語</span><SelectMenu className="profile-language-select" ariaLabel="コンテンツの表示言語" value={language} onChange={value=>setLanguage(value as 'Japanese'|'English')} options={[{value:'Japanese',label:'日本語'},{value:'English',label:'English'}]}/></div>
        <Link className="profile-settings-link" href="/bookmarks"><Bookmark size={17}/>ブックマーク</Link>
        <Link className="profile-settings-link" href="/roadmap"><Route size={17}/>学習ロードマップ</Link>
        <div className="profile-settings-label">その他</div>
        <button className="profile-settings-link" type="button"><Settings2 size={17}/>設定</button>
        <button className="profile-settings-link" onClick={async()=>{await logout();router.replace('/login')}} type="button"><LogOut size={17}/>ログアウト</button>
      </aside>
      <div className="profile-simple-main">
        <section className="profile-identity-simple profile-hero-card">
          <div className="profile-identity-copy"><span className="profile-avatar"><UserCircle size={42} strokeWidth={1.5}/><i>P</i></span><div><p className="profile-card-kicker">POKER LEARNER</p><h2>ポーカープレイヤー</h2><p>{user.email}</p><div className="profile-identity-meta"><span><Languages size={12}/>{language==='Japanese'?'日本語':'English'}</span><span><Sparkles size={12}/>学習メンバー</span></div></div></div>
          <button className="edit-profile" type="button"><PenLine size={14}/>編集</button>
        </section>

        <section className="profile-stat-grid" aria-label="学習サマリー">
          <DashboardStat icon={BookOpen} value={stats.total} label="学習済み" description="これまでに開いた記事"/>
          <DashboardStat icon={Flame} value={stats.weekly} label="今週" description="今週に開いた記事"/>
          <DashboardStat icon={CalendarDays} value={stats.activeDays} label="活動日数" description="今週学習した日数"/>
          <DashboardStat icon={Clock3} value={<>{stats.minutes}<small>分</small></>} label="学習時間" description="記事の目安時間の合計"/>
        </section>

        <section className="profile-next-step-card" aria-label="次の学習">
          <div className="profile-next-step-copy"><p className="profile-eyebrow">NEXT STEP</p><h2>{latestItem?'続きから学ぶ':'最初の1記事を見つける'}</h2><p>{latestItem?'前回開いた記事から、学習を再開しましょう。':'気になるテーマを選んで、ポーカーの学習を始めましょう。'}</p></div>
          {latestItem?<ArticleLink slug={latestItem.article!.slug} className="profile-primary-action">記事を読む <ArrowRight size={16}/></ArticleLink>:<Link href="/docs" className="profile-primary-action">コンテンツを探す <ArrowRight size={16}/></Link>}
        </section>

        <section className="profile-weekly-card" aria-label="今週の学習状況">
          <div className="profile-section-title"><div><p className="profile-eyebrow">THIS WEEK</p><h2>今週のペース</h2></div><span className="profile-section-note">週3記事を目安に</span></div>
          <div className="profile-weekly-body"><div className="profile-weekly-progress"><div className="profile-progress-label"><strong>{stats.weekly}<small>/ 3記事</small></strong><span>{weeklyProgress}%</span></div><div className="profile-progress-track"><i style={{width:`${weeklyProgress}%`}}/></div><p>{stats.weekly?'このペースで、無理なく学習を続けられています。':'まずは気になる記事を1本開いてみましょう。'}</p></div><div className="profile-weekly-highlight"><CalendarDays size={17}/><div><strong>{stats.activeDays}<small>日</small></strong><span>今週の活動日数</span></div><ArrowRight size={15}/></div></div>
        </section>

        <section className="profile-topic-card"><div className="profile-section-title"><div><p className="profile-eyebrow">YOUR TOPICS</p><h2>関心のあるテーマ</h2></div><button type="button">編集</button></div><div className="interest-list">{interests.map(item=><span key={item}><Check size={15}/>{item}</span>)}</div></section>
        <section className="profile-recent-card profile-history-card"><div className="profile-section-title"><div><p className="profile-eyebrow">RECENT ACTIVITY</p><h2>学習履歴</h2></div><Link href="/docs">すべて見る <ArrowRight size={14}/></Link></div>{recentItems.length?<div>{recentItems.map(({article,event})=><ArticleLink slug={article!.slug} className="profile-learning-row" key={`${article!.slug}-${event.openedAt}`}><BookOpen size={17}/><div><strong>{article!.title}</strong><span>{article!.source}</span></div><em>{article!.tags[0]?.toLowerCase()==='poker'?'':article!.tags[0]}</em><span><Clock3 size={13}/>{article!.minutes}分</span><time>{new Date(event.openedAt).toLocaleDateString('ja-JP',{month:'numeric',day:'numeric'})}</time><ExternalLink size={15}/></ArticleLink>)}</div>:<div className="profile-history-empty"><BookOpen size={22}/><div><strong>まだ学習履歴はありません</strong><p>記事や動画を開くと、ここに履歴が残ります。</p></div><Link href="/docs">コンテンツを探す</Link></div>}</section>
      </div>
    </div>
  </div>;
}
