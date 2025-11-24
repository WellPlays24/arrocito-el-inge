import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    RefreshControl,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import productsService from '../services/productsService';
import ProductCard from '../components/ProductCard';
import { useCart } from '../../../context/CartContext';

const ProductsScreen = ({ navigation }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { addToCart, getCartItemsCount } = useCart();

    const loadProducts = async () => {
        try {
            const data = await productsService.getProducts();
            setProducts(data);
        } catch (error) {
            Alert.alert('Error', error.message || 'No se pudieron cargar los productos');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadProducts();
    };

    const handleAddToCart = (product) => {
        addToCart(product);
        Alert.alert('Agregado', `${product.name} agregado al carrito`);
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View>
                <Text style={styles.greeting}>Hola! 👋</Text>
                <Text style={styles.title}>¿Qué te gustaría ordenar?</Text>
            </View>
            <TouchableOpacity
                style={styles.cartButton}
                onPress={() => navigation.navigate('Cart')}
            >
                <Text style={styles.cartIcon}>🛒</Text>
                {getCartItemsCount() > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{getCartItemsCount()}</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centered}>
                    <Text style={styles.loadingText}>Cargando productos...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            <FlatList
                data={products}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <ProductCard product={item} onAddToCart={handleAddToCart} />
                )}
                contentContainerStyle={styles.listContent}
                numColumns={2}
                columnWrapperStyle={styles.row}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#FF6B00"
                    />
                }
                ListEmptyComponent={
                    <View style={styles.centered}>
                        <Text style={styles.emptyText}>No hay productos disponibles</Text>
                    </View>
                }
            />
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
    greeting: {
        fontSize: 14,
        color: '#6B7280',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginTop: 4,
    },
    cartButton: {
        position: 'relative',
        padding: 8,
    },
    cartIcon: {
        fontSize: 28,
    },
    badge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#EF4444',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    listContent: {
        padding: 16,
    },
    row: {
        justifyContent: 'space-between',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        fontSize: 16,
        color: '#6B7280',
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },
});

export default ProductsScreen;
