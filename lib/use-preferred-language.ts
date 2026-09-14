'use client';

import {useUserPreferences} from './user-preferences';

export type {PreferredLanguage} from './user-preferences';

export function usePreferredLanguage(){
  const {language,setLanguage}=useUserPreferences();
  return [language,setLanguage] as const;
}
