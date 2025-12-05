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
import rouletteService from '../services/rouletteService';
import DateRangePicker from '../../../components/DateRangePicker';

const SpinLogsScreen = ({ navigation }) => {
    const getTodayString = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterWinners, setFilterWinners] = useState('all'); // 'all', 'winners', 'losers'
    const [startDate, setStartDate] = useState(getTodayString());
    const [endDate, setEndDate] = useState(getTodayString());

    useEffect(() => {
        loadLogs();
    }, [startDate, endDate]);

    useEffect(() => {
        applyFilters();
    }, [searchQuery, filterWinners, logs]);

    const loadLogs = async () => {
        try {
            const data = await rouletteService.getSpinLogs(startDate, endDate);
            setLogs(data);
        } catch (error) {
            console.error('Error loading logs:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...logs];

        // Filter by search query
        if (searchQuery) {
            const lower = searchQuery.toLowerCase();
            filtered = filtered.filter(log =>
                log.user_name.toLowerCase().includes(lower) ||
                log.prize_name.toLowerCase().includes(lower)
            );
        }

        // Filter by winner status
        if (filterWinners === 'winners') {
            filtered = filtered.filter(log => log.is_winner);
        } else if (filterWinners === 'losers') {
            filtered = filtered.filter(log => !log.is_winner);
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
            weekday: 'short',
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
            second: '2-digit',
            hour12: true,
        });
    };

    const renderLogItem = ({ item }) => (
        <View style={[
            styles.logCard,
            item.is_winner ? styles.winnerCard : styles.loserCard
        ]}>
            <View style={styles.cardHeader}>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.user_name}</Text>
                    <Text style={styles.prizeLabel}>
                        {item.is_winner ? '🎉 Ganó' : '😔 No ganó'}
                    </Text>
                </View>
                <View style={[
                    styles.prizeBadge,
                    item.is_winner ? styles.winnerBadge : styles.loserBadge
                ]}>
                    <Text style={styles.prizeText}>{item.prize_name}</Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>📅 Fecha:</Text>
                    <Text style={styles.infoValue}>{formatDate(item.spin_date)}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>🕐 Hora:</Text>
                    <Text style={styles.infoValue}>{formatTime(item.spin_date)}</Text>
                </View>
            </View>
        </View>
    );

    const getStats = () => {
        const total = logs.length;
        const winners = logs.filter(l => l.is_winner).length;
        const losers = total - winners;
        return { total, winners, losers };
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
                <Text style={styles.title}>Historial de Giros</Text>
            </View>

            <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
            />

            {/* Search */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar por usuario o premio..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Filters */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterButton, filterWinners === 'all' && styles.filterButtonActive]}
                    onPress={() => setFilterWinners('all')}
                >
                    <Text style={[styles.filterButtonText, filterWinners === 'all' && styles.filterButtonTextActive]}>
                        Todos ({stats.total})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filterWinners === 'winners' && styles.filterButtonActive]}
                    onPress={() => setFilterWinners('winners')}
                >
                    <Text style={[styles.filterButtonText, filterWinners === 'winners' && styles.filterButtonTextActive]}>
                        Ganadores ({stats.winners})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filterWinners === 'losers' && styles.filterButtonActive]}
                    onPress={() => setFilterWinners('losers')}
                >
                    <Text style={[styles.filterButtonText, filterWinners === 'losers' && styles.filterButtonTextActive]}>
                        No ganadores ({stats.losers})
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
                        <Text style={styles.emptyText}>No hay registros de giros</Text>
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
    },
    filterButton: {
        flex: 1,
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
        fontSize: 12,
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
        borderLeftWidth: 4,
    },
    winnerCard: {
        borderLeftColor: '#10B981',
    },
    loserCard: {
        borderLeftColor: '#EF4444',
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
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    prizeLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    prizeBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    winnerBadge: {
        backgroundColor: '#10B981',
    },
    loserBadge: {
        backgroundColor: '#EF4444',
    },
    prizeText: {
        color: 'white',
        fontSize: 12,
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

export default SpinLogsScreen;
