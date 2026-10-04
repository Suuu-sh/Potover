'use client';
import {useI18n} from '@/lib/i18n-client';
import Link from '@/components/LocaleLink';
import {ArrowRight,ExternalLink} from 'lucide-react';
import {articles} from '@/lib/data';
import {SourceFollowButton} from '@/components/SourceFollowButton';
type Source={slug:string;name:string;description:string;language:string;url:string};
export function SourceCard({source}:{source:Source}){
  const {t:uiText,href:localPath}=useI18n();const count=articles.filter(a=>a.sourceSlug===source.slug).length;return <article className="modern-source-row"><span className="modern-source-logo"><strong aria-hidden="true">{uiText(source.name.split(/\s+/).map(word=>word[0]).slice(0,2).join(''))}</strong></span><div className="modern-source-copy"><p><span>{uiText(source.language)}</span><a href={localPath(source.url)} target="_blank" rel="noreferrer" aria-label={uiText(`${source.name}のWebサイトを開く`)}><ExternalLink size={14}/></a><SourceFollowButton sourceSlug={source.slug} sourceName={source.name}/></p><h2>{uiText(source.name)}</h2><p>{uiText(source.description)}</p><small>{uiText(count)}{uiText("件の記事")}</small></div><Link className="modern-source-link" href={localPath(`/explore?q=${encodeURIComponent(source.name)}`)}>{uiText("記事を見る ")}<ArrowRight size={15}/></Link></article>}
