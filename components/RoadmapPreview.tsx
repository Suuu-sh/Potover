'use client';
import Link from 'next/link';
import {ArrowRight,BookOpen,CheckCircle2} from 'lucide-react';
import {useEffect,useMemo,useState} from 'react';
import {getLearningHistory} from '@/lib/learning-history';
import {moduleArticles,roadmaps} from '@/lib/roadmaps';
import {usePreferredLanguage} from '@/lib/use-preferred-language';
import {HomeSectionHeading} from '@/components/HomeSectionHeading';

export function RoadmapPreview(){
  const [language]=usePreferredLanguage();
  const [read,setRead]=useState<Set<string>>(new Set());
  useEffect(()=>{const sync=()=>setRead(new Set(getLearningHistory().map(item=>item.slug)));sync();window.addEventListener('potover-learning-changed',sync);return()=>window.removeEventListener('potover-learning-changed',sync)},[]);
  const progress=useMemo(()=>roadmaps.map(course=>{const unique=Array.from(new Set(course.modules.flatMap(module=>moduleArticles(module,language).map(article=>article.slug))));return unique.length?Math.round(unique.filter(slug=>read.has(slug)).length/unique.length*100):0}),[language,read]);
  return <section className="roadmap-preview"><div className="modern-section-head"><HomeSectionHeading eyebrow="LEARNING PATHS" title="学習ロードマップ"/><Link href="/roadmap">すべて見る <ArrowRight size={15}/></Link></div><div className="roadmap-preview-grid">{roadmaps.map((course,index)=><Link href={`/roadmap#${course.id}`} className="roadmap-preview-card home-elevated-card" key={course.id} style={{'--course-color':course.accent} as React.CSSProperties}><span>{progress[index]>0?<CheckCircle2/>:<BookOpen/>}</span><div><h3>{course.title}</h3><p>{course.description}</p><div className="roadmap-progress"><i style={{width:`${progress[index]}%`}}/></div><small>{progress[index]}% 完了 ・ {course.modules.length}ステップ</small></div><ArrowRight size={18}/></Link>)}</div></section>
}
