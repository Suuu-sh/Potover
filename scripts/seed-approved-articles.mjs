import {mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {exportArticles,uploadArticles} from './d1-articles.mjs';
import {publicationScope,selectApprovedDataset} from './publication-scope.mjs';

export async function seedApprovedSnapshot({apiUrl,token,publicationApproved,filePath='data/articles.json',scope=publicationScope}={}){
  if(publicationApproved!=='true')throw new Error('Initial seed requires explicit publication approval');
  if(!apiUrl)throw new Error('POTOVER_API_URL must be set explicitly');
  if(!token)throw new Error('POTOVER_INGEST_TOKEN is required for the initial seed');
  const dataset=selectApprovedDataset(JSON.parse(await readFile(filePath,'utf8')),scope);
  const directory=await mkdtemp(join(tmpdir(),'potover-approved-seed-'));
  try{
    const input=join(directory,'approved-source.json');
    await writeFile(input,JSON.stringify(dataset));
    await uploadArticles({apiUrl,token,filePath:input});
    // Verify the exact public identity set, not only a matching row count.
    return await exportArticles({apiUrl,filePath:input,outputPath:join(directory,'public.json'),mode:'public',scope});
  }finally{
    await rm(directory,{recursive:true,force:true});
  }
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  await seedApprovedSnapshot({apiUrl:process.env.POTOVER_API_URL,token:process.env.POTOVER_INGEST_TOKEN,publicationApproved:process.env.POTOVER_PUBLICATION_READY});
}
