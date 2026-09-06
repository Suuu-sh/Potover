import {SiteHeader} from '@/components/SiteHeader';
import {AuthProvider} from '@/lib/auth-client';
import {ArticleModalProvider} from '@/lib/article-modal';
import {SiteFooter} from '@/components/SiteFooter';
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
      <style dangerouslySetInnerHTML={{__html:'html.dark-mode,html.dark-mode body{background:#101010;color-scheme:dark}'}}/>
    </head>
    <body><AuthProvider><ArticleModalProvider><SiteHeader/><div className="app-shell">{children}</div><SiteFooter/></ArticleModalProvider></AuthProvider></body>
  </html>;
}
