'use client';
import {useI18n} from '@/lib/i18n-client';

import Link from '@/components/LocaleLink';
import {BookOpenText,Compass,Home,Map,UserCircle,UserRoundPlus} from 'lucide-react';
import {usePathname} from '@/lib/locale-router';
import {useAuth} from '@/lib/auth-client';
import styles from './MobileTabBar.module.css';

const within=(pathname:string,...roots:string[])=>roots.some(root=>pathname===root||pathname.startsWith(`${root}/`));

/** Bottom tab navigation shown on phone and tablet widths in place of the header nav. */
export function MobileTabBar(){
  const {t:uiText,href:localPath}=useI18n();
  const pathname=usePathname();
  const {user}=useAuth();
  const tabs=[
    {href:'/',label:'ホーム',Icon:Home,active:pathname==='/'||within(pathname,'/home')},
    {href:'/explore',label:'探す',Icon:Compass,active:within(pathname,'/explore','/docs')},
    {href:user?'/roadmap':`/login?next=${encodeURIComponent('/roadmap')}`,label:'ロードマップ',Icon:Map,active:within(pathname,'/roadmap')},
    {href:'/glossary',label:'用語集',Icon:BookOpenText,active:within(pathname,'/glossary')},
    user
      ?{href:'/profile',label:'アカウント',Icon:UserCircle,active:within(pathname,'/profile')}
      :{href:'/login',label:'ログイン',Icon:UserRoundPlus,active:within(pathname,'/login')},
  ];
  return <nav className={styles.bar} aria-label={uiText('モバイルナビゲーション')}>
    {tabs.map(({href,label,Icon,active})=><Link key={label} className={styles.tab} href={localPath(href)} aria-current={active?'page':undefined}>
      <span className={styles.icon}><Icon size={20} aria-hidden="true"/></span>
      <span className={styles.label}>{uiText(label)}</span>
    </Link>)}
  </nav>;
}
