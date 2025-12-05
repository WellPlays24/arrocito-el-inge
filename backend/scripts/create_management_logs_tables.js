require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function createLogsTables() {
    const client = await pool.connect();

    try {
        console.log('Creating logs tables...\n');

        // 1. Customer Management Logs
        console.log('Creating customer_management_logs table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS customer_management_logs (
                id SERIAL PRIMARY KEY,
                customer_id INTEGER NOT NULL REFERENCES users(id),
                action_type VARCHAR(50) NOT NULL,
                performed_by INTEGER REFERENCES users(id),
                performed_by_name VARCHAR(255),
                performed_by_role VARCHAR(50),
                changes_made TEXT,
                log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_customer_logs_customer 
            ON customer_management_logs(customer_id)
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_customer_logs_date 
            ON customer_management_logs(log_date DESC)
        `);

        console.log('✅ customer_management_logs created!\n');

        // 2. Order Status Logs
        console.log('Creating order_status_logs table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS order_status_logs (
                id SERIAL PRIMARY KEY,
                order_id INTEGER NOT NULL REFERENCES orders(id),
                old_status VARCHAR(50),
                new_status VARCHAR(50) NOT NULL,
                changed_by INTEGER NOT NULL REFERENCES users(id),
                changed_by_name VARCHAR(255),
                changed_by_role VARCHAR(50),
                log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_order_status_logs_order 
            ON order_status_logs(order_id)
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_order_status_logs_date 
            ON order_status_logs(log_date DESC)
        `);

        console.log('✅ order_status_logs created!\n');

        // 3. Order Creation Logs
        console.log('Creating order_creation_logs table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS order_creation_logs (
                id SERIAL PRIMARY KEY,
                order_id INTEGER NOT NULL REFERENCES orders(id),
                customer_id INTEGER NOT NULL REFERENCES users(id),
                customer_name VARCHAR(255),
                total_amount DECIMAL(10, 2),
                items_count INTEGER,
                created_by INTEGER NOT NULL REFERENCES users(id),
                created_by_name VARCHAR(255),
                created_by_role VARCHAR(50),
                log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_order_creation_logs_order 
            ON order_creation_logs(order_id)
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_order_creation_logs_customer 
            ON order_creation_logs(customer_id)
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_order_creation_logs_date 
            ON order_creation_logs(log_date DESC)
        `);

        console.log('✅ order_creation_logs created!\n');

        console.log('📋 All tables created successfully!');

    } catch (error) {
        console.error('❌ Error creating tables:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

createLogsTables()
    .then(() => {
        console.log('\n✅ Script completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script failed:', error);
        process.exit(1);
    });
