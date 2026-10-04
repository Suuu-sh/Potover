'use client';
import {useI18n} from '@/lib/i18n-client';

import Image from 'next/image';
import Link from '@/components/LocaleLink';
import {ArrowRight, ArrowUpRight} from 'lucide-react';
import {usePathname} from '@/lib/locale-router';
import {useAuth} from '@/lib/auth-client';
import {sources as sourceCatalog} from '@/lib/data';
import styles from './SiteFooter.module.css';

const siteNavigation=[{href:'/',label:'ホーム'},{href:'/explore',label:'記事・動画を探す'},{href:'/glossary',label:'ポーカー用語集'}];
const learningNavigation=[{href:'/roadmap',label:'学習ロードマップ'},{href:'/bookmarks',label:'ブックマーク'}];
const featuredSourceSlugs=['gto-wizard-japan','gto-wizard','upswing-poker'];
const featuredSources=featuredSourceSlugs.map(slug=>sourceCatalog.find(source=>source.slug===slug)).filter((source):source is (typeof sourceCatalog)[number]=>Boolean(source));

export function SiteFooter(){
  const {t:uiText,href:localPath}=useI18n();
  const pathname=usePathname();
  const {user}=useAuth();
  if(pathname === '/login' || pathname.startsWith('/login/')) return null;
  const visibleLearningNavigation=[{...learningNavigation[0],href:user?learningNavigation[0].href:`/login?next=${encodeURIComponent('/roadmap')}`},learningNavigation[1]];
  return <footer className={styles.footer}>
    <div className={styles.inner}>
      <div className={styles.top}>
        <div className={styles.brandColumn}>
          <Link href={localPath("/")} className={styles.brand} aria-label={uiText("Potover ホーム")}>
            <span className={styles.brandMark}><Image className={styles.lightMark} src="/brand/potover-mark-light.png" alt="" width={38} height={38}/><Image className={styles.darkMark} src="/brand/potover-mark-dark.png" alt="" width={38} height={38}/></span>
            <span>Potover</span>
          </Link>
          <p className={styles.tagline}>{uiText("ポーカーの学びを、ひとつの場所に。")}</p>
          <p className={styles.description}>{uiText("記事や動画を探して、次に学ぶテーマを見つけよう。")}</p>
          <Link className={styles.cta} href={localPath("/explore")}>{uiText("記事・動画を探す ")}<ArrowRight size={16} aria-hidden="true"/></Link>
        </div>
        <div className={styles.linkColumns}>
          <nav className={styles.linkGroup} aria-label={uiText("サイトナビゲーション")}>
            <h2>{uiText("探す")}</h2>
            {siteNavigation.map(item=><Link href={localPath(item.href)} key={item.href}>{uiText(item.label)}</Link>)}
          </nav>
          <nav className={styles.linkGroup} aria-label={uiText("学習ナビゲーション")}>
            <h2>{uiText("学ぶ")}</h2>
            {visibleLearningNavigation.map(item=><Link href={localPath(item.href)} key={item.href}>{uiText(item.label)}</Link>)}
          </nav>
          <nav className={styles.linkGroup} aria-label={uiText("情報源ナビゲーション")}>
            <h2>{uiText("情報源")}</h2>
            {featuredSources.map(source=><Link href={localPath(`/explore?q=${encodeURIComponent(source.name)}`)} key={source.slug}>{uiText(source.name)}<ArrowUpRight size={13} aria-hidden="true"/></Link>)}
            <Link href={localPath("/sources")}>{uiText("すべての情報源 ")}<ArrowRight size={13} aria-hidden="true"/></Link>
          </nav>
        </div>
      </div>
      <div className={styles.bottom}>
        <span>© {uiText(new Date().getFullYear())} Potover</span>
        <nav className={styles.legalLinks} aria-label={uiText("サービス情報")}>
          <Link href={localPath("/privacy")}>{uiText("プライバシーポリシー")}</Link>
          <Link href={localPath("/terms")}>{uiText("利用条件")}</Link>
          <Link href={localPath("/contact")}>{uiText("お問い合わせ")}</Link>
        </nav>
        <span>{uiText("最終更新：2026年9月28日")}</span>
      </div>
    </div>
  </footer>;
}
