import Link from 'next/link';
import {ArrowRight} from 'lucide-react';
import {SourceCard} from '@/components/SourceCard';
import {sources} from '@/lib/data';

export function SourceDirectory({compact=false}:{compact?:boolean}){
  return <div className={`source-directory-content${compact?' source-directory-content-compact':''}`}>
    <div className="modern-sources-head">
      <div><p>SOURCES</p><h2>{compact?'情報源':'すべての情報源'}</h2>{!compact&&<span>ポーカーの学びに役立つ情報源をまとめています。</span>}</div>
      {!compact&&<Link href="/explore">記事を探す <ArrowRight size={15} aria-hidden="true"/></Link>}
    </div>
    <div className="modern-source-list">{sources.map(source=><SourceCard source={source} key={source.slug}/>)}</div>
  </div>;
}
