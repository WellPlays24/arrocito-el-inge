import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
    TextInput,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import CartItem from '../components/CartItem';
import complementsService from '../../products/services/complementsService';
import ordersService from '../../orders/services/ordersService';

const CartScreen = ({ navigation }) => {
    const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [complements, setComplements] = useState([]);

    React.useEffect(() => {
        loadComplements();
    }, []);

    const loadComplements = async () => {
        try {
            const data = await complementsService.getComplements();
            setComplements(data.filter(c => c.is_active));
        } catch (error) {
            console.error('Error loading complements:', error);
        }
    };

    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            Alert.alert('Carrito vacío', 'Agrega productos antes de continuar');
            return;
        }

        setLoading(true);

        try {
            // Format cart items for backend
            const items = cartItems.map(item => ({
                product_id: item.id,
                quantity: item.quantity,
                complements: item.complements?.map(c => c.id) || []
            }));

            // Create order
            const orderData = {
                user_id: user?.id,
                payment_method: paymentMethod,
                notes: notes.trim() || null,
                items
            };

            const response = await ordersService.createOrder(orderData);

            // Clear cart
            clearCart();

            // Navigate to confirmation screen
            navigation.navigate('OrderConfirmation', { order: response });

        } catch (error) {
            Alert.alert(
                'Error',
                error.message || 'No se pudo crear el pedido. Intenta nuevamente.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleClearCart = () => {
        Alert.alert(
            'Vaciar carrito',
            '¿Estás seguro de que deseas eliminar todos los productos?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Vaciar', onPress: clearCart, style: 'destructive' },
            ]
        );
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <Text style={styles.title}>Mi Carrito</Text>
            {cartItems.length > 0 && (
                <TouchableOpacity onPress={handleClearCart}>
                    <Text style={styles.clearText}>Vaciar</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
            <Text style={styles.emptySubtitle}>
                Agrega productos para comenzar tu pedido
            </Text>
        </View>
    );

    const renderPaymentMethod = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Método de Pago</Text>
            <View style={styles.paymentOptions}>
                <TouchableOpacity
                    style={[
                        styles.paymentOption,
                        paymentMethod === 'cash' && styles.paymentOptionActive
                    ]}
                    onPress={() => setPaymentMethod('cash')}
                >
                    <View style={styles.radio}>
                        {paymentMethod === 'cash' && <View style={styles.radioInner} />}
                    </View>
                    <Text style={[
                        styles.paymentText,
                        paymentMethod === 'cash' && styles.paymentTextActive
                    ]}>
                        💵 Efectivo
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.paymentOption,
                        paymentMethod === 'transfer' && styles.paymentOptionActive
                    ]}
                    onPress={() => setPaymentMethod('transfer')}
                >
                    <View style={styles.radio}>
                        {paymentMethod === 'transfer' && <View style={styles.radioInner} />}
                    </View>
                    <Text style={[
                        styles.paymentText,
                        paymentMethod === 'transfer' && styles.paymentTextActive
                    ]}>
                        🏦 Transferencia
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderNotes = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notas (Opcional)</Text>
            <TextInput
                style={styles.notesInput}
                placeholder="Ej: Sin ensalada, mayonesa..."
                placeholderTextColor="#9CA3AF"
                value={notes}
                onChangeText={setNotes}
                multiline={true}
                numberOfLines={3}
                maxLength={200}
            />
        </View>
    );

    const renderFooter = () => {
        if (cartItems.length === 0) return null;

        return (
            <View style={styles.footer}>
                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={styles.totalAmount}>${getCartTotal().toFixed(2)}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.checkoutButton, loading && styles.checkoutButtonDisabled]}
                    onPress={handleCheckout}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.checkoutButtonText}>Proceder al Pago</Text>
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {renderHeader()}
            {cartItems.length === 0 ? (
                renderEmpty()
            ) : (
                <>
                    <ScrollView style={styles.content}>
                        <FlatList
                            data={cartItems}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <CartItem
                                    item={item}
                                    onUpdateQuantity={updateQuantity}
                                    onRemove={removeFromCart}
                                />
                            )}
                            contentContainerStyle={styles.listContent}
                            scrollEnabled={false}
                        />
                        {renderPaymentMethod()}

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Complementos Disponibles</Text>
                            <Text style={styles.complementsText}>
                                Puedes pedir estos complementos en las notas:
                            </Text>
                            <View style={styles.complementsContainer}>
                                {complements.map((comp) => (
                                    <View key={comp.id} style={styles.complementTag}>
                                        <Text style={styles.complementTagText}>• {comp.name}</Text>
                                    </View>
                                ))}
                            </View>
                            <Text style={styles.examplesText}>
                                Ejemplos: "Solo mayonesa", "Con todo", "Solo con madurito"
                            </Text>
                        </View>

                        {renderNotes()}
                    </ScrollView>
                    {renderFooter()}
                </>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    clearText: {
        fontSize: 16,
        color: '#EF4444',
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    listContent: {
        padding: 16,
    },
    section: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 12,
    },
    paymentOptions: {
        gap: 12,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    paymentOptionActive: {
        borderColor: '#FF6B00',
        backgroundColor: '#FFF7ED',
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FF6B00',
    },
    paymentText: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500',
    },
    paymentTextActive: {
        color: '#FF6B00',
        fontWeight: '600',
    },
    notesInput: {
        backgroundColor: 'white',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 12,
        fontSize: 14,
        color: '#1F2937',
        minHeight: 80,
        textAlignVertical: 'top',
    },
    complementsText: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    },
    complementsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    complementTag: {
        backgroundColor: '#FFF7ED',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#FFEDD5',
    },
    complementTagText: {
        fontSize: 12,
        color: '#C2410C',
        fontWeight: '500',
    },
    examplesText: {
        fontSize: 12,
        color: '#9CA3AF',
        fontStyle: 'italic',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIcon: {
        fontSize: 80,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
    footer: {
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#6B7280',
    },
    totalAmount: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FF6B00',
    },
    checkoutButton: {
        backgroundColor: '#FF6B00',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#FF6B00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    checkoutButtonDisabled: {
        opacity: 0.6,
    },
    checkoutButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default CartScreen;
