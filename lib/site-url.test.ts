import {readFileSync} from 'node:fs';
import {transformSync} from 'esbuild';
import {expect,it} from 'vitest';
import {PUBLIC_SITE_URL} from './site-url';
import {pageUrl} from './i18n';

it('uses the configured Pages release hostname for sitemap and robots',()=>{
  expect(PUBLIC_SITE_URL).toBe('https://potover.pages.dev');
  expect(readFileSync('app/robots.ts','utf8')).toContain('PUBLIC_SITE_URL');
  const code=transformSync(readFileSync('app/sitemap.ts','utf8'),{loader:'ts',format:'cjs'}).code;
  const compiled={exports:{} as {default:()=>{url:string;alternates?:unknown}[]}};
  new Function('require','module',code)((name:string)=>{
    if(name==='@/lib/i18n')return {pageUrl};
    if(name==='@/lib/data')return {articles:[{slug:'original-article'}]};
    throw Error('Unexpected sitemap dependency: '+name);
  },compiled);
  const entries=compiled.exports.default();
  expect(entries).toHaveLength(10);
  expect(new Set(entries.map(entry=>entry.url)).size).toBe(entries.length);
  expect(entries.map(entry=>entry.url)).toContain(`${PUBLIC_SITE_URL}/articles/original-article/`);
  for(const entry of entries){expect(new URL(entry.url).origin).toBe(PUBLIC_SITE_URL);expect(entry.url).not.toContain('/en/');expect(entry.alternates).toBeUndefined();}
});
