'use client';
import {useI18n} from '@/lib/i18n-client';

import Image from 'next/image';
import Link from '@/components/LocaleLink';
import {ArrowUpRight, Menu, X} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import styles from './ServiceLanding.module.css';

const navigation = [
  {href: '#features', label: '特徴'},
  {href: '#how-it-works', label: '学び方'},
  {href: '#faq', label: 'よくある質問'},
];

export function ServiceHeader() {
  const {t:uiText,href:localPath}=useI18n();
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    const closeOnOutside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    document.addEventListener('pointerdown', closeOnOutside);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.removeEventListener('pointerdown', closeOnOutside);
    };
  }, [open]);

  return (
    <header className={styles.header} ref={header}>
      <a className={styles.skipLink} href={localPath("#main-content")}>{uiText("本文へ移動")}</a>
      <div className={styles.headerInner}>
        <Link href={localPath("/")} className={styles.brand} aria-label={uiText("Potover サービスサイト")}>
          <Image className={styles.lightMark} src="/brand/potover-mark-light.png" alt="" width={40} height={40} priority/><Image className={styles.darkMark} src="/brand/potover-mark-dark.png" alt="" width={40} height={40} priority/>
          <span>Potover</span>
        </Link>
        <nav className={styles.desktopNav} aria-label={uiText("サービスナビゲーション")}>
          {navigation.map(item => <a href={localPath(item.href)} key={item.href}>{uiText(item.label)}</a>)}
        </nav>
        <Link href={localPath("/home")} className={styles.openApp}>{uiText("アプリを開く ")}<ArrowUpRight size={20} aria-hidden="true"/></Link>
        <button className={styles.menuButton} type="button" ref={trigger} aria-label={uiText(open ? 'メニューを閉じる' : 'メニューを開く')} aria-expanded={open} aria-controls="service-mobile-navigation" onClick={() => setOpen(value => !value)}>
          {open ? <X size={23} aria-hidden="true"/> : <Menu size={23} aria-hidden="true"/>}
        </button>
      </div>
      {open && <nav id="service-mobile-navigation" className={styles.mobileNav} aria-label={uiText("モバイルサービスナビゲーション")}>
        {navigation.map(item => <a href={localPath(item.href)} key={item.href} onClick={() => setOpen(false)}>{uiText(item.label)}<ArrowUpRight size={18} aria-hidden="true"/></a>)}
        <Link href={localPath("/home")} onClick={() => setOpen(false)}>{uiText("アプリを開く")}<ArrowUpRight size={18} aria-hidden="true"/></Link>
      </nav>}
    </header>
  );
}
