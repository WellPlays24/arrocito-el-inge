import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    RefreshControl,
    TouchableOpacity,
    Alert,
    ScrollView,
    TextInput,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import ordersService from '../services/ordersService';
import productsService from '../../products/services/productsService';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';

const OrdersScreen = ({ navigation }) => {
    const { isAdmin } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('all');

    // Admin order creation states
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [notes, setNotes] = useState('');
    const [showUserPicker, setShowUserPicker] = useState(false);

    useEffect(() => {
        loadOrders();
        if (isAdmin()) {
            loadUsers();
            loadProducts();
        }
    }, [filter]);

    const loadOrders = async () => {
        try {
            const data = await ordersService.getOrders(
                filter !== 'all' ? { status: filter } : {}
            );
            setOrders(data);
        } catch (error) {
            Alert.alert('Error', error.message || 'No se pudieron cargar las órdenes');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const loadUsers = async () => {
        try {
            console.log('Loading users...');
            const response = await api.get('/users');
            console.log('Users response:', response.data);

            // Handle both array and object responses
            const usersData = Array.isArray(response.data) ? response.data : response.data.users || [];
            const customers = usersData.filter(u => u.role === 'client');

            console.log('Filtered customers:', customers);
            setUsers(customers);

            if (customers.length === 0) {
                Alert.alert('Aviso', 'No hay clientes registrados en el sistema');
            }
        } catch (error) {
            console.error('Error loading users:', error);
            console.error('Error details:', error.response?.data);
            Alert.alert('Error', 'No se pudieron cargar los clientes: ' + (error.response?.data?.message || error.message));
        }
    };

    const loadProducts = async () => {
        try {
            const data = await productsService.getProducts();
            setProducts(data);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadOrders();
    };

    const addProductToOrder = (product) => {
        const existing = selectedItems.find(item => item.productId === product.id);
        if (existing) {
            setSelectedItems(selectedItems.map(item =>
                item.productId === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setSelectedItems([...selectedItems, {
                productId: product.id,
                productName: product.name,
                price: product.price,
                quantity: 1,
                complements: []
            }]);
        }
    };

    const removeProductFromOrder = (productId) => {
        setSelectedItems(selectedItems.filter(item => item.productId !== productId));
    };

    const updateQuantity = (productId, delta) => {
        setSelectedItems(selectedItems.map(item => {
            if (item.productId === productId) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : item;
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const calculateTotal = () => {
        return selectedItems.reduce((sum, item) => {
            return sum + (parseFloat(item.price) * item.quantity);
        }, 0);
    };

    const handleCreateOrder = async () => {
        if (!selectedUserId) {
            Alert.alert('Error', 'Selecciona un cliente');
            return;
        }
        if (selectedItems.length === 0) {
            Alert.alert('Error', 'Agrega al menos un producto');
            return;
        }

        try {
            const orderData = {
                userId: selectedUserId,
                items: selectedItems.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    complements: item.complements
                })),
                paymentMethod,
                isCredit: paymentMethod === 'credit',
                notes
            };

            await ordersService.createOrder(orderData);
            Alert.alert('Éxito', 'Pedido creado correctamente');

            // Reset form
            setSelectedUserId('');
            setSelectedItems([]);
            setNotes('');
            setPaymentMethod('cash');

            // Reload orders
            loadOrders();
        } catch (error) {
            Alert.alert('Error', error.message || 'No se pudo crear el pedido');
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return '#10B981';
            case 'pending': return '#F59E0B';
            case 'cancelled': return '#EF4444';
            default: return '#6B7280';
        }
    };

    const getStatusText = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'Completada';
            case 'pending': return 'Pendiente';
            case 'cancelled': return 'Cancelada';
            default: return status;
        }
    };

    const formatCurrency = (amount) => {
        return `$${parseFloat(amount || 0).toFixed(2)}`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-EC', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const renderOrder = ({ item }) => (
        <TouchableOpacity
            style={styles.orderCard}
            onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
        >
            <View style={styles.orderHeader}>
                <View>
                    <Text style={styles.orderNumber}>Orden #{item.id}</Text>
                    <Text style={styles.orderDate}>{formatDate(item.created_at || item.createdAt)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {getStatusText(item.status)}
                    </Text>
                </View>
            </View>
            <View style={styles.orderBody}>
                <Text style={styles.customerName}>
                    Cliente: {item.user_name || 'N/A'}
                </Text>
                <Text style={styles.orderTotal}>{formatCurrency(item.total_amount)}</Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.centered}>
                    <Text style={styles.loadingText}>Cargando órdenes...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // ADMIN VIEW
    if (isAdmin()) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <ScrollView>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Gestión de Pedidos</Text>
                    </View>

                    {/* Create Order Section */}
                    <View style={styles.createSection}>
                        <Text style={styles.sectionTitle}>Crear Nuevo Pedido</Text>

                        {/* Customer Selector */}
                        <TouchableOpacity
                            style={styles.pickerButton}
                            onPress={() => setShowUserPicker(true)}
                        >
                            <Text style={styles.pickerButtonText}>
                                {selectedUserId
                                    ? users.find(u => u.id === selectedUserId)?.name || 'Seleccionar cliente'
                                    : 'Seleccionar cliente'}
                            </Text>
                        </TouchableOpacity>

                        {/* Product Selection */}
                        <Text style={styles.subsectionTitle}>Productos:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productsScroll}>
                            {products.map(product => (
                                <TouchableOpacity
                                    key={product.id}
                                    style={styles.productChip}
                                    onPress={() => addProductToOrder(product)}
                                >
                                    <Text style={styles.productChipText}>{product.name}</Text>
                                    <Text style={styles.productChipPrice}>${parseFloat(product.price).toFixed(2)}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Selected Items */}
                        {selectedItems.length > 0 && (
                            <View style={styles.selectedItemsSection}>
                                <Text style={styles.subsectionTitle}>Items Seleccionados:</Text>
                                {selectedItems.map(item => (
                                    <View key={item.productId} style={styles.selectedItem}>
                                        <View style={styles.selectedItemInfo}>
                                            <Text style={styles.selectedItemName}>{item.productName}</Text>
                                            <Text style={styles.selectedItemPrice}>
                                                ${parseFloat(item.price).toFixed(2)} x {item.quantity}
                                            </Text>
                                        </View>
                                        <View style={styles.quantityControls}>
                                            <TouchableOpacity
                                                style={styles.quantityButton}
                                                onPress={() => updateQuantity(item.productId, -1)}
                                            >
                                                <Text style={styles.quantityButtonText}>-</Text>
                                            </TouchableOpacity>
                                            <Text style={styles.quantityText}>{item.quantity}</Text>
                                            <TouchableOpacity
                                                style={styles.quantityButton}
                                                onPress={() => updateQuantity(item.productId, 1)}
                                            >
                                                <Text style={styles.quantityButtonText}>+</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.removeButton}
                                                onPress={() => removeProductFromOrder(item.productId)}
                                            >
                                                <Text style={styles.removeButtonText}>🗑️</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}

                                {/* Total */}
                                <View style={styles.totalRow}>
                                    <Text style={styles.totalLabel}>Total:</Text>
                                    <Text style={styles.totalAmount}>{formatCurrency(calculateTotal())}</Text>
                                </View>

                                {/* Payment Method */}
                                <View style={styles.paymentSection}>
                                    <Text style={styles.subsectionTitle}>Método de Pago:</Text>
                                    <View style={styles.paymentButtons}>
                                        <TouchableOpacity
                                            style={[styles.paymentButton, paymentMethod === 'cash' && styles.paymentButtonActive]}
                                            onPress={() => setPaymentMethod('cash')}
                                        >
                                            <Text style={[styles.paymentButtonText, paymentMethod === 'cash' && styles.paymentButtonTextActive]}>
                                                Efectivo
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.paymentButton, paymentMethod === 'credit' && styles.paymentButtonActive]}
                                            onPress={() => setPaymentMethod('credit')}
                                        >
                                            <Text style={[styles.paymentButtonText, paymentMethod === 'credit' && styles.paymentButtonTextActive]}>
                                                Crédito
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Notes */}
                                <TextInput
                                    style={styles.notesInput}
                                    placeholder="Notas (opcional)"
                                    value={notes}
                                    onChangeText={setNotes}
                                    multiline
                                />

                                {/* Create Button */}
                                <TouchableOpacity
                                    style={styles.createOrderButton}
                                    onPress={handleCreateOrder}
                                >
                                    <Text style={styles.createOrderButtonText}>Crear Pedido</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Orders List */}
                    <View style={styles.ordersListSection}>
                        <Text style={styles.sectionTitle}>Pedidos</Text>

                        {/* Filter Tabs */}
                        <View style={styles.filterTabs}>
                            <TouchableOpacity
                                style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
                                onPress={() => setFilter('all')}
                            >
                                <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
                                    Todas
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.filterTab, filter === 'pending' && styles.filterTabActive]}
                                onPress={() => setFilter('pending')}
                            >
                                <Text style={[styles.filterTabText, filter === 'pending' && styles.filterTabTextActive]}>
                                    Pendientes
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.filterTab, filter === 'completed' && styles.filterTabActive]}
                                onPress={() => setFilter('completed')}
                            >
                                <Text style={[styles.filterTabText, filter === 'completed' && styles.filterTabTextActive]}>
                                    Completadas
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Orders */}
                        {orders.map(order => (
                            <View key={order.id}>
                                {renderOrder({ item: order })}
                            </View>
                        ))}

                        {orders.length === 0 && (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyIcon}>📦</Text>
                                <Text style={styles.emptyText}>No hay órdenes</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>

                {/* User Picker Modal */}
                <Modal
                    visible={showUserPicker}
                    transparent
                    animationType="slide"
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Seleccionar Cliente</Text>
                            <ScrollView style={styles.userList}>
                                {users.map(user => (
                                    <TouchableOpacity
                                        key={user.id}
                                        style={styles.userItem}
                                        onPress={() => {
                                            setSelectedUserId(user.id);
                                            setShowUserPicker(false);
                                        }}
                                    >
                                        <Text style={styles.userName}>{user.name}</Text>
                                        <Text style={styles.userEmail}>{user.email}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setShowUserPicker(false)}
                            >
                                <Text style={styles.modalCloseButtonText}>Cerrar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        );
    }

    // CUSTOMER VIEW
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mis Órdenes</Text>
            </View>

            <View style={styles.filterTabs}>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
                    onPress={() => setFilter('all')}
                >
                    <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
                        Todas
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'pending' && styles.filterTabActive]}
                    onPress={() => setFilter('pending')}
                >
                    <Text style={[styles.filterTabText, filter === 'pending' && styles.filterTabTextActive]}>
                        Pendientes
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'completed' && styles.filterTabActive]}
                    onPress={() => setFilter('completed')}
                >
                    <Text style={[styles.filterTabText, filter === 'completed' && styles.filterTabTextActive]}>
                        Completadas
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={orders}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderOrder}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#FF6B00"
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>📦</Text>
                        <Text style={styles.emptyText}>No hay órdenes</Text>
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
    createSection: {
        backgroundColor: 'white',
        padding: 20,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    subsectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4B5563',
        marginTop: 12,
        marginBottom: 8,
    },
    pickerButton: {
        backgroundColor: '#F3F4F6',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    pickerButtonText: {
        fontSize: 16,
        color: '#1F2937',
    },
    productsScroll: {
        marginBottom: 16,
    },
    productChip: {
        backgroundColor: '#FF6B00',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    productChipText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
    productChipPrice: {
        color: 'white',
        fontSize: 12,
    },
    selectedItemsSection: {
        marginTop: 16,
    },
    selectedItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    selectedItemInfo: {
        flex: 1,
    },
    selectedItemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    selectedItemPrice: {
        fontSize: 12,
        color: '#6B7280',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    quantityButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    quantityText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        minWidth: 20,
        textAlign: 'center',
    },
    removeButton: {
        marginLeft: 8,
    },
    removeButtonText: {
        fontSize: 18,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    totalAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FF6B00',
    },
    paymentSection: {
        marginTop: 16,
    },
    paymentButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    paymentButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
    },
    paymentButtonActive: {
        backgroundColor: '#FF6B00',
    },
    paymentButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    paymentButtonTextActive: {
        color: 'white',
    },
    notesInput: {
        backgroundColor: '#F3F4F6',
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
        minHeight: 60,
        textAlignVertical: 'top',
    },
    createOrderButton: {
        backgroundColor: '#10B981',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
    },
    createOrderButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    ordersListSection: {
        backgroundColor: 'white',
        padding: 20,
    },
    filterTabs: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        gap: 8,
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
    },
    filterTabActive: {
        backgroundColor: '#FF6B00',
    },
    filterTabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    filterTabTextActive: {
        color: 'white',
    },
    listContent: {
        padding: 16,
    },
    orderCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    orderNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    orderDate: {
        fontSize: 12,
        color: '#6B7280',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    orderBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    customerName: {
        fontSize: 14,
        color: '#6B7280',
    },
    orderTotal: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF6B00',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '70%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    userList: {
        maxHeight: 300,
    },
    userItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    userEmail: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    modalCloseButton: {
        backgroundColor: '#EF4444',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
    },
    modalCloseButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default OrdersScreen;
