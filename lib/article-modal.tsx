'use client';

import {createContext,useCallback,useContext,useEffect,useMemo,useState} from 'react';
import {ArrowUpRight,BookOpen,X} from 'lucide-react';
import {articles,Article} from '@/lib/data';
import {BookmarkButton} from '@/components/BookmarkButton';
import {LearningLink} from '@/components/LearningLink';

type ArticleModalContextValue={openArticle:(slug:string)=>void;closeArticle:()=>void};
const ArticleModalContext=createContext<ArticleModalContextValue|null>(null);

export function ArticleModalProvider({children}:{children:React.ReactNode}){
  const [slug,setSlug]=useState<string|null>(null);
  const article=slug?articles.find(item=>item.slug===slug)||null:null;
  const closeArticle=useCallback(()=>setSlug(null),[]);
  const openArticle=useCallback((nextSlug:string)=>setSlug(nextSlug),[]);
  useEffect(()=>{if(!article)return;const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape')closeArticle()};const previous=document.body.style.overflow;document.body.style.overflow='hidden';window.addEventListener('keydown',onKey);return()=>{document.body.style.overflow=previous;window.removeEventListener('keydown',onKey)}},[article,closeArticle]);
  const value=useMemo(()=>({openArticle,closeArticle}),[openArticle,closeArticle]);
  return <ArticleModalContext.Provider value={value}>{children}{article&&<ArticleModal article={article} onClose={closeArticle}/>}</ArticleModalContext.Provider>;
}

export function useArticleModal(){const value=useContext(ArticleModalContext);if(!value)throw new Error('useArticleModal must be used inside ArticleModalProvider');return value}

export function ArticleLink({slug,href,className,children,...props}:{slug:string;href?:string;className?:string;children:React.ReactNode;[key:string]:unknown}){
  const {openArticle}=useArticleModal();
  return <a {...props} className={className} href={href||`/articles/${slug}`} onClick={event=>{if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();openArticle(slug)}}>{children}</a>;
}

function ArticleModal({article,onClose}:{article:Article;onClose:()=>void}){
  return <div className="article-modal-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}><section className="article-modal" role="dialog" aria-modal="true" aria-labelledby="article-modal-title"><header className="article-modal-header"><div><p>{article.contentType==='video'?'VIDEO':'ARTICLE'}</p><span>{article.source}</span></div><button type="button" onClick={onClose} aria-label="詳細を閉じる"><X size={20}/></button></header><div className="article-modal-body"><h1 id="article-modal-title">{article.title}</h1><section className="article-modal-outline" aria-labelledby="article-modal-outline-title"><div className="article-modal-section-heading"><BookOpen size={17}/><h2 id="article-modal-outline-title">{article.contentType==='video'?'動画の内容':'見出し'}</h2></div><ol>{article.headings.map((heading,index)=><li data-level={heading.level} key={`${article.slug}-modal-heading-${index}`}><span>{String(index+1).padStart(2,'0')}</span><p>{heading.text}</p></li>)}</ol></section></div><footer className="article-modal-footer"><BookmarkButton slug={article.slug}/><LearningLink className="article-modal-cta" slug={article.slug} href={article.url}>{article.contentType==='video'?'YouTubeで見る':'元記事を読む'} <ArrowUpRight size={16}/></LearningLink></footer></section></div>;
}
