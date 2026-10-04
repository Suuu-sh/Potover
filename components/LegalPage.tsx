'use client';
import {useI18n} from '@/lib/i18n-client';
import styles from './LegalPage.module.css';

type LegalSection={title:string;paragraphs:string[]};

export function LegalPage({title,description,sections}:{title:string;description:string;sections:LegalSection[]}){
  const {t:uiText}=useI18n();
  return <main className={`shell page shared-header-page ${styles.page}`}>
    <header className={styles.heading}>
      <p className={styles.eyebrow}>POTOVER / INFORMATION</p>
      <h1>{uiText(title)}</h1>
      <p>{uiText(description)}</p>
    </header>
    <div className={styles.sections}>
      {sections.map(section=><section className={styles.section} key={section.title}>
        <h2>{uiText(section.title)}</h2>
        {section.paragraphs.map((paragraph,index)=><p key={`${section.title}-${index}`}>{uiText(paragraph)}</p>)}
      </section>)}
    </div>
    <p className={styles.updated}>{uiText("最終更新日：2026年10月4日")}</p>
  </main>;
}
