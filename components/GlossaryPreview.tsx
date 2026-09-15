import Link from 'next/link';
import {ArrowRight, BookOpenText} from 'lucide-react';

import {glossaryTerms} from '@/lib/glossary';

const featuredGlossarySlugs=['equity','open-raise','icm'];

const featuredTerms=glossaryTerms.filter(term=>featuredGlossarySlugs.includes(term.slug));

export function GlossaryPreview(){
  return <section className="glossary-preview" aria-labelledby="glossary-preview-title">
    <div className="glossary-preview-intro">
      <div>
        <span className="glossary-preview-icon"><BookOpenText size={20} aria-hidden="true"/></span>
        <p className="glossary-preview-eyebrow">POKER GLOSSARY</p>
        <h2 id="glossary-preview-title">プレイを支える、ポーカー用語</h2>
        <p className="glossary-preview-lead">気になった言葉を短く確認して、次に読む記事を見つけよう。</p>
      </div>
      <Link href="/glossary">用語集を見る <ArrowRight size={15} aria-hidden="true"/></Link>
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
