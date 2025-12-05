require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function createSpinGrantsTable() {
    const client = await pool.connect();

    try {
        console.log('Creating roulette_spin_grants table...');

        // Create the table
        await client.query(`
            CREATE TABLE IF NOT EXISTS roulette_spin_grants (
                id SERIAL PRIMARY KEY,
                admin_id INTEGER NOT NULL REFERENCES users(id),
                user_id INTEGER NOT NULL REFERENCES users(id),
                spins_granted INTEGER NOT NULL DEFAULT 1,
                cost DECIMAL(10, 2) DEFAULT 0.25,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('✅ Table roulette_spin_grants created successfully!');

        // Create indexes for better query performance
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_spin_grants_admin 
            ON roulette_spin_grants(admin_id)
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_spin_grants_user 
            ON roulette_spin_grants(user_id)
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_spin_grants_created 
            ON roulette_spin_grants(created_at DESC)
        `);

        console.log('✅ Indexes created successfully!');

        // Display current table structure
        const result = await client.query(`
            SELECT column_name, data_type, column_default
            FROM information_schema.columns
            WHERE table_name = 'roulette_spin_grants'
            ORDER BY ordinal_position
        `);

        console.log('\n📋 Table structure:');
        console.table(result.rows);

    } catch (error) {
        console.error('❌ Error creating table:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

createSpinGrantsTable()
    .then(() => {
        console.log('\n✅ Script completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script failed:', error);
        process.exit(1);
    });
