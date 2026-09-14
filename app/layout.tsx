import {SiteChrome} from '@/components/SiteChrome';
import {AuthProvider} from '@/lib/auth-client';
import {ArticleModalProvider} from '@/lib/article-modal';
import {adsenseClient} from '@/lib/adsense-config';
import './theme.css';
import './globals.css';

export const metadata={title:'Potover — ポーカー記事を、横断検索。',description:'良質なポーカー記事を、テーマ・難易度・言語から横断検索。'};

const themeScript=`
  try {
    if (localStorage.getItem('potover-theme') === 'dark') {
      document.documentElement.classList.add('dark-mode');
    }
  } catch (_) {}
`;
export default function Layout({children}:{children:React.ReactNode}){
  return <html lang="ja" suppressHydrationWarning>
    <head>
      <script dangerouslySetInnerHTML={{__html:themeScript}}/>
      {adsenseClient&&<script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`} crossOrigin="anonymous"/>}
    </head>
    <body><AuthProvider><ArticleModalProvider><SiteChrome>{children}</SiteChrome></ArticleModalProvider></AuthProvider></body>
  </html>;
}
