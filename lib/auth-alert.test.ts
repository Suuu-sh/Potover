import {readFileSync} from 'node:fs';
import {transformSync} from 'esbuild';
import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import {renderToStaticMarkup} from 'react-dom/server';
import {expect,it} from 'vitest';

const {code}=transformSync(readFileSync('lib/auth-client.tsx','utf8'),{loader:'tsx',format:'cjs',jsx:'automatic'});

function renderProvider(sessionError:string|null){
  let stateIndex=0;
  const react={...React,
    useState:(initial:unknown)=>{const index=stateIndex++;return [index===2?sessionError:index===1?false:initial,()=>{}]},
    useRef:(current:unknown)=>({current}),
    useCallback:(callback:unknown)=>callback,
    useMemo:(calculate:()=>unknown)=>calculate(),
    useEffect:()=>{},
  };
  const compiledModule={exports:{} as {AuthProvider:(props:{children:React.ReactNode})=>React.ReactElement}};
  const require=(name:string)=>{
    if(name==='react')return react;
    if(name==='react/jsx-runtime')return jsxRuntime;
    if(name==='@/lib/i18n-client')return {useI18n:()=>({locale:'ja',t:<T,>(value:T)=>value,href:(value:string)=>value})};
    if(['./auth-request','./auth-session','./legacy-storage-migration','./local-guest','./user-api'].includes(name))return {};
    throw new Error(`Unexpected auth import: ${name}`);
  };
  // Render presentation only; session requests and effects are intentionally inert.
  new Function('require','module',code)(require,compiledModule);
  return renderToStaticMarkup(compiledModule.exports.AuthProvider({children:React.createElement('main',null,'Content')}));
}

it('places the retry alert at the existing app-shell header offset while reserving its height',()=>{
  const html=renderProvider('接続できません');
  expect(html).toContain('role="alert"');
  expect(html).toContain('position:relative;top:64px');
  expect(html).toContain('もう一度試す');
  expect(html).not.toContain('position:fixed');
  expect(html).toContain('</div><main>Content</main>');
  const css=readFileSync('app/globals.css','utf8');
  expect(css).toMatch(/\.app-shell\{padding-top:64px!important\}/);
});

it('does not add spacing or an alert when there is no session error',()=>{
  expect(renderProvider(null)).toBe('<main>Content</main>');
});
