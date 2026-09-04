import {readFile,writeFile} from 'node:fs/promises';

const channels=[
  {id:'UCXSg1srGpJ67HuPTMm4w72g',source:'GTO Wizard',sourceSlug:'gto-wizard',sourceUrl:'https://www.youtube.com/@GTOWizard',language:'English'},
  {id:'UCe9X7pQ5R0LduvBkhmOnj7Q',source:'GTO Wizard Japan',sourceSlug:'gto-wizard-japan',sourceUrl:'https://www.youtube.com/@GTOWizardJapan',language:'Japanese'},
];
const headers={'user-agent':'Potover metadata collector/0.3 (+https://github.com/Suuu-sh/Potover)'};
const get=async url=>{const response=await fetch(url,{headers,redirect:'follow',signal:AbortSignal.timeout(8000)});if(!response.ok)throw new Error(`${response.status} ${url}`);return response.text()};
const decode=(value='')=>value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&#(\d+);/g,(_,code)=>String.fromCodePoint(Number(code))).replace(/&#x([0-9a-f]+);/gi,(_,code)=>String.fromCodePoint(Number.parseInt(code,16))).replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&apos;|&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/<[^>]+>/g,' ').replace(/https?:\/\/\S+/g,' ').replace(/\s+/g,' ').trim();
const pick=(xml,name)=>decode(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`,'i').exec(xml)?.[1]||'');
const summarize=(description,title)=>{let text=decode(description).replace(/^GTO Wizard helps you to learn GTO and analyze your game\. Try it for free at\s*/i,'');const boilerplate=text.search(/(?:GTO Wizard helps you to learn GTO and analyze your game|🧙|📚)/i);if(boilerplate>80)text=text.slice(0,boilerplate);return (text||title).trim().slice(0,320)};
const classify=(title,summary)=>{const text=`${title} ${summary}`.toLowerCase();const tags=[];for(const [needle,tag] of [['プリフロップ','preflop'],['preflop','preflop'],['フロップ','flop'],['flop','flop'],['ターン','turn'],['turn','turn'],['リバー','river'],['river','river'],['gto','gto'],['solver','gto'],['ソルバー','gto'],['icm','icm'],['エクスプロイト','exploit'],['exploit','exploit'],['ブラフ','bluff'],['bluff','bluff'],['キャッシュ','cash-game'],['cash','cash-game'],['トーナメント','mtt'],['tournament','mtt'],['mtt','mtt']])if(text.includes(needle))tags.push(tag);return {difficulty:/初心者|入門|基本|beginner|basic|fundamental/.test(text)?'beginner':'intermediate',tags:[...new Set(tags)]}};
const mapLimit=async(values,limit,callback)=>{const results=[];let cursor=0;await Promise.all(Array.from({length:Math.min(limit,values.length)},async()=>{while(cursor<values.length){const index=cursor++;results[index]=await callback(values[index],index)}}));return results};
const durationFor=async videoId=>{try{const html=await get(`https://www.youtube.com/watch?v=${videoId}`);return Number(html.match(/"lengthSeconds":"(\d+)"/)?.[1]||0)||null}catch{return null}};

const database=JSON.parse(await readFile('data/articles.json','utf8'));
const existing=new Map(database.articles.map(item=>[item.originalUrl,item]));
let collected=0;
for(const channel of channels){
  const feed=await get(`https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`);
  const entries=[...feed.matchAll(/<entry>([\s\S]*?)<\/entry>/gi)].map(match=>match[1]);
  const videos=await mapLimit(entries,5,async entry=>{
    const videoId=pick(entry,'yt:videoId');
    const title=pick(entry,'title');
    const description=pick(entry,'media:description');
    const summary=summarize(description,title);
    return {source:channel.source,sourceSlug:channel.sourceSlug,sourceUrl:channel.sourceUrl,title,originalUrl:`https://www.youtube.com/watch?v=${videoId}`,author:channel.source,publishedAt:pick(entry,'published')||null,summary,language:channel.language,imageUrl:`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,contentType:'video',durationSeconds:await durationFor(videoId),classification:classify(title,summary)};
  });
  for(const video of videos){const current=existing.get(video.originalUrl);if(current)Object.assign(current,video);else{database.articles.push(video);existing.set(video.originalUrl,video)}collected+=1}
  console.log(`${channel.source}: refreshed ${videos.length} YouTube videos`);
}
database.collectedAt=new Date().toISOString();
await writeFile('data/articles.json',JSON.stringify(database,null,2)+'\n');
console.log(JSON.stringify({collected,total:database.articles.length,videos:database.articles.filter(item=>item.contentType==='video').length},null,2));
