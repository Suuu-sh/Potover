'use client';

import {useEffect,useMemo,useRef,useState} from 'react';
import {BookOpen,Check,ChevronLeft,ChevronRight,Circle,RotateCcw,Search,SlidersHorizontal,X} from 'lucide-react';

import {ArticleFeedRow} from '@/components/ArticleFeedRow';
import {articles as initialArticles,Article,sources} from '@/lib/data';
import {getLearningHistory} from '@/lib/learning-history';
import {usePreferredLanguage} from '@/lib/use-preferred-language';

const sourceNames=sources.map(source=>source.name);
const READ_FILTER='学習済み';
const CONTENT_FILTERS=['記事','動画'] as const;
const QUICK_FILTERS=[['Preflop','プリフロップ'],['Flop','フロップ'],['GTO','GTO'],['cash-game','キャッシュ'],['MTT','MTT']] as const;
const PAGE_SIZE=20;
const SEARCH_ALIASES:Record<string,string[]>={
  'プリフロップ':['プリフロップ','preflop','pre-flop','pre flop'],
  'ポストフロップ':['ポストフロップ','postflop','post-flop','post flop','flop','turn','river'],
  'gto・ソルバー':['gto','ソルバー','solver'],
  'トーナメント':['トーナメント','tournament','mtt','icm'],
  'メンタル・思考':['メンタル','思考','mental','mindset','psychology','decision'],
  'バンクロール':['バンクロール','bankroll','bank roll'],
};
const groups=[
  {title:'ストリート',items:['Preflop','Flop','Turn','River']},
  {title:'戦略・テーマ',items:['GTO','Bluff','ICM','Exploit','Cash Game','MTT']},
  {title:'難易度',items:['Beginner','Intermediate','Advanced']},
  {title:'言語',items:['Japanese','English']},
  {title:'種類',items:[...CONTENT_FILTERS]},
  {title:'ソース',items:sourceNames},
  {title:'学習状況',items:[READ_FILTER]},
];

export default function Docs(){
  const articles:Article[]=initialArticles;
  const [query,setQuery]=useState('');
  const [selected,setSelected]=useState<string[]>([]);
  const [filtersOpen,setFiltersOpen]=useState(false);
  const [sort,setSort]=useState('relevance');
  const [page,setPage]=useState(1);
  const [toolbarVisible,setToolbarVisible]=useState(true);
  const [readSlugs,setReadSlugs]=useState<Set<string>>(new Set());
  const [indexQuery,setIndexQuery]=useState('');
  const [filterDialogQuery,setFilterDialogQuery]=useState('');
  const [preferredLanguage]=usePreferredLanguage();
  const toolbarTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  useEffect(()=>{setQuery(new URLSearchParams(location.search).get('q')||'')},[]);
  useEffect(()=>{const sync=()=>setReadSlugs(new Set(getLearningHistory().map(event=>event.slug)));sync();window.addEventListener('potover-learning-changed',sync);return()=>window.removeEventListener('potover-learning-changed',sync)},[]);
  const toggle=(value:string)=>setSelected(old=>old.includes(value)?old.filter(x=>x!==value):[...old,value]);
  const reset=()=>{setSelected([]);setQuery('')};
  const results=useMemo(()=>{
    const filtered=articles.filter(article=>{
      const text=[article.title,article.summary,article.source,...article.tags,article.category,article.contentType==='video'?'動画 youtube video':'記事 article'].join(' ').toLowerCase();
      const normalizedQuery=query.trim().toLowerCase();
      const queryTerms=SEARCH_ALIASES[normalizedQuery]||[normalizedQuery];
      const difficulty=selected.filter(x=>['Beginner','Intermediate','Advanced'].includes(x));
      const language=selected.filter(x=>['Japanese','English'].includes(x));
      const sourceFilters=selected.filter(x=>sourceNames.includes(x));
      const contentFilters=selected.filter(x=>CONTENT_FILTERS.includes(x as typeof CONTENT_FILTERS[number]));
      const readOnly=selected.includes(READ_FILTER);
      const topics=selected.filter(x=>x!==READ_FILTER&&!difficulty.includes(x)&&!language.includes(x)&&!sourceFilters.includes(x)&&!contentFilters.includes(x as typeof CONTENT_FILTERS[number]));
      return (!normalizedQuery||queryTerms.some(term=>text.includes(term)))&&(!difficulty.length||difficulty.includes(article.difficulty))&&(!language.length||language.includes(article.language))&&(!sourceFilters.length||sourceFilters.includes(article.source))&&(!contentFilters.length||contentFilters.includes(article.contentType==='video'?'動画':'記事'))&&(!readOnly||readSlugs.has(article.slug))&&(!topics.length||topics.some(x=>text.includes(x.toLowerCase())));
    });
    return [...filtered].sort((a,b)=>sort==='newest'?b.publishedAt.localeCompare(a.publishedAt):sort==='shortest'?a.minutes-b.minutes:(Number(b.language===preferredLanguage)-Number(a.language===preferredLanguage))||(preferredLanguage==='Japanese'?Number(b.sourceSlug==='gto-wizard-japan')-Number(a.sourceSlug==='gto-wizard-japan'):0));
  },[query,selected,sort,preferredLanguage,readSlugs]);
  const pageCount=Math.max(1,Math.ceil(results.length/PAGE_SIZE));
  const visibleResults=results.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE);
  const normalizedIndexQuery=indexQuery.trim().toLowerCase();
  const visibleContentFilters=CONTENT_FILTERS.filter(label=>!normalizedIndexQuery||label.toLowerCase().includes(normalizedIndexQuery));
  const visibleQuickFilters=QUICK_FILTERS.filter(([value,label])=>!normalizedIndexQuery||`${value} ${label}`.toLowerCase().includes(normalizedIndexQuery));
  const normalizedFilterDialogQuery=filterDialogQuery.trim().toLowerCase();
  const visibleFilterGroups=groups.map(group=>({...group,items:group.items.filter(item=>!normalizedFilterDialogQuery||item.toLowerCase().includes(normalizedFilterDialogQuery))})).filter(group=>group.items.length>0);
  const filterCount=(item:string)=>articles.filter(article=>item==='記事'?article.contentType!=='video':item==='動画'?article.contentType==='video':item==='学習済み'?readSlugs.has(article.slug):['Beginner','Intermediate','Advanced'].includes(item)?article.difficulty===item:['Japanese','English'].includes(item)?article.language===item:sourceNames.includes(item)?article.source===item:[...article.tags,article.category].some(value=>value.toLowerCase().includes(item.toLowerCase()))).length;
  useEffect(()=>{setPage(1)},[query,selected,sort,preferredLanguage]);
  useEffect(()=>()=>{if(toolbarTimer.current)clearTimeout(toolbarTimer.current)},[]);
  const onFeedScroll=()=>{setToolbarVisible(false);if(toolbarTimer.current)clearTimeout(toolbarTimer.current);toolbarTimer.current=setTimeout(()=>setToolbarVisible(true),180)};
  const movePage=(next:number)=>{setPage(Math.min(pageCount,Math.max(1,next)));document.querySelector('.docs-feed')?.scrollTo({top:0,behavior:'smooth'})};
  return <main className="docs-v3"><div className="docs-v3-layout"><aside className="docs-editorial-index"><header><small>CONTENT LIBRARY</small><h2>探す</h2><p>条件を選んでコンテンツを絞り込む</p></header><label className="docs-index-search"><Search size={15}/><input value={indexQuery} onChange={event=>setIndexQuery(event.target.value)} placeholder="フィルターを検索" aria-label="フィルターを検索"/></label><div className="docs-index-group"><span className="docs-index-group-title">ライブラリ</span><button className={selected.length===0?'is-active':''} onClick={()=>setSelected([])}><span>{selected.length===0?<Check/>:<Circle/>}</span><div><strong>すべて</strong><small>{articles.length}件</small></div></button></div><div className="docs-index-group"><span className="docs-index-group-title">コンテンツの種類</span>{visibleContentFilters.map(label=><button key={label} className={selected.includes(label)?'is-active':''} onClick={()=>toggle(label)}><span>{selected.includes(label)?<Check/>:<Circle/>}</span><div><strong>{label}</strong><small>{articles.filter(article=>(article.contentType==='video'?'動画':'記事')===label).length}件</small></div></button>)}</div><div className="docs-index-group"><span className="docs-index-group-title">テーマ</span>{visibleQuickFilters.map(([value,label])=><button key={value} className={selected.includes(value)?'is-active':''} onClick={()=>toggle(value)}><span>{selected.includes(value)?<Check/>:<Circle/>}</span><div><strong>{label}</strong><small>{articles.filter(article=>[...article.tags,article.category].some(item=>item.toLowerCase().includes(value.toLowerCase()))).length}件</small></div></button>)}</div><div className="docs-index-status"><span>表示言語</span><strong>{preferredLanguage==='Japanese'?'日本語':'English'}</strong><button onClick={()=>setFiltersOpen(true)}><SlidersHorizontal/>詳細な絞り込み</button></div></aside>
      <section className="docs-feed" onScroll={onFeedScroll}>
        <div className={`feed-toolbar${toolbarVisible?'':' is-scrolling-hidden'}`}><span><strong>{results.length}</strong>件のコンテンツ</span><div className="feed-toolbar-controls"><button type="button" className="feed-filter-button" onClick={()=>setFiltersOpen(true)}><SlidersHorizontal size={14}/>絞り込み{selected.length>0&&<em>{selected.length}</em>}</button><label>並び替え<select value={sort} onChange={e=>setSort(e.target.value)}><option value="relevance">関連度順</option><option value="newest">新着順</option><option value="shortest">短い順</option></select></label></div></div>
        {results.length===0?<div className="docs-empty"><BookOpen size={31}/><h2>条件に合うコンテンツがありません</h2><p>別のキーワードまたは条件を試してください。</p><button onClick={reset}>条件をリセット</button></div>:
        <><div className="docs-feed-list">{visibleResults.map(article=><ArticleFeedRow article={article} onTagClick={toggle} key={article.slug}/>)}</div><nav className="docs-pagination" aria-label="記事一覧のページ"><button type="button" onClick={()=>movePage(page-1)} disabled={page===1}><ChevronLeft size={16}/>前へ</button><span><strong>{page}</strong> / {pageCount}</span><button type="button" onClick={()=>movePage(page+1)} disabled={page===pageCount}>次へ<ChevronRight size={16}/></button></nav></>}
      </section>
    </div>

    {filtersOpen&&<div className="filter-dialog-backdrop" onMouseDown={()=>setFiltersOpen(false)}><aside className="filter-dialog" onMouseDown={e=>e.stopPropagation()}><div className="filter-dialog-head"><div><p>FILTERS</p><h2>絞り込み</h2></div><button onClick={()=>setFiltersOpen(false)} aria-label="絞り込みを閉じる"><X/></button></div><label className="filter-dialog-search"><Search size={17}/><input value={filterDialogQuery} onChange={event=>setFilterDialogQuery(event.target.value)} placeholder="フィルターを検索" aria-label="フィルターを検索"/></label>{visibleFilterGroups.map(group=><section key={group.title}><h3>{group.title}</h3><div>{group.items.map(item=><label key={item}><input type="checkbox" checked={selected.includes(item)} onChange={()=>toggle(item)}/><span>{item}</span><small>{filterCount(item)}件</small></label>)}</div></section>)}{visibleFilterGroups.length===0&&<p className="filter-dialog-empty">一致するフィルターがありません</p>}<div className="filter-dialog-actions"><button onClick={reset}><RotateCcw size={15}/>リセット</button><button onClick={()=>setFiltersOpen(false)}>{results.length}件を表示</button></div></aside></div>}
  </main>
}
