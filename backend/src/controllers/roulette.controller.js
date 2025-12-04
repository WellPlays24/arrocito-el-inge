const db = require('../db');

// Configuración de premios (probabilidades simples)
const PRIZES = [
    { id: 1, name: 'Nada', probability: 0.4, color: '#EF4444' }, // 40%
    { id: 2, name: '5% Descuento', probability: 0.3, color: '#3B82F6' }, // 30%
    { id: 3, name: 'Envío Gratis', probability: 0.2, color: '#10B981' }, // 20%
    { id: 4, name: 'Postre Gratis', probability: 0.09, color: '#F59E0B' }, // 9%
    { id: 5, name: 'Pedido Gratis', probability: 0.01, color: '#8B5CF6' }, // 1%
];

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

            // Determinar premio
            const rand = Math.random();
            let cumulative = 0;
            let selectedPrize = PRIZES[0];

            for (const prize of PRIZES) {
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

            await client.query('COMMIT');

            return res.json({
                prize: selectedPrize,
                remainingExtraSpins: newExtraSpins,
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
    try {
        const { userId, amount } = req.body;
        const spinsToAdd = amount || 1;

        if (!userId) {
            return res.status(400).json({ message: 'userId es requerido' });
        }

        const result = await db.query(
            'UPDATE users SET extra_spins = extra_spins + $1 WHERE id = $2 RETURNING id, name, extra_spins',
            [spinsToAdd, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        return res.json({
            message: `Se añadieron ${spinsToAdd} giros extra`,
            user: result.rows[0],
        });

    } catch (error) {
        console.error('Error al conceder giros:', error);
        return res.status(500).json({ message: 'Error al conceder giros' });
    }
}

module.exports = {
    getSpinStatus,
    spin,
    grantSpin,
};
