import {ArrowUpRight} from 'lucide-react';

type NativeAdCardProps={
  placement:'home'|'feed';
};

const ad={
  label:'広告',
  brand:'GTO Wizard Japan',
  title:'日本語で学ぶポーカー戦略',
  description:'最新の戦略記事をチェックして、次に学ぶテーマを見つけよう。',
  href:'https://blog.gtowizard.com/gto-wizard-in-japan/',
};

export function NativeAdCard({placement}:NativeAdCardProps){
  return <aside className={`native-ad-card native-ad-card-${placement}`} aria-label="広告">
    <span className="native-ad-label">{ad.label}</span>
    <span className="native-ad-mark" aria-hidden="true">GW</span>
    <div className="native-ad-copy">
      <p>{ad.brand}</p>
      <h2>{ad.title}</h2>
      <span>{ad.description}</span>
    </div>
    <a href={ad.href} target="_blank" rel="sponsored noopener noreferrer">
      記事を見る <ArrowUpRight size={15} aria-hidden="true"/>
    </a>
  </aside>;
}
