// lightweight stub: expand later or integrate a library
const blocked = ["kill yourself", "kys", "midget", "slur2"];

export function isToxic(text = "") {
  const t = text.toLowerCase();
  return blocked.some((b) => t.includes(b));
}
