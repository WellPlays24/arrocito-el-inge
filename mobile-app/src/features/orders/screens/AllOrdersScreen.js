import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    RefreshControl,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ordersService from '../services/ordersService';
import DateRangePicker from '../../../components/DateRangePicker';

const AllOrdersScreen = ({ navigation }) => {
    const getTodayString = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('all');
    const [startDate, setStartDate] = useState(getTodayString());
    const [endDate, setEndDate] = useState(getTodayString());

    useEffect(() => {
        loadOrders();
    }, [filter, startDate, endDate]);

    const loadOrders = async () => {
        try {
            const params = filter !== 'all' ? { status: filter } : {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const data = await ordersService.getOrders(params);
            setOrders(data);
        } catch (error) {
            Alert.alert('Error', error.message || 'No se pudieron cargar las órdenes');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadOrders();
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return '#10B981';
            case 'pending': return '#F59E0B';
            case 'cancelled': return '#EF4444';
            default: return '#6B7280';
        }
    };

    const getStatusText = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'Completada';
            case 'pending': return 'Pendiente';
            case 'cancelled': return 'Cancelada';
            default: return status;
        }
    };

    const formatCurrency = (amount) => {
        return `$${parseFloat(amount || 0).toFixed(2)}`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-EC', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const renderOrder = ({ item }) => (
        <TouchableOpacity
            style={styles.orderCard}
            onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
        >
            <View style={styles.orderHeader}>
                <View>
                    <Text style={styles.orderNumber}>Orden #{item.id}</Text>
                    <Text style={styles.orderDate}>{formatDate(item.created_at || item.createdAt)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {getStatusText(item.status)}
                    </Text>
                </View>
            </View>
            <View style={styles.orderBody}>
                <Text style={styles.customerName}>
                    Cliente: {item.user_name || 'N/A'}
                </Text>
                <Text style={styles.orderTotal}>{formatCurrency(item.total_amount)}</Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.centered}>
                    <Text style={styles.loadingText}>Cargando pedidos...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Pedidos</Text>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterTabs}>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
                    onPress={() => setFilter('all')}
                >
                    <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
                        Todas
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'pending' && styles.filterTabActive]}
                    onPress={() => setFilter('pending')}
                >
                    <Text style={[styles.filterTabText, filter === 'pending' && styles.filterTabTextActive]}>
                        Pendientes
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'completed' && styles.filterTabActive]}
                    onPress={() => setFilter('completed')}
                >
                    <Text style={[styles.filterTabText, filter === 'completed' && styles.filterTabTextActive]}>
                        Completadas
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'cancelled' && styles.filterTabActive]}
                    onPress={() => setFilter('cancelled')}
                >
                    <Text style={[styles.filterTabText, filter === 'cancelled' && styles.filterTabTextActive]}>
                        Canceladas
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Date Filter */}
            <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
            />

            {/* Orders List */}
            <FlatList
                data={orders}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderOrder}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#FF6B00"
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>📦</Text>
                        <Text style={styles.emptyText}>No hay pedidos</Text>
                    </View>
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
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#6B7280',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    filterTabs: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        gap: 8,
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
    },
    filterTabActive: {
        backgroundColor: '#FF6B00',
    },
    filterTabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    filterTabTextActive: {
        color: 'white',
    },
    listContent: {
        padding: 16,
    },
    orderCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    orderNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    orderDate: {
        fontSize: 12,
        color: '#6B7280',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    orderBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    customerName: {
        fontSize: 14,
        color: '#6B7280',
    },
    orderTotal: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF6B00',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
    },
});

export default AllOrdersScreen;
