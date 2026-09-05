import {readFile,writeFile} from 'node:fs/promises';

const database=JSON.parse(await readFile('data/articles.json','utf8'));
const headers={'user-agent':'Potover metadata collector/0.3 (+https://github.com/Suuu-sh/Potover)'};
const genericHeadings=new Set(['table of contents','keep reading','related posts','関連記事','同じカテゴリの記事','コメント','comments','leave a reply','share','crush with the best ai solver','more stories','other stories','we use cookies','cookie preferences center','stay ahead with the biggest poker news!']);

const decode=(value='')=>value
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1')
  .replace(/&#(\d+);/g,(_,code)=>String.fromCodePoint(Number(code)))
  .replace(/&#x([0-9a-f]+);/gi,(_,code)=>String.fromCodePoint(Number.parseInt(code,16)))
  .replace(/&nbsp;/gi,' ')
  .replace(/&amp;/gi,'&')
  .replace(/&quot;/gi,'"')
  .replace(/&apos;|&#x27;/gi,"'")
  .replace(/&lt;/gi,'<')
  .replace(/&gt;/gi,'>');

const clean=(value='')=>decode(value.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim();
const normalize=value=>value.toLocaleLowerCase().replace(/[「」『』“”\"'’‘.,:：!?！？\s]/g,'');
const titleKeys=new Set(database.articles.map(article=>normalize(article.title)));

function extractHeadings(html,title){
  const headings=[]; const seen=new Set();
  for(const match of html.matchAll(/<h([23])\b[^>]*>([\s\S]*?)<\/h\1>/gi)){
    const text=clean(match[2]);
    if(text.length<2||text.length>140)continue;
    const key=normalize(text);
    if(!key||seen.has(key)||genericHeadings.has(text.toLocaleLowerCase())||key===normalize(title)||titleKeys.has(key))continue;
    seen.add(key); headings.push({level:Number(match[1]),text});
    if(headings.length>=8)break;
  }
  return headings;
}

async function mapLimit(values,limit,callback){
  const results=Array(values.length); let cursor=0;
  await Promise.all(Array.from({length:Math.min(limit,values.length)},async()=>{
    while(true){const index=cursor++; if(index>=values.length)return; results[index]=await callback(values[index],index);}
  }));
  return results;
}

const results=await mapLimit(database.articles,8,async(article,index)=>{
  try{
    const response=await fetch(article.originalUrl,{headers,redirect:'follow'});
    if(!response.ok)throw new Error(String(response.status));
    const headings=extractHeadings(await response.text(),article.title);
    if(index%50===0)console.log(`headings ${index}/${database.articles.length}`);
    return {article,headings};
  }catch(error){
    console.warn(`Skipped ${article.originalUrl}: ${error.message}`);
    return {article,headings:[]};
  }
});

let withHeadings=0;
for(const result of results){
  if(result.headings.length){result.article.headings=result.headings;withHeadings++;}
  else if(!Array.isArray(result.article.headings))result.article.headings=[];
}
await writeFile('data/articles.json',JSON.stringify(database,null,2)+'\n');
console.log(JSON.stringify({total:database.articles.length,withHeadings,withoutHeadings:database.articles.length-withHeadings},null,2));
