/**
 * Dibuat oleh Ibrahim Nurul Huda
 * Website: sarbeh.com
 * https://academy.founderplus.id/p/turath-plugin
 *
 * Arabic terminal rendering engine.
 * Ported from github.com/latiif/ara (Go, MIT License)
 * Handles: glyph shaping, ligatures, tashkeel, RTL reversal, right-alignment.
 */

// ── Harf (Arabic letter with contextual forms) ─────────────────

interface Harf {
  unicode: number;
  isolated: number;
  initial: number;
  medial: number;
  final: number;
}

function h(
  unicode: number,
  isolated: number,
  initial: number,
  medial: number,
  final_: number,
): Harf {
  return { unicode, isolated, initial, medial, final: final_ };
}

// ── Tashkeel (vowel marks) ──────────────────────────────────────

const TASHKEEL = new Set([
  0x064e, // fatha
  0x064b, // fathataan
  0x064f, // damma
  0x064c, // dammataan
  0x0650, // kasra
  0x064d, // kasrataan
  0x0651, // shadda
  0x0652, // sukun
]);

// ── Arabic Alphabet ─────────────────────────────────────────────

const alefHamzaAbove = h(0x0623, 0xfe83, 0x0623, 0xfe84, 0xfe84);
const alef = h(0x0627, 0xfe8d, 0x0627, 0xfe8e, 0xfe8e);
const alefMaddaAbove = h(0x0622, 0xfe81, 0x0622, 0xfe82, 0xfe82);
const hamza = h(0x0621, 0xfe80, 0x0621, 0x0621, 0x0621);
const wawHamzaAbove = h(0x0624, 0xfe85, 0x0624, 0xfe86, 0xfe86);
const alefHamzaBelow = h(0x0625, 0xfe87, 0x0625, 0xfe88, 0xfe88);
const yehHamzaAbove = h(0x0626, 0xfe89, 0xfe8b, 0xfe8c, 0xfe8a);
const beh = h(0x0628, 0xfe8f, 0xfe91, 0xfe92, 0xfe90);
const teh = h(0x062a, 0xfe95, 0xfe97, 0xfe98, 0xfe96);
const tehMarbuta = h(0x0629, 0xfe93, 0x0629, 0x0629, 0xfe94);
const theh = h(0x062b, 0xfe99, 0xfe9b, 0xfe9c, 0xfe9a);
const jeem = h(0x062c, 0xfe9d, 0xfe9f, 0xfea0, 0xfe9e);
const hah = h(0x062d, 0xfea1, 0xfea3, 0xfea4, 0xfea2);
const khah = h(0x062e, 0xfea5, 0xfea7, 0xfea8, 0xfea6);
const dal = h(0x062f, 0xfea9, 0x062f, 0xfeaa, 0xfeaa);
const thal = h(0x0630, 0xfeab, 0x0630, 0xfeac, 0xfeac);
const reh = h(0x0631, 0xfead, 0x0631, 0xfeae, 0xfeae);
const zain = h(0x0632, 0xfeaf, 0x0632, 0xfeb0, 0xfeb0);
const seen = h(0x0633, 0xfeb1, 0xfeb3, 0xfeb4, 0xfeb2);
const sheen = h(0x0634, 0xfeb5, 0xfeb7, 0xfeb8, 0xfeb6);
const sad = h(0x0635, 0xfeb9, 0xfebb, 0xfebc, 0xfeba);
const dad = h(0x0636, 0xfebd, 0xfebf, 0xfec0, 0xfebe);
const tah = h(0x0637, 0xfec1, 0xfec3, 0xfec4, 0xfec2);
const zah = h(0x0638, 0xfec5, 0xfec7, 0xfec8, 0xfec6);
const ayn = h(0x0639, 0xfec9, 0xfecb, 0xfecc, 0xfeca);
const ghayn = h(0x063a, 0xfecd, 0xfecf, 0xfed0, 0xfece);
const feh = h(0x0641, 0xfed1, 0xfed3, 0xfed4, 0xfed2);
const qaf = h(0x0642, 0xfed5, 0xfed7, 0xfed8, 0xfed6);
const kaf = h(0x0643, 0xfed9, 0xfedb, 0xfedc, 0xfeda);
const lam = h(0x0644, 0xfedd, 0xfedf, 0xfee0, 0xfede);
const meem = h(0x0645, 0xfee1, 0xfee3, 0xfee4, 0xfee2);
const noon = h(0x0646, 0xfee5, 0xfee7, 0xfee8, 0xfee6);
const heh = h(0x0647, 0xfee9, 0xfeeb, 0xfeec, 0xfeea);
const waw = h(0x0648, 0xfeed, 0x0648, 0xfeee, 0xfeee);
const yeh = h(0x064a, 0xfef1, 0xfef3, 0xfef4, 0xfef2);
const alefMaksura = h(0x0649, 0xfeef, 0x0649, 0xfef0, 0xfef0);
const kasheeda = h(0x0640, 0x0640, 0x0640, 0x0640, 0x0640);
const lamAlef = h(0xfefb, 0xfefb, 0xfefb, 0xfefc, 0xfefc);
const lamAlefHamzaAbove = h(0xfef7, 0xfef7, 0xfef7, 0xfef8, 0xfef8);
const lamAlefHamzaBelow = h(0xfef9, 0xfef9, 0xfef9, 0xfefa, 0xfefa);
const lamAlefMaddah = h(0xfef5, 0xfef5, 0xfef5, 0xfef6, 0xfef6);

const alphabet: Harf[] = [
  alefHamzaAbove, alef, alefMaddaAbove, hamza, wawHamzaAbove,
  alefHamzaBelow, yehHamzaAbove, beh, teh, tehMarbuta, theh,
  jeem, hah, khah, dal, thal, reh, zain, seen, sheen, sad, dad,
  tah, zah, ayn, ghayn, feh, qaf, kaf, lam, meem, noon, heh,
  waw, yeh, alefMaksura, kasheeda, lamAlef, lamAlefHamzaAbove,
  lamAlefHamzaBelow, lamAlefMaddah,
];

// Letters that don't connect to the next letter
const initialAfterSet = new Set(
  [
    alefHamzaAbove, alefMaddaAbove, alef, hamza, wawHamzaAbove,
    alefHamzaBelow, tehMarbuta, dal, thal, reh, zain, waw,
    alefMaksura, lamAlef, lamAlefHamzaAbove, lamAlefHamzaBelow,
    lamAlefMaddah,
  ].flatMap((h) => [h.unicode, h.isolated, h.initial, h.medial, h.final]),
);

// Ligature map: lam + alef variants
const ligatures = new Map<number, Map<number, Harf>>();
const lamLigatures = new Map<number, Harf>();
lamLigatures.set(alef.unicode, lamAlef);
lamLigatures.set(alefHamzaAbove.unicode, lamAlefHamzaAbove);
lamLigatures.set(alefHamzaBelow.unicode, lamAlefHamzaBelow);
lamLigatures.set(alefMaddaAbove.unicode, lamAlefMaddah);
ligatures.set(lam.unicode, lamLigatures);

// ── Alphabet lookup cache ───────────────────────────────────────

let _arabicLettersCache: Set<number> | null = null;

function getArabicLetters(): Set<number> {
  if (_arabicLettersCache) return _arabicLettersCache;
  const s = new Set<number>();
  for (const harf of alphabet) {
    s.add(harf.unicode);
    s.add(harf.isolated);
    s.add(harf.initial);
    s.add(harf.medial);
    s.add(harf.final);
  }
  _arabicLettersCache = s;
  return s;
}

function harfEquals(harf: Harf, char: number): boolean {
  return (
    char === harf.unicode ||
    char === harf.isolated ||
    char === harf.initial ||
    char === harf.medial ||
    char === harf.final
  );
}

function getHarf(char: number): Harf {
  for (const s of alphabet) {
    if (harfEquals(s, char)) return s;
  }
  return { unicode: char, isolated: char, initial: char, medial: char, final: char };
}

// ── Core Functions ──────────────────────────────────────────────

function reverse(s: string): string {
  return [...s].reverse().join("");
}

function removeTashkeel(s: string): string {
  return [...s].filter((ch) => !TASHKEEL.has(ch.codePointAt(0)!)).join("");
}

function smartLength(s: string): number {
  let len = 0;
  for (const ch of s) {
    if (!TASHKEEL.has(ch.codePointAt(0)!)) len++;
  }
  return len;
}

/** Apply ligatures (lam + alef → lamAlef, etc.) */
function smooth(s: string): string {
  const runes = [...s].map((c) => c.codePointAt(0)!);
  const result: number[] = [];

  for (let i = 0; i < runes.length; i++) {
    if (i < runes.length - 1) {
      const curr = getHarf(runes[i]);
      const next = getHarf(runes[i + 1]);
      const secondPart = ligatures.get(curr.unicode);
      if (secondPart) {
        const ligature = secondPart.get(next.unicode);
        if (ligature) {
          result.push(ligature.unicode);
          i++; // skip next
          continue;
        }
      }
    }
    result.push(runes[i]);
  }

  return String.fromCodePoint(...result);
}

/** Convert each character to its proper contextual glyph form */
function toGlyph(text: string): string {
  const r = [...text].map((c) => c.codePointAt(0)!);
  const length = r.length;
  const result: number[] = [];

  for (let i = 0; i < length; i++) {
    const currentChar = r[i];
    const previousChar = i > 0 ? r[i - 1] : 0;
    const nextChar = i < length - 1 ? r[i + 1] : 0;

    // Check if current char is in alphabet
    let isInAlphabet = false;
    for (const s of alphabet) {
      if (harfEquals(s, currentChar)) {
        isInAlphabet = true;
        break;
      }
    }

    if (!isInAlphabet) {
      result.push(currentChar);
      continue;
    }

    let previousIn = false;
    let nextIn = false;
    for (const s of alphabet) {
      if (harfEquals(s, previousChar)) previousIn = true;
      if (harfEquals(s, nextChar)) nextIn = true;
    }

    const harf = getHarf(currentChar);

    if (previousIn && nextIn) {
      if (initialAfterSet.has(previousChar)) {
        result.push(harf.initial);
      } else {
        result.push(harf.medial);
      }
    } else if (nextIn) {
      result.push(harf.initial);
    } else if (previousIn) {
      if (initialAfterSet.has(previousChar)) {
        result.push(harf.isolated);
      } else {
        result.push(harf.final);
      }
    } else {
      result.push(harf.isolated);
    }
  }

  return String.fromCodePoint(...result);
}

/** Generate tashkeel position table */
function generateTashkeelTable(s: string): (number | 0)[] {
  return [...s].map((ch) => {
    const cp = ch.codePointAt(0)!;
    return TASHKEEL.has(cp) ? cp : 0;
  });
}

/** Re-apply tashkeel marks after glyph shaping */
function applyTashkeel(table: (number | 0)[], s: string): string {
  const sRunes = [...s].map((c) => c.codePointAt(0)!);
  const reversed = [...table].reverse();

  const result: number[] = [];
  let si = 0;
  let ti = 0;

  while (si < sRunes.length && ti < reversed.length) {
    result.push(sRunes[si]);
    si++;

    if (reversed[ti] !== 0) {
      result.push(reversed[ti]);
      ti += 2;
    } else {
      ti++;
    }
  }

  while (si < sRunes.length) {
    result.push(sRunes[si]);
    si++;
  }

  return String.fromCodePoint(...result);
}

/** Reverse text preserving non-Arabic word order */
function reversePreservingNonArabic(s: string): string {
  const arabicLetters = getArabicLetters();
  const words = s.split(" ");
  const stack: string[] = [];
  const formatted: string[] = [];

  for (const word of words) {
    let isArabicWord = false;
    for (const ch of word) {
      if (arabicLetters.has(ch.codePointAt(0)!)) {
        isArabicWord = true;
        break;
      }
    }

    if (isArabicWord) {
      if (stack.length > 0) {
        formatted.push(...stack.splice(0));
      }
      formatted.push(word);
    } else {
      stack.push(reverse(word));
    }
  }

  formatted.push(...stack);
  return reverse(formatted.join(" "));
}

/** Break long line at word boundary */
function breakLineAt(pos: number, str: string): [string, string] {
  const runes = [...str];
  for (let i = pos; i < runes.length; i++) {
    if (/\s/.test(runes[i])) {
      return [runes.slice(i + 1).join(""), runes.slice(0, i).join("")];
    }
  }
  return [str, ""];
}

/** Right-pad (actually left-pad for RTL) to terminal width */
function padRTL(strlen: number, size: number, str: string): string {
  const pad = Math.max(0, size - strlen);
  return " ".repeat(pad) + str;
}

/** Make text RTL with line wrapping and right-alignment */
function makeRTL(size: number, str: string): string {
  const strlen = smartLength(str);
  if (strlen > size) {
    const [fst, snd] = breakLineAt(strlen - size, str);
    return padRTL(smartLength(fst), size, fst) + "\n" + makeRTL(size, snd);
  }
  return padRTL(strlen, size, str);
}

// ── Public API ──────────────────────────────────────────────────

/**
 * Full Arabic rendering pipeline (same as `ara` CLI):
 * RemoveTashkeel → Smooth → ToGlyph → ReversePreservingNonArabic → ApplyTashkeel → MakeRTL
 */
export function renderArabicLine(line: string, termWidth: number): string {
  const table = generateTashkeelTable(line);
  const shaped = applyTashkeel(
    table,
    reversePreservingNonArabic(toGlyph(smooth(removeTashkeel(line)))),
  );
  return makeRTL(termWidth, shaped);
}

/** Check if text contains Arabic characters */
export function containsArabic(text: string): boolean {
  const letters = getArabicLetters();
  for (const ch of text) {
    if (letters.has(ch.codePointAt(0)!)) return true;
  }
  return false;
}

/**
 * Format multi-line Arabic content for terminal display.
 * Arabic lines get full rendering pipeline; non-Arabic lines pass through.
 */
export function formatArabic(text: string, termWidth: number): string {
  return text
    .split("\n")
    .map((line) => {
      if (!line.trim()) return line;
      // Strip ANSI for Arabic detection
      const plain = line.replace(/\x1b\[[0-9;]*m/g, "");
      if (!containsArabic(plain)) return line;

      // Extract ANSI codes
      const ansiRegex = /\x1b\[[0-9;]*m/g;
      const codes: string[] = [];
      let m: RegExpExecArray | null;
      while ((m = ansiRegex.exec(line)) !== null) codes.push(m[0]);
      const openCode = codes.length > 0 ? codes[0] : "";
      const resetCode = codes.length > 0 ? "\x1b[0m" : "";

      const rendered = renderArabicLine(plain, termWidth);
      return openCode ? openCode + rendered + resetCode : rendered;
    })
    .join("\n");
}
