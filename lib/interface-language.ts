import type {Locale} from './i18n';

export const INTERFACE_LANGUAGE_KEY='potover.interface-language';
export function storedLocale(value:string|null):Locale|null{return value==='ja'||value==='en'?value:null;}
/** Use the browser's primary language only until the visitor makes a choice. */
export function browserLocale(languages:readonly string[]):Locale{return /^ja(?:-|$)/i.test(languages[0]||'')?'ja':'en';}

type Environment={read:()=>string|null;write:(locale:Locale)=>void;languages:()=>readonly string[]};
export function createInterfaceLanguageStore(environment:Environment){
  let current:Locale|undefined;
  let chosen=false;
  const listeners=new Set<()=>void>();
  function readPreference(){try{return storedLocale(environment.read());}catch{return null;}}
  function publish(locale:Locale){const previous=current;current=locale;if(previous!==locale)listeners.forEach(listener=>listener());}
  function getSnapshot(){
    if(current===undefined){const saved=readPreference();chosen=saved!==null;current=saved||browserLocale(environment.languages());}
    return current;
  }
  return {
    getSnapshot,
    subscribe(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener);};},
    select(locale:Locale){chosen=true;try{environment.write(locale);}catch{/* In-memory selection still works when storage is unavailable. */}publish(locale);},
    syncPreference(value:string|null){const saved=storedLocale(value);chosen=saved!==null;publish(saved||browserLocale(environment.languages()));},
    browserChanged(){if(!chosen)publish(browserLocale(environment.languages()));},
  };
}
