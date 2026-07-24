import mongoose from 'mongoose';

const RAWG_KEY = '4807fd49018e42c6822b0922c2213fe8';
const MONGO_URI = 'mongodb+srv://adri:HUcDlLDFybAdfSrl@clusteradrian.kxzrxkt.mongodb.net/?appName=ClusterAdrian';

async function fetchRawgPage(page) {
  const url = `https://api.rawg.io/api/games?key=${RAWG_KEY}&metacritic=70,100&page_size=40&page=${page}&ordering=-metacritic`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`RAWG ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data;
}

async function run() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;

  const before = await db.collection('games').countDocuments();
  console.log(`Juegos antes: ${before}`);

  // Drop all games
  await db.collection('games').drop();
  console.log('Colección eliminada');

  // Import from RAWG — games with metacritic > 70
  let imported = 0;
  let page = 1;
  let hasMore = true;

  while (hasMore && page <= 10) {
    const data = await fetchRawgPage(page);
    const results = data.results || [];
    if (results.length === 0) break;

    const docs = results.map(g => ({
      name: g.name,
      description: (g.description_raw || '').substring(0, 1000),
      externalId: String(g.id),
      thumbnail: g.background_image || '',
      genre: (g.genres || []).map(x => x.name).join(', '),
      platform: (g.platforms || []).map(p => p.platform?.name).filter(Boolean).join(', '),
      picked: false,
      metacritic: g.metacritic || 0,
      rating: g.rating || 0,
      released: g.released || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await db.collection('games').insertMany(docs);
    imported += docs.length;
    console.log(`Pag ${page}: +${docs.length} = ${imported}`);

    hasMore = !!data.next;
    page++;
    await new Promise(r => setTimeout(r, 300));
  }

  const total = await db.collection('games').countDocuments();
  console.log(`\nTotal final: ${total} juegos con metacritic > 70`);
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
