import {translate,type Locale} from './i18n';
const topics=[
  [['プリフロップ','preflop','pre-flop','pre flop'],['プリフロップ','preflop','pre-flop','pre flop']],
  [['ポストフロップ','postflop','post-flop','post flop'],['ポストフロップ','postflop','post-flop','post flop','flop','turn','river']],
  [['gto・ソルバー','gto and solvers'],['gto','ソルバー','solver']],
  [['トーナメント','tournaments','tournament'],['トーナメント','tournament','mtt','icm']],
  [['メンタル・思考','mindset and decisions'],['メンタル','思考','mental','mindset','psychology','decision']],
  [['バンクロール','bankroll'],['バンクロール','bankroll','bank roll']],
] as const;
export function contentQueryTerms(query:string):readonly string[]{const normalized=query.trim().toLowerCase();return topics.find(([keys])=>(keys as readonly string[]).includes(normalized))?.[1]||[normalized];}
export function matchesFilterSearch(value:string,query:string,locale:Locale){return `${value} ${translate(value,locale)}`.toLowerCase().includes(query.trim().toLowerCase());}
