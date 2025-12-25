const animals = ["Panda", "Fox", "Otter", "Crow", "Koala", "Lynx", "Dolphin", "Cat", "Wolf", "Hawk"];
const moods = ["Tired", "BurntOut", "Salty", "Quiet", "Noisy", "Overthinking", "Confused", "Unbothered", "Stressed", "Chaotic"];

export function makeAlias(seed = "") {
  // deterministic-ish from seed
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;

  const a = animals[h % animals.length];
  const m = moods[(h >>> 8) % moods.length];
  return `${m} ${a}`;
}

export function makeSeed() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
