import {articles} from '@/lib/data';
import {notFound} from 'next/navigation';
import {LearningLink} from '@/components/LearningLink';

export function generateStaticParams(){return articles.map(({slug})=>({slug}));}
export default function Article({params}:{params:{slug:string}}){
  const a=articles.find(x=>x.slug===params.slug);
  if(!a)return notFound();

  return <main className="shell page shared-header-page"><article className="detail">
    <div className="source">{a.source}</div>
    <h1>{a.title}</h1>
    <div className="meta"><span className="pill">{a.difficulty}</span><span className="pill gray">{a.language}</span><span>{a.publishedAt} · {a.minutes} min read</span></div>
    <div className="detailbox">
      <section className="detail-summary" aria-labelledby="article-summary-heading">
        <p className="detail-kicker">ARTICLE BRIEF</p>
        <h2 id="article-summary-heading">要約</h2>
        <p>{a.summary}</p>
      </section>
      <section className="detail-takeaways" aria-labelledby="article-takeaways-heading">
        <p className="detail-kicker">KEY TAKEAWAYS</p>
        <h2 id="article-takeaways-heading">大事なポイント</h2>
        <ul className="detail-points">{a.keyPoints.map((point,index)=><li key={`${a.slug}-point-${index}`}><span>{String(index+1).padStart(2,'0')}</span><p>{point}</p></li>)}</ul>
      </section>
      <div className="detail-tags">{a.tags.map(t=><span className="tag" key={t}>{t}</span>)}</div>
      <LearningLink className="cta" slug={a.slug} href={a.url}>元記事を読む ↗</LearningLink>
    </div>
  </article></main>
}
