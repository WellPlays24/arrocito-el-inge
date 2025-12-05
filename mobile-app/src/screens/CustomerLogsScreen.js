import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import DateRangePicker from '../components/DateRangePicker';

const CustomerLogsScreen = ({ navigation }) => {
    const getTodayString = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterAction, setFilterAction] = useState('all'); // 'all', 'created', 'updated', 'deleted'
    const [startDate, setStartDate] = useState(getTodayString());
    const [endDate, setEndDate] = useState(getTodayString());

    useEffect(() => {
        loadLogs();
    }, [startDate, endDate]);

    useEffect(() => {
        applyFilters();
    }, [searchQuery, filterAction, logs]);

    const loadLogs = async () => {
        try {
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const response = await api.get('/logs/customer-management', { params });
            setLogs(response.data);
        } catch (error) {
            console.error('Error loading logs:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...logs];

        if (searchQuery) {
            const lower = searchQuery.toLowerCase();
            filtered = filtered.filter(log =>
                log.customer_name?.toLowerCase().includes(lower) ||
                log.performed_by_name?.toLowerCase().includes(lower)
            );
        }

        if (filterAction !== 'all') {
            filtered = filtered.filter(log => log.action_type === filterAction);
        }

        setFilteredLogs(filtered);
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

    const getActionColor = (action) => {
        switch (action) {
            case 'created': return '#10B981';
            case 'updated': return '#3B82F6';
            case 'deleted': return '#EF4444';
            default: return '#6B7280';
        }
    };

    const getActionLabel = (action) => {
        switch (action) {
            case 'created': return 'Creado';
            case 'updated': return 'Actualizado';
            case 'deleted': return 'Eliminado';
            default: return action;
        }
    };

    const renderLogItem = ({ item }) => (
        <View style={styles.logCard}>
            <View style={styles.cardHeader}>
                <View style={styles.userInfo}>
                    <Text style={styles.customerName}>{item.customer_name || 'Cliente'}</Text>
                    <Text style={styles.performedBy}>
                        Por: {item.performed_by_name || 'Sistema'} ({item.performed_by_role})
                    </Text>
                </View>
                <View style={[styles.actionBadge, { backgroundColor: getActionColor(item.action_type) }]}>
                    <Text style={styles.actionText}>{getActionLabel(item.action_type)}</Text>
                </View>
            </View>

            <View style={styles.cardBody}>
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

    const getStats = () => {
        const total = logs.length;
        const created = logs.filter(l => l.action_type === 'created').length;
        const updated = logs.filter(l => l.action_type === 'updated').length;
        const deleted = logs.filter(l => l.action_type === 'deleted').length;
        return { total, created, updated, deleted };
    };

    const stats = getStats();

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
                <Text style={styles.title}>Gestión de Clientes</Text>
            </View>

            <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
            />

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterButton, filterAction === 'all' && styles.filterButtonActive]}
                    onPress={() => setFilterAction('all')}
                >
                    <Text style={[styles.filterButtonText, filterAction === 'all' && styles.filterButtonTextActive]}>
                        Todos ({stats.total})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filterAction === 'created' && styles.filterButtonActive]}
                    onPress={() => setFilterAction('created')}
                >
                    <Text style={[styles.filterButtonText, filterAction === 'created' && styles.filterButtonTextActive]}>
                        Creados ({stats.created})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filterAction === 'updated' && styles.filterButtonActive]}
                    onPress={() => setFilterAction('updated')}
                >
                    <Text style={[styles.filterButtonText, filterAction === 'updated' && styles.filterButtonTextActive]}>
                        Editados ({stats.updated})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filterAction === 'deleted' && styles.filterButtonActive]}
                    onPress={() => setFilterAction('deleted')}
                >
                    <Text style={[styles.filterButtonText, filterAction === 'deleted' && styles.filterButtonTextActive]}>
                        Eliminados ({stats.deleted})
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredLogs}
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
    searchContainer: {
        padding: 16,
        backgroundColor: 'white',
    },
    searchInput: {
        backgroundColor: '#F3F4F6',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    filterContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 8,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        flexWrap: 'wrap',
    },
    filterButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
    },
    filterButtonActive: {
        backgroundColor: '#FF6B00',
    },
    filterButtonText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#6B7280',
    },
    filterButtonTextActive: {
        color: 'white',
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    userInfo: {
        flex: 1,
    },
    customerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    performedBy: {
        fontSize: 12,
        color: '#6B7280',
    },
    actionBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    actionText: {
        color: 'white',
        fontSize: 11,
        fontWeight: 'bold',
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

export default CustomerLogsScreen;
