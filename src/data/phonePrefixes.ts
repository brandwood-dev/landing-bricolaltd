import countries from "world-countries";

type PhonePrefix = {
  value: string; // e.g. "+216"
  flag: string;  // e.g. '<span className="fi fi-tn"></span>'
};

export const phonePrefixes: PhonePrefix[] = countries.flatMap(({ cca2, idd }) => {
  const iso = (cca2 || "").toLowerCase();
  const root = idd?.root;         // e.g. "+1"
  const suffixes = idd?.suffixes;  // e.g. ["340","671", ...] or undefined

  if (!iso || !root) return [];

  // Some countries have multiple suffixes under the same root (e.g. NANP)
  if (suffixes && suffixes.length) {
    return suffixes.map((s) => ({
      value: `${root}${s}`,
      flag: `<span className="fi fi-${iso}"></span>`,
    }));
  }

  // Countries with a single root and no suffixes
  return [
    {
      value: root,
      flag: `<span className="fi fi-${iso}"></span>`,
    },
  ];
});

// Optional: sort by dial code (human-friendly)
phonePrefixes.sort((a, b) =>
  a.value.localeCompare(b.value, "en", { numeric: true })
);

// Optional (if you ever want unique dial codes only — keep ONE per code):
const uniqueByCode = Array.from(new Map(phonePrefixes.map(p => [p.value, p])).values());

export default uniqueByCode;