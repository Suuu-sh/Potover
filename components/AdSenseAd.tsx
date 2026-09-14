'use client';

import {useEffect,useRef} from 'react';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type AdSenseAdProps={
  placement:'home'|'feed'|'detail';
};

const client=process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const slot=process.env.NEXT_PUBLIC_ADSENSE_SLOT;

export function AdSenseAd({placement}:AdSenseAdProps){
  const adRef=useRef<HTMLModElement>(null);
  const configured=Boolean(client&&slot);

  useEffect(()=>{
    if(!configured||!adRef.current)return;
    try{
      (window.adsbygoogle=window.adsbygoogle||[]).push({});
    }catch{
      // AdSense can be unavailable in local previews or when blocked by a browser.
    }
  },[configured]);

  return <aside className={`adsense-ad adsense-ad-${placement}`} aria-label="広告">
    {configured?<ins ref={adRef} className="adsbygoogle" style={{display:'block'}} data-ad-client={client} data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true"/>:<span className="adsense-ad-placeholder">AdSense広告枠（設定待ち）</span>}
  </aside>;
}
