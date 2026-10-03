import {expect,it} from 'vitest';
import {assertPublicScope,selectApprovedDataset} from './publication-scope.mjs';

const scope={version:'test',sources:['first','second'],articles:[
  {slug:'first-title-14',originalUrl:'https://first.test/article',sourceSlug:'first'},
  {slug:'second-title-29',originalUrl:'https://second.test/article',sourceSlug:'second'},
]};
const fixture=()=>({
  collectedAt:'2026-10-03',privateMetadata:{note:'preserved internally'},
  sources:[{slug:'excluded',name:'Excluded'},{slug:'second',name:'Second',private:{logo:'second.png'}},{slug:'first',name:'First',url:'https://first.test',language:'English'}],
  articles:[
    {title:'Excluded title',sourceSlug:'excluded',originalUrl:'https://excluded.test/article'},
    {title:'First title',sourceSlug:'first',originalUrl:'https://first.test/article',summary:'Private summary',headings:[{text:'Private heading'}],classification:{tags:['gto']}},
    {title:'Not yet approved',sourceSlug:'first',originalUrl:'https://first.test/future'},
    {title:'Second title',sourceSlug:'second',originalUrl:'https://second.test/article',author:'Private author'},
  ],
});
const publicFixture=()=>({sources:scope.sources.map(slug=>({slug})),articles:structuredClone(scope.articles)});

it('selects approved identities in manifest order, pins global slugs, and deep-copies full rows',()=>{
  const input=fixture();const before=structuredClone(input);
  const result=selectApprovedDataset(input,scope);
  expect(result.articles).toEqual([{...input.articles[1],slug:'first-title-14'},{...input.articles[3],slug:'second-title-29'}]);
  expect(result.sources).toEqual([input.sources[2],input.sources[1]]);
  expect(result.privateMetadata).toEqual(input.privateMetadata);
  expect(input).toEqual(before);
  result.articles[0].headings[0].text='changed';
  result.articles[0].classification.tags.push('changed');
  result.sources[1].private.logo='changed';
  result.privateMetadata.note='changed';
  expect(input).toEqual(before);
});

it('ignores rows outside the manifest even when they belong to an approved source',()=>{
  const input=fixture();input.articles.push({...input.articles[2]});input.sources.push({slug:'excluded'});
  expect(selectApprovedDataset(input,scope).articles).toHaveLength(2);
});

it.each([
  ['missing approved article',input=>input.articles.splice(1,1)],
  ['missing approved source',input=>input.sources.splice(2,1)],
  ['duplicate approved URL',input=>input.articles.push({...input.articles[1]})],
  ['duplicate source',input=>input.sources.push({...input.sources[2]})],
  ['source mismatch',input=>{input.articles[1].sourceSlug='second'}],
  ['source mismatch',input=>{delete input.articles[1].sourceSlug}],
  ['slug mismatch',input=>{input.articles[1].slug='first-title-1'}],
  ['URL mismatch',input=>{input.articles[1].slug='first-title-14';input.articles[1].originalUrl='https://first.test/changed'}],
])('selection rejects %s instead of silently changing release identity', (message,mutate)=>{
  const input=fixture();mutate(input);
  expect(()=>selectApprovedDataset(input,scope)).toThrow(message);
});

it('accepts exact public identities independent of their ordering',()=>{
  const input=publicFixture();
  expect(()=>assertPublicScope(input.articles.reverse(),input.sources.reverse(),scope)).not.toThrow();
});

it.each([
  ['missing approved article',input=>input.articles.pop()],
  ['unexpected article URL',input=>input.articles.push({slug:'extra',sourceSlug:'first',originalUrl:'https://first.test/extra'})],
  ['unexpected article URL',input=>{input.articles[1]={slug:'extra',sourceSlug:'first',originalUrl:'https://first.test/extra'}}],
  ['duplicate article URL',input=>{input.articles[1]={...input.articles[0]}}],
  ['duplicate article slug',input=>{input.articles[1].slug=input.articles[0].slug}],
  ['slug mismatch',input=>{input.articles[1].slug='second-title-2'}],
  ['source mismatch',input=>{input.articles[1].sourceSlug='first'}],
  ['missing approved source',input=>input.sources.pop()],
  ['unexpected source',input=>input.sources.push({slug:'extra'})],
  ['unexpected source',input=>{input.sources[1]={slug:'extra'}}],
  ['duplicate source',input=>{input.sources[1]={...input.sources[0]}}],
])('assertion rejects %s, including same-count replacements', (message,mutate)=>{
  const input=publicFixture();mutate(input);
  expect(()=>assertPublicScope(input.articles,input.sources,scope)).toThrow(message);
});

it.each([
  ['duplicate manifest source',manifest=>manifest.sources.push('first')],
  ['duplicate manifest URL',manifest=>manifest.articles.push({...manifest.articles[0],slug:'different'})],
  ['duplicate manifest slug',manifest=>{manifest.articles[1].slug=manifest.articles[0].slug}],
  ['unapproved source',manifest=>{manifest.articles[0].sourceSlug='excluded'}],
  ['invalid manifest article identity',manifest=>{delete manifest.articles[0].originalUrl}],
])('both helpers reject %s', (message,mutate)=>{
  const manifest=structuredClone(scope);mutate(manifest);
  expect(()=>selectApprovedDataset(fixture(),manifest)).toThrow(message);
  const input=publicFixture();
  expect(()=>assertPublicScope(input.articles,input.sources,manifest)).toThrow(message);
});
