import rawTradDict from "./TSCharacters.txt?raw";

export const dictionaryMap = new Map<string, string>();

const lines = rawTradDict.split(/\r?\n/);

lines.forEach((line) => {
  if (!line.trim()) return;
  const [trad, simp] = line.trim().split(/\s+/);
  if (trad && simp) {
    dictionaryMap.set(trad, simp);
  }
});

// Now these are available immediately on import, no await needed
export let regex = new RegExp(Array.from(dictionaryMap.keys()).join("|"), "g");
export let s = dictionaryMap;
