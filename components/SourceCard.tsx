import Image from 'next/image';
import Link from 'next/link';
import {ArrowRight,ExternalLink} from 'lucide-react';
import {articles} from '@/lib/data';
type Source={slug:string;name:string;description:string;language:string;url:string};
const logos:Record<string,string>={'gto-wizard':'/sources/gto-wizard.png','gto-wizard-japan':'/sources/gto-wizard.png','upswing-poker':'/sources/upswing.png','pokernews':'/sources/pokernews.png','pokercoaching':'/sources/pokercoaching.png','run-it-once':'/sources/run-it-once.png','poker-hack':'/sources/poker-hack.png'};
export function SourceCard({source}:{source:Source}){const count=articles.filter(a=>a.sourceSlug===source.slug).length;return <article className="modern-source-row"><span className="modern-source-logo"><Image src={logos[source.slug]||'/icon.png'} alt="" width={46} height={46}/></span><div className="modern-source-copy"><p><span>{source.language}</span><a href={source.url} target="_blank" rel="noreferrer" aria-label={`${source.name}のWebサイトを開く`}><ExternalLink size={14}/></a></p><h2>{source.name}</h2><p>{source.description}</p><small>{count}件の記事</small></div><Link className="modern-source-link" href={`/sources/${source.slug}`}>詳細を見る <ArrowRight size={15}/></Link></article>}
