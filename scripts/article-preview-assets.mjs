import {readFile,readdir,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {createArticlePreviewLookup} from '../packages/publication/article-previews.mjs';
// Use Next's image decoder, already installed and pinned by package-lock.json.
const require=createRequire(import.meta.url);
const {getImageSize}=require('next/dist/server/image-optimizer.js');
export async function validateArticlePreviewAssets(manifest,scope,{root='.',exportDirectory}={}){
  const lookup=createArticlePreviewLookup(manifest);
  const identities=new Set(scope.articles.map(a=>JSON.stringify([a.slug,a.sourceSlug,a.originalUrl])));
  const expected=new Set();const disabled=[];const enabledFiles=new Map();
  for(const item of manifest.articles){
    if(!identities.has(JSON.stringify([item.slug,item.sourceSlug,item.originalUrl])))throw new Error(`Preview not in publication scope: ${item.slug}`);
    const file=item.thumbnailPath.split('/').at(-1);expected.add(file);
    const active=Boolean(lookup({...item,contentType:'article'}));
    if(!active)disabled.push(file);
    let bytes;
    try{bytes=await readFile(resolve(root,'public',item.thumbnailPath.slice(1)))}catch(error){if(!active&&error.code==='ENOENT')continue;throw error}
    const digest=createHash('sha256').update(bytes).digest('hex');
    if(file!==`${digest}.webp`||bytes.length>25000)throw new Error(`Invalid preview bytes: ${item.slug}`);
    if(bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP'||bytes.readUInt32LE(4)+8!==bytes.length)throw new Error(`Invalid WebP container: ${item.slug}`);
    let offset=12;
    while(offset<bytes.length){
      if(offset+8>bytes.length)throw new Error('Invalid WebP chunk');
      const type=bytes.toString('ascii',offset,offset+4);const length=bytes.readUInt32LE(offset+4);
      if(!['VP8 ','VP8L','VP8X','ALPH'].includes(type)||offset+8+length>bytes.length)throw new Error('Preview metadata/animation or invalid chunk');
      offset+=8+length+(length%2);
    }
    if(offset!==bytes.length)throw new Error('Invalid WebP padding');
    const {width,height}=await getImageSize(bytes);
    if(width!==item.width||height!==item.height||Math.max(width,height)>160)throw new Error(`Invalid preview dimensions: ${item.slug}`);
    if(active)enabledFiles.set(file,digest);
  }
  const readAssetDirectory=async directory=>{try{return await readdir(directory)}catch(error){if(error.code==='ENOENT'&&enabledFiles.size===0)return [];throw error}};
  const actual=await readAssetDirectory(resolve(root,'public/article-previews'));
  if(actual.some(file=>!expected.has(file)))throw new Error('Unreviewed public preview file');
  // Suppressed files are omitted from NEW exports, not just hidden in UI/JSON.
  if(exportDirectory){
    for(const file of disabled)await rm(resolve(exportDirectory,'article-previews',file),{force:true});
    const files=await readAssetDirectory(resolve(exportDirectory,'article-previews'));
    if(files.length!==enabledFiles.size||files.some(file=>!enabledFiles.has(file)))throw new Error('Unexpected or missing exported preview');
    for(const file of files){
      const bytes=await readFile(resolve(exportDirectory,'article-previews',file));
      if(createHash('sha256').update(bytes).digest('hex')!==enabledFiles.get(file))throw new Error('Exported preview differs from reviewed bytes');
    }
  }
  return {reviewed:expected.size,enabled:expected.size-disabled.length};
}
