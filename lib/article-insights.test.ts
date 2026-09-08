import {describe,expect,it} from 'vitest';

import {cleanArticleSummary} from './article-insights';

describe('cleanArticleSummary',()=>{
  it('removes embedded shortcode CSS while keeping the description',()=>{
    expect(cleanArticleSummary('ポーカーの基礎を解説します。 .shortcode-single-image-wrap .rollover i { background: red; }')).toBe('ポーカーの基礎を解説します。');
  });

  it('uses a fallback when the source only contains shortcode CSS',()=>{
    expect(cleanArticleSummary('.shortcode-single-image-wrap .rollover i { background: red; }','ベットサイズの考え方')).toBe('ベットサイズの考え方');
  });
});
