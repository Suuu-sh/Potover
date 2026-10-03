export const dynamic='force-static';
import {MetadataRoute} from 'next';
import {PUBLIC_SITE_URL} from '@/lib/site-url';
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:'*',allow:'/'},sitemap:`${PUBLIC_SITE_URL}/sitemap.xml`}}
