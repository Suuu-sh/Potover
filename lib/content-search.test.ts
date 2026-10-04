import {readFileSync} from 'node:fs';
import {describe,expect,it} from 'vitest';
import {CASH_GAME_FILTER,canonicalContentFilter,matchesContentTopic,normalizeContentFilters} from './content-search';

describe('canonical Cash Game filters',()=>{
  it.each(['Cash Game','cash game','cash-game','キャッシュ'])('preserves the legacy filter %s',value=>{
    expect(canonicalContentFilter(value)).toBe(CASH_GAME_FILTER);
    expect(matchesContentTopic('gto cash-game preflop',value)).toBe(true);
    expect(matchesContentTopic('mtt icm',value)).toBe(false);
  });
  it('normalizes saved/URL aliases without changing source or language filters',()=>{
    expect(normalizeContentFilters(['Cash Game','English','キャッシュ','GTO Wizard Japan','cash-game'])).toEqual(['cash-game','English','GTO Wizard Japan']);
  });
  it('gives quick, advanced and old Japanese filters the same approved-snapshot count and result set',()=>{
    const {articles}=JSON.parse(readFileSync('data/articles.public.json','utf8')) as {articles:{slug:string;title:string;source:string;classification:{tags:string[]}}[]};
    const countFor=(filter:string)=>articles.filter(article=>article.classification.tags.some(tag=>matchesContentTopic(tag,filter))).length;
    const resultsFor=(filter:string)=>articles.filter(article=>matchesContentTopic([article.title,article.source,...article.classification.tags].join(' '),filter)).map(article=>article.slug);
    expect(countFor(CASH_GAME_FILTER)).toBe(108);
    for(const alias of ['Cash Game','cash game','キャッシュ']){expect(countFor(alias)).toBe(countFor(CASH_GAME_FILTER));expect(resultsFor(alias)).toEqual(resultsFor(CASH_GAME_FILTER));}
  });
  it('uses the same canonical value for both rendered filter controls',()=>{
    const source=readFileSync('components/pages/explore.tsx','utf8');
    expect(source).toContain("[CASH_GAME_FILTER,'キャッシュ']");
    expect(source).toContain("'Exploit',CASH_GAME_FILTER,'MTT'");
    expect(source).toContain('normalizeContentFilters(user?docsFilters:[])');
  });
});
