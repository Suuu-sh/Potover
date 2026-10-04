'use client';
import {useI18n} from '@/lib/i18n-client';
import Link from '@/components/LocaleLink';
import { Layers3,GitBranch,ChartNoAxesCombined,Trophy,Brain,Coins,ArrowRight } from 'lucide-react';
const groups=[['プリフロップ',Layers3,['オープンレンジ','3ベット戦略','スクイーズ','コールレンジ']],['ポストフロップ',GitBranch,['CB戦略','バレル','チェックレイズ','ブロッカー']],['GTO・ソルバー',ChartNoAxesCombined,['レンジ構築','ノードロック','エクスプロイト調整']],['トーナメント',Trophy,['ICM・ピック','スタック戦略','終盤のプレイ']],['メンタル・思考',Brain,['意思決定プロセス','バイアス','レビュー・振り返り']],['バンクロール',Coins,['資金管理','ベットサイズ','ショットテイク']]] as const;
export function TopicAtlas(){
  const {t:uiText,href:localPath}=useI18n();return <section className="topic-atlas" id="topics">{groups.map(([title,Icon,items])=><Link href={localPath(`/explore?q=${encodeURIComponent(title)}`)} className="topic-family" key={title}><span className="topic-icon"><Icon size={29}/></span><span><strong>{uiText(title)}</strong><small>{uiText(items.join('　'))}</small></span><ArrowRight className="topic-arrow" size={17}/></Link>)}</section>}
