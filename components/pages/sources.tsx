'use client';
import {useI18n} from '@/lib/i18n-client';

import {SourceDirectory} from '@/components/SourceDirectory';

export default function Sources(){
  const {t:uiText}=useI18n();
  return <main className="modern-sources" aria-labelledby="sources-page-title">
    <h1 id="sources-page-title" className="page-heading-visually-hidden">{uiText("情報源")}</h1>
    <section><SourceDirectory/></section>
  </main>;
}
