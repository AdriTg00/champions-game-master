// scripts/import-from-rawg.js
import 'dotenv/config';
import connectDB from '../config/db.js';
import GameDAO from '../dao/GameDao.js';
import axios from 'axios';
import mongoose from 'mongoose';

const RAWG_KEY = "0be9054b1c494cb9b21c8d64e941966c";
const RAWG_URL = `https://api.rawg.io/api/games?key=${RAWG_KEY}&metacritic=85,100&ordering=-added&page_size=100`;

const run = async () => {
  try {
    // 1) Conectar a la BD
    await connectDB(process.env.MONGO_URI);
    const dao = new GameDAO();
    console.log('🚀 Iniciando importación desde RAWG...');

    // 2) Obtener juegos de RAWG
    const res = await axios.get(RAWG_URL);
    const rawgGames = res.data.results || [];
    
    if (!rawgGames.length) {
      console.log('❌ No se obtuvieron juegos de RAWG.');
      process.exit(0);
    }

    console.log(`📦 Se encontraron ${rawgGames.length} juegos populares.`);

    let imported = 0;
    let skipped = 0;

    // 3) Procesar e insertar
    for (const g of rawgGames) {
      try {
        const extId = g.id.toString();
        
        // Verificar si ya existe por externalId para no duplicar
        const existing = await dao.findByExternalId(extId);
        
        if (existing) {
          skipped++;
          continue;
        }

        // Mapear al formato de tu base de datos
        await dao.create({
          name: g.name,
          description: `Géneros: ${g.genres.map(gen => gen.name).join(', ')}`,
          externalId: extId,
          thumbnail: g.background_image, // Importante: tu backend usa 'thumbnail'
          genre: g.genres[0]?.name || 'Acción',
          platform: g.platforms?.map(p => p.platform.name).slice(0, 3).join(', ')
        });

        imported++;
        console.log(`✅ Importado: ${g.name}`);
      } catch (err) {
        console.error(`⚠️ Error con ${g.name}:`, err.message);
      }
    }

    console.log('\n--- RESUMEN ---');
    console.log(`✨ Nuevos juegos: ${imported}`);
    console.log(`⏩ Saltados (duplicados): ${skipped}`);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('💥 Error crítico:', err.message);
    process.exit(1);
  }
};

run();