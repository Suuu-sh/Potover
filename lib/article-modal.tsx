'use client';

import {createContext,useCallback,useContext,useEffect,useMemo,useState} from 'react';
import {ArrowUpRight,CalendarDays,Globe2,X} from 'lucide-react';
import {articles,Article} from '@/lib/data';
import {BookmarkButton} from '@/components/BookmarkButton';
import {LearningLink} from '@/components/LearningLink';
import {AdSenseAd} from '@/components/AdSenseAd';
import {contentLabel} from '@/lib/content-labels';

type ArticleModalContextValue={openArticle:(slug:string)=>void;closeArticle:()=>void};
const ArticleModalContext=createContext<ArticleModalContextValue|null>(null);

export function ArticleModalProvider({children}:{children:React.ReactNode}){
  const [slug,setSlug]=useState<string|null>(null);
  const article=slug?articles.find(item=>item.slug===slug)||null:null;
  const closeArticle=useCallback(()=>setSlug(null),[]);
  const openArticle=useCallback((nextSlug:string)=>setSlug(nextSlug),[]);
  useEffect(()=>{if(!article)return;const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape')closeArticle()};const root=document.documentElement;const previousBodyOverflow=document.body.style.overflow;const previousRootOverflowY=root.style.overflowY;const previousBodyOverscroll=document.body.style.overscrollBehavior;const previousRootOverscroll=root.style.overscrollBehavior;document.body.style.overflow='hidden';root.style.overflowY='hidden';document.body.style.overscrollBehavior='none';root.style.overscrollBehavior='none';window.addEventListener('keydown',onKey);return()=>{document.body.style.overflow=previousBodyOverflow;root.style.overflowY=previousRootOverflowY;document.body.style.overscrollBehavior=previousBodyOverscroll;root.style.overscrollBehavior=previousRootOverscroll;window.removeEventListener('keydown',onKey)}},[article,closeArticle]);
  const value=useMemo(()=>({openArticle,closeArticle}),[openArticle,closeArticle]);
  return <ArticleModalContext.Provider value={value}>{children}{article&&<ArticleModal article={article} onClose={closeArticle}/>}</ArticleModalContext.Provider>;
}

export function useArticleModal(){const value=useContext(ArticleModalContext);if(!value)throw new Error('useArticleModal must be used inside ArticleModalProvider');return value}

export function ArticleLink({slug,href,className,children,...props}:{slug:string;href?:string;className?:string;children:React.ReactNode;[key:string]:unknown}){
  const {openArticle}=useArticleModal();
  return <a {...props} className={className} href={href||`/articles/${slug}`} onClick={event=>{if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();openArticle(slug)}}>{children}</a>;
}

function ArticleModal({article,onClose}:{article:Article;onClose:()=>void}){
  return <div className="article-modal-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}><section className="article-modal" role="dialog" aria-modal="true" aria-labelledby="article-modal-title"><header className="article-modal-header"><div><p>{article.contentType==='video'?'VIDEO':'ARTICLE'}</p><span>{article.source}</span><h1 id="article-modal-title">{article.title}</h1></div><button type="button" onClick={onClose} aria-label="詳細を閉じる"><X size={20}/></button></header><div className="article-modal-body"><div className="article-modal-meta"><span><CalendarDays size={14} aria-hidden="true"/>{article.publishedAt}</span><span><Globe2 size={14} aria-hidden="true"/>{contentLabel(article.language)}</span><span>{contentLabel(article.category)}</span></div><div className="detail-tags" style={{marginTop:20}}>{article.tags.map(tag=><span className="tag" key={tag}>{contentLabel(tag)}</span>)}</div><p>本文・動画は提供元のサイトでご覧ください。</p><AdSenseAd placement="feed"/></div><footer className="article-modal-footer"><BookmarkButton slug={article.slug}/><LearningLink className="article-modal-cta" slug={article.slug} href={article.url}>{article.contentType==='video'?'元の動画を見る':'元記事を読む'} <ArrowUpRight size={16}/></LearningLink></footer></section></div>;
}
