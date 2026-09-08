import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const root = new URL('../', import.meta.url);
const theme = JSON.parse(fs.readFileSync(new URL('lib/kiro-theme.json', root), 'utf8'));
export function renderTheme() {
  return '/* Generated from lib/kiro-theme.json. Run node scripts/generate-theme.mjs. */\n' +
    ['light', 'dark'].map(mode => (mode === 'light' ? ':root' : 'html.dark-mode') + ' {\n  color-scheme: ' + mode + ';\n' +
      Object.entries(theme.tokens).map(([name, values]) => '  --color-' + name + ': ' + values[mode] + ';').join('\n') + '\n}\n').join('\n');
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const output = new URL('app/theme.css', root);
  if (process.argv.includes('--check')) {
    if (fs.readFileSync(output, 'utf8') !== renderTheme()) throw new Error('Theme CSS is stale; run node scripts/generate-theme.mjs');
  } else {
    fs.writeFileSync(output, renderTheme());
  }
}
