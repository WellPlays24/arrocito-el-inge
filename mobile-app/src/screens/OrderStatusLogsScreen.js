import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import DateRangePicker from '../components/DateRangePicker';

const OrderStatusLogsScreen = ({ navigation }) => {
    const getTodayString = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [startDate, setStartDate] = useState(getTodayString());
    const [endDate, setEndDate] = useState(getTodayString());

    useEffect(() => {
        loadLogs();
    }, [startDate, endDate]);

    const loadLogs = async () => {
        try {
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const response = await api.get('/logs/order-status', { params });
            setLogs(response.data);
        } catch (error) {
            console.error('Error loading logs:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadLogs();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-EC', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('es-EC', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending': return 'Pendiente';
            case 'completed': return 'Completado';
            case 'cancelled': return 'Cancelado';
            default: return status;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#F59E0B';
            case 'completed': return '#10B981';
            case 'cancelled': return '#EF4444';
            default: return '#6B7280';
        }
    };

    const renderLogItem = ({ item }) => (
        <View style={styles.logCard}>
            <View style={styles.cardHeader}>
                <View style={styles.orderInfo}>
                    <Text style={styles.orderTitle}>Pedido #{item.order_id}</Text>
                    <Text style={styles.customerName}>{item.customer_name || 'Cliente'}</Text>
                </View>
            </View>

            <View style={styles.statusChange}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.old_status) }]}>
                    <Text style={styles.statusText}>{getStatusLabel(item.old_status)}</Text>
                </View>
                <Text style={styles.arrow}>→</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.new_status) }]}>
                    <Text style={styles.statusText}>{getStatusLabel(item.new_status)}</Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>👤 Cambiado por:</Text>
                    <Text style={styles.infoValue}>{item.changed_by_name}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>📅 Fecha:</Text>
                    <Text style={styles.infoValue}>{formatDate(item.log_date)}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>🕐 Hora:</Text>
                    <Text style={styles.infoValue}>{formatTime(item.log_date)}</Text>
                </View>
            </View>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#FF6B00" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Cambios de Estado</Text>
            </View>

            <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
            />

            <FlatList
                data={logs}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderLogItem}
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
                        <Text style={styles.emptyText}>No hay registros</Text>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        marginRight: 16,
    },
    backButtonText: {
        fontSize: 24,
        color: '#1F2937',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    listContent: {
        padding: 16,
    },
    logCard: {
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
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    orderInfo: {
        gap: 4,
    },
    orderTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    customerName: {
        fontSize: 14,
        color: '#6B7280',
    },
    statusChange: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    arrow: {
        fontSize: 20,
        color: '#6B7280',
    },
    cardBody: {
        gap: 8,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        color: '#1F2937',
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
    },
});

export default OrderStatusLogsScreen;
