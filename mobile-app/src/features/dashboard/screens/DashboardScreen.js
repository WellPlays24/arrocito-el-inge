import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    RefreshControl,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import dashboardService from '../services/dashboardService';

const DashboardScreen = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const loadDashboardData = async () => {
        try {
            const data = await dashboardService.getDailySummary(selectedDate);
            setSummary(data);
        } catch (error) {
            Alert.alert('Error', error.message || 'No se pudo cargar el resumen');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, [selectedDate]);

    const onRefresh = () => {
        setRefreshing(true);
        loadDashboardData();
    };

    const setToday = () => {
        setSelectedDate(new Date().toISOString().split('T')[0]);
    };

    const setYesterday = () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        setSelectedDate(yesterday.toISOString().split('T')[0]);
    };

    const formatCurrency = (amount) => {
        return `$${parseFloat(amount || 0).toFixed(2)}`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('es-EC', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.centered}>
                    <Text style={styles.loadingText}>Cargando resumen...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#FF6B00"
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Dashboard</Text>
                    <Text style={styles.headerSubtitle}>{formatDate(selectedDate)}</Text>
                </View>

                {/* Date Filter */}
                <View style={styles.dateFilter}>
                    <TouchableOpacity
                        style={[styles.filterButton, selectedDate === new Date().toISOString().split('T')[0] && styles.filterButtonActive]}
                        onPress={setToday}
                    >
                        <Text style={[styles.filterButtonText, selectedDate === new Date().toISOString().split('T')[0] && styles.filterButtonTextActive]}>
                            Hoy
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.filterButton}
                        onPress={setYesterday}
                    >
                        <Text style={styles.filterButtonText}>Ayer</Text>
                    </TouchableOpacity>
                </View>

                {/* Primary Metric - Total Sales */}
                <View style={styles.primaryCard}>
                    <Text style={styles.primaryLabel}>Ventas Totales</Text>
                    <Text style={styles.primaryValue}>
                        {formatCurrency(summary?.totalSales || summary?.total_sales || 0)}
                    </Text>
                    <Text style={styles.primarySubtext}>del día seleccionado</Text>
                </View>

                {/* Secondary Metrics */}
                <View style={styles.metricsGrid}>
                    <View style={styles.metricCard}>
                        <Text style={styles.metricIcon}>📦</Text>
                        <Text style={styles.metricValue}>
                            {summary?.totalOrders || summary?.total_orders || 0}
                        </Text>
                        <Text style={styles.metricLabel}>Órdenes</Text>
                    </View>

                    <View style={styles.metricCard}>
                        <Text style={styles.metricIcon}>💰</Text>
                        <Text style={styles.metricValue}>
                            {formatCurrency(
                                (summary?.totalSales || summary?.total_sales || 0) /
                                (summary?.totalOrders || summary?.total_orders || 1)
                            )}
                        </Text>
                        <Text style={styles.metricLabel}>Promedio</Text>
                    </View>
                </View>

                <View style={styles.metricsGrid}>
                    <View style={styles.metricCard}>
                        <Text style={styles.metricIcon}>✅</Text>
                        <Text style={styles.metricValue}>
                            {summary?.completedOrders || summary?.completed_orders || 0}
                        </Text>
                        <Text style={styles.metricLabel}>Completadas</Text>
                    </View>

                    <View style={styles.metricCard}>
                        <Text style={styles.metricIcon}>⏳</Text>
                        <Text style={styles.metricValue}>
                            {summary?.pendingOrders || summary?.pending_orders || 0}
                        </Text>
                        <Text style={styles.metricLabel}>Pendientes</Text>
                    </View>
                </View>

                {/* Top Products */}
                {summary?.topProducts && summary.topProducts.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Productos Más Vendidos</Text>
                        {summary.topProducts.slice(0, 3).map((product, index) => (
                            <View key={index} style={styles.productItem}>
                                <View style={styles.productRank}>
                                    <Text style={styles.productRankText}>{index + 1}</Text>
                                </View>
                                <View style={styles.productInfo}>
                                    <Text style={styles.productName}>{product.name}</Text>
                                    <Text style={styles.productQuantity}>
                                        {product.quantity} unidades
                                    </Text>
                                </View>
                                <Text style={styles.productSales}>
                                    {formatCurrency(product.total)}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollContent: {
        paddingBottom: 40,
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
    headerSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
        textTransform: 'capitalize',
    },
    dateFilter: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 12,
    },
    filterButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    filterButtonActive: {
        backgroundColor: '#FF6B00',
        borderColor: '#FF6B00',
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    filterButtonTextActive: {
        color: 'white',
    },
    primaryCard: {
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 24,
        backgroundColor: '#FF6B00',
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#FF6B00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    primaryLabel: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '600',
        marginBottom: 8,
    },
    primaryValue: {
        fontSize: 48,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    primarySubtext: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    metricsGrid: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 12,
    },
    metricCard: {
        flex: 1,
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    metricIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    metricValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    metricLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    section: {
        marginTop: 12,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 12,
    },
    productItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    productRank: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FEF3C7',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    productRankText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#F59E0B',
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    productQuantity: {
        fontSize: 12,
        color: '#6B7280',
    },
    productSales: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF6B00',
    },
});

export default DashboardScreen;
