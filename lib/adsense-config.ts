const adsenseDisabled=process.env.NEXT_PUBLIC_ADSENSE_DISABLED==='true';
export const adsenseClient=adsenseDisabled?'':process.env.NEXT_PUBLIC_ADSENSE_CLIENT||'ca-pub-2563366261399858';
export const adsenseSlot=process.env.NEXT_PUBLIC_ADSENSE_SLOT||'';
