import {readFileSync,existsSync} from 'node:fs';
import {describe,expect,it} from 'vitest';
import {canonicalPath,englishTranslations,localeFromPath,localePath,pageMetadata,pageUrl,safeReturnPath,stripLocale,translate} from './i18n';
import {contentQueryTerms,matchesFilterSearch} from './content-search';
import {glossaryTerms} from './glossary';
import {roadmapSummaries} from './roadmap-summary';

describe('explicit interface locales',()=>{
  it('recognizes only the complete English path prefix',()=>{
    expect(localeFromPath('/en/explore/')).toBe('en');expect(localeFromPath('/english')).toBe('ja');
    expect(stripLocale('/en')).toBe('/');expect(stripLocale('/en/explore/')).toBe('/explore/');
  });
  it('preserves query, filters and fragment when switching locales',()=>{
    const original='/explore?filters=English,Preflop&q=3-bet#topics';const english=localePath(original,'en');
    expect(english.startsWith('/en/explore?')).toBe(true);const parsed=new URL(english,'https://potover.pages.dev');
    expect(parsed.searchParams.get('filters')).toBe('English,Preflop');expect(parsed.searchParams.get('q')).toBe('3-bet');expect(parsed.hash).toBe('#topics');
    expect(localePath(english,'ja')).toBe(localePath(original,'ja'));expect(localePath(english,'en')).toBe(english);
  });
  it('keeps the intended page and locale through sign-in',()=>{
    const path=localePath('/login?next='+encodeURIComponent('/roadmap#cash')+'&reason=bookmark','en');
    const parsed=new URL(path,'https://potover.pages.dev');expect(parsed.pathname).toBe('/en/login');expect(parsed.searchParams.get('next')).toBe('/en/roadmap#cash');
    expect(parsed.searchParams.get('reason')).toBe('bookmark');expect(safeReturnPath('/explore?q=ICM','en')).toBe('/en/explore?q=ICM');
  });
  it.each([null,'https://example.com','//example.com','/\\example.com','/\n/evil','/%2f%2fevil','/%5cevil','/%0a/evil','/%'])('rejects unsafe login return target %s',value=>{
    expect(safeReturnPath(value,'en')).toBe('/en/profile');
  });
  it.each(['/en//example.com/path','/a/..//example.com/path','/en/..//example.com/path','/en/%2fexample.com/path','/a/%2e%2e//example.com/path','/en/a/..//example.com/path'])('rejects a normalized or localized protocol-relative return target %s',value=>{
    for(const locale of ['ja','en'] as const){
      const result=safeReturnPath(value,locale);
      expect(result).toBe(locale==='en'?'/en/profile':'/profile');
      expect(result.startsWith('//')).toBe(false);
      expect(new URL(result,'https://potover.pages.dev').origin).toBe('https://potover.pages.dev');
      expect(new URL(localePath(result,locale),'https://potover.pages.dev').origin).toBe('https://potover.pages.dev');
    }
  });
  it('never manufactures a protocol-relative link while localizing an internal URL',()=>{
    for(const value of ['/en//example.com/path','/a/..//example.com/path','/en/%2fexample.com/path','/en/a/..//example.com/path'])for(const locale of ['ja','en'] as const){
      const result=localePath(value,locale);
      expect(result.startsWith('//')).toBe(false);
      expect(new URL(result,'https://potover.pages.dev').origin).toBe('https://potover.pages.dev');
    }
  });
  it('preserves legitimate normalized local return paths and their query/fragment',()=>{
    expect(safeReturnPath('/articles/../explore?q=ICM&filters=English#topics','ja')).toBe('/explore?q=ICM&filters=English#topics');
    expect(safeReturnPath('/en/explore?q=ICM&filters=English#topics','ja')).toBe('/explore?q=ICM&filters=English#topics');
    expect(safeReturnPath('/articles/../explore?q=ICM&filters=English#topics','en')).toBe('/en/explore?q=ICM&filters=English#topics');
  });
  it('bounds work on nested sign-in return queries',()=>{let destination='/profile';for(let index=0;index<80;index++)destination='/login?next='+encodeURIComponent(destination);expect(()=>localePath(destination,'en')).not.toThrow();});
  it('does not prefix source links, assets, APIs, anchors, or emails',()=>{
    for(const path of ['https://blog.gtowizard.com/example','//example.com','/brand/icon.png','/api/auth/login','#beginner','mailto:potover39@gmail.com'])expect(localePath(path,'en')).toBe(path);
  });
  it('keeps Japanese UI text unchanged and translates only known UI copy',()=>{
    expect(translate('ホーム','ja')).toBe('ホーム');expect(translate('ホーム','en')).toBe('Home');expect(translate(1244,'en')).toBe(1244);
    expect(translate('Original third-party article title','en')).toBe('Original third-party article title');
    expect(translate('  ホーム ','en')).toBe('  Home ');expect(translate('1,244本の記事・動画から','en')).toBe('From 1,244 articles and videos');
  });
  it('translates critical account and error states',()=>{
    for(const copy of ['メールアドレスまたはパスワードが違います。','操作が多すぎます。しばらく後に再試行してください。','アカウントと保存したブックマーク・学習履歴・フォロー・設定を削除します。続けますか？'])expect(translate(copy,'en')).not.toMatch(/[\u3040-\u30ff\u3400-\u9fff]/);
  });
});

describe('localized SEO and route coverage',()=>{
  it('has reciprocal canonicals, hreflang and x-default',()=>{
    for(const locale of ['ja','en'] as const){const metadata=pageMetadata('/sources',locale);expect(metadata.alternates?.canonical).toBe(pageUrl('/sources',locale));expect(metadata.alternates?.languages).toEqual({ja:'https://potover.pages.dev/sources/',en:'https://potover.pages.dev/en/sources/','x-default':'https://potover.pages.dev/sources/'});}
  });
  it('canonicalizes old home/docs aliases without redirecting Japanese users',()=>{
    expect(canonicalPath('/home/')).toBe('/');expect(pageUrl('/docs','en')).toBe('https://potover.pages.dev/en/explore/');
  });
  it('keeps original titles in article metadata',()=>{
    expect(pageMetadata('/articles/example','en','元の記事タイトル').title).toBe('元の記事タイトル — Potover');
  });
  it('exports equivalent routes in both locales',()=>{
    for(const route of ['','home/','docs/','explore/','articles/','articles/[slug]/','sources/','glossary/','roadmap/','bookmarks/','profile/','login/','terms/','privacy/','contact/']){
      expect(existsSync(`app/(ja)/${route}page.tsx`)).toBe(true);expect(existsSync(`app/(english)/en/${route}page.tsx`)).toBe(true);
    }
    expect(readFileSync('app/(english)/en/layout.tsx','utf8')).toContain('locale="en"');expect(readFileSync('app/(ja)/layout.tsx','utf8')).toContain('locale="ja"');
  });
});

describe('English discovery and owned learning content',()=>{
  it('retains the same topic search semantics in both languages',()=>{
    expect(contentQueryTerms('Postflop')).toEqual(contentQueryTerms('ポストフロップ'));expect(contentQueryTerms('Mindset and decisions')).toEqual(contentQueryTerms('メンタル・思考'));
    expect(contentQueryTerms(' AKs ')).toEqual(['aks']);expect(matchesFilterSearch('動画','video','en')).toBe(true);expect(matchesFilterSearch('学習済み','complete','en')).toBe(true);
  });
  it('covers glossary definitions and roadmap labels without replacing the Japanese originals',()=>{
    for(const term of glossaryTerms)for(const copy of [term.term,term.reading,term.category,term.definition,...term.relatedTags])if(/[\u3040-\u30ff\u3400-\u9fff]/.test(copy))expect(englishTranslations[copy]).toBeTruthy();
    for(const course of roadmapSummaries)for(const copy of [course.title,course.description,course.navDescription])expect(englishTranslations[copy]).toBeTruthy();
    expect(glossaryTerms[0].term).toBe('エクイティ');
  });
  it('distinguishes preferred content language from the interface route',()=>{
    expect(translate('コンテンツの表示言語','en')).toBe('Preferred content language');
    const preference=readFileSync('lib/use-preferred-language.ts','utf8');expect(preference).toContain("!user&&locale==='en'?'English':language");
  });
});
