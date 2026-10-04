import {describe,expect,it,vi} from 'vitest';
import {watchDocumentMetadata} from './document-metadata';

function documentHarness(){
  let title='記事・動画を探す — Potover';let description='日本語の説明';let callback=()=>{};
  const titleWrite=vi.fn((value:string)=>{title=value;});
  const descriptionWrite=vi.fn((_name:string,value:string)=>{description=value;});
  const observe=vi.fn();const disconnect=vi.fn();
  const target={get title(){return title;},set title(value:string){titleWrite(value);},head:{},querySelector:()=>({getAttribute:()=>description,setAttribute:descriptionWrite})} as unknown as Document;
  class Observer{constructor(listener:()=>void){callback=listener;}observe=observe;disconnect=disconnect;}
  return {target,Observer:Observer as unknown as typeof MutationObserver,notify:()=>callback(),lateHeadUpdate:(nextTitle:string,nextDescription:string)=>{title=nextTitle;description=nextDescription;},title:()=>title,description:()=>description,titleWrite,descriptionWrite,observe,disconnect};
}

describe('interface metadata after static-head hydration',()=>{
  it('reapplies the selected language after a late Next head update',()=>{
    const view=documentHarness();const stop=watchDocumentMetadata(view.target,view.Observer,{title:'Explore poker articles and videos — Potover',description:'English description'});
    expect(view.title()).toBe('Explore poker articles and videos — Potover');
    view.lateHeadUpdate('記事・動画を探す — Potover','日本語の説明');view.notify();
    expect(view.title()).toBe('Explore poker articles and videos — Potover');expect(view.description()).toBe('English description');
    const writes=view.titleWrite.mock.calls.length+view.descriptionWrite.mock.calls.length;view.notify();
    expect(view.titleWrite.mock.calls.length+view.descriptionWrite.mock.calls.length).toBe(writes);
    stop();expect(view.disconnect).toHaveBeenCalledOnce();
  });
  it('does not let a cleaned-up route overwrite a newer title',()=>{
    const view=documentHarness();const stop=watchDocumentMetadata(view.target,view.Observer,{title:'Explore — Potover',description:'English'});stop();
    view.lateHeadUpdate('Poker glossary — Potover','Glossary');view.notify();
    expect(view.title()).toBe('Poker glossary — Potover');expect(view.description()).toBe('Glossary');
  });
  it('rejects a stale-route write before passive cleanup and preserves the original article title',()=>{
    const view=documentHarness();let path='/explore';
    const stopExplore=watchDocumentMetadata(view.target,view.Observer,{title:'Explore — Potover',description:'English'},()=>path==='/explore');
    path='/articles/original';view.lateHeadUpdate('元の記事タイトル — Potover','日本語の説明');view.notify();
    expect(view.title()).toBe('元の記事タイトル — Potover');stopExplore();
    const stopArticle=watchDocumentMetadata(view.target,view.Observer,{title:'元の記事タイトル — Potover',description:'English'},()=>path==='/articles/original');
    view.lateHeadUpdate('Explore — Potover','Old description');view.notify();
    expect(view.title()).toBe('元の記事タイトル — Potover');expect(view.description()).toBe('English');stopArticle();
  });
});
