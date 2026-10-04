'use client';
import {useI18n} from '@/lib/i18n-client';
import Link from '@/components/LocaleLink';
import {ArrowRight,BookOpenCheck,Route} from 'lucide-react';
import {HomeSectionHeading} from '@/components/HomeSectionHeading';

export function RoadmapGuide(){
  const {t:uiText,href:localPath}=useI18n();
  return <section className="roadmap-guide"><div className="roadmap-guide-icon"><Route/></div><div className="roadmap-guide-copy"><HomeSectionHeading title={uiText("何から読むか迷ったら、ロードマップから。")}/><p>{uiText("初心者・キャッシュ・MTTのコースから目的を選び、順番に学習できます。")}</p></div><div className="roadmap-guide-meta"><span><BookOpenCheck size={16}/>{uiText("読了状況を自動で反映")}</span><Link href={localPath("/roadmap")}>{uiText("ロードマップを見る ")}<ArrowRight size={16}/></Link></div></section>
}
