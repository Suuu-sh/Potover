'use client';
import {useI18n} from '@/lib/i18n-client';

import {useEffect,useMemo,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {BookOpen,Check,ChevronLeft,ChevronRight,Circle,RotateCcw,Search,SlidersHorizontal,X} from 'lucide-react';

import {ArticleFeedRow} from '@/components/ArticleFeedRow';
import {contentQueryTerms} from '@/lib/content-search';
import {contentLabel} from '@/lib/content-labels';
import {articles as initialArticles,Article,sources} from '@/lib/data';
import {useLearningHistory} from '@/lib/learning-history';
import {useAuth} from '@/lib/auth-client';
import {useUserPreferences} from '@/lib/user-preferences';
import {usePreferredLanguage} from '@/lib/use-preferred-language';

const sourceNames=sources.map(source=>source.name);
const READ_FILTER='学習済み';
const CONTENT_FILTERS=['記事','動画'] as const;
const QUICK_FILTERS=[['Preflop','プリフロップ'],['Flop','フロップ'],['GTO','GTO'],['cash-game','キャッシュ'],['MTT','MTT']] as const;
const PAGE_SIZE=20;
const groups=[
  {title:'ストリート',items:['Preflop','Flop','Turn','River']},
  {title:'戦略・テーマ',items:['GTO','Bluff','ICM','Exploit','Cash Game','MTT']},
  {title:'言語',items:['Japanese','English']},
  {title:'種類',items:[...CONTENT_FILTERS]},
  {title:'ソース',items:sourceNames},
  {title:'学習状況',items:[READ_FILTER]},
];

export default function Explore(){
  const {t:uiText}=useI18n();
  const articles:Article[]=initialArticles;
  const [query,setQuery]=useState('');
  const [selected,setSelected]=useState<string[]>([]);
  const [filtersOpen,setFiltersOpen]=useState(false);
  const [page,setPage]=useState(1);
  const [indexQuery,setIndexQuery]=useState('');
  const [filterDialogQuery,setFilterDialogQuery]=useState('');
  const [filtersHydrated,setFiltersHydrated]=useState(false);
  const [isScrolling,setIsScrolling]=useState(false);
  const {user,loading:authLoading}=useAuth();
  const {docsQuery,docsFilters,loading:preferencesLoading,setDocsFilters}=useUserPreferences();
  const initializedForUser=useRef<string|null|undefined>(undefined);
  const {events}=useLearningHistory();
  const readSlugs=useMemo(()=>new Set(events.map(event=>event.slug)),[events]);
  const [preferredLanguage]=usePreferredLanguage();
  useEffect(()=>{
    if(authLoading||(user&&preferencesLoading))return;
    const userKey=user?.id||null;
    if(initializedForUser.current===userKey)return;
    initializedForUser.current=userKey;
    const params=new URLSearchParams(location.search);
    const urlQuery=params.get('q');
    const urlFilters=params.get('filters');
    if(urlQuery!==null)setQuery(urlQuery);else setQuery(user?docsQuery:'');
    if(urlFilters!==null)setSelected(urlFilters?urlFilters.split(',').filter(value=>value&&(![READ_FILTER].includes(value)||Boolean(user))):[]);
    else setSelected(user?docsFilters:[]);
    setFiltersHydrated(true);
  },[authLoading,docsFilters,docsQuery,preferencesLoading,user]);
  useEffect(()=>{
    if(!filtersHydrated)return;
    let saveTimer:number|undefined;
    if(user&&!preferencesLoading)saveTimer=window.setTimeout(()=>{void setDocsFilters({query,selected})},300);
    const url=new URL(location.href);
    if(query)url.searchParams.set('q',query);else url.searchParams.delete('q');
    if(selected.length)url.searchParams.set('filters',selected.join(','));else url.searchParams.delete('filters');
    history.replaceState(null,'',url);
    return()=>{if(saveTimer!==undefined)window.clearTimeout(saveTimer)};
  },[filtersHydrated,preferencesLoading,query,selected,setDocsFilters,user]);
  const toggle=(value:string)=>setSelected(old=>old.includes(value)?old.filter(x=>x!==value):[...old,value]);
  const reset=()=>{setSelected([]);setQuery('');setIndexQuery('');setFilterDialogQuery('');const url=new URL(location.href);url.searchParams.delete('q');url.searchParams.delete('filters');history.replaceState(null,'',url)};
  const results=useMemo(()=>{
    const filtered=articles.filter(article=>{
      const text=[article.title,article.source,...article.tags,article.category,article.contentType==='video'?'動画 youtube video':'記事 article'].join(' ').toLowerCase();
      const normalizedQuery=query.trim().toLowerCase();
      const queryTerms=contentQueryTerms(normalizedQuery);
      const language=selected.filter(x=>['Japanese','English'].includes(x));
      const sourceFilters=selected.filter(x=>sourceNames.includes(x));
      const contentFilters=selected.filter(x=>CONTENT_FILTERS.includes(x as typeof CONTENT_FILTERS[number]));
      const readOnly=selected.includes(READ_FILTER);
      const topics=selected.filter(x=>x!==READ_FILTER&&!language.includes(x)&&!sourceFilters.includes(x)&&!contentFilters.includes(x as typeof CONTENT_FILTERS[number]));
      return (!normalizedQuery||queryTerms.some(term=>text.includes(term)))&&(!language.length||language.includes(article.language))&&(!sourceFilters.length||sourceFilters.includes(article.source))&&(!contentFilters.length||contentFilters.includes(article.contentType==='video'?'動画':'記事'))&&(!readOnly||readSlugs.has(article.slug))&&(!topics.length||topics.some(x=>text.includes(x.toLowerCase())));
    });
    return [...filtered].sort((a,b)=>(Number(b.language===preferredLanguage)-Number(a.language===preferredLanguage))||(preferredLanguage==='Japanese'?Number(b.sourceSlug==='gto-wizard-japan')-Number(a.sourceSlug==='gto-wizard-japan'):0));
  },[query,selected,preferredLanguage,readSlugs]);
  const pageCount=Math.max(1,Math.ceil(results.length/PAGE_SIZE));
  const visibleResults=results.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE);
  const normalizedIndexQuery=indexQuery.trim().toLowerCase();
  const visibleContentFilters=CONTENT_FILTERS.filter(label=>!normalizedIndexQuery||`${label} ${uiText(label)}`.toLowerCase().includes(normalizedIndexQuery));
  const visibleQuickFilters=QUICK_FILTERS.filter(([value,label])=>!normalizedIndexQuery||`${value} ${label}`.toLowerCase().includes(normalizedIndexQuery));
  const normalizedFilterDialogQuery=filterDialogQuery.trim().toLowerCase();
  const visibleFilterGroups=groups.filter(group=>user||group.title!=='学習状況').map(group=>({...group,items:group.items.filter(item=>!normalizedFilterDialogQuery||`${item} ${contentLabel(item)} ${uiText(contentLabel(item))}`.toLowerCase().includes(normalizedFilterDialogQuery))})).filter(group=>group.items.length>0);
  const selectedContentTypes=selected.filter(value=>CONTENT_FILTERS.includes(value as typeof CONTENT_FILTERS[number]));
  const countArticles=articles.filter(article=>!selectedContentTypes.length||selectedContentTypes.includes(article.contentType==='video'?'動画':'記事'));
  const filterCount=(item:string)=>(CONTENT_FILTERS.includes(item as typeof CONTENT_FILTERS[number])?articles:countArticles).filter(article=>item==='記事'?article.contentType!=='video':item==='動画'?article.contentType==='video':item==='学習済み'?readSlugs.has(article.slug):['Japanese','English'].includes(item)?article.language===item:sourceNames.includes(item)?article.source===item:[...article.tags,article.category].some(value=>value.toLowerCase().includes(item.toLowerCase()))).length;
  useEffect(()=>{setPage(1)},[query,selected,preferredLanguage]);
  useEffect(()=>{
    const feed=document.querySelector<HTMLElement>('.docs-feed');
    let timeout:number|null=null;
    const onScroll=()=>{
      setIsScrolling(true);
      if(timeout!==null)window.clearTimeout(timeout);
      timeout=window.setTimeout(()=>setIsScrolling(false),180);
    };
    window.addEventListener('scroll',onScroll,{passive:true});
    feed?.addEventListener('scroll',onScroll,{passive:true});
    return()=>{
      window.removeEventListener('scroll',onScroll);
      feed?.removeEventListener('scroll',onScroll);
      if(timeout!==null)window.clearTimeout(timeout);
    };
  },[]);
  const movePage=(next:number)=>{setPage(Math.min(pageCount,Math.max(1,next)));document.querySelector('.docs-feed')?.scrollTo({top:0,behavior:'smooth'})};
  const filterDialog=filtersOpen?<div className="filter-dialog-backdrop" onMouseDown={()=>setFiltersOpen(false)}><aside className="filter-dialog" onMouseDown={e=>e.stopPropagation()}><div className="filter-dialog-head"><div><h2>{uiText("絞り込み")}</h2></div><button onClick={()=>setFiltersOpen(false)} aria-label={uiText("絞り込みを閉じる")}><X/></button></div><label className="filter-dialog-search"><Search size={17}/><input value={filterDialogQuery} onChange={event=>setFilterDialogQuery(event.target.value)} placeholder={uiText("フィルターを検索")} aria-label={uiText("フィルターを検索")}/></label>{visibleFilterGroups.map(group=><section key={group.title}><h3>{uiText(group.title)}</h3><div>{group.items.map(item=><label key={item}><input type="checkbox" checked={selected.includes(item)} onChange={()=>toggle(item)}/><span>{uiText(contentLabel(item))}</span><small>{uiText(filterCount(item))}</small></label>)}</div></section>)}{visibleFilterGroups.length===0&&<p className="filter-dialog-empty">{uiText("一致するフィルターがありません")}</p>}<div className="filter-dialog-actions"><button onClick={reset}><RotateCcw size={15}/>{uiText("リセット")}</button><button onClick={()=>setFiltersOpen(false)}>{uiText(results.length)}{uiText("件を表示")}</button></div></aside></div>:null;
  return <main className="docs-v3"><div className="docs-v3-layout"><aside className="docs-editorial-index"><header className="docs-index-heading"><h2>{uiText("絞り込み")}</h2><button type="button" onClick={()=>{setSelected([]);setIndexQuery('')}}>{uiText("リセット")}</button></header><label className="docs-index-search"><Search size={15}/><input value={indexQuery} onChange={event=>setIndexQuery(event.target.value)} placeholder={uiText("フィルターを検索")} aria-label={uiText("フィルターを検索")}/></label><div className="docs-index-group"><span className="docs-index-group-title">{uiText("コンテンツ")}</span><button className={selected.length===0?'is-active':''} onClick={()=>setSelected([])}><span>{selected.length===0&&<Check/>}</span><div><strong>{uiText("すべて")}</strong><small>{uiText(articles.length)}</small></div></button>{visibleContentFilters.map(label=><button key={label} className={selected.includes(label)?'is-active':''} onClick={()=>toggle(label)}><span>{selected.includes(label)&&<Check/>}</span><div><strong>{uiText(label)}</strong><small>{uiText(articles.filter(article=>(article.contentType==='video'?'動画':'記事')===label).length)}</small></div></button>)}</div><div className="docs-index-group"><span className="docs-index-group-title">{uiText("テーマ")}</span>{visibleQuickFilters.map(([value,label])=><button key={value} className={selected.includes(value)?'is-active':''} onClick={()=>toggle(value)}><span>{selected.includes(value)&&<Check/>}</span><div><strong>{uiText(label)}</strong><small>{uiText(filterCount(value))}</small></div></button>)}</div><div className="docs-index-status"><button onClick={()=>setFiltersOpen(true)}>{uiText("詳細な絞り込み")}<span aria-hidden="true">→</span></button></div></aside>
      <section className="docs-feed">
        <div className={`feed-toolbar${isScrolling?' is-scrolling':''}`}><span><strong>{uiText(results.length)}</strong>{uiText("件のコンテンツ")}</span><div className="feed-toolbar-controls"><button type="button" className="feed-filter-button" onClick={()=>setFiltersOpen(true)}><SlidersHorizontal size={14}/>{uiText("絞り込み")}{selected.length>0&&<em>{uiText(selected.length)}</em>}</button></div></div>
        {(query||selected.length>0)&&<div className="active-filter-list" aria-label={uiText("選択中の絞り込み")}>{query&&<button type="button" onClick={()=>{setQuery('');const url=new URL(location.href);url.searchParams.delete('q');url.searchParams.delete('filters');history.replaceState(null,'',url)}} aria-label={uiText(`検索「${query}」を解除`)}>{uiText("検索：")}{uiText(query)}<X size={14}/></button>}{selected.map(value=><button type="button" key={value} onClick={()=>toggle(value)} aria-label={uiText(`${contentLabel(value)}を解除`)}>{uiText(contentLabel(value))}<X size={14}/></button>)}<button type="button" className="clear-filters" onClick={reset}>{uiText("すべて解除")}</button></div>}
        {results.length===0?<div className="docs-empty"><BookOpen size={31}/><h2>{uiText("条件に合うコンテンツがありません")}</h2><p>{uiText("別のキーワードまたは条件を試してください。")}</p><button onClick={reset}>{uiText("条件をリセット")}</button></div>:
        <><div className="docs-feed-list">{visibleResults.map(article=><ArticleFeedRow article={article} compactActions onTagClick={toggle} key={article.slug}/>)}</div><nav className="docs-pagination" aria-label={uiText("記事一覧のページ")}><button type="button" onClick={()=>movePage(page-1)} disabled={page===1}><ChevronLeft size={16}/>{uiText("前へ")}</button><span><strong>{uiText(page)}</strong> / {uiText(pageCount)}</span><button type="button" onClick={()=>movePage(page+1)} disabled={page===pageCount}>{uiText("次へ")}<ChevronRight size={16}/></button></nav></>}
      </section>
    </div>

    {uiText(filterDialog&&typeof document!=='undefined' ? createPortal(filterDialog,document.body) : null)}
  </main>
}
