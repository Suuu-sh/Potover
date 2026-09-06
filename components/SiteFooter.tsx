'use client';

import Image from 'next/image';
import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {usePathname} from 'next/navigation';
import styles from './SiteFooter.module.css';

const navigation=[{href:'/docs',label:'探す'},{href:'/roadmap',label:'ロードマップ'},{href:'/bookmarks',label:'ブックマーク'},{href:'/profile',label:'プロフィール'}];
const sources=[{href:'/docs?q=GTO%20Wizard',label:'GTO Wizard'},{href:'/docs?q=GTO%20Wizard%20Japan',label:'GTO Wizard Japan'}];

export function SiteFooter(){
  const pathname=usePathname();
  if(pathname.startsWith('/articles/'))return null;
  return <footer className={styles.footer}><div className={styles.inner}><div className={styles.brandColumn}><Link href="/" className={styles.brand} aria-label="Potover ホーム"><span className={styles.brandMark}><Image className={styles.lightMark} src="/brand/potover-mark-light.png" alt="" width={34} height={34}/><Image className={styles.darkMark} src="/brand/potover-mark-dark.png" alt="" width={34} height={34}/></span><span>Potover</span></Link><p>ポーカーの学びを、ひとつの場所に。</p></div><div className={styles.linkGroup}><h2>コンテンツ</h2>{navigation.map(item=><Link href={item.href} key={item.href}>{item.label}</Link>)}</div><div className={styles.linkGroup}><h2>情報源</h2>{sources.map(item=><Link href={item.href} key={item.href}>{item.label}<ArrowUpRight size={13}/></Link>)}</div></div><div className={styles.bottom}><span>© {new Date().getFullYear()} Potover</span><span>最終更新：2026年9月1日</span></div></footer>;
}
