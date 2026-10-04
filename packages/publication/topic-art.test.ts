import {readFileSync} from 'node:fs';
import {expect,it} from 'vitest';
import {classifyArticleTopic,createTopicArtLookup,readOwnedIllustration,TOPIC_IDS} from './topic-art.mjs';
import manifest from '../../data/owned-topic-art.json';
const artFor=createTopicArtLookup(manifest);
it('uses explicit deterministic tag priority without mutating search tags',()=>{
  const a={title:'A strategy',classification:{tags:['mtt','flop','bluff','preflop','gto']}};const before=JSON.stringify(a);expect(classifyArticleTopic(a)).toEqual({topic:'preflop',reason:'tag'});expect(JSON.stringify(a)).toBe(before);
  expect(classifyArticleTopic({title:'Turn',tags:['turn','mtt']})).toEqual({topic:'postflop',reason:'tag'});
  expect(classifyArticleTopic({tags:['icm','gto']})).toEqual({topic:'tournament',reason:'tag'});
});
it('uses clear Japanese/English title clues and a non-assertive general fallback',()=>{
  for(const title of ['ティルトへの対策','Poker mindset','How confirmation bias affects study'])expect(classifyArticleTopic({title}).topic).toBe('mental');
  for(const title of ['Bankroll management','バンクロール管理'])expect(classifyArticleTopic({title}).topic).toBe('cash');
  expect(classifyArticleTopic({title:'The Theory of Bounty Tournaments: Fundamentals',tags:['mtt']}).topic).toBe('tournament');
  expect(classifyArticleTopic({title:'Unclassified content'})).toEqual({topic:'general',reason:'fallback'});
});
it('maps all eight topics to fixed local generated asset paths',()=>{
  expect(manifest.assets.map(a=>a.id).sort()).toEqual([...TOPIC_IDS].sort());
  for(const asset of manifest.assets)expect(readOwnedIllustration({topic:asset.id,src:asset.src,width:1280,height:720})?.src).toBe(asset.src);
});
it.each(['https://evil.test/a.webp','//evil.test/a.webp','/topic-art/../raw.jpg','/topic-art/%2e%2e/raw.jpg','data:image/png;base64,AA','/article-previews/old.webp'])('rejects non-owned image path %s',src=>{
  expect(readOwnedIllustration({topic:'general',src,width:1280,height:720})).toBeUndefined();
});
it('rejects invalid/missing/duplicate manifest entries or altered origins',()=>{
  for(const patch of [(m:any)=>m.assets.pop(),(m:any)=>m.assets[0].src='https://evil.test/a.webp',(m:any)=>m.assets[0].id=m.assets[1].id,(m:any)=>m.assets[0].origin='source-article']){const m=structuredClone(manifest);patch(m);expect(()=>createTopicArtLookup(m)).toThrow();}
});
it('ignores untrusted art references and always derives a first-party image',()=>{
  expect(artFor({title:'Poker',imageUrl:'https://evil.test/full.jpg',preview:{src:'https://evil.test'}})).toMatchObject({topic:'general',src:'/topic-art/general.webp'});
});
it('keeps the current public identities and honest classification coverage',()=>{
  const data=JSON.parse(readFileSync('data/articles.public.json','utf8'));const counts:Record<string,number>={};let fallback=0;
  for(const a of data.articles){const result=classifyArticleTopic(a);counts[result.topic]=(counts[result.topic]||0)+1;if(result.reason==='fallback')fallback++;expect(a.illustration).toEqual(artFor(a));expect(a.imageUrl).toBeUndefined();expect(a.preview).toBeUndefined();}
  expect(data.articles.length).toBe(1244);expect(data.sources.length).toBe(9);expect(fallback).toBe(375);expect(counts).toEqual({gto:122,exploit:126,postflop:140,tournament:263,preflop:139,cash:35,mental:25,general:394});
});
