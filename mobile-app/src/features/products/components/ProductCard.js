import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const ProductCard = ({ product, onAddToCart }) => {
    const [imageError, setImageError] = useState(false);

    const placeholderImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN89erVfwAI+wPkQDdGkAAAAABJRU5ErkJggg==';

    return (
        <View style={styles.card}>
            <Image
                source={
                    imageError || !product.image_url
                        ? { uri: placeholderImage }
                        : { uri: product.image_url }
                }
                style={styles.image}
                resizeMode="cover"
                onError={() => setImageError(true)}
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
        width: CARD_WIDTH,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 120,
        backgroundColor: '#F3F4F6',
    },
    content: {
        padding: 12,
    },
    name: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
        height: 36,
    },
    description: {
        fontSize: 11,
        color: '#6B7280',
        marginBottom: 8,
        height: 28,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF6B00',
    },
    addButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FF6B00',
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
        fontSize: 20,
        fontWeight: 'bold',
        lineHeight: 20,
    },
});

export default ProductCard;
