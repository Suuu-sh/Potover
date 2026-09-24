import Link from 'next/link';
import {ArrowRight} from 'lucide-react';

import {HomeSectionHeading} from '@/components/HomeSectionHeading';
import {glossaryTerms} from '@/lib/glossary';

const featuredGlossarySlugs=['equity','open-raise','icm'];

const featuredTerms=glossaryTerms.filter(term=>featuredGlossarySlugs.includes(term.slug));

export function GlossaryPreview(){
  return <section className="glossary-preview" aria-label="ポーカー用語集">
    <div className="modern-section-head">
      <HomeSectionHeading title="ポーカー用語集" note="迷ったらここで確認"/>
      <Link href="/glossary">すべて見る <ArrowRight size={15} aria-hidden="true"/></Link>
    </div>
    <div className="glossary-preview-terms">
      {featuredTerms.map(term=><Link href="/glossary" className="glossary-preview-term home-elevated-card" key={term.slug}>
        <div className="glossary-preview-term-meta"><span>{term.category}</span><small>{term.reading}</small></div>
        <h3>{term.term}</h3>
        <p>{term.definition}</p>
        <span className="glossary-preview-term-link">用語集で見る <ArrowRight size={14} aria-hidden="true"/></span>
      </Link>)}
    </div>
  </section>;
}
