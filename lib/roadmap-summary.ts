export type RoadmapSummary={
  id:string;
  title:string;
  description:string;
  navDescription:string;
  accent:string;
};

export const roadmapSummaries:RoadmapSummary[]=[
  {id:'beginner',title:'初心者コース',description:'基本用語から、プリフロップとポストフロップの考え方まで。',navDescription:'基礎から体系的に学ぶ',accent:'#2878ee'},
  {id:'cash',title:'キャッシュコース',description:'深いスタックでのレンジ構築と、ストリートごとの戦略。',navDescription:'リングゲームで勝つ',accent:'#12a883'},
  {id:'mtt',title:'MTTコース',description:'スタック変化、ICM、終盤戦を体系的に学ぶ。',navDescription:'トーナメントで勝つ',accent:'#9b65e8'},
];
