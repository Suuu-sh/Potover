import {readFileSync} from 'node:fs';
import {expect,it} from 'vitest';

it('uses the approved public operator name and reachable disclosure contact',()=>{
  for(const path of ['app/privacy/page.tsx','app/terms/page.tsx','app/contact/page.tsx']){
    const page=readFileSync(path,'utf8');
    expect(page).toContain('Suu');
    expect(page).toContain('potover39@gmail.com');
  }
  for(const path of ['app/privacy/page.tsx','app/contact/page.tsx']){
    const page=readFileSync(path,'utf8');
    expect(page).toContain('本人の求めに応じて遅滞なく回答');
    expect(page).toContain('氏名・住所等');
  }
});

it('describes the initial title/link scope and enabled advertising without claiming source approval',()=>{
  expect(readFileSync('app/terms/page.tsx','utf8')).toContain('概要・本文抜粋・見出し・記事画像・動画サムネイルは配信しません');
  expect(readFileSync('app/privacy/page.tsx','utf8')).toContain('初回公開からGoogle AdSenseを利用');
  expect(readFileSync('docs/sources.md','utf8')).toContain('タイトル・リンク中心でも');
});
