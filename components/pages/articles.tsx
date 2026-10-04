'use client';
import {useI18n} from '@/lib/i18n-client';

import {articles} from '@/lib/data';
import {contentLabel} from '@/lib/content-labels';
import ArticleLink from '@/components/ArticleLink';
import {LearningLink} from '@/components/LearningLink';
import {ArticlePreview} from '@/components/ArticlePreview';

export default function Articles(){
  const {t:uiText,href:localPath}=useI18n();const list=articles;return <main className="shell page shared-header-page articles-clean"><div className="articles-clean-toolbar"><strong>{uiText(list.length)}</strong>{uiText("件のコンテンツ")}</div><div className="grid">{list.map(a=><article className="card" key={a.slug}>{a.preview&&<LearningLink slug={a.slug} href={a.url} aria-label={uiText(`${a.title}を提供元で開く`)}><ArticlePreview preview={a.preview} contentType={a.contentType}/></LearningLink>}<div className="source">{uiText(a.source)} · {uiText(a.contentType==='video'?'動画':'記事')}</div><ArticleLink slug={a.slug}><h3 lang={a.language==='English'?'en':'ja'}>{a.title}</h3></ArticleLink><div className="meta"><span className="tag">{uiText(contentLabel(a.category))}</span>{a.tags.map(t=><span className="tag" key={t}>{uiText(contentLabel(t))}</span>)}<span>{uiText(contentLabel(a.language))} · {uiText(a.publishedAt)}</span></div><LearningLink slug={a.slug} href={localPath(a.url)}>{uiText(a.contentType==='video'?'元の動画を見る':'元記事を読む')} ↗</LearningLink></article>)}</div></main>}
