const GAME_COLORS = {
  "Elden Ring": { color: "#3a2f1a", accent: "#d4a24a" },
  "The Legend of Zelda: Breath of the Wild": { color: "#123a2a", accent: "#7fd4a6" },
  "Zelda: Tears of the Kingdom": { color: "#123a2a", accent: "#7fd4a6" },
  "Red Dead Redemption 2": { color: "#3a1414", accent: "#e07a56" },
  "Hollow Knight": { color: "#141a2a", accent: "#8ea8d6" },
  Hades: { color: "#2a0f2a", accent: "#e05a7a" },
  "The Witcher 3: Wild Hunt": { color: "#1f1a12", accent: "#c8a878" },
  "The Witcher 3": { color: "#1f1a12", accent: "#c8a878" },
  "God of War Ragnarök": { color: "#1a2230", accent: "#7ab0d4" },
  "God of War": { color: "#1a2230", accent: "#7ab0d4" },
  "Baldur's Gate 3": { color: "#241226", accent: "#c68ad6" },
  Celeste: { color: "#2a1230", accent: "#d68ac6" },
  "Cyberpunk 2077": { color: "#2a2612", accent: "#f0d840" },
  "Grand Theft Auto V": { color: "#1f1a0f", accent: "#c8a878" },
  "Super Mario Odyssey": { color: "#1a2a1a", accent: "#e05a5a" },
  "Persona 5 Royal": { color: "#2a0a1a", accent: "#e05a5a" },
};

export function getGameColors(input) {
  const name = (typeof input === "string" ? input : (input?.title || input?.name || "")).trim();
  if (GAME_COLORS[name]) return GAME_COLORS[name];
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const hue = hash % 360;
  return { color: `oklch(0.2 0.04 ${hue})`, accent: `oklch(0.7 0.15 ${hue})` };
}
