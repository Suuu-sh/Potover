'use client';
import Link from 'next/link';
import {ArrowRight,Bookmark as BookmarkIcon} from 'lucide-react';
import {useEffect,useState} from 'react';

import {articles} from '@/lib/data';
import {ArticleFeedRow} from '@/components/ArticleFeedRow';
import {getBookmarks} from '@/components/BookmarkButton';
export default function Bookmarks(){const [ids,setIds]=useState<string[]>([]);useEffect(()=>{const sync=()=>setIds(getBookmarks());sync();window.addEventListener('potover-bookmarks-changed',sync);return()=>window.removeEventListener('potover-bookmarks-changed',sync)},[]);const saved=articles.filter(a=>ids.includes(a.slug));return <main className="library-page bookmarks-page"><div className="library-wrap"><div className="library-toolbar"><span>{saved.length}件の記事</span><Link href="/docs">記事を探す <ArrowRight size={15}/></Link></div>{saved.length===0?<div className="bookmark-empty"><BookmarkIcon size={30}/><h2>保存した記事はありません</h2><p>記事一覧のブックマークアイコンから保存できます。</p><Link href="/docs">記事を探す</Link></div>:<section className="docs-feed bookmark-docs-feed"><div className="docs-feed-list">{saved.map(article=><ArticleFeedRow article={article} key={article.slug}/>)}</div></section>}<div className="library-note"><BookmarkIcon size={18}/><span>保存内容はこのブラウザに保存されます。</span></div></div></main>}
