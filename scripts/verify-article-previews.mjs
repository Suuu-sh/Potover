import {readFile} from 'node:fs/promises';
import {validateArticlePreviewAssets} from './article-preview-assets.mjs';
const manifest=JSON.parse(await readFile('data/article-preview-manifest.json','utf8'));
const scope=JSON.parse(await readFile('data/publication-scope.json','utf8'));
const result=await validateArticlePreviewAssets(manifest,scope,{exportDirectory:process.argv.includes('--export')?'out':undefined});
console.log(`Verified ${result.enabled}/${result.reviewed} bounded article previews (max 160px).`);
