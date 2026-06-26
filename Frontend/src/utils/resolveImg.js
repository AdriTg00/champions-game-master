const FREETOGAME_THUMB = (id) => `https://www.freetogame.com/games/${id}/thumbnail.jpg`;

export function resolveImg(game) {
  if (!game) return null;
  const candidates = [
    game.image,
    game.coverUrl,
    game.thumbnail,
    game.cover,
  ];
  for (const c of candidates) {
    if (c && typeof c === "string" && c.length > 0) {
      return c.startsWith("//") ? `https:${c}` : c;
    }
  }
  if (game.externalId) {
    return FREETOGAME_THUMB(game.externalId);
  }
  return null;
}
