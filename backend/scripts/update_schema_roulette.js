const db = require('../src/db');

async function updateSchema() {
    try {
        console.log('Adding roulette columns to users table...');

        await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS last_spin_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS extra_spins INTEGER DEFAULT 0;
    `);

        console.log('Schema updated successfully.');
    } catch (error) {
        console.error('Error updating schema:', error);
    } finally {
        // We can't easily close the pool from here if it's not exported, 
        // but the script will exit eventually or we can force it.
        process.exit(0);
    }
}

updateSchema();
