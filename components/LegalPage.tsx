import styles from './LegalPage.module.css';

type LegalSection={title:string;paragraphs:string[]};

export function LegalPage({title,description,sections}:{title:string;description:string;sections:LegalSection[]}){
  return <main className={`shell page shared-header-page ${styles.page}`}>
    <header className={styles.heading}>
      <p className={styles.eyebrow}>POTOVER / INFORMATION</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
    <div className={styles.sections}>
      {sections.map(section=><section className={styles.section} key={section.title}>
        <h2>{section.title}</h2>
        {section.paragraphs.map((paragraph,index)=><p key={`${section.title}-${index}`}>{paragraph}</p>)}
      </section>)}
    </div>
    <p className={styles.updated}>最終更新日：2026年10月3日</p>
  </main>;
}
