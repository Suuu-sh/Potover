'use client';

import Image from 'next/image';
import Link from 'next/link';
import {ArrowRight, ArrowUpRight} from 'lucide-react';
import {usePathname} from 'next/navigation';
import {useAuth} from '@/lib/auth-client';
import {sources as sourceCatalog} from '@/lib/data';
import styles from './SiteFooter.module.css';

const siteNavigation=[{href:'/',label:'ホーム'},{href:'/explore',label:'記事・動画を探す'},{href:'/glossary',label:'ポーカー用語集'}];
const learningNavigation=[{href:'/roadmap',label:'学習ロードマップ'},{href:'/bookmarks',label:'ブックマーク'}];
const featuredSourceSlugs=['gto-wizard-japan','gto-wizard','upswing-poker'];
const featuredSources=featuredSourceSlugs.map(slug=>sourceCatalog.find(source=>source.slug===slug)).filter((source):source is (typeof sourceCatalog)[number]=>Boolean(source));

export function SiteFooter(){
  const pathname=usePathname();
  const {user}=useAuth();
  if(pathname === '/login' || pathname.startsWith('/login/')) return null;
  const visibleLearningNavigation=[{...learningNavigation[0],href:user?learningNavigation[0].href:`/login?next=${encodeURIComponent('/roadmap')}`},learningNavigation[1]];
  return <footer className={styles.footer}>
    <div className={styles.inner}>
      <div className={styles.top}>
        <div className={styles.brandColumn}>
          <Link href="/" className={styles.brand} aria-label="Potover ホーム">
            <span className={styles.brandMark}><Image className={styles.lightMark} src="/brand/potover-mark-light.png" alt="" width={38} height={38}/><Image className={styles.darkMark} src="/brand/potover-mark-dark.png" alt="" width={38} height={38}/></span>
            <span>Potover</span>
          </Link>
          <p className={styles.tagline}>ポーカーの学びを、ひとつの場所に。</p>
          <p className={styles.description}>記事や動画を探して、次に学ぶテーマを見つけよう。</p>
          <Link className={styles.cta} href="/explore">記事・動画を探す <ArrowRight size={16} aria-hidden="true"/></Link>
        </div>
        <div className={styles.linkColumns}>
          <nav className={styles.linkGroup} aria-label="サイトナビゲーション">
            <h2>EXPLORE</h2>
            {siteNavigation.map(item=><Link href={item.href} key={item.href}>{item.label}</Link>)}
          </nav>
          <nav className={styles.linkGroup} aria-label="学習ナビゲーション">
            <h2>LEARN</h2>
            {visibleLearningNavigation.map(item=><Link href={item.href} key={item.href}>{item.label}</Link>)}
          </nav>
          <nav className={styles.linkGroup} aria-label="情報源ナビゲーション">
            <h2>SOURCES</h2>
            {featuredSources.map(source=><Link href={`/explore?q=${encodeURIComponent(source.name)}`} key={source.slug}>{source.name}<ArrowUpRight size={13} aria-hidden="true"/></Link>)}
            <Link href="/sources">すべての情報源 <ArrowRight size={13} aria-hidden="true"/></Link>
          </nav>
        </div>
      </div>
      <div className={styles.bottom}>
        <span>© {new Date().getFullYear()} Potover</span>
        <span>最終更新：2026年9月1日</span>
      </div>
    </div>
  </footer>;
}
