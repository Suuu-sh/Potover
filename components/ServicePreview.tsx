import {Bookmark, BookOpen, Check, ChevronRight, Search, Play} from 'lucide-react';
import styles from './ServicePreview.module.css';

const topics = ['プリフロップ', 'GTO', 'MTT'];
const lessons = ['ポーカーの基本用語', 'プリフロップの考え方', 'ポストフロップの基礎'];

export function ServicePreview({kind}: {kind: 'search' | 'roadmap' | 'saved'}) {
  return <div className={styles.window} aria-hidden="true">
    <div className={styles.toolbar}><BookOpen size={16}/><strong>Potover</strong><span>LIBRARY</span></div>
    {kind === 'roadmap' ? <>
      <div className={styles.heading}>学習ロードマップ<small>基礎から、一歩ずつ。</small></div>
      <div className={styles.tabs}><b>初心者</b><span>キャッシュ</span><span>MTT</span></div>
      {lessons.map((title,i)=><div className={styles.row} key={title}><span className={styles.number}>0{i+1}</span><div><strong>{title}</strong><small>STEP {i+1} · 学習テーマ</small></div><ChevronRight size={16}/></div>)}
    </> : <>
      <div className={styles.search}>{kind==='search'?<Search size={17}/>:<Bookmark size={17}/>}<span>{kind==='search'?'次に学びたいテーマを検索':'あとで読む'}</span></div>
      <div className={styles.tabs}>{topics.map((t,i)=><span className={i===0?styles.selected:undefined} key={t}>{t}</span>)}</div>
      {['プリフロップの基礎を学ぶ','GTOの考え方を理解する','トーナメント戦略を深める'].map((title,i)=><div className={styles.row} key={title}><span className={styles.type}>{i===1?<Play size={21}/>:<BookOpen size={21}/>}</span><div><small>{i===1?'動画':'記事'} · 学習コンテンツ</small><strong>{title}</strong></div>{kind==='saved'?<Bookmark size={16} fill="currentColor"/>:<ChevronRight size={16}/>}</div>)}
    </>}
    <div className={styles.foot}><Check size={13}/> 探す。学ぶ。残す。</div>
  </div>;
}
