import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

const ProductCard = ({ product, onAddToCart }) => {
    return (
        <View style={styles.card}>
            <Image
                source={{ uri: product.image_url || 'https://via.placeholder.com/150' }}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.content}>
                <Text style={styles.name} numberOfLines={2}>
                    {product.name}
                </Text>
                {product.description && (
                    <Text style={styles.description} numberOfLines={2}>
                        {product.description}
                    </Text>
                )}
                <View style={styles.footer}>
                    <Text style={styles.price}>${parseFloat(product.price).toFixed(2)}</Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => onAddToCart(product)}
                    >
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 150,
        backgroundColor: '#F3F4F6',
    },
    content: {
        padding: 12,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    description: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FF6B00',
    },
    addButton: {
        backgroundColor: '#FF6B00',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FF6B00',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    addButtonText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export default ProductCard;
