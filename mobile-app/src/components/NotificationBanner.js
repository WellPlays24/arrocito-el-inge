import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
    Vibration,
} from 'react-native';

const { width } = Dimensions.get('window');

const NotificationBanner = ({ visible, message, type = 'success', onPress, onDismiss }) => {
    const slideAnim = useRef(new Animated.Value(-100)).current;
    const timeoutRef = useRef(null);

    useEffect(() => {
        if (visible) {
            // Vibrate on show
            Vibration.vibrate(100);

            // Slide down
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 50,
                friction: 7,
            }).start();

            // Auto dismiss after 4 seconds
            timeoutRef.current = setTimeout(() => {
                handleDismiss();
            }, 4000);
        } else {
            // Slide up
            Animated.timing(slideAnim, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [visible]);

    const handleDismiss = () => {
        Animated.timing(slideAnim, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            if (onDismiss) onDismiss();
        });
    };

    const handlePress = () => {
        handleDismiss();
        if (onPress) onPress();
    };

    if (!visible && slideAnim._value === -100) {
        return null;
    }

    const backgroundColor = type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6';
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor,
                    transform: [{ translateY: slideAnim }],
                },
            ]}
        >
            <TouchableOpacity
                style={styles.content}
                onPress={handlePress}
                activeOpacity={0.9}
            >
                <Text style={styles.icon}>{icon}</Text>
                <Text style={styles.message} numberOfLines={2}>
                    {message}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        paddingTop: 50, // Account for status bar
        paddingBottom: 16,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        fontSize: 24,
        marginRight: 12,
    },
    message: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: 'white',
        lineHeight: 20,
    },
});

export default NotificationBanner;
