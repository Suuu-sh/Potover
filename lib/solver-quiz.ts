// SolveaGTO（SolveaAI Edge API）のプリフロップSolutionからクイズを作る。
export const SOLVER_API_URL=(process.env.NEXT_PUBLIC_SOLVEAAI_API_URL||'').replace(/\/+$/,'');

export type Position='UTG'|'HJ'|'CO'|'BTN'|'SB'|'BB';

type HistoryAction={position:Position;action:{type:string;sizeBb?:number}};

export type NodeSummary={
  nodeId:string;
  nodeType:string;
  actingPosition:Position|null;
  actionHistory:{actions:HistoryAction[]};
  potBb:number;
  effectiveStackBb:number;
  hasStrategy:boolean;
};

export type HandAggregate={hand:string;comboCount:number;actions:Record<string,number>};

export type SolutionNode=Omit<NodeSummary,'hasStrategy'>&{handAggregates:HandAggregate[]};

export type SolutionSummary={solutionId:string;stackBb:number;solverVersion:string};

export type QuizQuestion={
  solutionId:string;
  node:SolutionNode;
  hand:HandAggregate;
  cards:[string,string];
  choices:string[];
};

export type Grade='best'|'mixed'|'miss';

async function getJson<T>(path:string):Promise<T>{
  const response=await fetch(`${SOLVER_API_URL}${path}`);
  if(!response.ok)throw new Error(`SolveaGTO API ${response.status}: ${path}`);
  return response.json() as Promise<T>;
}

export const fetchSolutions=()=>getJson<SolutionSummary[]>('/v1/preflop/solutions');
export const fetchNodes=(solutionId:string)=>getJson<NodeSummary[]>(`/v1/preflop/solutions/${encodeURIComponent(solutionId)}/nodes`);
export const fetchNode=(solutionId:string,nodeId:string)=>getJson<SolutionNode>(`/v1/preflop/solutions/${encodeURIComponent(solutionId)}/nodes/${encodeURIComponent(nodeId)}`);

export function quizNodes(nodes:NodeSummary[]){
  return nodes.filter(node=>node.nodeType==='player_decision'&&node.hasStrategy&&node.actingPosition);
}

// ほぼ100%フォールドのハンドばかり出ないよう、判断の分かれるハンドを優先する。
export function pickHand(hands:HandAggregate[],random=Math.random){
  const interesting=hands.filter(hand=>(hand.actions.fold??0)<0.95);
  const pool=interesting.length>0&&random()<0.8?interesting:hands;
  return pool[Math.floor(random()*pool.length)];
}

const SUITS=['♠','♥','♦','♣'];

export function handToCards(hand:string,random=Math.random):[string,string]{
  const [high,low,kind]=hand.split('');
  const first=Math.floor(random()*4);
  const second=kind==='s'?first:(first+1+Math.floor(random()*3))%4;
  return [`${high}${SUITS[first]}`,`${low}${SUITS[second]}`];
}

const ACTION_ORDER=['fold','check','call','raise','all_in'];

export function sortActions(actions:string[]){
  const rank=(action:string)=>ACTION_ORDER.indexOf(action.split('_')[0]==='all'?'all_in':action.split('_')[0]);
  const size=(action:string)=>Number(action.split('_')[1])||0;
  return [...actions].sort((a,b)=>rank(a)-rank(b)||size(a)-size(b));
}

export function actionLabel(action:string){
  if(action==='fold')return 'フォールド';
  if(action==='check')return 'チェック';
  if(action==='call')return 'コール';
  if(action==='all_in')return 'オールイン';
  const size=action.match(/^raise_([\d.]+)$/);
  if(size)return `レイズ ${size[1]}bb`;
  return action;
}

function historyActionLabel({type,sizeBb}:HistoryAction['action'],raiseCount:number){
  if(type==='call')return 'コール';
  if(type==='check')return 'チェック';
  if(type==='all_in')return 'オールイン';
  if(type==='raise'){
    const name=raiseCount===0?'オープン':`${raiseCount+2}ベット`;
    return sizeBb?`${sizeBb}bbで${name}`:name;
  }
  return type;
}

// 暗黙のフォールドは省き、参加したアクションだけを「UTG 2.5bbでオープン → CO 7.5bbで3ベット」のように並べる。
export function describeHistory(actions:HistoryAction[],hero?:Position|null){
  let raiseCount=0;
  const parts=actions.filter(item=>item.action.type!=='fold').map(item=>{
    const label=`${item.position} ${historyActionLabel(item.action,raiseCount)}`;
    if(item.action.type==='raise')raiseCount+=1;
    return label;
  });
  if(parts.length>0)return parts.join(' → ');
  return hero==='UTG'?'あなたが最初に行動します':'あなたの前は全員フォールド';
}

export function buildQuestion(solutionId:string,node:SolutionNode,random=Math.random):QuizQuestion{
  const hand=pickHand(node.handAggregates,random);
  const choices=sortActions(Array.from(new Set(node.handAggregates.flatMap(item=>Object.keys(item.actions)))));
  return {solutionId,node,hand,cards:handToCards(hand.hand,random),choices};
}

// 最頻アクションは正解。頻度25%以上は混合戦略として許容し、それ未満は不正解。
export function gradeAnswer(frequencies:Record<string,number>,answer:string):Grade{
  const chosen=frequencies[answer]??0;
  const top=Math.max(...Object.values(frequencies));
  if(chosen>=top-1e-9)return 'best';
  if(chosen>=0.25)return 'mixed';
  return 'miss';
}
