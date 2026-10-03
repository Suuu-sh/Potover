import {articles} from '@/lib/data';
import {contentLabel} from '@/lib/content-labels';
import {notFound} from 'next/navigation';
import {LearningLink} from '@/components/LearningLink';
import {BookmarkButton} from '@/components/BookmarkButton';
import {AdSenseAd} from '@/components/AdSenseAd';

export function generateStaticParams(){return articles.map(({slug})=>({slug}));}
export default async function Article({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const a=articles.find(x=>x.slug===slug);
  if(!a)return notFound();

  return <main className="shell page shared-header-page article-detail-page"><article className="detail">
    <div className="source">{a.source}</div>
    <h1>{a.title}</h1>
    <div className="meta"><span className="pill gray">{contentLabel(a.language)}</span><span>{a.publishedAt} · {a.contentType==='video'?'動画':'記事'}</span><span>{contentLabel(a.category)}</span></div>
    <div className="detailbox">
      <p>本文・動画は提供元のサイトでご覧ください。</p>
      <div className="detail-footer"><div className="detail-tags">{a.tags.map(t=><span className="tag" key={t}>{contentLabel(t)}</span>)}</div><BookmarkButton slug={a.slug}/><LearningLink className="cta" slug={a.slug} href={a.url}>{a.contentType==='video'?'元の動画を見る':'元記事を読む'} ↗</LearningLink></div>
    </div>
    <AdSenseAd placement="feed"/>
  </article></main>
}
