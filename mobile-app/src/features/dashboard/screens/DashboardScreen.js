import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    RefreshControl,
    TouchableOpacity,
    Alert,
    Modal,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import dashboardService from '../services/dashboardService';

const DashboardScreen = ({ navigation }) => {
    const [summary, setSummary] = useState(null);
    const [totalSales, setTotalSales] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [modalVisible, setModalVisible] = useState(false);
    const [tempDate, setTempDate] = useState(new Date().toISOString().split('T')[0]);
    const [showHistoricalSales, setShowHistoricalSales] = useState(true);

    const loadDashboardData = async () => {
        try {
            const [dailyData, totalData] = await Promise.all([
                dashboardService.getDailySummary(selectedDate),
                dashboardService.getTotalSales()
            ]);
            setSummary(dailyData);
            setTotalSales(totalData.total_sales);
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
                    <TouchableOpacity onPress={() => {
                        const date = new Date(selectedDate);
                        date.setDate(date.getDate() - 1);
                        setSelectedDate(date.toISOString().split('T')[0]);
                    }} style={styles.navButton}>
                        <Text style={styles.navButtonText}>←</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.dateDisplay}
                        onPress={() => setModalVisible(true)}
                    >
                        <Text style={styles.dateDisplayText}>
                            {formatDate(selectedDate)}
                        </Text>
                        <Text style={styles.dateSubtext}>Toca para cambiar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => {
                        const date = new Date(selectedDate);
                        date.setDate(date.getDate() + 1);
                        setSelectedDate(date.toISOString().split('T')[0]);
                    }} style={styles.navButton}>
                        <Text style={styles.navButtonText}>→</Text>
                    </TouchableOpacity>
                </View>

                {/* Date Selection Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Seleccionar Fecha</Text>
                            <Text style={styles.modalSubtitle}>Formato: YYYY-MM-DD</Text>

                            <TextInput
                                style={styles.input}
                                value={tempDate}
                                onChangeText={setTempDate}
                                placeholder="2025-12-01"
                                keyboardType="numeric"
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.confirmButton]}
                                    onPress={() => {
                                        // Simple validation
                                        if (/^\d{4}-\d{2}-\d{2}$/.test(tempDate)) {
                                            setSelectedDate(tempDate);
                                            setModalVisible(false);
                                        } else {
                                            Alert.alert('Error', 'Formato de fecha inválido');
                                        }
                                    }}
                                >
                                    <Text style={styles.confirmButtonText}>Confirmar</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={styles.todayButton}
                                onPress={() => {
                                    const today = new Date().toISOString().split('T')[0];
                                    setSelectedDate(today);
                                    setTempDate(today);
                                    setModalVisible(false);
                                }}
                            >
                                <Text style={styles.todayButtonText}>Ir a Hoy</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* Debtors Button */}
                <View style={styles.actionContainer}>
                    <TouchableOpacity
                        style={styles.debtorsButton}
                        onPress={() => navigation.navigate('Debtors')}
                    >
                        <Text style={styles.debtorsButtonText}>👥 Ver Deudores</Text>
                        <Text style={styles.debtorsButtonArrow}>›</Text>
                    </TouchableOpacity>
                </View>

                {/* All Time Sales */}
                {showHistoricalSales && (
                    <View style={[styles.primaryCard, { backgroundColor: '#4F46E5', marginBottom: 12 }]}>
                        <TouchableOpacity
                            style={styles.toggleButton}
                            onPress={() => setShowHistoricalSales(false)}
                        >
                            <Text style={styles.toggleButtonText}>✕</Text>
                        </TouchableOpacity>
                        <Text style={styles.primaryLabel}>Ventas Históricas</Text>
                        <Text style={styles.primaryValue}>
                            {formatCurrency(totalSales)}
                        </Text>
                        <Text style={styles.primarySubtext}>Acumulado total</Text>
                    </View>
                )}

                {!showHistoricalSales && (
                    <TouchableOpacity
                        style={styles.showHistoricalButton}
                        onPress={() => setShowHistoricalSales(true)}
                    >
                        <Text style={styles.showHistoricalText}>📊 Mostrar Ventas Históricas</Text>
                    </TouchableOpacity>
                )}

                {/* Daily Sales */}
                <View style={styles.primaryCard}>
                    <Text style={styles.primaryLabel}>Ventas del Día</Text>
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

                {/* Admin Actions */}
                <View style={styles.adminActionsSection}>
                    <Text style={styles.sectionTitle}>Acciones de Administrador</Text>
                    <View style={styles.adminButtonsRow}>
                        <TouchableOpacity
                            style={[styles.adminButton, { backgroundColor: '#EF4444' }]}
                            onPress={() => navigation.navigate('Debtors')}
                        >
                            <Text style={styles.adminButtonIcon}>💰</Text>
                            <Text style={styles.adminButtonText}>Ver Deudores</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.adminButton, { backgroundColor: '#3B82F6' }]}
                            onPress={() => navigation.navigate('AdminOrders')}
                        >
                            <Text style={styles.adminButtonIcon}>📋</Text>
                            <Text style={styles.adminButtonText}>Todos los Pedidos</Text>
                        </TouchableOpacity>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        marginBottom: 12,
    },
    navButton: {
        padding: 10,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
    },
    navButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    dateDisplay: {
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#FFF7ED',
        borderWidth: 1,
        borderColor: '#FFEDD5',
    },
    dateDisplayText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#C2410C',
        textTransform: 'capitalize',
    },
    dateSubtext: {
        fontSize: 10,
        color: '#9A3412',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#1F2937',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 16,
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#F3F4F6',
    },
    confirmButton: {
        backgroundColor: '#FF6B00',
    },
    cancelButtonText: {
        color: '#4B5563',
        fontWeight: '600',
    },
    confirmButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    todayButton: {
        marginTop: 12,
        padding: 8,
    },
    todayButtonText: {
        color: '#FF6B00',
        fontWeight: '600',
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
    actionContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    debtorsButton: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    adminActionsSection: {
        marginTop: 12,
        paddingHorizontal: 20,
    },
    adminButtonsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    adminButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    adminButtonIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    adminButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    toggleButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    toggleButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    showHistoricalButton: {
        backgroundColor: '#4F46E5',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
        marginHorizontal: 20,
    },
    showHistoricalText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default DashboardScreen;
