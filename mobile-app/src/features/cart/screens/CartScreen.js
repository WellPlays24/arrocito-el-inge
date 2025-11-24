import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../../../context/CartContext';
import CartItem from '../components/CartItem';

const CartScreen = ({ navigation }) => {
    const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            Alert.alert('Carrito vacío', 'Agrega productos antes de continuar');
            return;
        }
        Alert.alert('Checkout', 'Funcionalidad de pago próximamente');
        // Aquí navegaríamos a la pantalla de confirmación de pedido
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
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
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
            <TouchableOpacity
                style={styles.shopButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.shopButtonText}>Ver Productos</Text>
            </TouchableOpacity>
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
                    style={styles.checkoutButton}
                    onPress={handleCheckout}
                >
                    <Text style={styles.checkoutButtonText}>Proceder al Pago</Text>
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
                    />
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        padding: 4,
    },
    backIcon: {
        fontSize: 28,
        color: '#1F2937',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        flex: 1,
        textAlign: 'center',
    },
    clearText: {
        fontSize: 14,
        color: '#EF4444',
        fontWeight: '600',
    },
    listContent: {
        padding: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyIcon: {
        fontSize: 80,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 32,
    },
    shopButton: {
        backgroundColor: '#FF6B00',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 12,
        shadowColor: '#FF6B00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    shopButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        backgroundColor: 'white',
        padding: 20,
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
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: '#FF6B00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    checkoutButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default CartScreen;
