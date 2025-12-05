const db = require('../db');

// GET /api/logs/customer-management - Get all customer management logs
async function getCustomerManagementLogs(req, res) {
    try {
        const { startDate, endDate } = req.query;

        let query = `
            SELECT 
                cml.id,
                cml.customer_id,
                u.name AS customer_name,
                cml.action_type,
                cml.performed_by,
                cml.performed_by_name,
                cml.performed_by_role,
                cml.changes_made,
                cml.log_date
            FROM customer_management_logs cml
            LEFT JOIN users u ON u.id = cml.customer_id
        `;

        const params = [];
        const conditions = [];

        if (startDate) {
            conditions.push(`cml.log_date >= $${params.length + 1}::date`);
            params.push(startDate);
        }

        if (endDate) {
            conditions.push(`cml.log_date < ($${params.length + 1}::date + interval '1 day')`);
            params.push(endDate);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY cml.log_date DESC LIMIT 200';

        const result = await db.query(query, params);

        return res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener logs de gestión de clientes:', error);
        return res.status(500).json({ message: 'Error al obtener logs' });
    }
}

// GET /api/logs/order-status - Get all order status change logs
async function getOrderStatusLogs(req, res) {
    try {
        const { startDate, endDate } = req.query;

        let query = `
            SELECT 
                osl.id,
                osl.order_id,
                osl.old_status,
                osl.new_status,
                osl.changed_by,
                osl.changed_by_name,
                osl.changed_by_role,
                osl.log_date,
                u.name AS customer_name
            FROM order_status_logs osl
            LEFT JOIN orders o ON o.id = osl.order_id
            LEFT JOIN users u ON u.id = o.user_id
        `;

        const params = [];
        const conditions = [];

        if (startDate) {
            conditions.push(`osl.log_date >= $${params.length + 1}::date`);
            params.push(startDate);
        }

        if (endDate) {
            conditions.push(`osl.log_date < ($${params.length + 1}::date + interval '1 day')`);
            params.push(endDate);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY osl.log_date DESC LIMIT 200';

        const result = await db.query(query, params);

        return res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener logs de cambios de estado:', error);
        return res.status(500).json({ message: 'Error al obtener logs' });
    }
}

// GET /api/logs/order-creation - Get all order creation logs
async function getOrderCreationLogs(req, res) {
    try {
        const { startDate, endDate } = req.query;

        let query = `
            SELECT 
                ocl.id,
                ocl.order_id,
                ocl.customer_id,
                ocl.customer_name,
                ocl.total_amount,
                ocl.items_count,
                ocl.created_by,
                ocl.created_by_name,
                ocl.created_by_role,
                ocl.log_date
            FROM order_creation_logs ocl
        `;

        const params = [];
        const conditions = [];

        if (startDate) {
            conditions.push(`ocl.log_date >= $${params.length + 1}::date`);
            params.push(startDate);
        }

        if (endDate) {
            conditions.push(`ocl.log_date < ($${params.length + 1}::date + interval '1 day')`);
            params.push(endDate);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY ocl.log_date DESC LIMIT 200';

        const result = await db.query(query, params);

        return res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener logs de creación de pedidos:', error);
        return res.status(500).json({ message: 'Error al obtener logs' });
    }
}

module.exports = {
    getCustomerManagementLogs,
    getOrderStatusLogs,
    getOrderCreationLogs,
};
