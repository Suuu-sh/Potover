import {describe,it,expect} from 'vitest';
import {contentLabel} from './content-labels';
describe('content labels',()=>{
 it('localizes metadata without changing stored values',()=>{expect(contentLabel('Intermediate')).toBe('中級');expect(contentLabel('Japanese')).toBe('日本語')});
 it('supports lowercase tags and preserves source names',()=>{expect(contentLabel('preflop')).toBe('プリフロップ');expect(contentLabel('GTO Wizard Japan')).toBe('GTO Wizard Japan')});
});
