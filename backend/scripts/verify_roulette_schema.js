const db = require('../src/db');

async function verifyRouletteSchema() {
    try {
        console.log('Verificando esquema de ruleta...');

        // Verificar que las columnas existen
        const result = await db.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'users' 
      AND column_name IN ('last_spin_at', 'extra_spins')
      ORDER BY column_name;
    `);

        console.log('\nColumnas encontradas:');
        console.table(result.rows);

        if (result.rows.length === 2) {
            console.log('\n✅ Esquema correcto. Las columnas de ruleta están presentes.');
        } else {
            console.log('\n❌ Faltan columnas. Ejecutando migración...');

            await db.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS last_spin_at TIMESTAMP,
        ADD COLUMN IF NOT EXISTS extra_spins INTEGER DEFAULT 0;
      `);

            console.log('✅ Columnas añadidas correctamente.');
        }

        // Mostrar algunos usuarios de ejemplo
        const users = await db.query(`
      SELECT id, name, email, last_spin_at, extra_spins 
      FROM users 
      WHERE role = 'client'
      LIMIT 5;
    `);

        console.log('\nEjemplo de usuarios (primeros 5 clientes):');
        console.table(users.rows);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}

verifyRouletteSchema();
