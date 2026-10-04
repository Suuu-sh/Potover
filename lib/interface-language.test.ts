import {describe,expect,it,vi} from 'vitest';
import {browserLocale,createInterfaceLanguageStore,storedLocale} from './interface-language';

describe('browser-local interface language',()=>{
  it.each([['ja','ja'],['ja-JP','ja'],['JA-jp','ja'],['en-US','en'],['fr-FR','en'],['javanese','en']])('initializes %s as %s',(language,expected)=>{
    expect(browserLocale([language])).toBe(expected);
  });
  it('uses the primary browser language, with English as the empty-list fallback',()=>{
    expect(browserLocale(['en-US','ja-JP'])).toBe('en');expect(browserLocale([])).toBe('en');
  });
  it('accepts only supported saved choices',()=>{
    expect(storedLocale('ja')).toBe('ja');expect(storedLocale('en')).toBe('en');expect(storedLocale('fr')).toBeNull();
  });
  it('keeps an explicit choice across reloads and ignores later browser-language changes',()=>{
    let saved:string|null=null;let languages=['ja-JP'];
    const environment={read:()=>saved,write:(locale:string)=>{saved=locale;},languages:()=>languages};
    const first=createInterfaceLanguageStore(environment);const listener=vi.fn();first.subscribe(listener);
    expect(first.getSnapshot()).toBe('ja');first.select('en');expect(first.getSnapshot()).toBe('en');expect(saved).toBe('en');expect(listener).toHaveBeenCalledOnce();
    languages=['ja'];first.browserChanged();expect(first.getSnapshot()).toBe('en');
    expect(createInterfaceLanguageStore(environment).getSnapshot()).toBe('en');
  });
  it('responds to another tab changing or clearing the preference',()=>{
    const store=createInterfaceLanguageStore({read:()=>null,write:()=>{},languages:()=>['en-US']});
    expect(store.getSnapshot()).toBe('en');store.syncPreference('ja');expect(store.getSnapshot()).toBe('ja');store.syncPreference(null);expect(store.getSnapshot()).toBe('en');
  });
  it('keeps the switch usable when storage is blocked',()=>{
    const store=createInterfaceLanguageStore({read:()=>{throw Error('blocked');},write:()=>{throw Error('blocked');},languages:()=>['en']});
    expect(store.getSnapshot()).toBe('en');expect(()=>store.select('ja')).not.toThrow();expect(store.getSnapshot()).toBe('ja');store.browserChanged();expect(store.getSnapshot()).toBe('ja');
  });
  it('changes with browser preference only before a manual choice and cleans up subscribers',()=>{
    let languages=['ja'];const store=createInterfaceLanguageStore({read:()=>null,write:()=>{},languages:()=>languages});const listener=vi.fn();const unsubscribe=store.subscribe(listener);
    expect(store.getSnapshot()).toBe('ja');languages=['en'];store.browserChanged();expect(store.getSnapshot()).toBe('en');expect(listener).toHaveBeenCalledOnce();unsubscribe();store.select('ja');expect(listener).toHaveBeenCalledOnce();
  });
});
