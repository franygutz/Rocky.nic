// Utilidades de texto: escapar HTML y glosario al tocar.
export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Definiciones para niños (sin cifras inventadas).
export const GLOSSARY = [
  { id: 'cme', term: 'CME', words: ['CME', 'eyección de masa coronal'], def: 'Una nube enorme de gas que el Sol lanza al espacio.' },
  { id: 'sep', term: 'SEP', words: ['SEP', 'partículas energéticas'], def: 'Partículas que el Sol acelera muchísimo. Fuera de la Tierra suben la radiación.' },
  { id: 'gst', term: 'GST', words: ['GST', 'tormenta geomagnética'], def: 'Cuando el campo magnético de la Tierra se agita. Pasa en la Tierra, no en la Luna.' },
  { id: 'kp', term: 'Kp', words: ['Kp'], def: 'Un índice de 0 a 9 que mide cuánto se agita el campo magnético de la Tierra.' },
  { id: 'donki', term: 'DONKI', words: ['DONKI'], def: 'La base de datos de clima espacial de la NASA. Guarda eventos del Sol.' },
  { id: 'eva', term: 'EVA', words: ['EVA'], def: 'Actividad extravehicular: salir de la base con traje espacial.' },
  { id: 'dosimetro', term: 'dosímetro', words: ['dosímetro', 'dosímetros'], def: 'Un aparato que mide cuánta radiación recibió una persona.' },
  { id: 'regolito', term: 'regolito', words: ['regolito'], def: 'El polvo y las piedritas que cubren el suelo de la Luna.' },
  { id: 'hidroponia', term: 'hidroponía', words: ['hidroponía', 'hidropónico', 'hidropónica'], def: 'Cultivar plantas en agua con nutrientes, sin tierra.' },
  { id: 'co2', term: 'CO₂', words: ['CO₂', 'CO2', 'dióxido de carbono'], def: 'El gas que exhalamos. En una base hay que retirarlo del aire.' },
  { id: 'luna7', term: 'Luna-7', words: ['Luna-7'], def: 'Tu base en la Luna. Es inventada para el juego.' }
];
export const TERM = Object.fromEntries(GLOSSARY.map((g) => [g.id, g]));

const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Marca la primera aparición de cada término como botón del glosario.
export function withTerms(text) {
  let html = esc(text);
  for (const g of GLOSSARY) {
    for (const w of g.words) {
      const re = new RegExp(`(^|[^\\p{L}>-])(${escRe(esc(w))})(?![\\p{L}<])`, 'u');
      if (re.test(html)) {
        html = html.replace(re, (m, pre, word) => `${pre}<button type="button" class="term" data-term="${g.id}">${word}</button>`);
        break;
      }
    }
  }
  return html;
}

export const fmtNum = (n) => String(n).replace('.', ',');
export function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(String(iso).length <= 10 ? iso + 'T12:00:00Z' : iso);
  if (isNaN(d)) return String(iso).slice(0, 10);
  return new Intl.DateTimeFormat('es-NI', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(d);
}
export const safeUrl = (u) => (typeof u === 'string' && /^https?:\/\//i.test(u) ? u : null);
