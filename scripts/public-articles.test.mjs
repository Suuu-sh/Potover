import {mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {afterEach,expect,it} from 'vitest';
import {preparePublicArticles,projectPublicArticles} from './public-articles.mjs';
import {assertPublicScope,publicationScope} from './publication-scope.mjs';

let directory;
afterEach(async()=>{if(directory)await rm(directory,{recursive:true,force:true});directory=undefined});
const dataset={
  collectedAt:'2026-10-03T00:00:00Z',secretMetadata:'PRIVATE_SENTINEL',
  sources:[{slug:'test',name:'Test',url:'https://example.test',language:'English',logo:'PRIVATE_SENTINEL'}],
  articles:[{source:'Test',sourceSlug:'test',sourceUrl:'https://example.test',title:'Public title',originalUrl:'https://example.test/article',language:'English',publishedAt:'2026-10-01',contentType:'video',classification:{difficulty:'beginner',tags:['gto'],private:'PRIVATE_SENTINEL'},summary:'PRIVATE_SENTINEL',headings:[{text:'PRIVATE_SENTINEL'}],imageUrl:'https://example.test/PRIVATE_SENTINEL.jpg',author:'PRIVATE_SENTINEL',durationSeconds:500,unknown:'PRIVATE_SENTINEL'}],
};
const scope={version:'test',sources:['test'],articles:[{slug:'public-title-19',sourceSlug:'test',originalUrl:'https://example.test/article'}]};

it('allows only public link metadata and never mutates source data',()=>{
  const original=JSON.stringify(dataset);
  const result=projectPublicArticles(dataset,{scope});
  expect(JSON.stringify(result)).not.toContain('PRIVATE_SENTINEL');
  expect(Object.keys(result.articles[0]).sort()).toEqual(['classification','contentType','language','originalUrl','publishedAt','slug','source','sourceSlug','sourceUrl','title'].sort());
  expect(result.articles[0]).toMatchObject({title:'Public title',originalUrl:'https://example.test/article',slug:'public-title-19'});
  expect(JSON.stringify(dataset)).toBe(original);
});

it('preserves existing public slugs across projection and projects an existing public snapshot safely',()=>{
  const input=structuredClone(dataset);input.articles[0].slug='public-title-19';
  const projected=projectPublicArticles(input,{scope});
  expect(projectPublicArticles(projected,{scope})).toEqual(projected);
  expect(projected.articles[0].slug).toBe('public-title-19');
});

it('writes a separate sanitized file without replacing the original collection',async()=>{
  directory=await mkdtemp(join(tmpdir(),'potover-public-'));
  const inputPath=join(directory,'source.json');const outputPath=join(directory,'public.json');
  const contents=JSON.stringify(dataset);await writeFile(inputPath,contents);
  await preparePublicArticles({inputPath,outputPath,scope});
  expect(await readFile(inputPath,'utf8')).toBe(contents);
  expect(await readFile(outputPath,'utf8')).not.toContain('PRIVATE_SENTINEL');
  await expect(preparePublicArticles({inputPath,outputPath:'data/articles.json'})).rejects.toThrow('must not overwrite');
});

it('filters unapproved titles, URLs, and sources before projecting fields',()=>{
  const input=structuredClone(dataset);
  input.sources.push({slug:'excluded',name:'EXCLUDED_SOURCE',url:'https://excluded.test'});
  input.articles.unshift({slug:'excluded-1',sourceSlug:'excluded',title:'EXCLUDED_TITLE',originalUrl:'https://excluded.test/EXCLUDED_URL'});
  input.articles.push({sourceSlug:'test',title:'UNAPPROVED_TITLE',originalUrl:'https://example.test/UNAPPROVED_URL'});
  const projected=projectPublicArticles(input,{scope});
  expect(JSON.stringify(projected)).not.toMatch(/EXCLUDED|UNAPPROVED/);
  expect(projected.sources).toEqual([{slug:'test',name:'Test',url:'https://example.test',language:'English'}]);
  expect(projected.articles.map(article=>article.slug)).toEqual(['public-title-19']);
  expect(()=>assertPublicScope(projected.articles,projected.sources,scope)).not.toThrow();
});

it('uses the fixed production manifest unless a synthetic scope is explicitly supplied',()=>{
  expect(()=>projectPublicArticles(dataset)).toThrow('missing approved source');
});

it('fails before replacing a public file when an approved identity is missing',async()=>{
  directory=await mkdtemp(join(tmpdir(),'potover-public-'));
  const inputPath=join(directory,'source.json');const outputPath=join(directory,'public.json');
  await writeFile(inputPath,JSON.stringify({...dataset,articles:[]}));
  await writeFile(outputPath,'previous-valid-snapshot');
  await expect(preparePublicArticles({inputPath,outputPath,scope})).rejects.toThrow('missing approved article');
  expect(await readFile(outputPath,'utf8')).toBe('previous-valid-snapshot');
});

it('projects exactly 1,244 original identities from 9 sources with unchanged legacy slugs',async()=>{
  const original=JSON.parse(await readFile('data/articles.json','utf8'));
  const before=JSON.stringify(original);
  const projected=projectPublicArticles(original);
  const slugify=value=>value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80);
  const legacyByUrl=new Map(original.articles.map((article,index)=>[article.originalUrl,article.slug||`${slugify(article.title)||'gtowizard-content'}-${index+1}`]));
  expect(original.articles).toHaveLength(1406);
  expect(projected.articles).toHaveLength(1244);
  expect(projected.sources).toHaveLength(9);
  expect(projected.sources.map(source=>source.slug)).toEqual(publicationScope.sources);
  expect(projected.sources).toEqual(original.sources.filter(source=>publicationScope.sources.includes(source.slug)));
  for(const article of projected.articles)expect(article.slug).toBe(legacyByUrl.get(article.originalUrl));
  const excluded=original.articles.filter(article=>['pokernews','m-portal'].includes(article.sourceSlug));
  const publicTitles=new Set(projected.articles.map(article=>article.title));
  const publicUrls=new Set(projected.articles.map(article=>article.originalUrl));
  expect(excluded).toHaveLength(162);
  for(const article of excluded){
    expect(publicTitles.has(article.title)).toBe(false);
    expect(publicUrls.has(article.originalUrl)).toBe(false);
  }
  expect(JSON.stringify(projected)).not.toMatch(/pokernews\.com|mpj-portal\.jp/);
  expect(()=>assertPublicScope(projected.articles,projected.sources)).not.toThrow();
  expect(JSON.stringify(original)).toBe(before);
  expect(projectPublicArticles({...original,articles:[...original.articles].reverse()})).toEqual(projected);
  expect(projectPublicArticles(projected)).toEqual(projected);
});

it('loads only the generated public projection into the application',async()=>{
  const source=await readFile('lib/data.ts','utf8');
  expect(source).toContain("from '@/data/articles.public.json'");
  expect(source).not.toContain("from '@/data/articles.json'");
  expect(source).not.toMatch(/summary|headings|durationSeconds|buildFallbackHeadings/);
});

it('projects exactly the reviewed local previews and ignores injected raw image fields',async()=>{
  const raw=JSON.parse(await readFile('data/articles.json','utf8'));
  const m=JSON.parse(await readFile('data/article-preview-manifest.json','utf8'));
  const projected=projectPublicArticles(raw);
  expect(projected.articles.filter(a=>a.preview)).toHaveLength(11);
  for(const item of m.articles){
    const article=projected.articles.find(a=>a.slug===item.slug);
    expect(article.preview).toMatchObject({src:item.thumbnailPath,width:item.width,height:item.height});
    expect(JSON.stringify(article.preview)).not.toContain(item.originalImageUrl);
  }
  expect(projectPublicArticles(projected)).toEqual(projected);
  const off=structuredClone(m);off.sources.forEach(s=>s.enabled=false);
  expect(projectPublicArticles(raw,{previews:off}).articles.some(a=>a.preview)).toBe(false);
});

it('restores only pinned safe cover URLs, never arbitrary injected raw images',async()=>{
  const raw=JSON.parse(await readFile('data/articles.json','utf8'));
  const first=raw.articles[0];const expected=first.imageUrl;first.imageUrl='https://evil.test/new.jpg';
  const projected=projectPublicArticles(raw);
  expect(projected.articles[0].imageUrl).toBe(expected);
  expect(projected.articles.filter(a=>a.imageUrl)).toHaveLength(1243);
  expect(JSON.stringify(projected)).not.toContain('evil.test');
  expect(projected.articles.every(a=>!('summary'in a)&&!('headings'in a))).toBe(true);
});
