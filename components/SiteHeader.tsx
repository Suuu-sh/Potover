import Image from 'next/image';
import Link from 'next/link';
import {Bookmark,UserCircle} from 'lucide-react';
export function SiteHeader(){return <header className="site-header"><div className="site-header-inner"><Link className="brand-lockup" href="/" aria-label="Potover ホーム"><Image src="/brand/potover-logo.png" alt="Potover" width={2172} height={724} priority/></Link><nav><Link href="/docs">記事を探す</Link><Link href="/#topics">トピック</Link><Link href="/sources">情報源</Link></nav><div className="atlas-actions"><Link href="/bookmarks"><Bookmark size={18}/>ブックマーク</Link><Link href="/profile" aria-label="プロフィール"><UserCircle size={27}/></Link></div></div></header>}
