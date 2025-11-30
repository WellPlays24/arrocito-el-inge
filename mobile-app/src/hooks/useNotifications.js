import { useState, useCallback } from 'react';

export const useNotifications = () => {
    const [notification, setNotification] = useState({
        visible: false,
        message: '',
        type: 'success',
        onPress: null,
    });

    const showNotification = useCallback((message, type = 'success', onPress = null) => {
        setNotification({
            visible: true,
            message,
            type,
            onPress,
        });
    }, []);

    const hideNotification = useCallback(() => {
        setNotification(prev => ({
            ...prev,
            visible: false,
        }));
    }, []);

    return {
        notification,
        showNotification,
        hideNotification,
    };
};
