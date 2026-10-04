import {readFileSync} from 'node:fs';
import {transformSync} from 'esbuild';
import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import {afterEach,expect,it,vi} from 'vitest';
import {localePath,translate,type Locale} from '../lib/i18n';

const {code}=transformSync(readFileSync('components/AccountSecurity.tsx','utf8'),{loader:'tsx',format:'cjs',jsx:'automatic'});
afterEach(()=>vi.unstubAllGlobals());

function elements(node:React.ReactNode):React.ReactElement[]{
  return React.Children.toArray(node).flatMap(child=>React.isValidElement(child)
    ?[child,...elements((child.props as {children?:React.ReactNode}).children)]:[]);
}

function deleteForm(confirmed:boolean,locale:Locale='ja'){
  const confirm=vi.fn(()=>confirmed);
  vi.stubGlobal('window',{confirm});
  const password=crypto.randomUUID();
  const deleteAccount=vi.fn().mockResolvedValue(undefined);
  const replace=vi.fn();
  const setState=vi.fn();
  let stateIndex=0;
  const react={...React,useState:(initial:unknown)=>[stateIndex++===3?password:initial,setState]};
  const compiledModule={exports:{} as {AccountSecurity:()=>React.ReactElement}};
  const require=(name:string)=>{
    if(name==='react')return react;
    if(name==='react/jsx-runtime')return jsxRuntime;
    if(name==='@/lib/i18n-client')return {useI18n:()=>({locale,t:<T,>(value:T)=>translate(value,locale),href:(value:string)=>localePath(value,locale)})};
    if(name==='lucide-react')return {KeyRound:()=>null,ShieldAlert:()=>null,Trash2:()=>null};
    if(name==='next/navigation'||name==='@/lib/locale-router')return {useRouter:()=>({replace:(value:string)=>replace(localePath(value,locale))})};
    if(name==='@/lib/auth-client')return {useAuth:()=>({deleteAccount,changePassword:vi.fn()})};
    throw new Error(`Unexpected account security import: ${name}`);
  };
  new Function('require','module',code)(require,compiledModule);
  const form=elements(compiledModule.exports.AccountSecurity()).filter(node=>node.type==='form')[1];
  const submit=(form.props as {onSubmit:(event:{preventDefault:()=>void})=>Promise<void>}).onSubmit;
  return {submit,confirm,password,deleteAccount,replace,setState};
}

it('cancels account deletion without calling the API, navigating, or changing form state',async()=>{
  const view=deleteForm(false);
  const preventDefault=vi.fn();
  await view.submit({preventDefault});
  expect(preventDefault).toHaveBeenCalledOnce();
  expect(view.confirm).toHaveBeenCalledOnce();
  expect(view.deleteAccount).not.toHaveBeenCalled();
  expect(view.replace).not.toHaveBeenCalled();
  expect(view.setState).not.toHaveBeenCalled();
});

it('continues the existing deletion and login redirect only after confirmation',async()=>{
  const view=deleteForm(true);
  await view.submit({preventDefault:vi.fn()});
  expect(view.confirm).toHaveBeenCalledWith('アカウントと保存したブックマーク・学習履歴・フォロー・設定を削除します。続けますか？');
  expect(view.deleteAccount).toHaveBeenCalledExactlyOnceWith(view.password);
  expect(view.replace).toHaveBeenCalledExactlyOnceWith('/login');
  expect(view.confirm.mock.invocationCallOrder[0]).toBeLessThan(view.deleteAccount.mock.invocationCallOrder[0]);
});


it('keeps English deletion confirmation and the post-delete route in the selected locale',async()=>{
  const view=deleteForm(true,'en');
  await view.submit({preventDefault:vi.fn()});
  expect(view.confirm).toHaveBeenCalledWith('This will delete your account, bookmarks, learning history, followed sources and settings. Continue?');
  expect(view.replace).toHaveBeenCalledExactlyOnceWith('/en/login');
});
