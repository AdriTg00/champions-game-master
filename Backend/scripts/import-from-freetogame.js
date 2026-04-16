// scripts/import-from-freetogame.js
import 'dotenv/config';
import connectDB from '../config/db.js';
import GameDAO from '../dao/GameDao.js';
import axios from 'axios';
import mongoose from 'mongoose';

const BATCH_SIZE = 50; // cantidad de juegos a procesar por tanda (ajusta si quieres más/menos)
const REMOTE_ALL_URL = 'https://www.freetogame.com/api/games';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const run = async () => {
  try {
    // 1) Conectar a la BD
    await connectDB(process.env.MONGO_URI);
    const dao = new GameDAO();
    console.log('Conectado a la BD. Obteniendo lista de juegos desde FreeToGame...');

    // 2) Obtener todos los juegos desde la API externa
    const res = await axios.get(REMOTE_ALL_URL, { timeout: 15000 });
    const games = Array.isArray(res.data) ? res.data : [];
    if (!games.length) {
      console.log('No se han obtenido juegos desde la API externa. Saliendo.');
      await mongoose.connection.close();
      process.exit(0);
    }
    console.log(`Obtenidos ${games.length} juegos desde FreeToGame.`);

    // 3) Procesar en batches
    let imported = 0;
    let skippedExists = 0;
    let errors = 0;
    let processed = 0;

    for (let i = 0; i < games.length; i += BATCH_SIZE) {
      const batch = games.slice(i, i + BATCH_SIZE);
      console.log(`Procesando batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} juegos)...`);

      // Procesar el batch en paralelo con Promise.allSettled
      const promises = batch.map(async (external) => {
        try {
          // Mapear campos
          const extId = external.id ? String(external.id) : undefined;
          const name = (external.title || '').toString().trim();
          const description = (external.short_description || '').toString().trim();
          const thumbnail = external.thumbnail || undefined;
          const genre = external.genre || undefined;
          const platform = external.platform || undefined;

          if (!name) {
            return { status: 'no-title', extId };
          }

          // Evitar duplicados por nombre (y opcionalmente por externalId si ya lo guardas)
          const existing = await dao.findByExternalId(extId)
          if (existing) {
            return { status: 'exists', extId, id: existing._id.toString() };
          }

          // Crear en BD
          const created = await dao.create({
            name,
            description: description || undefined,
            externalId: extId || undefined,
            thumbnail,
            genre,
            platform
          });

          return { status: 'imported', extId, id: created._id.toString() };
        } catch (err) {
          return { status: 'error', extId: external.id, error: err.message || err.toString() };
        }
      });

      const results = await Promise.allSettled(promises);

      // Interpretar resultados
      for (const r of results) {
        if (r.status === 'fulfilled') {
          const info = r.value;
          processed++;
          if (info.status === 'imported') {
            imported++;
            console.log(`  + importado: extId=${info.extId} -> localId=${info.id}`);
          } else if (info.status === 'exists') {
            skippedExists++;
            console.log(`  - ya existe: extId=${info.extId} -> localId=${info.id}`);
          } else if (info.status === 'no-title') {
            errors++;
            console.log(`  ! sin título (extId=${info.extId}), saltando`);
          } else if (info.status === 'error') {
            errors++;
            console.log(`  ! error importando extId=${info.extId}: ${info.error}`);
          } else {
            errors++;
            console.log(`  ! resultado desconocido: ${JSON.stringify(info)}`);
          }
        } else {
          // Promise rejected
          errors++;
          console.log('  ! promise rechazada en batch:', r.reason);
        }
      }

      // Espera corta entre batches para ser amable con la API / BD (ajustable)
      await sleep(300);
    }

    
    // 4) Resumen
    console.log('--- IMPORT SUMMARY ---');
    console.log(`Total juegos obtenidos: ${games.length}`);
    console.log(`Procesados: ${processed}`);
    console.log(`Importados: ${imported}`);
    console.log(`Saltados (ya existían): ${skippedExists}`);
    console.log(`Errores: ${errors}`);

    // 5) Cerrar conexión
    await mongoose.connection.close();
    console.log('Conexión cerrada. Fin.');
    process.exit(0);
  } catch (err) {
    console.error('Error general:', err.response ? err.response.data : err.message || err);
    try { await mongoose.connection.close(); } catch(e) {}
    process.exit(1);
  }
};

run();
