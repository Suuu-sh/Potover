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

export const CASH_GAME_FILTER='cash-game';
/** Keep old saved/URL values working while both filter controls use one tag. */
export function canonicalContentFilter(value:string):string{
  return ['cash game','cash-game','キャッシュ'].includes(value.trim().toLowerCase())?CASH_GAME_FILTER:value;
}
export function normalizeContentFilters(values:string[]):string[]{return Array.from(new Set(values.map(canonicalContentFilter)));}
export function matchesContentTopic(text:string,filter:string):boolean{return text.toLowerCase().includes(canonicalContentFilter(filter).toLowerCase());}
