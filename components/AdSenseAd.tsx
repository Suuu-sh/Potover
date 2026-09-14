'use client';

import {useEffect,useRef} from 'react';
import {adsenseClient,adsenseSlot} from '@/lib/adsense-config';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type AdSenseAdProps={
  placement:'home'|'feed'|'detail';
};

export function AdSenseAd({placement}:AdSenseAdProps){
  const adRef=useRef<HTMLModElement>(null);
  const configured=Boolean(adsenseSlot);

  useEffect(()=>{
    if(!configured||!adRef.current)return;
    try{
      (window.adsbygoogle=window.adsbygoogle||[]).push({});
    }catch{
      // AdSense can be unavailable in local previews or when blocked by a browser.
    }
  },[configured]);

  if(!adsenseClient)return <aside className={`adsense-ad adsense-ad-${placement}`} aria-label="広告"><span className="adsense-ad-placeholder">AdSense広告枠（設定待ち）</span></aside>;
  if(!adsenseSlot)return null;
  return <aside className={`adsense-ad adsense-ad-${placement}`} aria-label="広告"><ins ref={adRef} className="adsbygoogle" style={{display:'block'}} data-ad-client={adsenseClient} data-ad-slot={adsenseSlot} data-ad-format="auto" data-full-width-responsive="true"/></aside>;
}
