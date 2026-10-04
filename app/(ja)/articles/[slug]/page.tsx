import Page from '@/components/pages/articles-slug';
import {pageMetadata} from '@/lib/i18n';
import {articles} from '@/lib/data';
import type {Metadata} from 'next';
export function generateStaticParams(){return articles.map(({slug})=>({slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const article=articles.find(item=>item.slug===slug);return pageMetadata('/articles/'+slug,'ja',article?.title);}
export default async function ArticlePage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return <Page slug={slug}/>;}
