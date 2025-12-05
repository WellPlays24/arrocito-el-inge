import { useState, useEffect, useRef } from 'react';
import ordersService from '../features/orders/services/ordersService';

export const useOrderStatusWatch = (userId, onOrderReady) => {
    const [orders, setOrders] = useState([]);
    const previousStatusesRef = useRef({});
    const intervalRef = useRef(null);

    useEffect(() => {
        if (!userId) return;

        const fetchUserOrders = async () => {
            try {
                // Don't fetch if no userId (user logged out)
                if (!userId) return;

                const userOrders = await ordersService.getOrders({ userId });
                setOrders(userOrders);

                // Check for status changes to 'completed'
                userOrders.forEach(order => {
                    const previousStatus = previousStatusesRef.current[order.id];

                    if (previousStatus && previousStatus !== 'completed' && order.status === 'completed') {
                        // Order just became ready
                        if (onOrderReady) {
                            onOrderReady(order);
                        }
                    }

                    // Update previous status
                    previousStatusesRef.current[order.id] = order.status;
                });
            } catch (error) {
                // Silently fail if token error (user logged out)
                if (!error.message?.includes('Token')) {
                    console.error('Error fetching user orders:', error);
                }
            }
        };

        // Initial fetch
        fetchUserOrders();

        // Polling disabled to reduce backend load - use manual refresh instead
        // intervalRef.current = setInterval(fetchUserOrders, 60000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [userId, onOrderReady]);

    return { orders };
};
