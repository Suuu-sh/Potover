import {articles} from '@/lib/data';
import {contentLabel} from '@/lib/content-labels';
import ArticleLink from '@/components/ArticleLink';
import {LearningLink} from '@/components/LearningLink';

export default function Articles(){const list=articles;return <main className="shell page shared-header-page articles-clean"><div className="articles-clean-toolbar"><strong>{list.length}</strong>件のコンテンツ</div><div className="grid">{list.map(a=><article className="card" key={a.slug}><div className="source">{a.source} · {a.contentType==='video'?'動画':'記事'}</div><ArticleLink slug={a.slug}><h3>{a.title}</h3></ArticleLink><div className="meta"><span className="tag">{contentLabel(a.category)}</span>{a.tags.map(t=><span className="tag" key={t}>{contentLabel(t)}</span>)}<span>{contentLabel(a.language)} · {a.publishedAt}</span></div><LearningLink slug={a.slug} href={a.url}>{a.contentType==='video'?'元の動画を見る':'元記事を読む'} ↗</LearningLink></article>)}</div></main>}
