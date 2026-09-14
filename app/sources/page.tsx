import {BookOpen} from 'lucide-react';
import {SourceDirectory} from '@/components/SourceDirectory';
import {sources} from '@/lib/data';

export const metadata={title:'情報源 — Potover'};

export default function Sources(){
  return <main className="modern-sources">
    <header>
      <div><p>CURATED SOURCES</p><h1>情報源</h1><span>信頼できるポーカー記事・動画の出どころを見つける。</span></div>
      <div><BookOpen size={20} aria-hidden="true"/><strong>{sources.length}件の情報源</strong><span>記事や動画の出どころを一覧で確認できます。</span></div>
    </header>
    <section><SourceDirectory/></section>
  </main>;
}
