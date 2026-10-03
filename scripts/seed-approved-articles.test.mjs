import {mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {afterEach,expect,it,vi} from 'vitest';
import {seedApprovedSnapshot} from './seed-approved-articles.mjs';

let directory;
afterEach(async()=>{vi.unstubAllGlobals();if(directory)await rm(directory,{recursive:true,force:true});directory=undefined});
const source={slug:'approved',name:'Approved',url:'https://example.test',language:'English'};
const approved={source:'Approved',sourceSlug:'approved',title:'Approved title',originalUrl:'https://example.test/approved',summary:'Stored original summary',classification:{difficulty:'beginner',tags:[]}};
const scope={version:'test',sources:['approved'],articles:[{slug:'approved-title-2',originalUrl:approved.originalUrl,sourceSlug:'approved'}]};
const original={sources:[{slug:'excluded',name:'Excluded'},source],articles:[{sourceSlug:'excluded',title:'Excluded title',originalUrl:'https://example.test/excluded'},approved]};

it.each([undefined,'false','TRUE'])('requires explicit publication approval before any request: %j',async approval=>{
  const fetch=vi.fn();vi.stubGlobal('fetch',fetch);
  await expect(seedApprovedSnapshot({apiUrl:'https://api.example.test',token:'local-test-only',publicationApproved:approval,scope})).rejects.toThrow('explicit publication approval');
  expect(fetch).not.toHaveBeenCalled();
});

it('seeds only the approved snapshot once, preserves original data and verifies the public set without a token',async()=>{
  directory=await mkdtemp(join(tmpdir(),'potover-seed-test-'));
  const filePath=join(directory,'articles.json');
  const contents=JSON.stringify(original);await writeFile(filePath,contents);
  const uploads=[];
  vi.stubGlobal('fetch',vi.fn(async(url,options)=>{
    const parsed=new URL(url);
    expect(parsed.origin).toBe('https://api.example.test');
    if(options.method==='POST'){
      expect(options.headers.Authorization).toBe('Bearer local-test-only');
      const payload=JSON.parse(options.body);uploads.push(payload);
      return Response.json({ok:true,count:payload.articles.length});
    }
    expect(options.headers).toBeUndefined();
    if(parsed.pathname==='/api/sources')return Response.json({sources:[source]});
    return Response.json({total:1,articles:uploads.flatMap(payload=>payload.articles)});
  }));
  expect(await seedApprovedSnapshot({apiUrl:'https://api.example.test',token:'local-test-only',publicationApproved:'true',filePath,scope})).toEqual({articles:1,sources:1});
  expect(uploads).toHaveLength(1);
  expect(uploads[0].sources).toEqual([source]);
  expect(uploads[0].articles).toHaveLength(1);
  expect(uploads[0].articles[0]).toMatchObject({...approved,slug:'approved-title-2'});
  expect(await readFile(filePath,'utf8')).toBe(contents);
});

it('does not seed if an approved article is missing from the preserved input',async()=>{
  directory=await mkdtemp(join(tmpdir(),'potover-seed-test-'));
  const filePath=join(directory,'articles.json');await writeFile(filePath,JSON.stringify({...original,articles:[]}));
  const fetch=vi.fn();vi.stubGlobal('fetch',fetch);
  await expect(seedApprovedSnapshot({apiUrl:'https://api.example.test',token:'local-test-only',publicationApproved:'true',filePath,scope})).rejects.toThrow();
  expect(fetch).not.toHaveBeenCalled();
});

it('keeps one-time seeding separate from collection and disabled for ordinary deploys',async()=>{
  const workflow=await readFile('.github/workflows/deploy.yml','utf8');
  expect(workflow).toContain('seed_approved_snapshot:');
  expect(workflow).toMatch(/seed_approved_snapshot:[\s\S]*?default: false/);
  expect(workflow).toContain("github.event_name == 'workflow_dispatch' && inputs.seed_approved_snapshot");
  expect(workflow).toContain("github.ref == 'refs/heads/main'");
  expect(workflow).not.toContain('POTOVER_COLLECTION_APPROVED');
  expect(workflow).not.toContain('git push');
  expect(workflow).not.toContain('POTOVER_ACCOUNT_RETENTION_ENABLED');
});
