'use client';

import Image from 'next/image';
import Link from 'next/link';
import {ArrowRight,BookOpen,Check,CheckCircle2,Circle,Clock3,Coins,LockKeyhole,Target,Trophy} from 'lucide-react';
import {useEffect,useMemo,useState} from 'react';
import {getLearningHistory} from '@/lib/learning-history';
import {moduleArticles,roadmaps} from '@/lib/roadmaps';
import {usePreferredLanguage} from '@/lib/use-preferred-language';

const courseIcons=[Target,Coins,Trophy];

export default function RoadmapPage(){
  const [language]=usePreferredLanguage();
  const [read,setRead]=useState<Set<string>>(new Set());
  const [activeCourse,setActiveCourse]=useState(0);
  const [activeModule,setActiveModule]=useState(0);
  useEffect(()=>{const sync=()=>setRead(new Set(getLearningHistory().map(item=>item.slug)));sync();window.addEventListener('potover-learning-changed',sync);return()=>window.removeEventListener('potover-learning-changed',sync)},[]);
  const courses=useMemo(()=>roadmaps.map(course=>{const modules=course.modules.map(module=>({...module,articles:moduleArticles(module,language,5)}));const slugs=Array.from(new Set(modules.flatMap(module=>module.articles.map(article=>article.slug))));const completed=slugs.filter(slug=>read.has(slug)).length;return {...course,modules,total:slugs.length,completed,progress:slugs.length?Math.round(completed/slugs.length*100):0}}),[language,read]);
  const course=courses[activeCourse];
  const module=course.modules[activeModule];
  const nextArticle=module.articles.find(article=>!read.has(article.slug))||module.articles[0];
  const chooseCourse=(index:number)=>{setActiveCourse(index);setActiveModule(0)};
  return <main className="curriculum-page">
    <div className="curriculum-course-tabs" role="tablist" aria-label="コースを選択">{courses.map((item,index)=>{const Icon=courseIcons[index];return <button key={item.id} role="tab" aria-selected={index===activeCourse} className={index===activeCourse?'is-active':''} onClick={()=>chooseCourse(index)}><Icon/><span><strong>{item.title}</strong><small>{index===0?'基礎から体系的に学ぶ':index===1?'リングゲームで勝つ':'トーナメントで勝つ'}</small></span></button>})}</div>
    <section className="curriculum-shell">
      <header className="curriculum-heading"><div><h1>{course.title}</h1><p>{course.description}</p><div className="curriculum-progress"><i style={{width:`${course.progress}%`}}/></div><small>全{course.total}記事中 {course.completed}記事完了</small></div><strong>進捗 {course.progress}%</strong></header>
      <div className="curriculum-layout">
        <nav className="curriculum-index" aria-label={`${course.title}の章`}>{course.modules.map((item,index)=>{const complete=item.articles.length>0&&item.articles.every(article=>read.has(article.slug));const started=item.articles.some(article=>read.has(article.slug));return <button key={item.title} className={index===activeModule?'is-active':''} onClick={()=>setActiveModule(index)}><span>{complete?<Check/>:index+1}</span><div><small>第{index+1}章</small><strong>{item.title}</strong>{item.articles.slice(0,5).map((article,articleIndex)=><i key={article.slug} className={read.has(article.slug)?'is-read':''}>{read.has(article.slug)?<CheckCircle2/>:started||index===activeModule?<Circle/>:<LockKeyhole/>}<em>{index+1}.{articleIndex+1}</em>{article.title}</i>)}</div></button>})}</nav>
        <div className="curriculum-main">
          {nextArticle&&<section className="next-lesson"><p>次に読む記事</p><Link href={`/articles/${nextArticle.slug}`} className="next-lesson-feature"><div className="next-lesson-image"><Image src={nextArticle.imageUrl||'/brand/potover-logo.png'} alt="" fill sizes="340px"/></div><div><small>第{activeModule+1}章&nbsp; {activeModule+1}.{Math.max(1,module.articles.findIndex(article=>article.slug===nextArticle.slug)+1)}</small><h2>{nextArticle.title}</h2><p>{nextArticle.summary}</p><span><Clock3/> {nextArticle.minutes}分 <i><BookOpen/>おすすめ</i></span></div><b><ArrowRight/></b></Link></section>}
          <section className="lesson-list"><header><h2>この章のレッスン</h2><span>{module.articles.filter(article=>read.has(article.slug)).length} / {module.articles.length} 完了</span></header>{module.articles.map((article,index)=><Link href={`/articles/${article.slug}`} key={article.slug} className={read.has(article.slug)?'is-read':article.slug===nextArticle?.slug?'is-current':''}><span>{read.has(article.slug)?<Check/>:index+1}</span><strong>{activeModule+1}.{index+1}</strong><div><b>{article.title}</b><small>{article.source}</small></div><em><Clock3/>{article.minutes}分</em><ArrowRight/></Link>)}</section>
          <div className="chapter-rest">{course.modules.filter((_,index)=>index!==activeModule).map((item,index)=><button key={item.title} onClick={()=>setActiveModule(course.modules.indexOf(item))}>{index+2>activeModule?<LockKeyhole/>:<CheckCircle2/>}<strong>第{course.modules.indexOf(item)+1}章　{item.title}</strong><span>{item.articles.length}レッスン</span><ArrowRight/></button>)}</div>
        </div>
      </div>
    </section>
  </main>
}
