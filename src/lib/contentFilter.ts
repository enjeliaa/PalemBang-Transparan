const bannedWords = [
  "anjing", "bangsat", "bajingan", "brengsek", "kampret", "kontol",
  "memek", "pepek", "ngentot", "goblok", "tolol", "idiot", "bodoh",
  "bego", "dungu", "keparat", "setan", "laknat", "pelacur", "lonte",
  "porno", "bokep", "cabul", "mesum", "telanjang", "bugil", "seks",
  "sange", "nazi", "rasis", "kafir", "cina", "pribumi", "judi",
  "narkoba", "sabu", "ganja",
];

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function filterContent(input: string) {
  let filtered = input;
  let isFiltered = false;

  for (const word of bannedWords) {
    const regex = new RegExp(`\\b${escapeRegExp(word)}\\b`, "gi");
    if (regex.test(filtered)) {
      isFiltered = true;
      filtered = filtered.replace(regex, "***");
    }
  }

  return { filtered, isFiltered };
}

export const forbiddenWords = bannedWords;
