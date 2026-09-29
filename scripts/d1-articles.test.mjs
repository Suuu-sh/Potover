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
  const filePath=await fixture({collectedAt:'2026-09-28T00:00:00.000Z',sources:[source],articles:Array.from({length:76},(_,index)=>article(index))});
  const calls=[];
  vi.stubGlobal('fetch',vi.fn(async(url,options)=>{
    const body=JSON.parse(options.body);
    calls.push({url,headers:options.headers,body});
    return Response.json({ok:true,count:body.articles.length});
  }));

  const result=await uploadArticles({apiUrl:'http://127.0.0.1:8787',token:'local-secret',filePath});

  expect(result).toEqual({articles:76,sources:1});
  expect(calls).toHaveLength(2);
  expect(calls[0].body.articles).toHaveLength(75);
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

it('exports every D1 page as a snapshot and preserves the stable D1 slugs',async()=>{
  const filePath=await fixture({sources:[source],articles:[article(0)]});
  const storedArticles=[{...article(0),slug:'d1-slug-1'},{...article(1),slug:'d1-slug-2'}];
  vi.stubGlobal('fetch',vi.fn(async(url)=>{
    const parsed=new URL(url);
    if(parsed.pathname==='/api/sources')return Response.json({sources:[source]});
    const offset=Number(parsed.searchParams.get('offset'));
    return Response.json({total:2,collectedAt:'2026-09-28T00:00:00.000Z',articles:storedArticles.slice(offset,offset+1)});
  }));

  const result=await exportArticles({apiUrl:'https://api.example.test',filePath});

  const snapshot=JSON.parse(await readFile(filePath,'utf8'));
  expect(result).toEqual({articles:2,sources:1});
  expect(snapshot.articles.map(row=>row.slug)).toEqual(['d1-slug-1','d1-slug-2']);
  expect(snapshot.collectedAt).toBe('2026-09-28T00:00:00.000Z');
  expect(snapshot.snapshotAt).toBeTruthy();
});

it('does not overwrite a larger current snapshot with a smaller D1 response',async()=>{
  const filePath=await fixture({sources:[source],articles:[article(0),article(1)]});
  const original=await readFile(filePath,'utf8');
  vi.stubGlobal('fetch',vi.fn(async(url)=>{
    const parsed=new URL(url);
    if(parsed.pathname==='/api/sources')return Response.json({sources:[source]});
    return Response.json({total:1,articles:[{...article(0),slug:'d1-slug-1'}]});
  }));

  await expect(exportArticles({apiUrl:'https://api.example.test',filePath})).rejects.toThrow('D1 has 1 articles but the current snapshot has 2');
  expect(await readFile(filePath,'utf8')).toBe(original);
});
