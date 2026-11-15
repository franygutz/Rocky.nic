import { describe, it, expect } from 'vitest';
import es from '../src/i18n/es.js';
import en from '../src/i18n/en.js';

const vars = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');

describe('archivos de idioma', () => {
  it('es y en tienen exactamente las mismas claves', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(es).sort());
  });
  it('cada texto usa las mismas variables {x} en los dos idiomas', () => {
    const bad = Object.keys(es).filter((k) => vars(es[k]) !== vars(en[k]));
    expect(bad).toEqual([]);
  });
  it('ningún texto en inglés quedó vacío', () => {
    expect(Object.keys(en).filter((k) => !String(en[k]).trim())).toEqual([]);
  });
});
