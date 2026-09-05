'use client';

import Image from 'next/image';
import {CalendarDays,Clock3,ExternalLink,Globe2} from 'lucide-react';
import {useEffect,useState} from 'react';

import {Article} from '@/lib/data';
import {BookmarkButton} from '@/components/BookmarkButton';
import {LearningLink} from '@/components/LearningLink';
import {getLearningHistory} from '@/lib/learning-history';
import ArticleLink from '@/components/ArticleLink';

const sourceImages:Record<string,string>={'gto-wizard':'/sources/gto-wizard.png','gto-wizard-japan':'/sources/gto-wizard.png','upswing-poker':'/sources/upswing.png','pokernews':'/sources/pokernews.png','pokercoaching':'/sources/pokercoaching.png'};
const sourceGlyphs:Record<string,string>={'gto-wizard':'W','upswing-poker':'U','pokernews':'P','pokercoaching':'P'};

export function ArticleFeedRow({article,onTagClick}:{article:Article;onTagClick?:(tag:string)=>void}){
  const [read,setRead]=useState(false);
  useEffect(()=>{const sync=()=>setRead(getLearningHistory().some(event=>event.slug===article.slug));sync();window.addEventListener('potover-learning-changed',sync);return()=>window.removeEventListener('potover-learning-changed',sync)},[article.slug]);
  return <article className={`docs-feed-row${read?' is-read':''}`}>
    <ArticleLink slug={article.slug} className="article-cover"><Image src={article.imageUrl||sourceImages[article.sourceSlug]||'/icon.png'} alt="" fill sizes="(max-width: 720px) 34vw, 280px"/></ArticleLink>
    <div className="feed-copy"><div className="feed-source"><span className="source-glyph">{sourceGlyphs[article.sourceSlug]||article.source.slice(0,1)}</span><strong>{article.source}</strong><span className="content-kind">{article.contentType==='video'?'動画':'記事'}</span></div>
      <ArticleLink slug={article.slug}><h2>{article.title}</h2></ArticleLink><p>{article.summary}</p>
      <div className="feed-tags">{article.tags.slice(0,3).map(tag=><button key={tag} type="button" onClick={()=>onTagClick?.(tag)}>{tag}</button>)}</div>
      <div className="feed-meta"><span>{article.difficulty}</span><span><Globe2 size={13}/>{article.language}</span><span><CalendarDays size={13}/>{article.publishedAt}</span><span><Clock3 size={13}/>{article.contentType==='video'?`${article.minutes}分`:`${article.minutes}分で読了`}</span></div>
    </div>
    <div className="feed-actions"><BookmarkButton slug={article.slug}/><LearningLink slug={article.slug} href={article.url} aria-label={article.contentType==='video'?'YouTubeで見る':'元記事を開く'}><ExternalLink size={20}/></LearningLink></div>
  </article>
}
