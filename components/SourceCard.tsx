import Link from 'next/link';
import {ExternalLink, ArrowRight} from 'lucide-react';
import {articles} from '@/lib/data';
type Source={slug:string;name:string;description:string;language:string;url:string};
export function SourceCard({source}:{source:Source}){const count=articles.filter(a=>a.sourceSlug===source.slug).length;return <article className="source-card-new"><div className="source-card-top"><span className="source-badge">{source.name.slice(0,1)}</span><span className="source-lang">{source.language}</span></div><h2>{source.name}</h2><p>{source.description}</p><div className="source-card-meta"><span>{count}件の記事</span><a href={source.url} target="_blank" rel="noreferrer" aria-label={`${source.name}のWebサイトを開く`}><ExternalLink size={15}/></a><Link href={`/sources/${source.slug}`}>詳細を見る <ArrowRight size={14}/></Link></div></article>}
