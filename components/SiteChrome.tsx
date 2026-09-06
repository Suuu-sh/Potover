'use client';

import {usePathname} from 'next/navigation';
import {SiteHeader} from './SiteHeader';
import {SiteFooter} from './SiteFooter';

/** The marketing page owns its chrome; learning routes keep their existing shell. */
export function SiteChrome({children}: {children: React.ReactNode}) {
  const pathname = usePathname();

  if (pathname === '/') return <>{children}</>;

  return <><SiteHeader/><div className="app-shell">{children}</div><SiteFooter/></>;
}
