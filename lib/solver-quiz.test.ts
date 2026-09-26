import {describe,expect,it} from 'vitest';

import {actionLabel,buildQuestion,describeHistory,gradeAnswer,handToCards,optionKey,pickHand,type HandStrategy,type SpotDetail} from './solver-quiz';

const seq=(...values:number[])=>{let i=0;return ()=>values[i++%values.length]};

describe('solver quiz',()=>{
  it('describes the history without folds',()=>{
    expect(describeHistory([
      {position:'CO',action:'raise',sizeBb:2.5},
      {position:'BTN',action:'raise',sizeBb:8},
      {position:'CO',action:'raise',sizeBb:20},
    ])).toBe('CO 2.5bbでオープン → BTN 8bbで3ベット → CO 20bbで4ベット');
    expect(describeHistory([{position:'SB',action:'call',sizeBb:1}],'BB')).toBe('SB リンプ');
    expect(describeHistory([],'UTG')).toBe('あなたが最初に行動します');
    expect(describeHistory([],'CO')).toBe('あなたの前は全員フォールド');
  });

  it('never asks unreachable hands and prefers non-trivial ones',()=>{
    const hands:HandStrategy[]=[
      {hand:'95o',reachable:false,frequencies:{fold:0.2,call:0.8}},
      {hand:'72o',reachable:true,frequencies:{fold:1,call:0}},
      {hand:'AKs',reachable:true,frequencies:{fold:0,call:1}},
    ];
    expect(pickHand(hands,seq(0.1,0.9)).hand).toBe('AKs');
    for(const value of [0,0.3,0.6,0.99])expect(pickHand(hands,seq(0.9,value)).hand).not.toBe('95o');
  });

  it('builds cards that match the hand class',()=>{
    const [a,b]=handToCards('AKs',seq(0.3));
    expect(a.slice(1)).toBe(b.slice(1));
    const [c,d]=handToCards('QQ',seq(0.3,0.5));
    expect(c.slice(1)).not.toBe(d.slice(1));
  });

  it('labels option keys',()=>{
    expect(optionKey({action:'raise',sizeBb:20})).toBe('raise_20');
    expect(optionKey({action:'all_in'})).toBe('all_in');
    expect(actionLabel('raise_20')).toBe('レイズ 20bb');
    expect(actionLabel('fold')).toBe('フォールド');
  });

  it('grades best, mixed and missed answers',()=>{
    const frequencies={fold:0.1,call:0.3,raise_20:0.6};
    expect(gradeAnswer(frequencies,'raise_20')).toBe('best');
    expect(gradeAnswer(frequencies,'call')).toBe('mixed');
    expect(gradeAnswer(frequencies,'fold')).toBe('miss');
  });

  it('uses the spot options as choices',()=>{
    const spot:SpotDetail={dataset:'four-bet-responses',spotId:'BTN_vs_CO_four_bet',stage:'vs_4bet',hero:'BTN',effectiveStackBb:100,strategyType:'ai_estimate_not_gto',
      history:[],options:[{action:'fold'},{action:'call'},{action:'all_in'}],
      hands:[{hand:'AA',reachable:true,frequencies:{fold:0,call:0.1,all_in:0.9}}]};
    expect(buildQuestion(spot,seq(0.1)).choices).toEqual(['fold','call','all_in']);
  });
});
