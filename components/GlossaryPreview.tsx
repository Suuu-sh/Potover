'use client';
import {useI18n} from '@/lib/i18n-client';
import Link from '@/components/LocaleLink';
import {ArrowRight} from 'lucide-react';

import {HomeSectionHeading} from '@/components/HomeSectionHeading';
import {glossaryTerms} from '@/lib/glossary';

const featuredGlossarySlugs=['equity','open-raise','icm'];

const featuredTerms=glossaryTerms.filter(term=>featuredGlossarySlugs.includes(term.slug));

export function GlossaryPreview(){
  const {t:uiText,href:localPath}=useI18n();
  return <section className="glossary-preview" aria-label={uiText("ポーカー用語集")}>
    <div className="modern-section-head">
      <HomeSectionHeading title={uiText("ポーカー用語集")} note="迷ったらここで確認"/>
      <Link href={localPath("/glossary")}>{uiText("すべて見る ")}<ArrowRight size={15} aria-hidden="true"/></Link>
    </div>
    <div className="glossary-preview-terms">
      {featuredTerms.map(term=><Link href={localPath("/glossary")} className="glossary-preview-term home-elevated-card" key={term.slug}>
        <div className="glossary-preview-term-meta"><span>{uiText(term.category)}</span><small>{uiText(term.reading)}</small></div>
        <h3>{uiText(term.term)}</h3>
        <p>{uiText(term.definition)}</p>
        <span className="glossary-preview-term-link">{uiText("用語集で見る ")}<ArrowRight size={14} aria-hidden="true"/></span>
      </Link>)}
    </div>
  </section>;
}
