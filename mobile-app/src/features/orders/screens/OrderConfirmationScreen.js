import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const OrderConfirmationScreen = ({ route, navigation }) => {
    const { order } = route.params;

    const formatCurrency = (amount) => {
        return `$${parseFloat(amount || 0).toFixed(2)}`;
    };

    const getPaymentMethodText = (method) => {
        return method === 'cash' ? '💵 Efectivo' : '🏦 Transferencia';
    };

    const handleContinue = () => {
        // Navigate back to main tabs (which will show Products for customers)
        navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
        });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Success Icon */}
                <View style={styles.iconContainer}>
                    <Text style={styles.successIcon}>✅</Text>
                </View>

                {/* Title */}
                <Text style={styles.title}>¡Pedido Realizado!</Text>
                <Text style={styles.subtitle}>
                    Tu pedido ha sido recibido correctamente
                </Text>

                {/* Order Number */}
                <View style={styles.orderNumberCard}>
                    <Text style={styles.orderNumberLabel}>Número de Pedido</Text>
                    <Text style={styles.orderNumber}>#{order.id}</Text>
                </View>

                {/* Order Details */}
                <View style={styles.detailsCard}>
                    <Text style={styles.cardTitle}>Detalles del Pedido</Text>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Total:</Text>
                        <Text style={styles.detailValue}>
                            {formatCurrency(order.total_amount)}
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Método de Pago:</Text>
                        <Text style={styles.detailValue}>
                            {getPaymentMethodText(order.payment_method)}
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Estado:</Text>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>Pendiente</Text>
                        </View>
                    </View>

                    {order.notes && (
                        <>
                            <View style={styles.divider} />
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Notas:</Text>
                                <Text style={styles.detailValueNotes}>{order.notes}</Text>
                            </View>
                        </>
                    )}
                </View>

                {/* Information Message */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoIcon}>ℹ️</Text>
                    <Text style={styles.infoText}>
                        Tu pedido está siendo preparado. Te notificaremos cuando esté listo para retirar.
                    </Text>
                </View>

                {/* Continue Button */}
                <TouchableOpacity
                    style={styles.continueButton}
                    onPress={handleContinue}
                >
                    <Text style={styles.continueButtonText}>Volver a Productos</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    content: {
        padding: 20,
        alignItems: 'center',
    },
    iconContainer: {
        marginTop: 20,
        marginBottom: 16,
    },
    successIcon: {
        fontSize: 80,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 32,
        textAlign: 'center',
    },
    orderNumberCard: {
        backgroundColor: '#FF6B00',
        paddingVertical: 20,
        paddingHorizontal: 32,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 24,
        width: '100%',
        shadowColor: '#FF6B00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    orderNumberLabel: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 8,
        fontWeight: '600',
    },
    orderNumber: {
        fontSize: 36,
        fontWeight: 'bold',
        color: 'white',
    },
    detailsCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        width: '100%',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    detailLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 16,
        color: '#1F2937',
        fontWeight: '600',
    },
    detailValueNotes: {
        fontSize: 14,
        color: '#1F2937',
        fontWeight: '400',
        flex: 1,
        textAlign: 'right',
        marginLeft: 16,
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    statusBadge: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#F59E0B',
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#EFF6FF',
        borderRadius: 12,
        padding: 16,
        width: '100%',
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    infoIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#1E40AF',
        lineHeight: 20,
    },
    continueButton: {
        backgroundColor: '#FF6B00',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#FF6B00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    continueButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default OrderConfirmationScreen;
