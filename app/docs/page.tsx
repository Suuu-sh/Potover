'use client';

import {useEffect,useMemo,useState} from 'react';
import Image from 'next/image';
import {Bookmark,BookOpen,CalendarDays,Clock3,ExternalLink,Globe2,RotateCcw,Search,SlidersHorizontal,X} from 'lucide-react';

import {BookmarkButton} from '@/components/BookmarkButton';
import {LearningLink} from '@/components/LearningLink';
import {articles as initialArticles,Article,sources} from '@/lib/data';

const sourceNames=sources.map(source=>source.name);
const groups=[
  {title:'ストリート',items:['Preflop','Flop','Turn','River']},
  {title:'戦略・テーマ',items:['GTO','Bluff','ICM','Exploit','Cash Game','MTT']},
  {title:'難易度',items:['Beginner','Intermediate','Advanced']},
  {title:'言語',items:['Japanese','English']},
  {title:'ソース',items:sourceNames},
];
const sourceImages:Record<string,string>={'gto-wizard':'/sources/gto-wizard.png','upswing-poker':'/sources/upswing.png','pokernews':'/sources/pokernews.png','pokercoaching':'/sources/pokercoaching.png'};
const sourceGlyphs:Record<string,string>={'gto-wizard':'W','upswing-poker':'U','pokernews':'P','pokercoaching':'P'};

export default function Docs(){
  const articles:Article[]=initialArticles;
  const [draft,setDraft]=useState('');
  const [query,setQuery]=useState('');
  const [selected,setSelected]=useState<string[]>([]);
  const [filtersOpen,setFiltersOpen]=useState(false);
  const [sort,setSort]=useState('relevance');
  useEffect(()=>{const q=new URLSearchParams(location.search).get('q')||'';setDraft(q);setQuery(q)},[]);
  const toggle=(value:string)=>setSelected(old=>old.includes(value)?old.filter(x=>x!==value):[...old,value]);
  const reset=()=>{setSelected([]);setDraft('');setQuery('')};
  const results=useMemo(()=>{
    const filtered=articles.filter(article=>{
      const text=[article.title,article.summary,article.source,...article.tags,article.category].join(' ').toLowerCase();
      const difficulty=selected.filter(x=>['Beginner','Intermediate','Advanced'].includes(x));
      const language=selected.filter(x=>['Japanese','English'].includes(x));
      const sourceFilters=selected.filter(x=>sourceNames.includes(x));
      const topics=selected.filter(x=>!difficulty.includes(x)&&!language.includes(x)&&!sourceFilters.includes(x));
      return (!query||text.includes(query.toLowerCase()))&&(!difficulty.length||difficulty.includes(article.difficulty))&&(!language.length||language.includes(article.language))&&(!sourceFilters.length||sourceFilters.includes(article.source))&&(!topics.length||topics.some(x=>text.includes(x.toLowerCase())));
    });
    return [...filtered].sort((a,b)=>sort==='newest'?b.publishedAt.localeCompare(a.publishedAt):sort==='shortest'?a.minutes-b.minutes:0);
  },[query,selected,sort]);
  const search=(value:string)=>{setDraft(value);setQuery(value);window.scrollTo({top:0,behavior:'smooth'})};
  return <main className="docs-v3"><div className="docs-command"><form onSubmit={e=>{e.preventDefault();setQuery(draft.trim())}}><Search size={17}/><input value={draft} onChange={e=>setDraft(e.target.value)} aria-label="記事を検索" placeholder="戦略・状況・キーワードで検索"/><kbd>⌘ K</kbd><button type="button" className="search-filter-button" onClick={()=>setFiltersOpen(true)}><SlidersHorizontal size={15}/>絞り込み{selected.length>0&&<em>{selected.length}</em>}</button><button type="submit">検索</button></form></div>

    <div className="docs-v3-layout">
      <section className="docs-feed">
        <div className="feed-toolbar"><span><strong>{results.length}</strong>件の記事</span><label>並び替え<select value={sort} onChange={e=>setSort(e.target.value)}><option value="relevance">関連度順</option><option value="newest">新着順</option><option value="shortest">短い順</option></select></label></div>
        {results.length===0?<div className="docs-empty"><BookOpen size={31}/><h2>条件に合う記事がありません</h2><p>別のキーワードまたは条件を試してください。</p><button onClick={reset}>条件をリセット</button></div>:
        <div className="docs-feed-list">{results.slice(0,20).map(article=><article className="docs-feed-row" key={article.slug}>
          <a href={`/articles/${article.slug}`} className="article-cover"><Image src={article.imageUrl||sourceImages[article.sourceSlug]||'/icon.png'} alt="" fill sizes="(max-width: 720px) 34vw, 280px"/></a>
          <div className="feed-copy"><div className="feed-source"><span className="source-glyph">{sourceGlyphs[article.sourceSlug]||article.source.slice(0,1)}</span><strong>{article.source}</strong><span className="content-kind">{article.contentType==='video'?'動画':'記事'}</span></div>
            <a href={`/articles/${article.slug}`}><h2>{article.title}</h2></a><p>{article.summary}</p>
            <div className="feed-tags">{article.tags.slice(0,3).map(tag=><button key={tag} onClick={()=>toggle(tag)}>{tag}</button>)}</div>
            <div className="feed-meta"><span>{article.difficulty}</span><span><Globe2 size={13}/>{article.language}</span><span><CalendarDays size={13}/>{article.publishedAt}</span><span><Clock3 size={13}/>{article.contentType==='video'?`${article.minutes}分`:`${article.minutes}分で読了`}</span></div>
          </div>
          <div className="feed-actions"><BookmarkButton slug={article.slug}/><LearningLink slug={article.slug} href={article.url} aria-label="元記事を開く"><ExternalLink size={20}/></LearningLink></div>
        </article>)}</div>}
      </section>
    </div>

    {filtersOpen&&<div className="filter-dialog-backdrop" onMouseDown={()=>setFiltersOpen(false)}><aside className="filter-dialog" onMouseDown={e=>e.stopPropagation()}><div className="filter-dialog-head"><div><p>FILTERS</p><h2>絞り込み</h2></div><button onClick={()=>setFiltersOpen(false)}><X/></button></div>{groups.map(group=><section key={group.title}><h3>{group.title}</h3><div>{group.items.map(item=><label key={item}><input type="checkbox" checked={selected.includes(item)} onChange={()=>toggle(item)}/><span>{item}</span></label>)}</div></section>)}<div className="filter-dialog-actions"><button onClick={reset}><RotateCcw size={15}/>リセット</button><button onClick={()=>setFiltersOpen(false)}>{results.length}件を表示</button></div></aside></div>}
  </main>
}
