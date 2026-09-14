import {describe, expect, it} from 'vitest';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import theme from './kiro-theme.json';

const styles = ['app/login/Login.module.css', 'app/globals.css', 'components/SiteFooter.module.css', 'components/ServiceLanding.module.css', 'components/ServiceCharacter.module.css'];
const read = (file: string) => readFileSync(file, 'utf8');

describe('Kiro theme contract', () => {
  it('pins the official Light and Dark color values, not approximations', () => {
    expect(theme.source.version).toBe('1.0.437');
    expect(theme.tokens.canvas).toEqual({source:'editor.background',light:'#f2f1f4',dark:'#211d25'});
    expect(theme.tokens.surface).toEqual({source:'editorWidget.background',light:'#ffffff',dark:'#28242e'});
    expect(theme.tokens.accent).toEqual({source:'accent',light:'#7138cc',dark:'#b080ff'});
    expect(theme.tokens.button).toEqual({source:'button.background',light:'#7138cc',dark:'#7138cc'});
    expect(theme.tokens['button-hover']).toEqual({source:'button.hoverBackground',light:'#6432b3',dark:'#8e47ff'});
    expect(theme.tokens.border).toEqual({source:'input.border',light:'#c1bec6',dark:'#4a464f'});
  });

  it('keeps the generated CSS synchronized with the sole palette source', () => {
    expect(() => execFileSync(process.execPath, ['scripts/generate-theme.mjs', '--check'])).not.toThrow();
    const css = read('app/theme.css');
    expect(css).toContain(':root {\n  color-scheme: light;');
    expect(css).toContain('html.dark-mode {\n  color-scheme: dark;');
    for (const [name, values] of Object.entries(theme.tokens)) {
      expect(css).toContain('--color-' + name + ': ' + values.light + ';');
      expect(css).toContain('--color-' + name + ': ' + values.dark + ';');
    }
  });

  it.each(styles)('%s has no hardcoded or obsolete UI palette', file => {
    const css = read(file);
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i);
    expect(css).not.toMatch(/--refero-|--blue|--bg\b/);
    for (const match of Array.from(css.matchAll(/var\(--color-([a-z-]+)\)/g))) {
      expect(theme.tokens).toHaveProperty(match[1]);
    }
  });

  it('preserves the saved theme before hydration without a separate dark palette', () => {
    const layout = read('app/layout.tsx');
    expect(layout).toContain("localStorage.getItem('potover-theme')");
    expect(layout).toContain("import './theme.css'");
    expect(layout).not.toContain('background:#');
  });

  it('preserves full-color article artwork and uses a mode-independent readable overlay', () => {
    expect(read('app/globals.css')).not.toMatch(/grayscale\(|sepia\(|hue-rotate\(/);
    expect(theme.tokens['on-artwork'].light).toBe(theme.tokens['on-artwork'].dark);
    expect(theme.tokens['artwork-scrim'].light).toBe(theme.tokens['artwork-scrim'].dark);
  });
});
