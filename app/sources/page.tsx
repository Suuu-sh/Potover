import {SiteHeader} from '@/components/SiteHeader';
import {SourceCard} from '@/components/SourceCard';
import {sources} from '@/lib/data';
export const metadata={title:'情報源 — Potover'};
export default function Sources(){return <main className="library-page"><SiteHeader/><div className="library-wrap"><div className="library-intro"><p className="page-kicker">CURATED SOURCES</p><h1>情報源</h1><p>記事の出典を明確にし、詳しく読むときはオリジナルサイトへ。</p></div><div className="source-grid-new">{sources.map(s=><SourceCard source={s} key={s.slug}/>)}</div></div></main>}
