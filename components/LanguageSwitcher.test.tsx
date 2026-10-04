import {readFileSync} from 'node:fs';
import {transformSync} from 'esbuild';
import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import {expect,it,vi} from 'vitest';
import type {Locale} from '../lib/i18n';

it.each(['en','ja'] as const)('switches %s in place without a navigation destination',locale=>{
  const setLocale=vi.fn();
  const {code}=transformSync(readFileSync('components/LanguageSwitcher.tsx','utf8'),{loader:'tsx',format:'cjs',jsx:'automatic'});
  const compiled={exports:{} as {LanguageSwitcher:()=>React.ReactElement}};
  new Function('require','module',code)((name:string)=>{
    if(name==='react/jsx-runtime')return jsxRuntime;
    if(name==='@/lib/i18n-client')return {useI18n:()=>({locale,setLocale})};
    throw Error('Unexpected switch dependency: '+name);
  },compiled);
  const button=compiled.exports.LanguageSwitcher();const props=button.props as {type:string;href?:string;onClick:()=>void;lang:Locale};
  expect(button.type).toBe('button');expect(props.type).toBe('button');expect(props.href).toBeUndefined();props.onClick();
  expect(setLocale).toHaveBeenCalledExactlyOnceWith(locale==='en'?'ja':'en');expect(props.lang).toBe(locale==='en'?'ja':'en');
});
