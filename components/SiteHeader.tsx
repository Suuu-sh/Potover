import Link from 'next/link';
import { Bookmark, UserCircle } from 'lucide-react';
export function SiteHeader(){return <header className="site-header"><div className="site-header-inner"><Link className="atlas-logo" href="/">Potover</Link><nav><Link href="/docs">記事を探す</Link><Link href="/#topics">トピック</Link><Link href="/sources">情報源</Link></nav><div className="atlas-actions"><Link href="/bookmarks"><Bookmark size={18}/>ブックマーク</Link><Link href="/profile" aria-label="プロフィール"><UserCircle size={27}/></Link></div></div></header>}
