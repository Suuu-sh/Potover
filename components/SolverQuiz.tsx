'use client';

import {ArrowRight, CircleCheck, CircleDot, CircleX, RotateCcw, Sparkles} from 'lucide-react';
import {useCallback, useEffect, useRef, useState} from 'react';

import {
  SOLVER_API_URL,
  actionLabel,
  buildQuestion,
  describeHistory,
  fetchNode,
  fetchNodes,
  fetchSolutions,
  gradeAnswer,
  quizNodes,
  type Grade,
  type NodeSummary,
  type QuizQuestion,
  type SolutionNode,
} from '@/lib/solver-quiz';

type Status='loading'|'ready'|'error'|'unconfigured';

const gradeCopy:Record<Grade,{title:string;Icon:typeof CircleCheck}>={
  best:{title:'正解！Solverの最頻アクションです',Icon:CircleCheck},
  mixed:{title:'許容範囲。Solverも一定の頻度で選ぶ混合戦略です',Icon:CircleDot},
  miss:{title:'不正解。Solverの選択頻度が低いアクションです（25%未満）',Icon:CircleX},
};

export function SolverQuiz(){
  const [status,setStatus]=useState<Status>(SOLVER_API_URL?'loading':'unconfigured');
  const [question,setQuestion]=useState<QuizQuestion|null>(null);
  const [answer,setAnswer]=useState<string|null>(null);
  const [score,setScore]=useState({correct:0,total:0,streak:0});
  const source=useRef<{solutionId:string;nodes:NodeSummary[];cache:Map<string,SolutionNode>}|null>(null);

  const next=useCallback(async()=>{
    setAnswer(null);
    try{
      if(!source.current){
        const [solution]=await fetchSolutions();
        if(!solution)throw new Error('solution not found');
        const nodes=quizNodes(await fetchNodes(solution.solutionId));
        if(nodes.length===0)throw new Error('no decision nodes');
        source.current={solutionId:solution.solutionId,nodes,cache:new Map()};
      }
      const {solutionId,nodes,cache}=source.current;
      const summary=nodes[Math.floor(Math.random()*nodes.length)];
      const node=cache.get(summary.nodeId)??await fetchNode(solutionId,summary.nodeId);
      cache.set(summary.nodeId,node);
      setQuestion(buildQuestion(solutionId,node));
      setStatus('ready');
    }catch{
      setStatus('error');
    }
  },[]);

  useEffect(()=>{if(SOLVER_API_URL)void next()},[next]);

  const choose=(action:string)=>{
    if(!question||answer)return;
    setAnswer(action);
    const correct=gradeAnswer(question.hand.actions,action)!=='miss';
    setScore(current=>({correct:current.correct+(correct?1:0),total:current.total+1,streak:correct?current.streak+1:0}));
  };

  const grade=question&&answer?gradeAnswer(question.hand.actions,answer):null;

  return <main className="quiz-page shared-header-page" aria-labelledby="quiz-page-title">
    <div className="quiz-shell">
      <header className="quiz-heading">
        <div>
          <p className="quiz-eyebrow"><Sparkles size={12} aria-hidden="true"/> SolveaGTO連携</p>
          <h1 id="quiz-page-title">プリフロップ GTOクイズ</h1>
          <p>SolveaGTOの独自AI Solverが計算した戦略から出題します。キャッシュ6-max・100BBのスポットで、あなたのアクションを選んでください。</p>
        </div>
        <dl className="quiz-score" aria-label="スコア">
          <div><dt>正解</dt><dd>{score.correct}<small>/{score.total}</small></dd></div>
          <div><dt>連続</dt><dd>{score.streak}</dd></div>
        </dl>
      </header>

      {status==='unconfigured'&&<section className="quiz-message"><h2>クイズは準備中です</h2><p>SolveaGTO APIの接続先が設定されていません。</p></section>}
      {status==='error'&&<section className="quiz-message"><h2>問題を読み込めませんでした</h2><p>SolveaGTO APIに接続できませんでした。時間をおいて再度お試しください。</p><button type="button" onClick={()=>{setStatus('loading');void next()}}><RotateCcw size={14} aria-hidden="true"/>再読み込み</button></section>}
      {status==='loading'&&!question&&<section className="quiz-message" aria-live="polite"><p>Solverの戦略を読み込み中…</p></section>}

      {status==='ready'&&question&&<section className="quiz-card" aria-live="polite">
        <div className="quiz-spot">
          <div className="quiz-spot-meta">
            <span>あなたは <strong>{question.node.actingPosition}</strong></span>
            <span>ポット {question.node.potBb}bb</span>
            <span>有効スタック {question.node.effectiveStackBb}bb</span>
          </div>
          <p className="quiz-history">{describeHistory(question.node.actionHistory.actions,question.node.actingPosition)}</p>
          <div className="quiz-hand" aria-label={`ハンド ${question.hand.hand}`}>
            {question.cards.map(card=><span key={card} className={/[♥♦]/.test(card)?'is-red':undefined}>{card}</span>)}
            <small>{question.hand.hand}</small>
          </div>
        </div>

        <div className="quiz-choices" role="group" aria-label="アクションを選択">
          {question.choices.map(action=>{
            const frequency=question.hand.actions[action]??0;
            const state=answer?(action===answer?`is-chosen is-${grade}`:gradeAnswer(question.hand.actions,action)==='best'?'is-best':''):'';
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

      <p className="quiz-note">頻度は{question?.hand.hand??'ハンド'}の全コンボを平均したSolverの戦略です。SolveaGTOのSolverは開発中のため、数値は今後更新される可能性があります。</p>
    </div>
  </main>;
}
