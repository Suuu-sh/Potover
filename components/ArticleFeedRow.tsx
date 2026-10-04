'use client';
import {useI18n} from '@/lib/i18n-client';

import {contentLabel} from '@/lib/content-labels';
import {ArrowUpRight,CalendarDays,Check,Globe2} from 'lucide-react';

import {Article} from '@/lib/data';
import {BookmarkButton} from '@/components/BookmarkButton';
import {LearningLink} from '@/components/LearningLink';
import {SourceFollowButton} from '@/components/SourceFollowButton';
import {useLearningHistory} from '@/lib/learning-history';
import ArticleLink from '@/components/ArticleLink';
import {ArticleArtwork} from '@/components/ArticleArtwork';

const sourceGlyphs:Record<string,string>={'gto-wizard':'W','gto-wizard-japan':'W','upswing-poker':'U','pokernews':'P','pokercoaching':'P'};

type ArticleFeedRowProps={article:Article;onTagClick?:(tag:string)=>void;compactActions?:boolean};

export function ArticleFeedRow({article,onTagClick,compactActions=false}:ArticleFeedRowProps){
  const {t:uiText,href:localPath}=useI18n();
  const {hasRead}=useLearningHistory();
  const read=hasRead(article.slug);
  const actionButtons=<BookmarkButton slug={article.slug}/>;
  return <article className="docs-feed-row">
    <ArticleLink slug={article.slug} className="article-cover" aria-label={uiText(`${article.title}の詳細`)}><ArticleArtwork article={article} sizes="(max-width: 640px) 100vw, (max-width: 720px) 34vw, 280px"/></ArticleLink>
    <div className="feed-copy"><div className="feed-source"><span className="source-glyph">{uiText(sourceGlyphs[article.sourceSlug]||article.source.slice(0,1))}</span><strong>{uiText(article.source)}</strong><SourceFollowButton sourceSlug={article.sourceSlug} sourceName={article.source}/><span className="content-kind">{uiText(article.contentType==='video'?'動画':'記事')}</span>{read&&<span className="read-status"><Check size={12} aria-hidden="true"/>{uiText(article.contentType==='video'?'視聴済み':'読了')}</span>}{compactActions&&<div className="feed-source-actions">{uiText(actionButtons)}</div>}</div>
      <ArticleLink slug={article.slug} className="feed-card-link"><h2 lang={article.language==='English'?'en':'ja'}>{article.title}</h2></ArticleLink>
      <div className="feed-tags"><span className="tag">{uiText(contentLabel(article.category))}</span>{article.tags.slice(0,3).map(tag=><button key={tag} type="button" onClick={()=>onTagClick?.(tag)}>{uiText(contentLabel(tag))}</button>)}</div>
      <div className="feed-meta"><span><Globe2 size={13}/>{uiText(contentLabel(article.language))}</span><span><CalendarDays size={13}/>{uiText(article.publishedAt)}</span><LearningLink slug={article.slug} href={localPath(article.url)}>{uiText(article.contentType==='video'?'元の動画を見る':'元記事を読む')} <ArrowUpRight size={13}/></LearningLink></div>
    </div>
    {!compactActions&&<div className="feed-actions">{uiText(actionButtons)}</div>}
  </article>
}
