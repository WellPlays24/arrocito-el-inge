import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    RefreshControl,
    Alert,
    TouchableOpacity,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import productsService from '../services/productsService';
import ProductCard from '../components/ProductCard';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';

const ProductsScreen = ({ navigation }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { addToCart } = useCart();
    const { isAdmin, user } = useAuth();

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

    const handleDeleteProduct = (product) => {
        Alert.alert(
            'Confirmar Eliminación',
            `¿Estás seguro de que deseas eliminar "${product.name}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await productsService.deleteProduct(product.id);
                            Alert.alert('Éxito', 'Producto eliminado correctamente');
                            loadProducts();
                        } catch (error) {
                            Alert.alert('Error', 'No se pudo eliminar el producto');
                        }
                    }
                }
            ]
        );
    };

    const handleEditProduct = (product) => {
        navigation.navigate('EditProduct', { productId: product.id });
    };

    // ADMIN VIEW
    const renderAdminProductItem = ({ item }) => (
        <View style={styles.adminProductCard}>
            <Image
                source={{ uri: item.image_url || 'https://via.placeholder.com/80' }}
                style={styles.adminProductImage}
            />
            <View style={styles.adminProductInfo}>
                <Text style={styles.adminProductName}>{item.name}</Text>
                <Text style={styles.adminProductPrice}>${parseFloat(item.price).toFixed(2)}</Text>
                <Text style={styles.adminProductStock}>Stock: {item.stock || 0}</Text>
            </View>
            <View style={styles.adminProductActions}>
                <TouchableOpacity
                    style={[styles.adminActionButton, styles.editButton]}
                    onPress={() => handleEditProduct(item)}
                >
                    <Text style={styles.adminActionButtonText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.adminActionButton, styles.deleteButton]}
                    onPress={() => handleDeleteProduct(item)}
                >
                    <Text style={styles.adminActionButtonText}>🗑️</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderAdminHeader = () => (
        <View style={styles.adminHeader}>
            <Text style={styles.adminTitle}>Gestión de Productos</Text>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddProduct')}
            >
                <Text style={styles.addButtonText}>➕ Agregar</Text>
            </TouchableOpacity>
        </View>
    );

    // CUSTOMER VIEW
    const renderCustomerHeader = () => {
        const now = new Date();

        // Format time
        const timeString = now.toLocaleTimeString('es-EC', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        // Format date
        const dateString = now.toLocaleDateString('es-EC', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        // Get first name only
        //const firstName = user?.name?.split(' ')[0] || 'Cliente';

        return (
            <View style={styles.header}>
                <View style={styles.greetingContainer}>
                    <Text style={styles.greeting}>¡Hola, {user.name}! 👋</Text>
                    <Text style={styles.dateTime}>{dateString}</Text>
                    <Text style={styles.time}>{timeString}</Text>
                </View>
                <Text style={styles.title}>¿Qué te gustaría ordenar?</Text>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centered}>
                    <Text style={styles.loadingText}>Cargando productos...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // ADMIN VIEW
    if (isAdmin()) {
        return (
            <SafeAreaView style={styles.container}>
                {renderAdminHeader()}
                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderAdminProductItem}
                    contentContainerStyle={styles.adminListContent}
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
    }

    // CUSTOMER VIEW
    return (
        <SafeAreaView style={styles.container}>
            {renderCustomerHeader()}
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
    // Customer styles
    header: {
        flexDirection: 'column',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    greetingContainer: {
        marginBottom: 12,
    },
    greeting: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    dateTime: {
        fontSize: 13,
        color: '#6B7280',
        textTransform: 'capitalize',
    },
    time: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 2,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4B5563',
    },
    listContent: {
        padding: 16,
    },
    row: {
        justifyContent: 'space-between',
    },
    // Admin styles
    adminHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    adminTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    addButton: {
        backgroundColor: '#10B981',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    adminListContent: {
        padding: 16,
    },
    adminProductCard: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        alignItems: 'center',
    },
    adminProductImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    adminProductInfo: {
        flex: 1,
        marginLeft: 12,
    },
    adminProductName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    adminProductPrice: {
        fontSize: 14,
        color: '#FF6B00',
        fontWeight: '600',
        marginBottom: 2,
    },
    adminProductStock: {
        fontSize: 12,
        color: '#6B7280',
    },
    adminProductActions: {
        flexDirection: 'row',
        gap: 8,
    },
    adminActionButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editButton: {
        backgroundColor: '#3B82F6',
    },
    deleteButton: {
        backgroundColor: '#EF4444',
    },
    adminActionButtonText: {
        fontSize: 18,
    },
    // Common styles
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
