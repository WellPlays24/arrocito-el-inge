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
import rouletteService from '../services/rouletteService';

const GrantHistoryScreen = ({ navigation }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const data = await rouletteService.getGrantHistory();
            setHistory(data);
        } catch (error) {
            console.error('Error loading history:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadHistory();
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
            hour12: true,
        });
    };

    const renderHistoryItem = ({ item }) => (
        <View style={styles.historyCard}>
            <View style={styles.cardHeader}>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.user_name}</Text>
                    <Text style={styles.label}>Cliente</Text>
                </View>
                <View style={styles.costBadge}>
                    <Text style={styles.costText}>${parseFloat(item.cost).toFixed(2)}</Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>👤 Admin:</Text>
                    <Text style={styles.infoValue}>{item.admin_name}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>🎰 Giros:</Text>
                    <Text style={styles.infoValue}>{item.spins_granted}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>📅 Fecha:</Text>
                    <Text style={styles.infoValue}>{formatDate(item.created_at)}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>🕐 Hora:</Text>
                    <Text style={styles.infoValue}>{formatTime(item.created_at)}</Text>
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
                <Text style={styles.title}>Historial de Giros</Text>
            </View>

            <FlatList
                data={history}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderHistoryItem}
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
                        <Text style={styles.emptyText}>No hay historial de giros</Text>
                    </View>
                }
            />

            {/* Summary Footer */}
            {history.length > 0 && (
                <View style={styles.summaryFooter}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Total Registros</Text>
                        <Text style={styles.summaryValue}>{history.length}</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Total Giros</Text>
                        <Text style={styles.summaryValue}>
                            {history.reduce((sum, item) => sum + item.spins_granted, 0)}
                        </Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Total Costo</Text>
                        <Text style={styles.summaryValue}>
                            ${history.reduce((sum, item) => sum + parseFloat(item.cost), 0).toFixed(2)}
                        </Text>
                    </View>
                </View>
            )}
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
    historyCard: {
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
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    label: {
        fontSize: 12,
        color: '#6B7280',
    },
    costBadge: {
        backgroundColor: '#10B981',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    costText: {
        color: 'white',
        fontSize: 14,
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
    summaryFooter: {
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    summaryDivider: {
        width: 1,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 8,
    },
});

export default GrantHistoryScreen;
