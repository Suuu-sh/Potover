import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {createTopicArtLookup} from '../packages/publication/topic-art.mjs';
const require=createRequire(import.meta.url);const {getImageSize}=require('next/dist/server/image-optimizer.js');
export async function validateOwnedArtwork({root='.',exportDirectory}={}){
  const manifest=JSON.parse(await readFile(resolve(root,'data/owned-topic-art.json'),'utf8'));createTopicArtLookup(manifest);
  const allowed=new Set(manifest.assets.map(a=>a.src.split('/').at(-1)));
  const files=await readdir(resolve(root,'public/topic-art'));
  if(files.length!==allowed.size||files.some(f=>!allowed.has(f)))throw new Error('Unreviewed topic artwork file');
  for(const a of manifest.assets){
    const bytes=await readFile(resolve(root,'public',a.src.slice(1)));
    if(bytes.length!==a.bytes||bytes.length>100000||createHash('sha256').update(bytes).digest('hex')!==a.sha256)throw new Error('Owned artwork hash/size mismatch');
    const size=await getImageSize(bytes);if(size.width!==a.width||size.height!==a.height)throw new Error('Owned artwork dimensions mismatch');
    if(bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP'||bytes.readUInt32LE(4)+8!==bytes.length)throw new Error('Invalid artwork container');
    let at=12;while(at<bytes.length){const type=bytes.toString('ascii',at,at+4);const n=bytes.readUInt32LE(at+4);if(!['VP8 ','VP8L','VP8X','ALPH'].includes(type)||at+8+n>bytes.length)throw new Error('Artwork has metadata/animation/invalid chunk');at+=8+n+n%2;}if(at!==bytes.length)throw new Error('Invalid artwork padding');
  }
  const former=await readdir(resolve(root,'public/article-previews')).catch(e=>{if(e.code==='ENOENT')return [];throw e});
  if(former.length)throw new Error('Former third-party preview files must not be published');
  if(exportDirectory){
    const exported=await readdir(resolve(exportDirectory,'topic-art'));
    if(exported.length!==allowed.size||exported.some(f=>!allowed.has(f)))throw new Error('Missing or unexpected exported artwork');
    for(const a of manifest.assets){const bytes=await readFile(resolve(exportDirectory,a.src.slice(1)));if(createHash('sha256').update(bytes).digest('hex')!==a.sha256)throw new Error('Exported artwork differs from verified bytes');}
    const stale=await readdir(resolve(exportDirectory,'article-previews')).catch(e=>{if(e.code==='ENOENT')return [];throw e});
    if(stale.length)throw new Error('Stale third-party preview assets in export');
  }
  return {artworks:manifest.assets.length,bytes:manifest.assets.reduce((sum,a)=>sum+a.bytes,0)};
}
