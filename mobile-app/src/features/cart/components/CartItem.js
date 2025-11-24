import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
    const handleDecrease = () => {
        if (item.quantity > 1) {
            onUpdateQuantity(item.id, item.quantity - 1);
        } else {
            Alert.alert(
                'Eliminar producto',
                '¿Deseas eliminar este producto del carrito?',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Eliminar', onPress: () => onRemove(item.id), style: 'destructive' },
                ]
            );
        }
    };

    const handleIncrease = () => {
        onUpdateQuantity(item.id, item.quantity + 1);
    };

    const itemTotal = parseFloat(item.price) * item.quantity;

    return (
        <View style={styles.container}>
            <Image
                source={{ uri: item.image_url || 'https://via.placeholder.com/80' }}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.details}>
                <Text style={styles.name} numberOfLines={2}>
                    {item.name}
                </Text>
                <Text style={styles.price}>${parseFloat(item.price).toFixed(2)}</Text>
            </View>
            <View style={styles.controls}>
                <View style={styles.quantityContainer}>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={handleDecrease}
                    >
                        <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantity}>{item.quantity}</Text>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={handleIncrease}
                    >
                        <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.total}>${itemTotal.toFixed(2)}</Text>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => onRemove(item.id)}
                >
                    <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    details: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    price: {
        fontSize: 14,
        color: '#6B7280',
    },
    controls: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 4,
    },
    quantityButton: {
        width: 28,
        height: 28,
        backgroundColor: '#FF6B00',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    quantity: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginHorizontal: 12,
        minWidth: 20,
        textAlign: 'center',
    },
    total: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF6B00',
        marginVertical: 8,
    },
    deleteButton: {
        padding: 4,
    },
    deleteIcon: {
        fontSize: 20,
    },
});

export default CartItem;
