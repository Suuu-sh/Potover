import {articles} from '@/lib/data';
import {notFound} from 'next/navigation';
import {LearningLink} from '@/components/LearningLink';
import {AdSenseAd} from '@/components/AdSenseAd';

export function generateStaticParams(){return articles.map(({slug})=>({slug}));}
export default function Article({params}:{params:{slug:string}}){
  const a=articles.find(x=>x.slug===params.slug);
  if(!a)return notFound();

  return <main className="shell page shared-header-page article-detail-page"><article className="detail">
    <div className="source">{a.source}</div>
    <h1>{a.title}</h1>
    <div className="meta"><span className="pill gray">{a.language==='Japanese'?'日本語':a.language==='English'?'英語':a.language}</span><span>{a.publishedAt} · {a.contentType==='video'?`${a.minutes}分の動画`:`約${a.minutes}分で読めます`}</span></div>
    <div className="detailbox">
      <section className="detail-takeaways" aria-labelledby="article-outline-heading">
        <h2 id="article-outline-heading">{a.contentType==='video'?'動画の内容':'見出し'}</h2>
        <ol className="detail-points detail-outline">{a.headings.map((heading,index)=><li data-level={heading.level} key={`${a.slug}-heading-${index}`}><p>{heading.text}</p></li>)}</ol>
      </section>
      <div className="detail-footer"><div className="detail-tags">{a.tags.map(t=><span className="tag" key={t}>{t}</span>)}</div><LearningLink className="cta" slug={a.slug} href={a.url}>{a.contentType==='video'?'YouTubeで見る':'元記事を読む'} ↗</LearningLink></div>
    </div>
    <AdSenseAd placement="feed"/>
  </article></main>
}
