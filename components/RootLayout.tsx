/* eslint-disable @next/next/no-head-element -- This shared component is the HTML root for both App Router layouts. */
import {SiteChrome} from './SiteChrome';
import {LocaleProvider} from '@/lib/i18n-client';
import type {Locale} from '@/lib/i18n';
import {AuthProvider} from '@/lib/auth-client';
import {ArticleModalProvider} from '@/lib/article-modal';
import {BookmarksProvider} from '@/lib/bookmarks';
import {LearningHistoryProvider} from '@/lib/learning-history';
import {UserPreferencesProvider} from '@/lib/user-preferences';
import {adsenseClient} from '@/lib/adsense-config';
import '@/app/theme.css';
import '@/app/globals.css';
export function RootLayout({children,locale}:{children:React.ReactNode;locale:Locale}){
  return <html lang={locale} suppressHydrationWarning>
    {adsenseClient?<head><script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`} crossOrigin="anonymous"/></head>:null}
    <body><LocaleProvider locale={locale}><AuthProvider><UserPreferencesProvider><BookmarksProvider><LearningHistoryProvider><ArticleModalProvider><SiteChrome>{children}</SiteChrome></ArticleModalProvider></LearningHistoryProvider></BookmarksProvider></UserPreferencesProvider></AuthProvider></LocaleProvider></body>
  </html>;
}
