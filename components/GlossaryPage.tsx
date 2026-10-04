'use client';
import {useI18n} from '@/lib/i18n-client';

import Link from '@/components/LocaleLink';
import {ArrowRight, BookOpenText, Search, X} from 'lucide-react';
import {useMemo, useState} from 'react';

import {glossaryCategories, glossaryTerms, type GlossaryCategory} from '@/lib/glossary';

export function GlossaryPage(){
  const {t:uiText,href:localPath}=useI18n();
  const [query,setQuery]=useState('');
  const [category,setCategory]=useState<GlossaryCategory>('すべて');
  const normalizedQuery=query.trim().toLowerCase();
  const results=useMemo(()=>glossaryTerms.filter(term=>{
    const matchesCategory=category==='すべて'||term.category===category;
    const searchable=[term.term,term.reading,term.definition,term.searchQuery,...term.relatedTags,...[term.term,term.definition,term.category,...term.relatedTags].map(value=>uiText(value))].join(' ').toLowerCase();
    return matchesCategory&&(!normalizedQuery||searchable.includes(normalizedQuery));
  }),[category,normalizedQuery,uiText]);

  return <main className="glossary-page shared-header-page" aria-labelledby="glossary-page-title">
    <div className="glossary-shell">
      <h1 id="glossary-page-title" className="page-heading-visually-hidden">{uiText("ポーカー用語集")}</h1>

      <section className="glossary-toolbar" aria-label={uiText("用語集の検索と絞り込み")}>
        <label className="glossary-search">
          <Search size={17} aria-hidden="true"/>
          <input value={query} onChange={event=>setQuery(event.target.value)} placeholder={uiText("用語や説明を検索…")} aria-label={uiText("用語や説明を検索")}/>
          {query&&<button type="button" onClick={()=>setQuery('')} aria-label={uiText("検索をクリア")}><X size={16}/></button>}
        </label>
        <div className="glossary-result-count"><strong>{uiText(results.length)}</strong>{uiText("語を表示")}</div>
      </section>

      <nav className="glossary-categories" aria-label={uiText("用語のカテゴリー")}>
        {glossaryCategories.map(item=><button key={item} type="button" className={category===item?'is-active':''} aria-pressed={category===item} onClick={()=>setCategory(item)}>{uiText(item)}</button>)}
      </nav>

      {results.length===0?<section className="glossary-empty" aria-live="polite"><BookOpenText size={28} aria-hidden="true"/><h2>{uiText("一致する用語がありません")}</h2><p>{uiText("検索語を変えるか、カテゴリーを「すべて」に戻してください。")}</p><button type="button" onClick={()=>{setQuery('');setCategory('すべて')}}>{uiText("条件をリセット")}</button></section>:
      <section className="glossary-grid" aria-live="polite">
        {results.map(term=><article className="glossary-card" key={term.slug}>
          <div className="glossary-card-top"><span>{uiText(term.category)}</span><small>{uiText(term.reading)}</small></div>
          <h2>{uiText(term.term)}</h2>
          <p>{uiText(term.definition)}</p>
          <div className="glossary-card-footer">
            <div className="glossary-related-tags">{term.relatedTags.map(tag=><span key={tag}>{uiText(tag)}</span>)}</div>
            <Link href={localPath(`/explore?q=${encodeURIComponent(term.searchQuery)}`)} aria-label={uiText(`${term.term}に関連する記事を探す`)}>{uiText("関連記事 ")}<ArrowRight size={14} aria-hidden="true"/></Link>
          </div>
        </article>)}
      </section>}
    </div>
  </main>;
}
