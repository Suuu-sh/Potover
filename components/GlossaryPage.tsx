'use client';

import Link from 'next/link';
import {ArrowRight, BookOpenText, Search, X} from 'lucide-react';
import {useMemo, useState} from 'react';

import {glossaryCategories, glossaryTerms, type GlossaryCategory} from '@/lib/glossary';

export function GlossaryPage(){
  const [query,setQuery]=useState('');
  const [category,setCategory]=useState<GlossaryCategory>('すべて');
  const normalizedQuery=query.trim().toLowerCase();
  const results=useMemo(()=>glossaryTerms.filter(term=>{
    const matchesCategory=category==='すべて'||term.category===category;
    const searchable=[term.term,term.reading,term.definition,...term.relatedTags].join(' ').toLowerCase();
    return matchesCategory&&(!normalizedQuery||searchable.includes(normalizedQuery));
  }),[category,normalizedQuery]);

  return <main className="glossary-page shared-header-page" aria-labelledby="glossary-page-title">
    <div className="glossary-shell">
      <h1 id="glossary-page-title" className="page-heading-visually-hidden">ポーカー用語集</h1>

      <section className="glossary-toolbar" aria-label="用語集の検索と絞り込み">
        <label className="glossary-search">
          <Search size={17} aria-hidden="true"/>
          <input value={query} onChange={event=>setQuery(event.target.value)} placeholder="用語や説明を検索…" aria-label="用語や説明を検索"/>
          {query&&<button type="button" onClick={()=>setQuery('')} aria-label="検索をクリア"><X size={16}/></button>}
        </label>
        <div className="glossary-result-count"><strong>{results.length}</strong>語を表示</div>
      </section>

      <nav className="glossary-categories" aria-label="用語のカテゴリー">
        {glossaryCategories.map(item=><button key={item} type="button" className={category===item?'is-active':''} aria-pressed={category===item} onClick={()=>setCategory(item)}>{item}</button>)}
      </nav>

      {results.length===0?<section className="glossary-empty" aria-live="polite"><BookOpenText size={28} aria-hidden="true"/><h2>一致する用語がありません</h2><p>検索語を変えるか、カテゴリーを「すべて」に戻してください。</p><button type="button" onClick={()=>{setQuery('');setCategory('すべて')}}>条件をリセット</button></section>:
      <section className="glossary-grid" aria-live="polite">
        {results.map(term=><article className="glossary-card" key={term.slug}>
          <div className="glossary-card-top"><span>{term.category}</span><small>{term.reading}</small></div>
          <h2>{term.term}</h2>
          <p>{term.definition}</p>
          <div className="glossary-card-footer">
            <div className="glossary-related-tags">{term.relatedTags.map(tag=><span key={tag}>{tag}</span>)}</div>
            <Link href={`/docs?q=${encodeURIComponent(term.searchQuery)}`} aria-label={`${term.term}に関連する記事を探す`}>関連記事 <ArrowRight size={14} aria-hidden="true"/></Link>
          </div>
        </article>)}
      </section>}
    </div>
  </main>;
}
