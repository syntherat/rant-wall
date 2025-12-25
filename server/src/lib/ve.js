// lib/ve.js
export function dateKeyIST(d = new Date()) {
  // simple dateKey; okay for your use
  const x = new Date(d.getTime());
  return x.toISOString().slice(0, 10);
}

export async function addVE(user, amount, reason = "unknown", cap = 150) {
  if (!user || amount <= 0) return { added: 0 };

  const dk = dateKeyIST();
  if (user.veDaily?.dateKey !== dk) {
    user.veDaily = { dateKey: dk, earnedToday: 0 };
  }

  const left = Math.max(0, cap - (user.veDaily.earnedToday || 0));
  const give = Math.min(left, amount);

  if (give <= 0) return { added: 0 };

  user.ventEnergy = (user.ventEnergy || 0) + give;
  user.veDaily.earnedToday = (user.veDaily.earnedToday || 0) + give;

  // (optional) keep a log later
  return { added: give, reason };
}
