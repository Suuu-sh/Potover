import {Article,articles} from '@/lib/data';
import {roadmapSummaries} from '@/lib/roadmap-summary';

export type RoadmapModule={title:string;description:string;tags:string[];difficulty?:string};
export type Roadmap={id:string;title:string;description:string;accent:string;modules:RoadmapModule[]};

export const roadmaps:Roadmap[]=[
  {...roadmapSummaries[0],modules:[
    {title:'プリフロップの基本',description:'ポジションとスターティングハンドを理解する',tags:['preflop'],difficulty:'Beginner'},
    {title:'フロップの考え方',description:'ボードとベットサイズの基本を身につける',tags:['flop'],difficulty:'Beginner'},
    {title:'ブラフとバリュー',description:'ベットする目的と頻度を整理する',tags:['bluff'],difficulty:'Beginner'},
    {title:'GTOの入口',description:'均衡戦略を実戦で使うための土台を作る',tags:['gto'],difficulty:'Beginner'},
  ]},
  {...roadmapSummaries[1],modules:[
    {title:'キャッシュのプリフロップ',description:'ポジション別のレンジを整える',tags:['cash-game','preflop']},
    {title:'フロップ戦略',description:'CBとチェックをボード別に使い分ける',tags:['cash-game','flop']},
    {title:'ターンの組み立て',description:'レンジ変化とセカンドバレルを学ぶ',tags:['cash-game','turn']},
    {title:'リバーとエクスプロイト',description:'薄いバリューと相手別の調整を磨く',tags:['cash-game','river','exploit']},
  ]},
  {...roadmapSummaries[2],modules:[
    {title:'MTTの基礎',description:'トーナメント特有の考え方を理解する',tags:['mtt'],difficulty:'Beginner'},
    {title:'ショートスタック戦略',description:'限られたスタックでの判断を磨く',tags:['mtt','preflop']},
    {title:'ICMを理解する',description:'賞金価値を含めた意思決定を学ぶ',tags:['icm']},
    {title:'終盤の実戦戦略',description:'バブルからファイナルまでの調整を身につける',tags:['mtt','exploit']},
  ]},
];

export function moduleArticles(module:RoadmapModule,language:string,limit=3):Article[]{
  const preferredSource=language==='Japanese'?'gto-wizard-japan':'gto-wizard';
  return articles.map(article=>({article,score:module.tags.reduce((sum,tag)=>sum+(article.tags.includes(tag)?2:0),0)+(article.language===language?2:0)+(module.difficulty===article.difficulty?1:0)+(article.sourceSlug===preferredSource?2:0)+(article.imageUrl?1:0)})).filter(item=>item.score>=4).sort((a,b)=>b.score-a.score||b.article.publishedAt.localeCompare(a.article.publishedAt)).slice(0,limit).map(item=>item.article);
}
