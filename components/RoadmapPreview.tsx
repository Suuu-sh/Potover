'use client';
import {useI18n} from '@/lib/i18n-client';
import Link from '@/components/LocaleLink';
import {ArrowRight,LockKeyhole} from 'lucide-react';
import {useMemo} from 'react';
import {useLearningHistory} from '@/lib/learning-history';
import {moduleArticles,roadmaps} from '@/lib/roadmaps';
import {usePreferredLanguage} from '@/lib/use-preferred-language';
import {HomeSectionHeading} from '@/components/HomeSectionHeading';
import {useAuth} from '@/lib/auth-client';

export function RoadmapPreview(){
  const {t:uiText,href:localPath}=useI18n();
  const [language]=usePreferredLanguage();
  const {user}=useAuth();
  const {events}=useLearningHistory();
  const read=useMemo(()=>new Set(events.map(item=>item.slug)),[events]);
  const progress=useMemo(()=>roadmaps.map(course=>{const unique=Array.from(new Set(course.modules.flatMap(module=>moduleArticles(module,language).map(article=>article.slug))));return unique.length?Math.round(unique.filter(slug=>read.has(slug)).length/unique.length*100):0}),[language,read]);
  const roadmapHref=(hash?:string)=>{const destination=`/roadmap${hash?`#${hash}`:''}`;return user?destination:`/login?next=${encodeURIComponent(destination)}`};
  return <section className="roadmap-preview"><div className="modern-section-head"><HomeSectionHeading title={uiText("学習ロードマップ")} note="3つのコースと進み具合"/><div className="roadmap-preview-actions">{!user&&<span className="roadmap-login-required"><LockKeyhole size={13} aria-hidden="true"/>{uiText("ログイン必須")}</span>}<Link href={localPath(roadmapHref())}>{uiText("すべて見る ")}<ArrowRight size={15}/></Link></div></div><div className="roadmap-preview-grid">{roadmaps.map((course,index)=>{return <Link href={localPath(roadmapHref(course.id))} className="roadmap-preview-card home-elevated-card" key={course.id} style={{'--course-color':course.accent} as React.CSSProperties}><div><h3>{uiText(course.title)}</h3><p>{uiText(course.description)}</p><div className="roadmap-progress" role="progressbar" aria-label={uiText(`${course.title}の学習進捗`)} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress[index]}><i style={{width:`${progress[index]}%`}}/></div><div className="roadmap-progress-caption"><small>{uiText(progress[index])}{uiText("% 完了 ・ ")}{uiText(course.modules.length)}{uiText("ステップ")}</small><small aria-hidden="true">100%</small></div></div><ArrowRight size={18}/></Link>})}</div></section>
}
