import Link from 'next/link';
import {ArrowRight} from 'lucide-react';
import {SourceCard} from '@/components/SourceCard';
import {sources} from '@/lib/data';
export const metadata={title:'情報源 — Potover'};
export default function Sources(){return <main className="modern-sources sources-clean"><section><div className="modern-sources-head"><div><h2>情報源</h2><p>{sources.length}件</p></div><Link href="/docs">記事から探す <ArrowRight size={15}/></Link></div><div className="modern-source-list">{sources.map(s=><SourceCard source={s} key={s.slug}/>)}</div></section></main>}
