'use client';

import {useI18n} from './i18n-client';
import {useAuth} from './auth-client';
import {useUserPreferences} from './user-preferences';

export type {PreferredLanguage} from './user-preferences';

export function usePreferredLanguage(){
  const {language,setLanguage}=useUserPreferences();
  const {locale}=useI18n();const {user}=useAuth();
  return [!user&&locale==='en'?'English':language,setLanguage] as const;
}
