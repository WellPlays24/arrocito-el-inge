const db = require('../db');

// Helper para determinar si ya giró hoy
function hasSpunToday(lastSpinAt) {
    if (!lastSpinAt) return false;
    const last = new Date(lastSpinAt);
    const now = new Date();
    return (
        last.getDate() === now.getDate() &&
        last.getMonth() === now.getMonth() &&
        last.getFullYear() === now.getFullYear()
    );
}

// GET /api/roulette/status
async function getSpinStatus(req, res) {
    try {
        const userId = req.user.id;
        const result = await db.query(
            'SELECT last_spin_at, extra_spins FROM users WHERE id = $1',
            [userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const { last_spin_at, extra_spins } = result.rows[0];
        const spunToday = hasSpunToday(last_spin_at);

        // Puede girar si: NO ha girado hoy O tiene giros extra
        const canSpin = !spunToday || extra_spins > 0;

        return res.json({
            canSpin,
            spunToday,
            extraSpins: extra_spins,
            lastSpinAt: last_spin_at,
        });
    } catch (error) {
        console.error('Error al obtener estado de ruleta:', error);
        return res.status(500).json({ message: 'Error interno' });
    }
}

// POST /api/roulette/spin
async function spin(req, res) {
    try {
        const userId = req.user.id;

        // Transacción para asegurar consistencia
        const client = await db.pool.connect();

        try {
            await client.query('BEGIN');

            const userRes = await client.query(
                'SELECT last_spin_at, extra_spins FROM users WHERE id = $1 FOR UPDATE',
                [userId]
            );

            if (userRes.rowCount === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            const { last_spin_at, extra_spins } = userRes.rows[0];
            const spunToday = hasSpunToday(last_spin_at);

            if (spunToday && extra_spins <= 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ message: 'Ya giraste hoy y no tienes giros extra' });
            }

            // Obtener premios activos de la base de datos
            const prizesRes = await client.query(
                'SELECT id, name, probability, color, description FROM roulette_prizes WHERE is_active = true ORDER BY id'
            );

            if (prizesRes.rowCount === 0) {
                await client.query('ROLLBACK');
                return res.status(500).json({ message: 'No hay premios configurados' });
            }

            const prizes = prizesRes.rows;

            // Normalizar probabilidades (asegurar que sumen 1)
            const totalProb = prizes.reduce((sum, p) => sum + parseFloat(p.probability), 0);
            const normalizedPrizes = prizes.map(p => ({
                ...p,
                probability: parseFloat(p.probability) / totalProb
            }));

            // Determinar premio
            const rand = Math.random();
            let cumulative = 0;
            let selectedPrize = normalizedPrizes[0];

            for (const prize of normalizedPrizes) {
                cumulative += prize.probability;
                if (rand < cumulative) {
                    selectedPrize = prize;
                    break;
                }
            }

            // Actualizar usuario
            let newExtraSpins = extra_spins;

            // Si ya giró hoy, consumimos un giro extra
            if (spunToday) {
                newExtraSpins = Math.max(0, extra_spins - 1);
            }
            // Si no ha girado hoy, es su giro gratis del día (no consume extra)

            await client.query(
                'UPDATE users SET last_spin_at = NOW(), extra_spins = $1 WHERE id = $2',
                [newExtraSpins, userId]
            );

            // Record spin log
            const isWinner = selectedPrize.name.toLowerCase() !== 'nada';
            const logResult = await client.query(
                `INSERT INTO roulette_spin_logs (user_id, prize_id, prize_name, is_winner, spin_date)
                 VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
                 RETURNING spin_date`,
                [userId, selectedPrize.id, selectedPrize.name, isWinner]
            );

            const spinDate = logResult.rows[0].spin_date;

            await client.query('COMMIT');

            return res.json({
                prize: selectedPrize,
                remainingExtraSpins: newExtraSpins,
                spinDate: spinDate, // Include timestamp for frontend display
            });

        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Error en el giro de ruleta:', error);
        return res.status(500).json({ message: 'Error al girar la ruleta' });
    }
}

// POST /api/roulette/grant
// Body: { userId: 1, amount: 1 }
async function grantSpin(req, res) {
    const client = await db.pool.connect();
    try {
        const { userId, amount } = req.body;
        const spinsToAdd = amount || 1;
        const adminId = req.user.id; // Get admin ID from authenticated request

        if (!userId) {
            return res.status(400).json({ message: 'userId es requerido' });
        }

        await client.query('BEGIN');

        // Update user's extra spins
        const result = await client.query(
            'UPDATE users SET extra_spins = extra_spins + $1 WHERE id = $2 RETURNING id, name, extra_spins',
            [spinsToAdd, userId]
        );

        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Record the grant in history
        const cost = spinsToAdd * 0.25; // $0.25 per spin
        await client.query(
            `INSERT INTO roulette_spin_grants (admin_id, user_id, spins_granted, cost, created_at)
             VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
            [adminId, userId, spinsToAdd, cost]
        );

        await client.query('COMMIT');

        return res.json({
            message: `Se añadieron ${spinsToAdd} giros extra`,
            user: result.rows[0],
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al conceder giros:', error);
        return res.status(500).json({ message: 'Error al conceder giros' });
    } finally {
        client.release();
    }
}

// GET /api/roulette/prizes - Get all prizes
async function getPrizes(req, res) {
    try {
        const result = await db.query(
            'SELECT * FROM roulette_prizes ORDER BY probability DESC'
        );
        return res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener premios:', error);
        return res.status(500).json({ message: 'Error al obtener premios' });
    }
}

// POST /api/roulette/prizes - Create prize
async function createPrize(req, res) {
    try {
        const { name, probability, color, description } = req.body;

        if (!name || probability === undefined || !color) {
            return res.status(400).json({ message: 'Faltan campos requeridos' });
        }

        if (probability < 0 || probability > 1) {
            return res.status(400).json({ message: 'La probabilidad debe estar entre 0 y 1' });
        }

        const result = await db.query(
            `INSERT INTO roulette_prizes (name, probability, color, description) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [name, probability, color, description || null]
        );

        return res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear premio:', error);
        return res.status(500).json({ message: 'Error al crear premio' });
    }
}

// PUT /api/roulette/prizes/:id - Update prize
async function updatePrize(req, res) {
    try {
        const { id } = req.params;
        const { name, probability, color, description, is_active } = req.body;

        if (probability !== undefined && (probability < 0 || probability > 1)) {
            return res.status(400).json({ message: 'La probabilidad debe estar entre 0 y 1' });
        }

        const result = await db.query(
            `UPDATE roulette_prizes 
             SET name = COALESCE($1, name),
                 probability = COALESCE($2, probability),
                 color = COALESCE($3, color),
                 description = COALESCE($4, description),
                 is_active = COALESCE($5, is_active),
                 updated_at = NOW()
             WHERE id = $6
             RETURNING *`,
            [name, probability, color, description, is_active, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Premio no encontrado' });
        }

        return res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar premio:', error);
        return res.status(500).json({ message: 'Error al actualizar premio' });
    }
}

// DELETE /api/roulette/prizes/:id - Delete prize
async function deletePrize(req, res) {
    try {
        const { id } = req.params;

        const result = await db.query(
            'DELETE FROM roulette_prizes WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Premio no encontrado' });
        }

        return res.json({ message: 'Premio eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar premio:', error);
        return res.status(500).json({ message: 'Error al eliminar premio' });
    }
}

// GET /api/roulette/grants/history - Get all spin grant history
async function getGrantHistory(req, res) {
    try {
        const { startDate, endDate } = req.query;

        let query = `
            SELECT 
                sg.id,
                sg.spins_granted,
                sg.cost,
                sg.created_at,
                a.name AS admin_name,
                u.name AS user_name,
                u.id AS user_id
            FROM roulette_spin_grants sg
            JOIN users a ON a.id = sg.admin_id
            JOIN users u ON u.id = sg.user_id
        `;

        const params = [];
        const conditions = [];

        if (startDate) {
            conditions.push(`sg.created_at >= $${params.length + 1}::date`);
            params.push(startDate);
        }

        if (endDate) {
            conditions.push(`sg.created_at < ($${params.length + 1}::date + interval '1 day')`);
            params.push(endDate);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY sg.created_at DESC LIMIT 100';

        const result = await db.query(query, params);

        return res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener historial de giros:', error);
        return res.status(500).json({ message: 'Error al obtener historial' });
    }
}

// GET /api/roulette/grants/user/:userId - Get grant history for specific user
async function getGrantHistoryByUser(req, res) {
    try {
        const { userId } = req.params;

        const result = await db.query(`
            SELECT 
                sg.id,
                sg.spins_granted,
                sg.cost,
                sg.created_at,
                a.name AS admin_name
            FROM roulette_spin_grants sg
            JOIN users a ON a.id = sg.admin_id
            WHERE sg.user_id = $1
            ORDER BY sg.created_at DESC
        `, [userId]);

        return res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener historial de usuario:', error);
        return res.status(500).json({ message: 'Error al obtener historial' });
    }
}

// GET /api/roulette/logs - Get all spin logs
async function getSpinLogs(req, res) {
    try {
        const { startDate, endDate } = req.query;

        let query = `
            SELECT 
                sl.id,
                sl.prize_name,
                sl.is_winner,
                sl.spin_date,
                u.name AS user_name,
                u.id AS user_id
            FROM roulette_spin_logs sl
            JOIN users u ON u.id = sl.user_id
        `;

        const params = [];
        const conditions = [];

        if (startDate) {
            conditions.push(`sl.spin_date >= $${params.length + 1}::date`);
            params.push(startDate);
        }

        if (endDate) {
            conditions.push(`sl.spin_date < ($${params.length + 1}::date + interval '1 day')`);
            params.push(endDate);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY sl.spin_date DESC LIMIT 200';

        const result = await db.query(query, params);

        return res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener logs de giros:', error);
        return res.status(500).json({ message: 'Error al obtener logs' });
    }
}

// GET /api/roulette/logs/user/:userId - Get spin logs for specific user
async function getSpinLogsByUser(req, res) {
    try {
        const { userId } = req.params;

        const result = await db.query(`
            SELECT 
                sl.id,
                sl.prize_name,
                sl.is_winner,
                sl.spin_date
            FROM roulette_spin_logs sl
            WHERE sl.user_id = $1
            ORDER BY sl.spin_date DESC
        `, [userId]);

        return res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener logs de usuario:', error);
        return res.status(500).json({ message: 'Error al obtener logs' });
    }
}

module.exports = {
    getSpinStatus,
    spin,
    grantSpin,
    getPrizes,
    createPrize,
    updatePrize,
    deletePrize,
    getGrantHistory,
    getGrantHistoryByUser,
    getSpinLogs,
    getSpinLogsByUser,
};
