'use client';

import Link from 'next/link';
import {ArrowRight, Bookmark as BookmarkIcon, LockKeyhole} from 'lucide-react';
import {useEffect, useState} from 'react';

import {articles} from '@/lib/data';
import {ArticleFeedRow} from '@/components/ArticleFeedRow';
import {getBookmarks} from '@/components/BookmarkButton';

export default function Bookmarks() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setIds(getBookmarks());
    sync();
    window.addEventListener('potover-bookmarks-changed', sync);
    return () => window.removeEventListener('potover-bookmarks-changed', sync);
  }, []);

  const saved = articles.filter(article => ids.includes(article.slug));

  return (
    <main className="library-page bookmarks-page">
      <div className="library-wrap">
        <div className="library-toolbar">
          <h1>保存した記事</h1>
          <span>{saved.length}件</span>
        </div>
        {saved.length === 0 ? (
          <section className="bookmark-empty" aria-labelledby="bookmark-empty-title">
            <BookmarkIcon className="bookmark-empty-icon" size={40} aria-hidden="true"/>
            <div className="bookmark-empty-copy">
              <h2 id="bookmark-empty-title">保存した記事はまだありません</h2>
              <p>気になる記事を保存して、あとから読み返せます。</p>
            </div>
            <Link href="/docs">記事を探す <ArrowRight size={18} aria-hidden="true"/></Link>
          </section>
        ) : (
          <section className="docs-feed bookmark-docs-feed">
            <div className="docs-feed-list">
              {saved.map(article => <ArticleFeedRow article={article} compactActions key={article.slug}/>)}
            </div>
          </section>
        )}
        <div className="library-note">
          <LockKeyhole size={16} aria-hidden="true"/>
          <span>このブラウザに保存されます。</span>
        </div>
      </div>
    </main>
  );
}
