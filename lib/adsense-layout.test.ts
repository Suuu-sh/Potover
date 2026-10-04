import {readFileSync} from 'node:fs';
import {transformSync} from 'esbuild';
import {createElement,type ReactElement,type ReactNode} from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import {renderToStaticMarkup} from 'react-dom/server';
import {expect,it} from 'vitest';

const {code}=transformSync(readFileSync('components/RootLayout.tsx','utf8'),{loader:'tsx',format:'cjs',jsx:'automatic'});
const Passthrough=({children}:{children:ReactNode})=>children;
const wrappers={LocaleProvider:Passthrough,SiteChrome:Passthrough,AuthProvider:Passthrough,ArticleModalProvider:Passthrough,BookmarksProvider:Passthrough,LearningHistoryProvider:Passthrough,UserPreferencesProvider:Passthrough};

function renderLayout(adsenseClient:string){
  const compiledModule={exports:{} as {RootLayout:(props:{children:ReactNode;locale:'ja'|'en'})=>ReactElement}};
  // Isolate the real root layout from app providers and CSS for this HTML contract.
  const require=(name:string)=>{
    if(name==='react/jsx-runtime')return jsxRuntime;
    if(name==='@/lib/adsense-config')return {adsenseClient};
    if(name.endsWith('.css'))return {};
    if(name.startsWith('@/')||name==='./SiteChrome')return wrappers;
    throw new Error(`Unexpected layout import: ${name}`);
  };
  new Function('require','module',code)(require,compiledModule);
  return renderToStaticMarkup(compiledModule.exports.RootLayout({children:createElement('p',null,'Local QA'),locale:'ja'}));
}

it('leaves head creation to Next metadata when AdSense is disabled',()=>{
  const html=renderLayout('');
  expect(html).not.toContain('<head>');
  expect(html).not.toContain('adsbygoogle.js');
  expect(html).toContain('<body><p>Local QA</p></body>');
});

it('keeps the existing AdSense script when a client is enabled',()=>{
  const html=renderLayout('ca-pub-2563366261399858');
  expect(html).toContain('<head><script');
  expect(html).toContain('adsbygoogle.js?client=ca-pub-2563366261399858');
  expect(html).toContain('</script></head>');
});
