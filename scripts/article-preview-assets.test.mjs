import {readFile,mkdtemp,mkdir,copyFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {expect,it} from 'vitest';
import {validateArticlePreviewAssets} from './article-preview-assets.mjs';
const manifest=JSON.parse(await readFile('data/article-preview-manifest.json','utf8'));
const scope=JSON.parse(await readFile('data/publication-scope.json','utf8'));
it('verifies every delivered file, identity, byte hash and actual <=160px dimensions',async()=>{
  expect(await validateArticlePreviewAssets(manifest,scope)).toEqual({reviewed:11,enabled:11});
});
it('rejects an identity outside the approved title publication scope',async()=>{
  const m=structuredClone(manifest);m.articles[0].slug='unapproved';
  await expect(validateArticlePreviewAssets(m,scope)).rejects.toThrow('not in publication scope');
});
it('removes suppressed assets from a new production export',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'potover-preview-export-'));
  try{
    await mkdir(join(dir,'article-previews'));
    const item=manifest.articles[0];const filename=item.thumbnailPath.split('/').at(-1);
    for(const item of manifest.articles)await copyFile(`public${item.thumbnailPath}`,join(dir,'article-previews',item.thumbnailPath.split('/').at(-1)));
    const m=structuredClone(manifest);m.articles[0].enabled=false;
    expect(await validateArticlePreviewAssets(m,scope,{exportDirectory:dir})).toEqual({reviewed:11,enabled:10});
    await expect(readFile(join(dir,'article-previews',filename))).rejects.toThrow();
  }finally{await rm(dir,{recursive:true,force:true})}
});

it('rejects unexpected stale assets in the final export',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'potover-preview-stale-'));
  try{
    await mkdir(join(dir,'article-previews'));
    for(const item of manifest.articles)await copyFile(`public${item.thumbnailPath}`,join(dir,'article-previews',item.thumbnailPath.split('/').at(-1)));
    await writeFile(join(dir,'article-previews','unreviewed.jpg'),'stale full-size file');
    await expect(validateArticlePreviewAssets(manifest,scope,{exportDirectory:dir})).rejects.toThrow('Unexpected or missing exported preview');
  }finally{await rm(dir,{recursive:true,force:true})}
});

it('permits a complete takedown with all sources off and both asset directories absent',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'potover-preview-all-off-'));
  try{
    const m=structuredClone(manifest);m.sources.forEach(s=>s.enabled=false);
    expect(await validateArticlePreviewAssets(m,scope,{root:dir,exportDirectory:join(dir,'out')})).toEqual({reviewed:11,enabled:0});
    await expect(validateArticlePreviewAssets(manifest,scope,{root:dir})).rejects.toThrow();
  }finally{await rm(dir,{recursive:true,force:true})}
});
