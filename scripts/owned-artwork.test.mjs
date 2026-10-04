import {readFile,writeFile,mkdtemp,mkdir,copyFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {expect,it} from 'vitest';
import {validateOwnedArtwork} from './owned-artwork.mjs';
const manifest=JSON.parse(await readFile('data/owned-topic-art.json','utf8'));
it('verifies all generated artwork hashes, actual dimensions and metadata-free WebP bytes',async()=>{
  expect(await validateOwnedArtwork()).toEqual({artworks:8,bytes:364128});
});
it('verifies the exported asset set and rejects stale source-image bytes',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'potover-owned-export-'));
  try{
    await mkdir(join(dir,'topic-art'));
    for(const a of manifest.assets)await copyFile(`public${a.src}`,join(dir,a.src.slice(1)));
    expect((await validateOwnedArtwork({exportDirectory:dir})).artworks).toBe(8);
    await mkdir(join(dir,'article-previews'));await writeFile(join(dir,'article-previews','stale.webp'),'old source image');
    await expect(validateOwnedArtwork({exportDirectory:dir})).rejects.toThrow('Stale third-party');
  }finally{await rm(dir,{recursive:true,force:true})}
});
it('rejects mismatched bytes in an otherwise correctly named export',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'potover-owned-mismatch-'));
  try{
    await mkdir(join(dir,'topic-art'));
    for(const a of manifest.assets)await copyFile(`public${a.src}`,join(dir,a.src.slice(1)));
    await writeFile(join(dir,'topic-art/general.webp'),'unreviewed');
    await expect(validateOwnedArtwork({exportDirectory:dir})).rejects.toThrow('differs from verified');
  }finally{await rm(dir,{recursive:true,force:true})}
});
