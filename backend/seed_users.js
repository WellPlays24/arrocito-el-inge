// seed_users.js - Script para crear usuarios de ejemplo
const db = require('./src/db');
const bcrypt = require('bcryptjs');

async function seedUsers() {
    try {
        console.log('🌱 Iniciando seed de usuarios...\n');

        // Usuario Cliente de ejemplo
        const clientData = {
            name: 'Juan Pérez',
            phone: '0987654321',
            email: 'cliente@example.com',
            password: 'cliente123',
            role: 'client',
            cedula: '0106299357', // Cédula válida de ejemplo
            date_of_birth: '1999-11-02'
        };

        // Usuario Admin de ejemplo
        const adminData = {
            name: 'Wellington Castillo',
            phone: '0912345678',
            email: 'wellington.castillocisf@gmail.com',
            password: '1999Wecm30',
            role: 'admin',
            cedula: '0926853149', // Cédula válida de ejemplo
            date_of_birth: '1999-05-30'
        };

        // Verificar si ya existen
        const existingClient = await db.query(
            'SELECT id FROM users WHERE email = $1',
            [clientData.email]
        );

        const existingAdmin = await db.query(
            'SELECT id FROM users WHERE email = $1',
            [adminData.email]
        );

        // Crear cliente si no existe
        if (existingClient.rowCount > 0) {
            console.log('⚠️  El cliente ya existe:', clientData.email);
        } else {
            const clientPasswordHash = await bcrypt.hash(clientData.password, 10);
            const clientResult = await db.query(
                `INSERT INTO users (name, phone, email, password_hash, role, cedula, date_of_birth)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, name, email, role`,
                [
                    clientData.name,
                    clientData.phone,
                    clientData.email,
                    clientPasswordHash,
                    clientData.role,
                    clientData.cedula,
                    clientData.date_of_birth
                ]
            );
            console.log('✅ Cliente creado:', clientResult.rows[0]);
            console.log('   📧 Email:', clientData.email);
            console.log('   🔑 Password:', clientData.password);
            console.log('');
        }

        // Crear admin si no existe
        if (existingAdmin.rowCount > 0) {
            console.log('⚠️  El admin ya existe:', adminData.email);
        } else {
            const adminPasswordHash = await bcrypt.hash(adminData.password, 10);
            const adminResult = await db.query(
                `INSERT INTO users (name, phone, email, password_hash, role, cedula, date_of_birth)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, name, email, role`,
                [
                    adminData.name,
                    adminData.phone,
                    adminData.email,
                    adminPasswordHash,
                    adminData.role,
                    adminData.cedula,
                    adminData.date_of_birth
                ]
            );
            console.log('✅ Admin creado:', adminResult.rows[0]);
            console.log('   📧 Email:', adminData.email);
            console.log('   🔑 Password:', adminData.password);
            console.log('');
        }

        console.log('🎉 Seed completado!\n');
        console.log('📝 Resumen de credenciales:');
        console.log('─────────────────────────────────────');
        console.log('CLIENTE:');
        console.log(`  Email: ${clientData.email}`);
        console.log(`  Password: ${clientData.password}`);
        console.log('');
        console.log('ADMIN:');
        console.log(`  Email: ${adminData.email}`);
        console.log(`  Password: ${adminData.password}`);
        console.log('─────────────────────────────────────\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error al crear usuarios:', error);
        process.exit(1);
    }
}

seedUsers();
