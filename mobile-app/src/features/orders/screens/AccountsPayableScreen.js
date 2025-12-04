import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ordersService from '../services/ordersService';
import { useAuth } from '../../../context/AuthContext';

const AccountsPayableScreen = ({ navigation }) => {
    const { isAdmin } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadPendingOrders = async () => {
        try {
            const allOrders = await ordersService.getMyOrders();
            // Filter orders that are NOT completed and NOT cancelled
            const pending = allOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
            setOrders(pending);
        } catch (error) {
            console.error('Error loading pending orders:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadPendingOrders();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadPendingOrders();
    }, []);

    const calculateTotalDebt = () => {
        return orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.orderNumber}>Pedido #{item.id}</Text>
                <Text style={styles.date}>
                    {new Date(item.order_date).toLocaleDateString()}
                </Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Estado:</Text>
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Pendiente de Pago</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardFooter}>
                <Text style={styles.totalLabel}>Monto:</Text>
                <Text style={styles.totalAmount}>${parseFloat(item.total_amount).toFixed(2)}</Text>
            </View>
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6B00" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Cuentas por Pagar</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Total a Pagar</Text>
                <Text style={styles.summaryAmount}>${calculateTotalDebt().toFixed(2)}</Text>
                <Text style={styles.summaryNote}>Suma de todos tus pedidos pendientes</Text>
            </View>

            <FlatList
                data={orders}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B00']} />
                }
                ListEmptyComponent={
                    !isAdmin() ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>🎉</Text>
                            <Text style={styles.emptyText}>¡Estás al día!</Text>
                            <Text style={styles.emptySubtext}>No tienes cuentas pendientes por pagar.</Text>
                        </View>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>📋</Text>
                            <Text style={styles.emptyText}>No hay cuentas pendientes</Text>
                        </View>
                    )
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        fontSize: 24,
        color: '#1F2937',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    summaryCard: {
        margin: 16,
        padding: 20,
        backgroundColor: '#FF6B00',
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#FF6B00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    summaryLabel: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    summaryAmount: {
        color: 'white',
        fontSize: 36,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    summaryNote: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 12,
    },
    listContent: {
        padding: 16,
        paddingTop: 0,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    orderNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    date: {
        fontSize: 14,
        color: '#6B7280',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        color: '#4B5563',
    },
    statusBadge: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#D97706',
        fontSize: 12,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginBottom: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 14,
        color: '#4B5563',
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF6B00',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
});

export default AccountsPayableScreen;
