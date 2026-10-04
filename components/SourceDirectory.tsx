'use client';
import {useI18n} from '@/lib/i18n-client';
import Link from '@/components/LocaleLink';
import {ArrowRight} from 'lucide-react';
import {SourceCard} from '@/components/SourceCard';
import {sources} from '@/lib/data';

export function SourceDirectory({compact=false}:{compact?:boolean}){
  const {t:uiText,href:localPath}=useI18n();
  return <div className={`source-directory-content${compact?' source-directory-content-compact':''}`}>
    <div className="modern-sources-head">
      <div><h2>{uiText(compact?'情報源':'すべての情報源')}</h2>{!compact&&<span>{uiText("ポーカーの学びに役立つ情報源をまとめています。")}</span>}</div>
      {!compact&&<Link href={localPath("/explore")}>{uiText("記事を探す ")}<ArrowRight size={15} aria-hidden="true"/></Link>}
    </div>
    <div className="modern-source-list">{sources.map(source=><SourceCard source={source} key={source.slug}/>)}</div>
  </div>;
}
