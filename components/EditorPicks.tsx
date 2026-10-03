import Link from 'next/link';
import ArticleLink from '@/components/ArticleLink';
import {ArrowRight,BookOpen,ExternalLink,Play} from 'lucide-react';
import {articles} from '@/lib/data';
import {contentLabel} from '@/lib/content-labels';
import {LearningLink} from '@/components/LearningLink';

export function EditorPicks(){return <section className="editor-picks"><div className="picks-head"><h2>編集部のおすすめ</h2><Link href="/explore">すべて見る <ArrowRight size={15}/></Link></div><div className="pick-list">{articles.slice(0,3).map(a=><article className="pick-row" key={a.slug}><span className="pick-logo" style={{display:'grid',placeItems:'center'}}>{a.contentType==='video'?<Play size={28} aria-hidden="true"/>:<BookOpen size={28} aria-hidden="true"/>}</span><div className="pick-copy"><ArticleLink slug={a.slug}><h3>{a.title}</h3></ArticleLink><p>{contentLabel(a.category)}</p></div><span className="pick-source">{a.source}</span><span className="pick-language">{contentLabel(a.language)}</span><span className="pick-time">{a.publishedAt}</span><LearningLink slug={a.slug} href={a.url} aria-label={`${a.title}を提供元で開く`}><ExternalLink size={17}/></LearningLink></article>)}</div></section>}
