import {adsenseClient} from '@/lib/adsense-config';

export const dynamic='force-static';

export function GET(){
  const publisherId=adsenseClient.replace(/^ca-/,'');
  const body=publisherId.startsWith('pub-')?`google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`:'';
  return new Response(body,{headers:{'content-type':'text/plain; charset=utf-8'}});
}
