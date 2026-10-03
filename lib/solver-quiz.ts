// SolveaGTOのExternal APIが配信する推定レンジ（/v1/estimated）からクイズを作る。
export const SOLVER_API_URL=(process.env.NEXT_PUBLIC_SOLVEAAI_API_URL||'').replace(/\/+$/,'');

export type Position='UTG'|'HJ'|'CO'|'BTN'|'SB'|'BB';

export type SpotAction={position:Position;action:'fold'|'call'|'check'|'raise'|'all_in';sizeBb?:number};

export type SpotOption={action:SpotAction['action'];sizeBb?:number};

export type Stage='open'|'vs_open'|'vs_3bet'|'vs_4bet'|'vs_5bet'|'vs_limp';

export type SpotSummary={
  dataset:string;
  spotId:string;
  stage:Stage;
  hero:Position;
  effectiveStackBb:number;
  history:SpotAction[];
  options:SpotOption[];
};

export type HandStrategy={hand:string;reachable:boolean;frequencies:Record<string,number>};

export type SpotDetail=SpotSummary&{strategyType:string;hands:HandStrategy[]};

export type QuizQuestion={
  spot:SpotDetail;
  hand:HandStrategy;
  cards:[string,string];
  choices:string[];
};

export type Grade='best'|'mixed'|'miss';

async function getJson<T>(path:string):Promise<T>{
  const response=await fetch(`${SOLVER_API_URL}${path}`);
  if(!response.ok)throw new Error(`SolveaGTO API ${response.status}: ${path}`);
  return response.json() as Promise<T>;
}

export const fetchSpots=()=>getJson<SpotSummary[]>('/v1/estimated/spots');
export const fetchSpot=(dataset:string,spotId:string)=>getJson<SpotDetail>(`/v1/estimated/datasets/${encodeURIComponent(dataset)}/spots/${encodeURIComponent(spotId)}`);

export const stageLabels:Record<Stage,string>={
  open:'オープン',
  vs_open:'オープンへの応答',
  vs_3bet:'3ベットへの応答',
  vs_4bet:'4ベットへの応答',
  vs_5bet:'5ベットへの応答',
  vs_limp:'リンプへの応答',
};

export function optionKey({action,sizeBb}:SpotOption){
  return action==='raise'?`raise_${sizeBb}`:action;
}

// 到達しないハンドは出題しない。ほぼ100%フォールドのハンドばかり出ないよう、判断の分かれるハンドを優先する。
export function pickHand(hands:HandStrategy[],random=Math.random){
  const reachable=hands.filter(hand=>hand.reachable);
  const candidates=reachable.length>0?reachable:hands;
  const interesting=candidates.filter(hand=>(hand.frequencies.fold??0)<0.95);
  const pool=interesting.length>0&&random()<0.8?interesting:candidates;
  return pool[Math.floor(random()*pool.length)];
}

const SUITS=['♠','♥','♦','♣'];

export function handToCards(hand:string,random=Math.random):[string,string]{
  const [high,low,kind]=hand.split('');
  const first=Math.floor(random()*4);
  const second=kind==='s'?first:(first+1+Math.floor(random()*3))%4;
  return [`${high}${SUITS[first]}`,`${low}${SUITS[second]}`];
}

export function actionLabel(key:string){
  if(key==='fold')return 'フォールド';
  if(key==='check')return 'チェック';
  if(key==='call')return 'コール';
  if(key==='all_in')return 'オールイン';
  const size=key.match(/^raise_([\d.]+)$/);
  if(size)return `レイズ ${size[1]}bb`;
  return key;
}

function historyActionLabel({action,sizeBb}:SpotAction,raiseCount:number){
  if(action==='call')return raiseCount===0?'リンプ':'コール';
  if(action==='check')return 'チェック';
  if(action==='all_in')return 'オールイン';
  if(action==='raise'){
    const name=raiseCount===0?'オープン':`${raiseCount+2}ベット`;
    return sizeBb?`${sizeBb}bbで${name}`:name;
  }
  return 'フォールド';
}

// フォールドは省き、参加したアクションだけを「UTG 2.5bbでオープン → CO 8bbで3ベット」のように並べる。
export function describeHistory(actions:SpotAction[],hero?:Position|null){
  let raiseCount=0;
  const parts=actions.filter(item=>item.action!=='fold').map(item=>{
    const label=`${item.position} ${historyActionLabel(item,raiseCount)}`;
    if(item.action==='raise')raiseCount+=1;
    return label;
  });
  if(parts.length>0)return parts.join(' → ');
  return hero==='UTG'?'あなたが最初に行動します':'あなたの前は全員フォールド';
}

export function buildQuestion(spot:SpotDetail,random=Math.random):QuizQuestion{
  const hand=pickHand(spot.hands,random);
  return {spot,hand,cards:handToCards(hand.hand,random),choices:spot.options.map(optionKey)};
}

// 最頻アクションは正解。頻度25%以上は混合戦略として許容し、それ未満は不正解。
export function gradeAnswer(frequencies:Record<string,number>,answer:string):Grade{
  const chosen=frequencies[answer]??0;
  const top=Math.max(...Object.values(frequencies));
  if(chosen>=top-1e-9)return 'best';
  if(chosen>=0.25)return 'mixed';
  return 'miss';
}
