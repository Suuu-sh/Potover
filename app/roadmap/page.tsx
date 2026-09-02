'use client';
import Link from 'next/link';
import {ArrowRight,Check,CheckCircle2,Circle,Clock3} from 'lucide-react';
import {useEffect,useMemo,useState} from 'react';
import {getLearningHistory} from '@/lib/learning-history';
import {moduleArticles,roadmaps} from '@/lib/roadmaps';
import {usePreferredLanguage} from '@/lib/use-preferred-language';

export default function RoadmapPage(){
  const [language]=usePreferredLanguage();
  const [read,setRead]=useState<Set<string>>(new Set());
  useEffect(()=>{const sync=()=>setRead(new Set(getLearningHistory().map(item=>item.slug)));sync();window.addEventListener('potover-learning-changed',sync);return()=>window.removeEventListener('potover-learning-changed',sync)},[]);
  const courses=useMemo(()=>roadmaps.map(course=>{const modules=course.modules.map(module=>({...module,articles:moduleArticles(module,language)}));const slugs=Array.from(new Set(modules.flatMap(module=>module.articles.map(article=>article.slug))));const completed=slugs.filter(slug=>read.has(slug)).length;return {...course,modules,progress:slugs.length?Math.round(completed/slugs.length*100):0}}),[language,read]);
  return <main className="roadmap-page"><header className="roadmap-page-head"><div><h1>学習ロードマップ</h1><p>目的に合ったコースを選び、記事を読みながら知識を積み上げます。</p></div><span>{language==='Japanese'?'日本語の記事':'English articles'}</span></header><div className="roadmap-courses">{courses.map(course=><section id={course.id} className="roadmap-course" key={course.id} style={{'--course-color':course.accent} as React.CSSProperties}><header><div><small>COURSE</small><h2>{course.title}</h2><p>{course.description}</p></div><div className="course-progress-ring" style={{'--progress':`${course.progress*3.6}deg`} as React.CSSProperties}><strong>{course.progress}%</strong></div></header><div className="course-progress-line"><i style={{width:`${course.progress}%`}}/></div><div className="roadmap-modules">{course.modules.map((module,index)=>{const complete=module.articles.length>0&&module.articles.every(article=>read.has(article.slug));return <article className="roadmap-module" key={module.title}><div className="module-step">{complete?<CheckCircle2/>:<span>{index+1}</span>}<i/></div><div className="module-content"><div className="module-title"><div><small>STEP {index+1}</small><h3>{module.title}</h3><p>{module.description}</p></div>{complete&&<em><Check size={12}/>完了</em>}</div><div className="module-articles">{module.articles.map(article=><Link href={`/articles/${article.slug}`} key={article.slug} className={read.has(article.slug)?'is-read':undefined}>{read.has(article.slug)?<CheckCircle2 size={16}/>:<Circle size={16}/>}<span><strong>{article.title}</strong><small>{article.source} <i><Clock3 size={11}/>{article.minutes}分</i></small></span><ArrowRight size={15}/></Link>)}</div></div></article>})}</div></section>)}</div></main>
}
