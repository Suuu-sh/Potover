import {SourceDirectory} from '@/components/SourceDirectory';

export const metadata={title:'情報源 — Potover'};

export default function Sources(){
  return <main className="modern-sources" aria-labelledby="sources-page-title">
    <h1 id="sources-page-title" className="page-heading-visually-hidden">情報源</h1>
    <section><SourceDirectory/></section>
  </main>;
}
