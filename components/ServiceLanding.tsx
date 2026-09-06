import Link from 'next/link';
import {ArrowRight,Bookmark,BookOpen,Route,Search,Sparkles} from 'lucide-react';
import {articles} from '@/lib/data';
import {roadmapSummaries} from '@/lib/roadmap-summary';
import styles from './ServiceLanding.module.css';

const features=[
  {icon:Search,title:'横断検索',body:'複数の情報源から、今知りたいテーマの記事をすばやく見つけられます。'},
  {icon:Route,title:'学習ロードマップ',body:'プリフロップから実戦的なテーマまで、学ぶ順番を迷わず進められます。'},
  {icon:Bookmark,title:'あとで読む',body:'気になったコンテンツを保存して、自分のペースで振り返れます。'},
];
const stats=[
  {value:`${articles.length.toLocaleString('ja-JP')}+`,label:'収録コンテンツ'},
  {value:String(roadmapSummaries.length),label:'学習ロードマップ'},
  {value:'1',label:'自分だけのライブラリ'},
];

export function ServiceLanding(){
  return <main className={styles.page}>
    <section className={styles.hero}>
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>POKER LEARNING ATLAS</p>
        <h1>ポーカーの学びを、<span>ひとつの場所に。</span></h1>
        <p className={styles.lead}>良質なポーカー記事と動画を横断して探し、学習の道筋までつなげるためのサービスです。</p>
        <div className={styles.actions}>
          <Link className={styles.primaryAction} href="/home">ホームを開く <ArrowRight size={17}/></Link>
          <Link className={styles.secondaryAction} href="/docs">記事を探す <Search size={16}/></Link>
        </div>
        <div className={styles.stats} aria-label="Potoverの特徴">{stats.map(stat=><div key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}</div>
      </div>
      <div className={styles.heroVisual} aria-hidden="true">
        <div className={styles.visualGlow}/>
        <div className={styles.visualPanel}>
          <div className={styles.visualHeader}><span><Sparkles size={14}/> LEARNING ATLAS</span><i/></div>
          <div className={styles.visualSearch}><Search size={16}/><span>ポーカー戦略を検索</span><kbd>⌘ K</kbd></div>
          <div className={styles.visualResult}><div className={styles.resultIcon}><BookOpen size={18}/></div><div><strong>今読むべきコンテンツ</strong><span>テーマと難易度から見つける</span></div><ArrowRight size={16}/></div>
          <div className={styles.visualPath}><div className={styles.pathLine}/><span>学習ロードマップ</span><b>次の一歩を見つける</b><small>PRE-FLOP → POST-FLOP → TOURNAMENT</small></div>
        </div>
      </div>
    </section>
    <section className={styles.featureSection}>
      <div className={styles.sectionHeading}><p className={styles.eyebrow}>WHY POTOVER</p><h2>探すだけで、学びが前に進む。</h2></div>
      <div className={styles.featureGrid}>{features.map(({icon:Icon,title,body})=><article className={styles.featureCard} key={title}><span className={styles.featureIcon}><Icon size={19}/></span><h3>{title}</h3><p>{body}</p><Link href={title==='学習ロードマップ'?'/roadmap':title==='あとで読む'?'/bookmarks':'/docs'}>詳しく見る <ArrowRight size={14}/></Link></article>)}</div>
    </section>
    <section className={styles.cta}>
      <div><p className={styles.eyebrow}>START LEARNING</p><h2>まずは、気になるテーマから。</h2><p>登録なしでコンテンツを探せます。自分の学習ペースに合わせて始めましょう。</p></div>
      <Link className={styles.primaryAction} href="/home">Potoverをはじめる <ArrowRight size={17}/></Link>
    </section>
  </main>;
}
