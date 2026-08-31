export type RawArticle={title:string;url:string;description?:string;author?:string;publishedAt?:string}; export interface SourceAdapter{source:string;collect():Promise<RawArticle[]>}
export function deduplicate(items:RawArticle[]){const seen=new Set<string>();return items.filter(item=>{if(seen.has(item.url))return false;seen.add(item.url);return true})}
export function normalize(item:RawArticle){return {title:item.title.trim(),originalUrl:item.url,summary:(item.description||'').trim(),author:item.author||null,publishedAt:item.publishedAt||null}}
