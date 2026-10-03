'use client';

import {ArrowRight, CircleCheck, CircleDot, CircleX, RotateCcw, Sparkles} from 'lucide-react';
import {useCallback, useEffect, useRef, useState} from 'react';

import {
  SOLVER_API_URL,
  actionLabel,
  buildQuestion,
  describeHistory,
  fetchSpot,
  fetchSpots,
  gradeAnswer,
  stageLabels,
  type Grade,
  type QuizQuestion,
  type SpotDetail,
  type SpotSummary,
} from '@/lib/solver-quiz';

type Status='loading'|'ready'|'error'|'unconfigured';

const gradeCopy:Record<Grade,{title:string;Icon:typeof CircleCheck}>={
  best:{title:'正解！推定レンジで最も多いアクションです',Icon:CircleCheck},
  mixed:{title:'許容範囲。一定の頻度で選ばれる混合戦略です',Icon:CircleDot},
  miss:{title:'不正解。選ばれる頻度が低いアクションです（25%未満）',Icon:CircleX},
};

export function SolverQuiz(){
  const [status,setStatus]=useState<Status>(SOLVER_API_URL?'loading':'unconfigured');
  const [question,setQuestion]=useState<QuizQuestion|null>(null);
  const [answer,setAnswer]=useState<string|null>(null);
  const [score,setScore]=useState({correct:0,total:0,streak:0});
  const source=useRef<{spots:SpotSummary[];cache:Map<string,SpotDetail>}|null>(null);

  const next=useCallback(async()=>{
    setAnswer(null);
    try{
      if(!source.current){
        const spots=await fetchSpots();
        if(spots.length===0)throw new Error('no spots');
        source.current={spots,cache:new Map()};
      }
      const {spots,cache}=source.current;
      const summary=spots[Math.floor(Math.random()*spots.length)];
      const key=`${summary.dataset}/${summary.spotId}`;
      const spot=cache.get(key)??await fetchSpot(summary.dataset,summary.spotId);
      cache.set(key,spot);
      setQuestion(buildQuestion(spot));
      setStatus('ready');
    }catch{
      setStatus('error');
    }
  },[]);

  useEffect(()=>{if(SOLVER_API_URL)void next()},[next]);

  const choose=(action:string)=>{
    if(!question||answer)return;
    setAnswer(action);
    const correct=gradeAnswer(question.hand.frequencies,action)!=='miss';
    setScore(current=>({correct:current.correct+(correct?1:0),total:current.total+1,streak:correct?current.streak+1:0}));
  };

  const grade=question&&answer?gradeAnswer(question.hand.frequencies,answer):null;

  return <main className="quiz-page shared-header-page" aria-labelledby="quiz-page-title">
    <div className="quiz-shell">
      <header className="quiz-heading">
        <div>
          <p className="quiz-eyebrow"><Sparkles size={12} aria-hidden="true"/> SolveaGTO連携</p>
          <h1 id="quiz-page-title">プリフロップ レンジクイズ</h1>
          <p>SolveaGTOの推定レンジから出題します。キャッシュ6-max・100BB（レーキ5%・上限3BB）のスポットで、あなたのアクションを選んでください。</p>
        </div>
        <dl className="quiz-score" aria-label="スコア">
          <div><dt>正解</dt><dd>{score.correct}<small>/{score.total}</small></dd></div>
          <div><dt>連続</dt><dd>{score.streak}</dd></div>
        </dl>
      </header>

      {status==='unconfigured'&&<section className="quiz-message"><h2>クイズは準備中です</h2><p>SolveaGTO APIの接続先が設定されていません。</p></section>}
      {status==='error'&&<section className="quiz-message"><h2>問題を読み込めませんでした</h2><p>SolveaGTO APIに接続できませんでした。時間をおいて再度お試しください。</p><button type="button" onClick={()=>{setStatus('loading');void next()}}><RotateCcw size={14} aria-hidden="true"/>再読み込み</button></section>}
      {status==='loading'&&!question&&<section className="quiz-message" aria-live="polite"><p>推定レンジを読み込み中…</p></section>}

      {status==='ready'&&question&&<section className="quiz-card" aria-live="polite">
        <div className="quiz-spot">
          <div className="quiz-spot-meta">
            <span>あなたは <strong>{question.spot.hero}</strong></span>
            <span>{stageLabels[question.spot.stage]}</span>
            <span>有効スタック {question.spot.effectiveStackBb}bb</span>
          </div>
          <p className="quiz-history">{describeHistory(question.spot.history,question.spot.hero)}</p>
          <div className="quiz-hand" aria-label={`ハンド ${question.hand.hand}`}>
            {question.cards.map(card=><span key={card} className={/[♥♦]/.test(card)?'is-red':undefined}>{card}</span>)}
            <small>{question.hand.hand}</small>
          </div>
        </div>

        <div className="quiz-choices" role="group" aria-label="アクションを選択">
          {question.choices.map(action=>{
            const frequency=question.hand.frequencies[action]??0;
            const state=answer?(action===answer?`is-chosen is-${grade}`:gradeAnswer(question.hand.frequencies,action)==='best'?'is-best':''):'';
            return <button key={action} type="button" className={state||undefined} disabled={!!answer} onClick={()=>choose(action)}>
              <span>{actionLabel(action)}</span>
              {answer&&<><span className="quiz-bar" style={{width:`${frequency*100}%`}} aria-hidden="true"/><strong>{(frequency*100).toFixed(1)}%</strong></>}
            </button>;
          })}
        </div>

        {grade&&<div className={`quiz-result is-${grade}`}>
          {(()=>{const {Icon,title}=gradeCopy[grade];return <p><Icon size={18} aria-hidden="true"/>{title}</p>})()}
          <button type="button" onClick={()=>void next()} autoFocus>次の問題 <ArrowRight size={14} aria-hidden="true"/></button>
        </div>}
      </section>}

      <p className="quiz-note">頻度はSolveaGTOのAI推定レンジ（GTOソルバーの解ではありません）です。レンジは今後更新される可能性があります。</p>
    </div>
  </main>;
}
