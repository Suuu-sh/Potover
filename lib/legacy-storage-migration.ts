'use client';

import {userRequest} from './user-api';

const BOOKMARKS_KEY='potover-bookmarks';
const LEARNING_HISTORY_KEY='potover-learning-history';
const LANGUAGE_KEY='potover-language';
const THEME_KEY='potover-theme';
const FILTERS_KEY='potover-docs-filters';

function readJson<T>(key:string):T|null{
  const raw=localStorage.getItem(key);
  if(raw===null)return null;
  try{return JSON.parse(raw) as T}catch{return null}
}

export async function migrateLegacyStorage(){
  const bookmarks=readJson<unknown>(BOOKMARKS_KEY);
  if(bookmarks!==null){
    try{
      if(Array.isArray(bookmarks))for(const slug of bookmarks){if(typeof slug==='string')await userRequest('/api/bookmarks',{method:'POST',body:JSON.stringify({slug,saved:true})})}
      localStorage.removeItem(BOOKMARKS_KEY);
    }catch{}
  }

  const history=readJson<unknown>(LEARNING_HISTORY_KEY);
  if(history!==null){
    try{
      if(Array.isArray(history))for(const event of history){if(event&&typeof event==='object'&&typeof (event as {slug?:unknown}).slug==='string')await userRequest('/api/learning-history',{method:'POST',body:JSON.stringify({slug:(event as {slug:string}).slug,openedAt:(event as {openedAt?:unknown}).openedAt})})}
      localStorage.removeItem(LEARNING_HISTORY_KEY);
    }catch{}
  }

  const language=localStorage.getItem(LANGUAGE_KEY);
  const theme=localStorage.getItem(THEME_KEY);
  const filters=readJson<unknown>(FILTERS_KEY);
  if(language!==null||theme!==null||filters!==null){
    try{
      const body:{language?:string;theme?:string;docsQuery?:string;docsFilters?:string[]}={};
      if(language==='Japanese'||language==='English')body.language=language;
      if(theme==='light'||theme==='dark')body.theme=theme;
      if(filters&&typeof filters==='object'){
        const value=filters as {query?:unknown;selected?:unknown[]};
        if(typeof value.query==='string')body.docsQuery=value.query;
        if(Array.isArray(value.selected)&&value.selected.every(item=>typeof item==='string'))body.docsFilters=value.selected as string[];
      }
      if(Object.keys(body).length)await userRequest('/api/preferences',{method:'POST',body:JSON.stringify(body)});
      if(language!==null)localStorage.removeItem(LANGUAGE_KEY);
      if(theme!==null)localStorage.removeItem(THEME_KEY);
      if(filters!==null)localStorage.removeItem(FILTERS_KEY);
    }catch{}
  }
}
