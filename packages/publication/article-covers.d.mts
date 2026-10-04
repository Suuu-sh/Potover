export type CoverIdentity={slug?:string;sourceSlug:string;originalUrl:string;contentType?:string};
export function safeArticleCover(value:unknown,article:CoverIdentity):string|undefined;
export function createArticleCoverLookup(manifest:unknown,scope:unknown,previewManifest?:unknown):{suppressed:(article:CoverIdentity)=>boolean;coverFor:(article:CoverIdentity)=>string|undefined};
export function applyCoverSuppressions(previews:unknown,covers:unknown):unknown;
