import { useState, useEffect, useRef } from 'react';
import ordersService from '../features/orders/services/ordersService';

export const useOrderPolling = (isAdmin, onNewOrder) => {
    const [pendingCount, setPendingCount] = useState(0);
    const previousCountRef = useRef(0);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (!isAdmin) return;

        const fetchPendingOrders = async () => {
            try {
                // Don't fetch if not admin (user logged out or not admin)
                if (!isAdmin) return;

                const orders = await ordersService.getOrders({ status: 'pending' });
                const count = orders.length;

                setPendingCount(count);

                // Check if there are new orders
                if (count > previousCountRef.current && previousCountRef.current > 0) {
                    const newOrdersCount = count - previousCountRef.current;
                    if (onNewOrder) {
                        onNewOrder(newOrdersCount, orders[0]); // Pass first new order
                    }
                }

                previousCountRef.current = count;
            } catch (error) {
                // Silently fail if token error (user logged out)
                if (!error.message?.includes('Token')) {
                    console.error('Error fetching pending orders:', error);
                }
            }
        };

        // Initial fetch
        fetchPendingOrders();

        // Polling disabled to reduce backend load - use manual refresh instead
        // intervalRef.current = setInterval(fetchPendingOrders, 60000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isAdmin, onNewOrder]);

    return { pendingCount };
};
