import {describe,expect,it} from 'vitest';

import {actionLabel,buildQuestion,describeHistory,gradeAnswer,handToCards,pickHand,quizNodes,sortActions,type HandAggregate,type NodeSummary} from './solver-quiz';

const seq=(...values:number[])=>{let i=0;return ()=>values[i++%values.length]};

describe('solver quiz',()=>{
  it('keeps only decision nodes with a strategy',()=>{
    const base={actionHistory:{actions:[]},potBb:1.5,effectiveStackBb:100};
    const nodes=[
      {...base,nodeId:'a',nodeType:'player_decision',actingPosition:'UTG',hasStrategy:true},
      {...base,nodeId:'b',nodeType:'terminal_fold',actingPosition:null,hasStrategy:false},
      {...base,nodeId:'c',nodeType:'continuation',actingPosition:null,hasStrategy:true},
    ] as NodeSummary[];
    expect(quizNodes(nodes).map(node=>node.nodeId)).toEqual(['a']);
  });

  it('describes the history without implicit folds',()=>{
    expect(describeHistory([
      {position:'UTG',action:{type:'raise',sizeBb:2.5}},
      {position:'HJ',action:{type:'fold'}},
      {position:'CO',action:{type:'raise',sizeBb:7.5}},
      {position:'BTN',action:{type:'call'}},
    ])).toBe('UTG 2.5bbでオープン → CO 7.5bbで3ベット → BTN コール');
    expect(describeHistory([],'UTG')).toBe('あなたが最初に行動します');
    expect(describeHistory([{position:'UTG',action:{type:'fold'}}],'HJ')).toBe('あなたの前は全員フォールド');
  });

  it('prefers hands that are not pure folds',()=>{
    const hands:HandAggregate[]=[
      {hand:'72o',comboCount:12,actions:{fold:1}},
      {hand:'AKs',comboCount:4,actions:{fold:0,raise_2_5:1}},
    ];
    expect(pickHand(hands,seq(0.1,0.9)).hand).toBe('AKs');
  });

  it('builds cards that match the hand class',()=>{
    const [a,b]=handToCards('AKs',seq(0.3));
    expect(a.slice(1)).toBe(b.slice(1));
    const [c,d]=handToCards('QQ',seq(0.3,0.5));
    expect(c.slice(1)).not.toBe(d.slice(1));
  });

  it('orders and labels actions',()=>{
    expect(sortActions(['raise_7.5','all_in','fold','call','raise_2.5'])).toEqual(['fold','call','raise_2.5','raise_7.5','all_in']);
    expect(actionLabel('raise_7.5')).toBe('レイズ 7.5bb');
    expect(actionLabel('fold')).toBe('フォールド');
  });

  it('grades best, mixed and missed answers',()=>{
    const frequencies={fold:0.1,call:0.3,'raise_7.5':0.6};
    expect(gradeAnswer(frequencies,'raise_7.5')).toBe('best');
    expect(gradeAnswer(frequencies,'call')).toBe('mixed');
    expect(gradeAnswer(frequencies,'fold')).toBe('miss');
  });

  it('collects every action at the node as choices',()=>{
    const node={nodeId:'n',nodeType:'player_decision',actingPosition:'BB' as const,actionHistory:{actions:[]},potBb:4,effectiveStackBb:100,handAggregates:[
      {hand:'AKs',comboCount:4,actions:{fold:0,call:0.4,'raise_11':0.6}},
    ]};
    expect(buildQuestion('s',node,seq(0.1)).choices).toEqual(['fold','call','raise_11']);
  });
});
