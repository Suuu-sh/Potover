import {mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {afterEach,expect,it,vi} from 'vitest';
import {exportArticles,uploadArticles} from './d1-articles.mjs';

let temporaryDirectory;
afterEach(async()=>{
  vi.unstubAllGlobals();
  if(temporaryDirectory)await rm(temporaryDirectory,{recursive:true,force:true});
  temporaryDirectory=undefined;
});

async function fixture(value){
  temporaryDirectory=await mkdtemp(path.join(os.tmpdir(),'potover-d1-'));
  const filePath=path.join(temporaryDirectory,'articles.json');
  await writeFile(filePath,JSON.stringify(value));
  return filePath;
}

const scopeFor=articles=>({version:'test',sources:['sample-source'],articles:articles.map(({slug,originalUrl,sourceSlug})=>({slug,originalUrl,sourceSlug}))});
const source={slug:'sample-source',name:'Sample Source',url:'https://example.com',language:'English'};
const article=(index)=>({
  source:source.name,
  sourceUrl:source.url,
  sourceSlug:source.slug,
  title:`Sample article ${index}`,
  originalUrl:`https://example.com/articles/${index}`,
  author:null,
  publishedAt:'2026-09-01T00:00:00.000Z',
  summary:'A short article summary.',
  language:'English',
  imageUrl:null,
  contentType:'article',
  classification:{difficulty:'beginner',tags:['gto']},
});

it('uploads bounded batches, sending source metadata only once',async()=>{
  const filePath=await fixture({collectedAt:'2026-09-28T00:00:00.000Z',sources:[source],articles:Array.from({length:6},(_,index)=>article(index))});
  const calls=[];
  vi.stubGlobal('fetch',vi.fn(async(url,options)=>{
    const body=JSON.parse(options.body);
    calls.push({url,headers:options.headers,body});
    return Response.json({ok:true,count:body.articles.length});
  }));

  const result=await uploadArticles({apiUrl:'http://127.0.0.1:8787',token:'local-secret',filePath});

  expect(result).toEqual({articles:6,sources:1});
  expect(calls).toHaveLength(2);
  expect(calls[0].body.articles).toHaveLength(5);
  expect(calls[1].body.articles).toHaveLength(1);
  expect(calls[0].body.sources).toEqual([source]);
  expect(calls[1].body.sources).toEqual([]);
  expect(calls[0].body.collectedAt).toBeUndefined();
  expect(calls[1].body.collectedAt).toBe('2026-09-28T00:00:00.000Z');
  expect(calls[0].headers.Authorization).toBe('Bearer local-secret');
  expect(calls[0].body.articles[0].slug).toBe('sample-article-0-1');
});

it('refuses uploads without an explicit destination and secret',async()=>{
  const filePath=await fixture({sources:[source],articles:[article(0)]});
  const fetch=vi.fn();
  vi.stubGlobal('fetch',fetch);

  await expect(uploadArticles({apiUrl:'http://127.0.0.1:8787',filePath})).rejects.toThrow('POTOVER_INGEST_TOKEN is required');
  await expect(uploadArticles({token:'local-secret',filePath})).rejects.toThrow('POTOVER_API_URL must be set explicitly');
  expect(fetch).not.toHaveBeenCalled();
});

it('refuses to send an ingestion token to a non-local HTTP endpoint',async()=>{
  const filePath=await fixture({sources:[source],articles:[article(0)]});
  await expect(uploadArticles({apiUrl:'http://api.example.test',token:'local-secret',filePath}))
    .rejects.toThrow('HTTP is allowed only for localhost development');
});

it('exports every authenticated D1 page and preserves the full source data and stable slugs',async()=>{
  const filePath=await fixture({sources:[source],articles:[article(0)]});
  const storedArticles=[{...article(0),slug:'d1-slug-1',headings:[{level:2,text:'Source heading'}],imageUrl:'https://example.com/image.jpg'},
    {...article(1),slug:'d1-slug-2',contentType:'video',durationSeconds:123,imageUrl:'https://example.com/thumbnail.jpg'}];
  const articleCalls=[];
  vi.stubGlobal('fetch',vi.fn(async(url,options)=>{
    const parsed=new URL(url);
    if(['/api/sources','/api/sources/export'].includes(parsed.pathname))return Response.json({sources:[source]});
    articleCalls.push({path:parsed.pathname,headers:options.headers});
    const offset=Number(parsed.searchParams.get('offset'));
    return Response.json({total:2,collectedAt:'2026-09-28T00:00:00.000Z',articles:storedArticles.slice(offset,offset+1)});
  }));

  const result=await exportArticles({apiUrl:'https://api.example.test',token:'local-secret',filePath});

  const snapshot=JSON.parse(await readFile(filePath,'utf8'));
  expect(result).toEqual({articles:2,sources:1});
  expect(snapshot.articles.map(row=>row.slug)).toEqual(['d1-slug-1','d1-slug-2']);
  expect(snapshot.articles).toEqual(storedArticles);
  expect(articleCalls).toEqual(Array.from({length:2},()=>({path:'/api/articles/export',headers:{Authorization:'Bearer local-secret'}})));
  expect(snapshot.collectedAt).toBe('2026-09-28T00:00:00.000Z');
  expect(snapshot.snapshotAt).toBeTruthy();
});

it.each([undefined,'','   '])('requires a secret before making any full-export request: %j',async token=>{
  const filePath=await fixture({sources:[source],articles:[article(0)]});
  const original=await readFile(filePath,'utf8');
  const fetch=vi.fn();
  vi.stubGlobal('fetch',fetch);
  await expect(exportArticles({apiUrl:'https://api.example.test',token,filePath})).rejects.toThrow('POTOVER_INGEST_TOKEN is required');
  expect(fetch).not.toHaveBeenCalled();
  expect(await readFile(filePath,'utf8')).toBe(original);
});

it('never falls back to public data or changes the raw snapshot after a rejected private export',async()=>{
  const filePath=await fixture({sources:[source],articles:[article(0)]});
  const original=await readFile(filePath,'utf8');
  const paths=[];
  vi.stubGlobal('fetch',vi.fn(async url=>{
    const {pathname}=new URL(url);
    paths.push(pathname);
    if(pathname==='/api/sources/export')return Response.json({sources:[source]});
    return Response.json({error:'Unauthorized'},{status:401});
  }));
  await expect(exportArticles({apiUrl:'https://api.example.test',token:'wrong-token',filePath})).rejects.toThrow('Potover API 401');
  expect(paths).toEqual(['/api/sources/export','/api/articles/export']);
  expect(await readFile(filePath,'utf8')).toBe(original);
});

it('exports only public metadata to a separate file without credentials, including from an older full API',async()=>{
  const storedArticles=[0,1].map(index=>({...article(index),slug:`stable-${index}`,category:'GTO',
    headings:[{level:2,text:'Private heading'}],excerpt:'Private excerpt',author:'Private author',
    sourceModifiedAt:'2026-10-03T00:00:00Z',imageUrl:'https://example.com/thumbnail.jpg',durationSeconds:123,
    classification:{difficulty:'beginner',tags:['gto'],reason:'Private classification explanation'}}));
  const filePath=await fixture({sources:[source],articles:storedArticles});
  const original=await readFile(filePath,'utf8');
  const outputPath=path.join(temporaryDirectory,'articles.public.json');
  const calls=[];
  vi.stubGlobal('fetch',vi.fn(async(url,options)=>{
    const parsed=new URL(url);
    calls.push({path:parsed.pathname,headers:options.headers});
    if(['/api/sources','/api/sources/export'].includes(parsed.pathname))return Response.json({sources:[{...source,description:'Private description'}]});
    const offset=Number(parsed.searchParams.get('offset'));
    return Response.json({total:2,collectedAt:'2026-10-03T00:00:00Z',articles:storedArticles.slice(offset,offset+1)});
  }));
  await exportArticles({apiUrl:'https://api.example.test',filePath,outputPath,mode:'public',scope:scopeFor(storedArticles)});
  const snapshot=JSON.parse(await readFile(outputPath,'utf8'));
  expect(snapshot.articles).toEqual(storedArticles.map(row=>({
    slug:row.slug,source:row.source,sourceSlug:row.sourceSlug,sourceUrl:row.sourceUrl,title:row.title,
    originalUrl:row.originalUrl,publishedAt:row.publishedAt,language:row.language,contentType:row.contentType,
    classification:{difficulty:'beginner',tags:['gto']},category:'GTO',
  })));
  expect(snapshot.sources).toEqual([source]);
  expect(calls).toEqual([{path:'/api/sources',headers:undefined},...Array.from({length:2},()=>({path:'/api/articles',headers:undefined}))]);
  expect(await readFile(filePath,'utf8')).toBe(original);
});

it('does not transmit a supplied token in public mode',async()=>{
  const publicArticle={...article(0),slug:'stable-0'};
  const filePath=await fixture({sources:[source],articles:[publicArticle]});
  vi.stubGlobal('fetch',vi.fn(async(url,options)=>{
    expect(options.headers).toBeUndefined();
    return new URL(url).pathname==='/api/sources'?Response.json({sources:[source]}):Response.json({total:1,articles:[publicArticle]});
  }));
  await exportArticles({apiUrl:'https://api.example.test',filePath,outputPath:path.join(temporaryDirectory,'public.json'),mode:'public',token:'unneeded-token',scope:scopeFor([publicArticle])});
});

it.each(['missing','extra','wrong-slug','wrong-source','replaced-url','duplicate'])('rejects a public snapshot outside the exact approved identity set: %s',async variant=>{
  const approved=[0,1].map(index=>({...article(index),slug:`stable-${index}`}));
  const rows=structuredClone(approved);
  if(variant==='missing')rows.pop();
  if(variant==='extra')rows.push({...article(2),slug:'stable-2'});
  if(variant==='wrong-slug')rows[0].slug='unapproved-slug';
  if(variant==='wrong-source')rows[0].sourceSlug='unapproved-source';
  if(variant==='replaced-url')rows[0].originalUrl='https://example.com/replaced';
  if(variant==='duplicate')rows[1]=rows[0];
  const filePath=await fixture({sources:[source],articles:approved});
  const outputPath=path.join(temporaryDirectory,'public.json');
  await writeFile(outputPath,'existing-public-snapshot');
  vi.stubGlobal('fetch',vi.fn(async url=>new URL(url).pathname==='/api/sources'
    ?Response.json({sources:[source]}):Response.json({total:rows.length,articles:rows})));
  await expect(exportArticles({apiUrl:'https://api.example.test',filePath,outputPath,mode:'public',scope:scopeFor(approved),guardAgainstShrink:false})).rejects.toThrow();
  expect(await readFile(outputPath,'utf8')).toBe('existing-public-snapshot');
});

it('refuses public exports that could overwrite the private source file',async()=>{
  const filePath=await fixture({sources:[source],articles:[article(0)]});
  const fetch=vi.fn();
  vi.stubGlobal('fetch',fetch);
  await expect(exportArticles({apiUrl:'https://api.example.test',filePath,mode:'public'})).rejects.toThrow('separate outputPath');
  await expect(exportArticles({apiUrl:'https://api.example.test',filePath,outputPath:path.join(temporaryDirectory,'.','articles.json'),mode:'public'})).rejects.toThrow('separate outputPath');
  await expect(exportArticles({apiUrl:'https://api.example.test',filePath,mode:'unknown'})).rejects.toThrow('export mode must be internal or public');
  expect(fetch).not.toHaveBeenCalled();
});

it('does not overwrite a larger current snapshot with a smaller D1 response',async()=>{
  const filePath=await fixture({sources:[source],articles:[article(0),article(1)]});
  const original=await readFile(filePath,'utf8');
  vi.stubGlobal('fetch',vi.fn(async(url)=>{
    const parsed=new URL(url);
    if(['/api/sources','/api/sources/export'].includes(parsed.pathname))return Response.json({sources:[source]});
    return Response.json({total:1,articles:[{...article(0),slug:'d1-slug-1'}]});
  }));

  await expect(exportArticles({apiUrl:'https://api.example.test',token:'local-secret',filePath})).rejects.toThrow('D1 has 1 articles but the current snapshot has 2');
  expect(await readFile(filePath,'utf8')).toBe(original);
});

it('keeps migrated slugs through reordering and title changes, assigning URL IDs only to new articles',async()=>{
  const stored=[{...article(1),slug:'existing-article-2',title:'Changed title'}, {...article(0),slug:'existing-article-1'}, article(2)];
  const filePath=await fixture({snapshotAt:'2026-10-03T00:00:00Z',sources:[source],articles:stored});
  const slugs=[];
  vi.stubGlobal('fetch',vi.fn(async(_url,options)=>{
    const body=JSON.parse(options.body);
    slugs.push(body.articles.map(row=>row.slug));
    return Response.json({count:body.articles.length});
  }));
  await uploadArticles({apiUrl:'http://localhost:8787',token:'test-only',filePath});
  await writeFile(filePath,JSON.stringify({snapshotAt:'2026-10-03T00:00:00Z',sources:[source],articles:[stored[2],stored[0],stored[1]]}));
  await uploadArticles({apiUrl:'http://localhost:8787',token:'test-only',filePath});
  expect(slugs[0].slice(0,2)).toEqual(['existing-article-2','existing-article-1']);
  expect(slugs[0][2]).toMatch(/^article-[a-f0-9]{24}$/);
  expect(slugs[1]).toEqual([slugs[0][2],slugs[0][0],slugs[0][1]]);
});

it('continues from actual page length when the API returns short pages',async()=>{
  const filePath=await fixture({sources:[source],articles:[article(0)]});
  const rows=Array.from({length:5},(_,index)=>({...article(index),slug:`stable-${index}`}));
  const offsets=[];
  vi.stubGlobal('fetch',vi.fn(async(url)=>{
    const parsed=new URL(url);
    if(['/api/sources','/api/sources/export'].includes(parsed.pathname))return Response.json({sources:[source]});
    const offset=Number(parsed.searchParams.get('offset'));offsets.push(offset);
    return Response.json({total:5,collectedAt:'2026-10-03T00:00:00Z',articles:rows.slice(offset,offset+2)});
  }));
  await exportArticles({apiUrl:'https://api.example.test',token:'local-secret',filePath});
  expect(offsets).toEqual([0,2,4]);
  expect(JSON.parse(await readFile(filePath,'utf8')).articles).toEqual(rows);
});

it('does not publish pages from different collection snapshots',async()=>{
  const filePath=await fixture({sources:[source],articles:[article(0)]});
  const original=await readFile(filePath,'utf8');
  vi.stubGlobal('fetch',vi.fn(async(url)=>{
    const parsed=new URL(url);
    if(['/api/sources','/api/sources/export'].includes(parsed.pathname))return Response.json({sources:[source]});
    const offset=Number(parsed.searchParams.get('offset'));
    return Response.json({total:2,collectedAt:`2026-10-0${offset+1}T00:00:00Z`,articles:[{...article(offset),slug:`stable-${offset}`}]});
  }));
  await expect(exportArticles({apiUrl:'https://api.example.test',token:'local-secret',filePath})).rejects.toThrow('D1 changed while exporting');
  expect(await readFile(filePath,'utf8')).toBe(original);
});
