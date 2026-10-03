import Link from 'next/link';
import {ArrowRight,ExternalLink} from 'lucide-react';
import {articles} from '@/lib/data';
import {SourceFollowButton} from '@/components/SourceFollowButton';
type Source={slug:string;name:string;description:string;language:string;url:string};
export function SourceCard({source}:{source:Source}){const count=articles.filter(a=>a.sourceSlug===source.slug).length;return <article className="modern-source-row"><span className="modern-source-logo"><strong aria-hidden="true">{source.name.split(/\s+/).map(word=>word[0]).slice(0,2).join('')}</strong></span><div className="modern-source-copy"><p><span>{source.language}</span><a href={source.url} target="_blank" rel="noreferrer" aria-label={`${source.name}のWebサイトを開く`}><ExternalLink size={14}/></a><SourceFollowButton sourceSlug={source.slug} sourceName={source.name}/></p><h2>{source.name}</h2><p>{source.description}</p><small>{count}件の記事</small></div><Link className="modern-source-link" href={`/explore?q=${encodeURIComponent(source.name)}`}>記事を見る <ArrowRight size={15}/></Link></article>}
