import {afterEach,expect,it,vi} from 'vitest';

afterEach(()=>{vi.unstubAllEnvs();vi.resetModules()});

it.each([
  [undefined,false],
  ['true',true],
  ['false',false],
] as const)('disables AdSense only when NEXT_PUBLIC_ADSENSE_DISABLED is %s',async(value,disabled)=>{
  vi.stubEnv('NEXT_PUBLIC_ADSENSE_DISABLED',value);
  vi.stubEnv('NEXT_PUBLIC_ADSENSE_CLIENT',undefined);
  vi.resetModules();
  const defaults=await import('./adsense-config');
  expect(defaults.adsenseClient).toBe(disabled?'':'ca-pub-2563366261399858');

  vi.stubEnv('NEXT_PUBLIC_ADSENSE_CLIENT','ca-pub-local-qa');
  vi.resetModules();
  const configured=await import('./adsense-config');
  expect(configured.adsenseClient).toBe(disabled?'':'ca-pub-local-qa');
});
