import {readFileSync} from 'node:fs';
import {expect,it} from 'vitest';

it('uses the approved public operator name and reachable disclosure contact',()=>{
  for(const path of ['components/pages/privacy.tsx','components/pages/terms.tsx','components/pages/contact.tsx']){
    const page=readFileSync(path,'utf8');
    expect(page).toContain('Suu');
    expect(page).toContain('potover39@gmail.com');
  }
  for(const path of ['components/pages/privacy.tsx','components/pages/contact.tsx']){
    const page=readFileSync(path,'utf8');
    expect(page).toContain('本人の求めに応じて遅滞なく回答');
    expect(page).toContain('氏名・住所等');
  }
});

it('describes reduced search previews and enabled advertising without claiming source approval',()=>{
  expect(readFileSync('components/pages/terms.tsx','utf8')).toContain('概要・本文抜粋・抽出見出しは配信しません');
  expect(readFileSync('components/pages/privacy.tsx','utf8')).toContain('初回公開からGoogle AdSenseを利用');
  expect(readFileSync('docs/sources.md','utf8')).toContain('タイトル・リンク中心でも');
});


it('states the conditional collection policy and current pause without a stale prelaunch claim',()=>{
  const privacy=readFileSync('components/pages/privacy.tsx','utf8');
  expect(privacy).toContain('自動収集を明示的に禁止する条件がなく、適用される制限を守れる場合');
  expect(privacy).toContain('明示的な禁止がないことだけを、提供元から利用許諾を得たこととは扱いません。');
  expect(privacy).toContain('自動収集は現在停止しています。');
  expect(privacy).not.toContain('本番公開・自動収集を行いません。');
});

it('describes free ad-supported image display and removal contact in both languages',()=>{
  const terms=readFileSync('components/pages/terms.tsx','utf8');
  expect(terms).toContain('無料で利用');
  expect(terms).toContain('広告');
  expect(terms).toContain('個別の許諾を得た');
  expect(terms).toContain('表示停止・削除');
  const english=JSON.parse(readFileSync('lib/translations/en-legal.json','utf8'));
  expect(Object.values(english).join(' ')).toContain('legality in every country or region');
  expect(Object.values(english).join(' ')).toContain('IP address');
});
