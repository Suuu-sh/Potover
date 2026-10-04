export type ArticlePreview = {src:string;width:number;height:number;credit:string};
export type PreviewIdentity = {slug:string;sourceSlug:string;originalUrl:string;contentType?:string};
export function readPublicArticlePreview(value:unknown):ArticlePreview|undefined;
export function createArticlePreviewLookup(manifest:unknown):(article:PreviewIdentity)=>ArticlePreview|undefined;
