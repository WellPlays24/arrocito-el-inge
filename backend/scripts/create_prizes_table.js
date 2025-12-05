const db = require('../src/db');

async function createPrizesTable() {
    try {
        console.log('Creating roulette_prizes table...');

        // Create table
        await db.query(`
      CREATE TABLE IF NOT EXISTS roulette_prizes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        probability DECIMAL(5,4) NOT NULL CHECK (probability >= 0 AND probability <= 1),
        color VARCHAR(7) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

        console.log('Table created successfully.');

        // Check if there are already prizes
        const existing = await db.query('SELECT COUNT(*) FROM roulette_prizes');

        if (parseInt(existing.rows[0].count) === 0) {
            console.log('Inserting default prizes...');

            await db.query(`
        INSERT INTO roulette_prizes (name, probability, color, description) VALUES
        ('Nada', 0.4, '#EF4444', 'Mejor suerte la próxima vez'),
        ('5% Descuento', 0.3, '#3B82F6', '5% de descuento en tu próximo pedido'),
        ('Envío Gratis', 0.2, '#10B981', 'Envío gratis en tu próximo pedido'),
        ('Postre Gratis', 0.09, '#F59E0B', 'Un postre gratis con tu próximo pedido'),
        ('Pedido Gratis', 0.01, '#8B5CF6', '¡Un pedido completamente gratis!');
      `);

            console.log('Default prizes inserted.');
        } else {
            console.log(`Found ${existing.rows[0].count} existing prizes, skipping insertion.`);
        }

        // Show current prizes
        const prizes = await db.query('SELECT * FROM roulette_prizes ORDER BY probability DESC');
        console.log('\nCurrent prizes:');
        console.table(prizes.rows);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}

createPrizesTable();
