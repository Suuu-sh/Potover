import {readFileSync} from 'node:fs';
import {expect,it} from 'vitest';
import {PUBLIC_SITE_URL} from './site-url';

it('uses the configured Pages release hostname for sitemap and robots',()=>{
  expect(PUBLIC_SITE_URL).toBe('https://potover.pages.dev');
  for(const file of ['app/sitemap.ts','app/robots.ts']){
    expect(readFileSync(file,'utf8')).toContain('PUBLIC_SITE_URL');
    expect(readFileSync(file,'utf8')).not.toContain('https://potover.com');
  }
});
