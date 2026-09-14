import {SiteChrome} from '@/components/SiteChrome';
import {AuthProvider} from '@/lib/auth-client';
import {ArticleModalProvider} from '@/lib/article-modal';
import {BookmarksProvider} from '@/lib/bookmarks';
import {LearningHistoryProvider} from '@/lib/learning-history';
import {UserPreferencesProvider} from '@/lib/user-preferences';
import {adsenseClient} from '@/lib/adsense-config';
import './theme.css';
import './globals.css';

export const metadata={title:'Potover — ポーカー記事を、横断検索。',description:'良質なポーカー記事を、テーマ・言語から横断検索。'};
export default function Layout({children}:{children:React.ReactNode}){
  return <html lang="ja" suppressHydrationWarning>
    <head>
      {adsenseClient&&<script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`} crossOrigin="anonymous"/>}
    </head>
    <body><AuthProvider><UserPreferencesProvider><BookmarksProvider><LearningHistoryProvider><ArticleModalProvider><SiteChrome>{children}</SiteChrome></ArticleModalProvider></LearningHistoryProvider></BookmarksProvider></UserPreferencesProvider></AuthProvider></body>
  </html>;
}
