'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ExternalLink, Clock3, ChevronUp, ChevronDown, RotateCcw, BookOpen, X } from 'lucide-react';
import { DocsHeader } from '@/components/DocsHeader';
import { SiteHeader } from '@/components/SiteHeader';
import { articles } from '@/lib/data';

const streets = ['Preflop', 'Flop', 'Turn', 'River'];
const strategies = ['GTO', 'Bluff Catch', 'ICM', 'Overbet', 'Cash Game'];
const levels = ['Beginner', 'Intermediate', 'Advanced'];
const languages = ['Japanese', 'English'];
const sourceLogos: Record<string,string> = {'Upswing Poker':'/sources/upswing.png','PokerNews':'/sources/pokernews.png','GTO Wizard':'/sources/gto-wizard.png','PokerCoaching':'/sources/pokercoaching.png','Poker Hack':'/sources/poker-hack.png','Run It Once':'/sources/run-it-once.png'};
const japaneseTitles: Record<string,string> = {'river-bluff-catching-explained':'ブラフキャッチの精度を高める3つのポイント','poker-position-guide':'ポジション別オープンレンジの最適化','understanding-icm':'トーナメント中盤のスタック戦略','cbet-flop-basics':'フロップCBの基本を学ぶ','bankroll-management':'バンクロール管理の実践ガイド','turn-overbet-strategy':'ターンオーバーベットの考え方'};

export default function Home() {
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  useEffect(() => { const q = new URLSearchParams(window.location.search).get('q') || ''; setDraft(q); setQuery(q); }, []);

  const toggle = (value: string) => setSelected((old) => old.includes(value) ? old.filter((x) => x !== value) : [...old, value]);
  const reset = () => { setSelected([]); setQuery(''); setDraft(''); };
  const results = useMemo(() => articles.filter((article) => {
    const text = [article.title, article.summary, article.source, ...article.tags].join(' ').toLowerCase();
    const searchMatch = !query || text.includes(query.toLowerCase());
    const difficultyFilters = selected.filter((x) => levels.includes(x));
    const languageFilters = selected.filter((x) => languages.includes(x));
    const topicFilters = selected.filter((x) => [...streets, ...strategies].includes(x));
    return searchMatch
      && (!difficultyFilters.length || difficultyFilters.includes(article.difficulty))
      && (!languageFilters.length || languageFilters.includes(article.language))
      && (!topicFilters.length || topicFilters.some((filter) => article.tags.some((tag) => tag.toLowerCase().includes(filter.toLowerCase())) || article.category === filter));
  }), [query, selected]);

  function submit(event: React.FormEvent) { event.preventDefault(); setQuery(draft.trim()); }

  const FilterGroup = ({ title, items }: { title: string; items: string[] }) => {
    const isCollapsed = Boolean(collapsed[title]);
    const count = items.filter((item) => selected.includes(item)).length;
    return <section className={`filter-section ${isCollapsed ? 'collapsed' : ''}`}>
      <button className="filter-title" onClick={() => setCollapsed((old) => ({...old, [title]: !old[title]}))} aria-expanded={!isCollapsed}>
        <span>{title}{count > 0 && <em>{count}</em>}</span>{isCollapsed ? <ChevronDown size={15}/> : <ChevronUp size={15}/>}
      </button>
      {!isCollapsed && <div className="filter-options">{items.map((item) => <label key={item} className="check-row"><input type="checkbox" checked={selected.includes(item)} onChange={() => toggle(item)}/><span>{item}</span></label>)}</div>}
    </section>;
  };

  return <><SiteHeader/><main className="workspace docs-light docs-with-site-header">
    <DocsHeader draft={draft} setDraft={setDraft} onSubmit={submit} openFilters={() => setMobileFilters(true)}/>

    <aside className={`filter-rail ${mobileFilters ? 'open' : ''}`}>
      <div className="mobile-filter-head"><strong>絞り込み</strong><button onClick={() => setMobileFilters(false)}><X/></button></div>
      <FilterGroup title="ストリート" items={streets}/>
      <FilterGroup title="戦略・テーマ" items={strategies}/>
      <FilterGroup title="難易度" items={levels}/>
      <FilterGroup title="言語" items={languages}/>
      <button className="reset-button" onClick={reset}><RotateCcw size={17}/>フィルターをリセット</button>
      <div className="filter-date">最終更新: 2026-08-31</div>
    </aside>

    <section className="results-area" id="top">
      {results.length === 0 ? <div className="empty-state"><BookOpen size={30}/><h2>条件に合う記事がありません</h2><p>フィルターを減らすか、別のキーワードを試してください。</p><button onClick={reset}>条件をリセット</button></div> : <div className="article-list">{results.map((article, index) => <article className={`result-row ${index === 0 ? 'featured' : ''}`} key={article.slug}>
        <div className={`source-mark source-mark-${article.sourceSlug}`}><Image src={sourceLogos[article.source] || '/icon.png'} alt={`${article.source} logo`} width={84} height={84}/></div>
        <div className="result-copy">
          {index === 0 && <span className="featured-label">注目記事</span>}
          <a href={`/articles/${article.slug}`}><h2>{japaneseTitles[article.slug] || article.title}</h2></a>
          <p className="result-summary"><strong>{article.source}</strong><span>·</span>{article.summary}</p>
          <div className="result-meta">{article.tags.slice(0, 3).map((tag) => <button key={tag} onClick={() => toggle(tag)}>{tag}</button>)}<span>{article.difficulty}</span><span>{article.language}</span><span className="read-time"><Clock3 size={14}/>{article.minutes}分</span></div>
        </div>
        <a className="external-button" aria-label="元記事を開く" href={article.url} target="_blank" rel="noreferrer"><ExternalLink size={21}/></a>
      </article>)}</div>}
    </section>
  </main></>;
}
