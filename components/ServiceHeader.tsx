'use client';

import Image from 'next/image';
import Link from 'next/link';
import {ArrowUpRight, Menu, X} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import styles from './ServiceLanding.module.css';

const navigation = [
  {href: '#features', label: '特徴'},
  {href: '#how-it-works', label: '学び方'},
  {href: '#faq', label: 'よくある質問'},
];

export function ServiceHeader() {
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
      <a className={styles.skipLink} href="#main-content">本文へ移動</a>
      <div className={styles.headerInner}>
        <Link href="/" className={styles.brand} aria-label="Potover サービスサイト">
          <Image src="/brand/potover-mark-dark.png" alt="" width={40} height={40} priority/>
          <span>Potover</span>
        </Link>
        <nav className={styles.desktopNav} aria-label="サービスナビゲーション">
          {navigation.map(item => <a href={item.href} key={item.href}>{item.label}</a>)}
        </nav>
        <Link href="/home" className={styles.openApp}>アプリを開く <ArrowUpRight size={20} aria-hidden="true"/></Link>
        <button className={styles.menuButton} type="button" ref={trigger} aria-label={open ? 'メニューを閉じる' : 'メニューを開く'} aria-expanded={open} aria-controls="service-mobile-navigation" onClick={() => setOpen(value => !value)}>
          {open ? <X size={23} aria-hidden="true"/> : <Menu size={23} aria-hidden="true"/>}
        </button>
      </div>
      {open && <nav id="service-mobile-navigation" className={styles.mobileNav} aria-label="モバイルサービスナビゲーション">
        {navigation.map(item => <a href={item.href} key={item.href} onClick={() => setOpen(false)}>{item.label}<ArrowUpRight size={18} aria-hidden="true"/></a>)}
        <Link href="/home" onClick={() => setOpen(false)}>アプリを開く<ArrowUpRight size={18} aria-hidden="true"/></Link>
      </nav>}
    </header>
  );
}
