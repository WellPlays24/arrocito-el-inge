import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../hooks/useNotifications';
import { useOrderPolling } from '../hooks/useOrderPolling';
import { useOrderStatusWatch } from '../hooks/useOrderStatusWatch';
import NotificationBanner from '../components/NotificationBanner';

// Import screens
import ProductsScreen from '../features/products/screens/ProductsScreen';
import CartScreen from '../features/cart/screens/CartScreen';
import ProfileScreen from '../features/profile/screens/ProfileScreen';
import DashboardScreen from '../features/dashboard/screens/DashboardScreen';
import OrdersScreen from '../features/orders/screens/OrdersScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator({ navigation }) {
    const { isAdmin, user } = useAuth();
    const { getCartItemsCount } = useCart();
    const cartCount = getCartItemsCount();
    const { notification, showNotification, hideNotification } = useNotifications();

    // Admin: Poll for new orders
    const { pendingCount } = useOrderPolling(
        isAdmin(),
        (newOrdersCount, firstOrder) => {
            showNotification(
                `Nuevo pedido #${firstOrder.id} recibido`,
                'success',
                () => navigation.navigate('Orders')
            );
        }
    );

    // Customer: Watch for order status changes
    useOrderStatusWatch(
        !isAdmin() ? user?.id : null,
        (order) => {
            showNotification(
                `Tu pedido #${order.id} está listo para retirar`,
                'success',
                () => navigation.navigate('Profile')
            );
        }
    );

    if (isAdmin()) {
        // Admin tabs: Dashboard, Products, Orders, Profile
        return (
            <>
                <NotificationBanner
                    visible={notification.visible}
                    message={notification.message}
                    type={notification.type}
                    onPress={notification.onPress}
                    onDismiss={hideNotification}
                />
                <Tab.Navigator
                    screenOptions={{
                        headerShown: false,
                        tabBarActiveTintColor: '#FF6B00',
                        tabBarInactiveTintColor: '#6B7280',
                        tabBarStyle: {
                            backgroundColor: 'white',
                            borderTopWidth: 1,
                            borderTopColor: '#E5E7EB',
                            height: 60,
                            paddingBottom: 8,
                            paddingTop: 8,
                        },
                        tabBarLabelStyle: {
                            fontSize: 12,
                            fontWeight: '600',
                        },
                    }}
                >
                    <Tab.Screen
                        name="Dashboard"
                        component={DashboardScreen}
                        options={{
                            tabBarIcon: ({ color }) => (
                                <Text style={{ fontSize: 24 }}>📊</Text>
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Products"
                        component={ProductsScreen}
                        options={{
                            tabBarLabel: 'Productos',
                            tabBarIcon: ({ color }) => (
                                <Text style={{ fontSize: 24 }}>🏠</Text>
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Orders"
                        component={OrdersScreen}
                        options={{
                            tabBarLabel: 'Órdenes',
                            tabBarIcon: ({ color }) => (
                                <Text style={{ fontSize: 24 }}>📦</Text>
                            ),
                            tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
                            tabBarBadgeStyle: {
                                backgroundColor: '#EF4444',
                                color: 'white',
                                fontSize: 10,
                                fontWeight: 'bold',
                            },
                        }}
                    />
                    <Tab.Screen
                        name="Profile"
                        component={ProfileScreen}
                        options={{
                            tabBarLabel: 'Perfil',
                            tabBarIcon: ({ color }) => (
                                <Text style={{ fontSize: 24 }}>👤</Text>
                            ),
                        }}
                    />
                </Tab.Navigator>
            </>
        );
    }

    // Regular user tabs: Products, Cart, Profile
    return (
        <>
            <NotificationBanner
                visible={notification.visible}
                message={notification.message}
                type={notification.type}
                onPress={notification.onPress}
                onDismiss={hideNotification}
            />
            <Tab.Navigator
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: '#FF6B00',
                    tabBarInactiveTintColor: '#6B7280',
                    tabBarStyle: {
                        backgroundColor: 'white',
                        borderTopWidth: 1,
                        borderTopColor: '#E5E7EB',
                        height: 60,
                        paddingBottom: 8,
                        paddingTop: 8,
                    },
                    tabBarLabelStyle: {
                        fontSize: 12,
                        fontWeight: '600',
                    },
                }}
            >
                <Tab.Screen
                    name="Products"
                    component={ProductsScreen}
                    options={{
                        tabBarLabel: 'Productos',
                        tabBarIcon: ({ color }) => (
                            <Text style={{ fontSize: 24 }}>🏠</Text>
                        ),
                    }}
                />
                <Tab.Screen
                    name="Cart"
                    component={CartScreen}
                    options={{
                        tabBarLabel: 'Carrito',
                        tabBarIcon: ({ color }) => (
                            <Text style={{ fontSize: 24 }}>🛒</Text>
                        ),
                        tabBarBadge: cartCount > 0 ? cartCount : undefined,
                        tabBarBadgeStyle: {
                            backgroundColor: '#EF4444',
                            color: 'white',
                            fontSize: 10,
                            fontWeight: 'bold',
                        },
                    }}
                />
                <Tab.Screen
                    name="Profile"
                    component={ProfileScreen}
                    options={{
                        tabBarLabel: 'Perfil',
                        tabBarIcon: ({ color }) => (
                            <Text style={{ fontSize: 24 }}>👤</Text>
                        ),
                    }}
                />
            </Tab.Navigator>
        </>
    );
}

const styles = StyleSheet.create({
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    placeholderText: {
        fontSize: 18,
        color: '#6B7280',
        fontWeight: '600',
    },
});
