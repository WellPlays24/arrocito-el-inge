import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ordersService from '../services/ordersService';

import { useAuth } from '../../../context/AuthContext';

const OrderDetailScreen = ({ route, navigation }) => {
    const { orderId } = route.params;
    const { isAdmin } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrderDetails();
    }, [orderId]);

    const loadOrderDetails = async () => {
        try {
            const data = await ordersService.getOrderById(orderId);
            setOrder(data);
        } catch (error) {
            console.error('Error loading order details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        try {
            setLoading(true);
            await ordersService.updateOrderStatus(orderId, newStatus);
            await loadOrderDetails();
            alert(`Pedido ${newStatus === 'completed' ? 'completado' : 'cancelado'} exitosamente`);
        } catch (error) {
            alert('Error al actualizar el estado del pedido');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteOrder = async () => {
        Alert.alert(
            'Confirmar Eliminación',
            '¿Estás seguro de que deseas eliminar este pedido? Esta acción no se puede deshacer.',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await ordersService.deleteOrder(orderId);
                            alert('Pedido eliminado exitosamente');
                            navigation.goBack();
                        } catch (error) {
                            alert('Error al eliminar el pedido');
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#F59E0B';
            case 'completed': return '#10B981';
            case 'cancelled': return '#EF4444';
            default: return '#6B7280';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending': return 'Pendiente';
            case 'completed': return 'Completado';
            case 'cancelled': return 'Cancelado';
            default: return status;
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6B00" />
            </View>
        );
    }

    if (!order) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>No se pudo cargar el pedido</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <Text style={styles.headerButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Pedido #{order.id}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Status Banner */}
                <View style={[styles.statusBanner, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                        {getStatusLabel(order.status)}
                    </Text>
                    <Text style={styles.dateText}>
                        {new Date(order.order_date).toLocaleString()}
                    </Text>
                </View>

                {/* Items List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Productos</Text>
                    {order.items.map((item, index) => (
                        <View key={index} style={styles.itemCard}>
                            <View style={styles.itemHeader}>
                                <Text style={styles.itemName}>
                                    {item.quantity}x {item.product_name}
                                </Text>
                                <Text style={styles.itemPrice}>
                                    ${parseFloat(item.subtotal).toFixed(2)}
                                </Text>
                            </View>

                            {/* Complements */}
                            {item.complements && item.complements.length > 0 && (
                                <View style={styles.complementsContainer}>
                                    {item.complements.map((comp, idx) => (
                                        <Text key={idx} style={styles.complementText}>
                                            + {comp.name}
                                        </Text>
                                    ))}
                                </View>
                            )}
                        </View>
                    ))}
                </View>

                {/* Order Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Información del Pedido</Text>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Método de Pago</Text>
                        <Text style={styles.infoValue}>
                            {order.payment_method === 'cash' ? 'Efectivo' : 'Transferencia'}
                        </Text>
                    </View>

                    {order.notes && (
                        <View style={styles.noteContainer}>
                            <Text style={styles.infoLabel}>Notas:</Text>
                            <Text style={styles.noteText}>{order.notes}</Text>
                        </View>
                    )}
                </View>

                {/* Total */}
                <View style={styles.footer}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total a Pagar</Text>
                        <Text style={styles.totalAmount}>
                            ${parseFloat(order.total_amount).toFixed(2)}
                        </Text>
                    </View>
                </View>

                {/* Admin Actions */}
                {isAdmin() && (
                    <View style={styles.adminActions}>
                        <Text style={styles.adminTitle}>Acciones de Administrador</Text>

                        {/* Status Change Buttons - Always visible */}
                        <View style={styles.statusChangeSection}>
                            <Text style={styles.subsectionTitle}>Cambiar Estado:</Text>
                            <View style={styles.actionButtons}>
                                {order.status !== 'pending' && (
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.pendingButton]}
                                        onPress={() => handleStatusUpdate('pending')}
                                    >
                                        <Text style={styles.actionButtonText}>⏳ Pendiente</Text>
                                    </TouchableOpacity>
                                )}
                                {order.status !== 'completed' && (
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.completeButton]}
                                        onPress={() => handleStatusUpdate('completed')}
                                    >
                                        <Text style={styles.actionButtonText}>✓ Completar</Text>
                                    </TouchableOpacity>
                                )}
                                {order.status !== 'cancelled' && (
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.cancelButton]}
                                        onPress={() => handleStatusUpdate('cancelled')}
                                    >
                                        <Text style={styles.actionButtonText}>✕ Cancelar</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* Delete Button */}
                        <TouchableOpacity
                            style={[styles.actionButton, styles.deleteButton]}
                            onPress={handleDeleteOrder}
                        >
                            <Text style={styles.actionButtonText}>🗑️ Eliminar Pedido</Text>
                        </TouchableOpacity>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#EF4444',
        marginBottom: 20,
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
    headerButton: {
        padding: 8,
    },
    headerButtonText: {
        fontSize: 24,
        color: '#1F2937',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    content: {
        padding: 16,
    },
    statusBanner: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        alignItems: 'center',
    },
    statusText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    dateText: {
        fontSize: 14,
        color: '#4B5563',
    },
    section: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 12,
    },
    itemCard: {
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        paddingBottom: 12,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        flex: 1,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    complementsContainer: {
        marginTop: 4,
        paddingLeft: 12,
    },
    complementText: {
        fontSize: 14,
        color: '#6B7280',
        fontStyle: 'italic',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    noteContainer: {
        marginTop: 8,
        backgroundColor: '#FFF7ED',
        padding: 12,
        borderRadius: 8,
    },
    noteText: {
        fontSize: 14,
        color: '#9A3412',
        marginTop: 4,
    },
    footer: {
        marginTop: 8,
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 18,
        color: '#4B5563',
    },
    totalAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FF6B00',
    },
    backButton: {
        backgroundColor: '#FF6B00',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    backButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    adminActions: {
        marginTop: 20,
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    adminTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 12,
        textAlign: 'center',
    },
    statusChangeSection: {
        marginBottom: 12,
    },
    subsectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4B5563',
        marginBottom: 8,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pendingButton: {
        backgroundColor: '#F59E0B',
    },
    completeButton: {
        backgroundColor: '#10B981',
    },
    cancelButton: {
        backgroundColor: '#EF4444',
    },
    deleteButton: {
        backgroundColor: '#DC2626',
        marginTop: 12,
    },
    actionButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default OrderDetailScreen;
