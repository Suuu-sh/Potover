export const TOPIC_LABELS={general:'ポーカー全般',preflop:'プリフロップ',postflop:'ポストフロップ',gto:'GTO・ソルバー',exploit:'ブラフ・エクスプロイト',tournament:'トーナメント・ICM',mental:'メンタル・学習',cash:'キャッシュ・資金管理'};
export const TOPIC_IDS=Object.keys(TOPIC_LABELS);
// Existing search tags stay unchanged. Select one display illustration using
// explicit tag priority and clear title clues, not a claimed semantic verdict.
export function classifyArticleTopic(article){
  const title=typeof article?.title==='string'?article.title:'';
  const values=article?.classification?.tags??article?.tags;
  const tags=new Set(Array.isArray(values)?values.filter(x=>typeof x==='string').map(x=>x.toLowerCase()):[]);
  if(/\b(?:mental|mindset|psychology|psychological|tilt|tilting|cognitive|bias|biases|motivation|learning|studying|study)\b|メンタル|ティルト|心構え|バイアス|勉強法|学習|振り返り/i.test(title))return {topic:'mental',reason:'title'};
  if(/\bbankroll\b|資金管理|バンクロール|ショットテイク/i.test(title))return {topic:'cash',reason:'title'};
  if(/\b(?:beginner|beginners|hand rankings)\b|poker rules|how to play poker|ポーカーとは|ポーカーのルール|役一覧|初心者|はじめて|マナー/i.test(title))return {topic:'general',reason:'basic-title'};
  if(tags.has('preflop'))return {topic:'preflop',reason:'tag'};
  if(tags.has('bluff')||tags.has('exploit'))return {topic:'exploit',reason:'tag'};
  if(['flop','turn','river'].some(t=>tags.has(t)))return {topic:'postflop',reason:'tag'};
  if(['mtt','icm','spin'].some(t=>tags.has(t)))return {topic:'tournament',reason:'tag'};
  if(tags.has('cash-game'))return {topic:'cash',reason:'tag'};
  if(tags.has('gto'))return {topic:'gto',reason:'tag'};
  return {topic:'general',reason:'fallback'};
}
export function createTopicArtLookup(manifest){
  if(manifest?.version!==1||!Array.isArray(manifest.assets)||manifest.assets.length!==TOPIC_IDS.length)throw new Error('Invalid owned topic art manifest');
  const assets=new Map();
  for(const asset of manifest.assets){
    if(!TOPIC_IDS.includes(asset.id)||assets.has(asset.id)||asset.src!==`/topic-art/${asset.id}.webp`||asset.width!==1280||asset.height!==720||asset.origin!=='generated-for-potover'||!/^[a-f0-9]{64}$/.test(asset.sha256))throw new Error('Unsafe owned topic art asset');
    assets.set(asset.id,{topic:asset.id,src:asset.src,width:asset.width,height:asset.height,label:TOPIC_LABELS[asset.id]});
  }
  return article=>assets.get(classifyArticleTopic(article).topic);
}
export function readOwnedIllustration(value){
  if(!value||!TOPIC_IDS.includes(value.topic)||value.src!==`/topic-art/${value.topic}.webp`||value.width!==1280||value.height!==720)return undefined;
  return {topic:value.topic,src:value.src,width:1280,height:720,label:TOPIC_LABELS[value.topic]};
}
