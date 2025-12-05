require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function createSpinLogsTable() {
    const client = await pool.connect();

    try {
        console.log('Creating roulette_spin_logs table...');

        // Create the table
        await client.query(`
            CREATE TABLE IF NOT EXISTS roulette_spin_logs (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                prize_id INTEGER REFERENCES roulette_prizes(id),
                prize_name VARCHAR(255) NOT NULL,
                is_winner BOOLEAN DEFAULT FALSE,
                spin_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('✅ Table roulette_spin_logs created successfully!');

        // Create indexes for better query performance
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_spin_logs_user 
            ON roulette_spin_logs(user_id)
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_spin_logs_date 
            ON roulette_spin_logs(spin_date DESC)
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_spin_logs_winner 
            ON roulette_spin_logs(is_winner)
        `);

        console.log('✅ Indexes created successfully!');

        // Display current table structure
        const result = await client.query(`
            SELECT column_name, data_type, column_default
            FROM information_schema.columns
            WHERE table_name = 'roulette_spin_logs'
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

createSpinLogsTable()
    .then(() => {
        console.log('\n✅ Script completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script failed:', error);
        process.exit(1);
    });
