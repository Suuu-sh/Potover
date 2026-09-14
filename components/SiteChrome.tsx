'use client';

import {usePathname} from 'next/navigation';
import {SiteHeader} from './SiteHeader';
import {SiteFooter} from './SiteFooter';
import {SourceFollowProvider} from '@/lib/source-follows';

export function SiteChrome({children}: {children: React.ReactNode}) {
  const pathname = usePathname();

  return <SourceFollowProvider><SiteHeader/><div className="app-shell">{children}</div>{pathname.replace(/\/$/, '') !== '/login' && <SiteFooter/>}</SourceFollowProvider>;
}
