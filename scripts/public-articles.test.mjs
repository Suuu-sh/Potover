import {mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {afterEach,expect,it} from 'vitest';
import {preparePublicArticles,projectPublicArticles} from './public-articles.mjs';

let directory;
afterEach(async()=>{if(directory)await rm(directory,{recursive:true,force:true});directory=undefined});
const dataset={
  collectedAt:'2026-10-03T00:00:00Z',secretMetadata:'PRIVATE_SENTINEL',
  sources:[{slug:'test',name:'Test',url:'https://example.test',language:'English',logo:'PRIVATE_SENTINEL'}],
  articles:[{source:'Test',sourceSlug:'test',sourceUrl:'https://example.test',title:'Public title',originalUrl:'https://example.test/article',language:'English',publishedAt:'2026-10-01',contentType:'video',classification:{difficulty:'beginner',tags:['gto'],private:'PRIVATE_SENTINEL'},summary:'PRIVATE_SENTINEL',headings:[{text:'PRIVATE_SENTINEL'}],imageUrl:'https://example.test/PRIVATE_SENTINEL.jpg',author:'PRIVATE_SENTINEL',durationSeconds:500,unknown:'PRIVATE_SENTINEL'}],
};

it('allows only public link metadata and never mutates source data',()=>{
  const original=JSON.stringify(dataset);
  const result=projectPublicArticles(dataset);
  expect(JSON.stringify(result)).not.toContain('PRIVATE_SENTINEL');
  expect(Object.keys(result.articles[0]).sort()).toEqual(['classification','contentType','language','originalUrl','publishedAt','slug','source','sourceSlug','sourceUrl','title'].sort());
  expect(result.articles[0]).toMatchObject({title:'Public title',originalUrl:'https://example.test/article',slug:'public-title-1'});
  expect(JSON.stringify(dataset)).toBe(original);
});

it('preserves existing public slugs across projection and projects an existing public snapshot safely',()=>{
  const input=structuredClone(dataset);input.articles[0].slug='stable-public-link';
  const projected=projectPublicArticles(input);
  expect(projectPublicArticles(projected)).toEqual(projected);
  expect(projected.articles[0].slug).toBe('stable-public-link');
});

it('writes a separate sanitized file without replacing the original collection',async()=>{
  directory=await mkdtemp(join(tmpdir(),'potover-public-'));
  const inputPath=join(directory,'source.json');const outputPath=join(directory,'public.json');
  const contents=JSON.stringify(dataset);await writeFile(inputPath,contents);
  await preparePublicArticles({inputPath,outputPath});
  expect(await readFile(inputPath,'utf8')).toBe(contents);
  expect(await readFile(outputPath,'utf8')).not.toContain('PRIVATE_SENTINEL');
  await expect(preparePublicArticles({inputPath,outputPath:'data/articles.json'})).rejects.toThrow('must not overwrite');
});

it('loads only the generated public projection into the application',async()=>{
  const source=await readFile('lib/data.ts','utf8');
  expect(source).toContain("from '@/data/articles.public.json'");
  expect(source).not.toContain("from '@/data/articles.json'");
  expect(source).not.toMatch(/summary|headings|imageUrl|durationSeconds|buildFallbackHeadings/);
});
