require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function createLoginLogsTable() {
    const client = await pool.connect();

    try {
        console.log('Creating login_logs table...');

        // Create the table
        await client.query(`
            CREATE TABLE IF NOT EXISTS login_logs (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                user_name VARCHAR(255) NOT NULL,
                user_role VARCHAR(50) NOT NULL,
                login_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('✅ Table login_logs created successfully!');

        // Create indexes for better query performance
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_login_logs_user 
            ON login_logs(user_id)
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_login_logs_date 
            ON login_logs(login_date DESC)
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_login_logs_role 
            ON login_logs(user_role)
        `);

        console.log('✅ Indexes created successfully!');

        // Display current table structure
        const result = await client.query(`
            SELECT column_name, data_type, column_default
            FROM information_schema.columns
            WHERE table_name = 'login_logs'
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

createLoginLogsTable()
    .then(() => {
        console.log('\n✅ Script completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script failed:', error);
        process.exit(1);
    });
