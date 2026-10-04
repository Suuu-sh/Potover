export type ArticleTopic='general'|'preflop'|'postflop'|'gto'|'exploit'|'tournament'|'mental'|'cash';
export type OwnedIllustration={topic:ArticleTopic;src:string;width:number;height:number;label:string};
export const TOPIC_LABELS:Record<ArticleTopic,string>;
export const TOPIC_IDS:ArticleTopic[];
export function classifyArticleTopic(article:unknown):{topic:ArticleTopic;reason:'title'|'basic-title'|'tag'|'fallback'};
export function createTopicArtLookup(manifest:unknown):(article:unknown)=>OwnedIllustration;
export function readOwnedIllustration(value:unknown):OwnedIllustration|undefined;
