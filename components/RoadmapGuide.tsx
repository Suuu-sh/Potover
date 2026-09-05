import Link from 'next/link';
import {ArrowRight,BookOpenCheck,Route} from 'lucide-react';
import {HomeSectionHeading} from '@/components/HomeSectionHeading';

export function RoadmapGuide(){
  return <section className="roadmap-guide"><div className="roadmap-guide-icon"><Route/></div><div className="roadmap-guide-copy"><HomeSectionHeading eyebrow="GUIDED LEARNING" title="何から読むか迷ったら、ロードマップから。"/><p>初心者・キャッシュ・MTTのコースから目的を選び、順番に学習できます。</p></div><div className="roadmap-guide-meta"><span><BookOpenCheck size={16}/>読了状況を自動で反映</span><Link href="/roadmap">ロードマップを見る <ArrowRight size={16}/></Link></div></section>
}
