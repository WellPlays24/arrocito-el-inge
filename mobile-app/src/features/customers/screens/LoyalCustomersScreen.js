import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    Image,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import customersService from '../services/customersService';

const LoyalCustomersScreen = ({ navigation }) => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        try {
            const data = await customersService.getLoyalCustomers();
            setCustomers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const formatCurrency = (amount) => {
        return `$${parseFloat(amount || 0).toFixed(2)}`;
    };

    const renderPodium = () => {
        if (customers.length < 3) return null;

        const [first, second, third] = customers;

        return (
            <View style={styles.podiumContainer}>
                {/* Second Place */}
                <View style={[styles.podiumItem, styles.podiumSecond]}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>{second.name.charAt(0)}</Text>
                        <View style={[styles.badge, { backgroundColor: '#C0C0C0' }]}>
                            <Text style={styles.badgeText}>2</Text>
                        </View>
                    </View>
                    <Text style={styles.podiumName} numberOfLines={1}>{second.name}</Text>
                    <Text style={styles.podiumOrders}>{second.completed_orders_count} pedidos</Text>
                    <View style={[styles.podiumBar, { height: 80, backgroundColor: '#C0C0C0' }]} />
                </View>

                {/* First Place */}
                <View style={[styles.podiumItem, styles.podiumFirst]}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>{first.name.charAt(0)}</Text>
                        <View style={[styles.badge, { backgroundColor: '#FFD700' }]}>
                            <Text style={styles.badgeText}>1</Text>
                        </View>
                    </View>
                    <Text style={styles.podiumName} numberOfLines={1}>{first.name}</Text>
                    <Text style={styles.podiumOrders}>{first.completed_orders_count} pedidos</Text>
                    <View style={[styles.podiumBar, { height: 110, backgroundColor: '#FFD700' }]} />
                </View>

                {/* Third Place */}
                <View style={[styles.podiumItem, styles.podiumThird]}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>{third.name.charAt(0)}</Text>
                        <View style={[styles.badge, { backgroundColor: '#CD7F32' }]}>
                            <Text style={styles.badgeText}>3</Text>
                        </View>
                    </View>
                    <Text style={styles.podiumName} numberOfLines={1}>{third.name}</Text>
                    <Text style={styles.podiumOrders}>{third.completed_orders_count} pedidos</Text>
                    <View style={[styles.podiumBar, { height: 60, backgroundColor: '#CD7F32' }]} />
                </View>
            </View>
        );
    };

    const renderItem = ({ item, index }) => {
        // Skip top 3 if we have enough data for podium
        if (customers.length >= 3 && index < 3) return null;

        return (
            <View style={styles.listItem}>
                <View style={styles.rankContainer}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemEmail}>{item.email}</Text>
                </View>
                <View style={styles.itemStats}>
                    <Text style={styles.itemOrders}>{item.completed_orders_count} pedidos</Text>
                    <Text style={styles.itemTotal}>{formatCurrency(item.total_spent)}</Text>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <ActivityIndicator size="large" color="#FF6B00" style={{ marginTop: 50 }} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Clientes Fieles 🏆</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={customers}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <>
                        {customers.length >= 3 ? renderPodium() : null}
                        <Text style={styles.listTitle}>Top 10 Clientes</Text>
                    </>
                }
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#FF6B00"
                    />
                }
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No hay datos suficientes aún.</Text>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        fontSize: 24,
        color: '#1F2937',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    listContent: {
        paddingBottom: 20,
    },
    podiumContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingTop: 30,
        paddingBottom: 20,
        backgroundColor: 'white',
        marginBottom: 10,
    },
    podiumItem: {
        alignItems: 'center',
        width: '30%',
    },
    podiumFirst: {
        zIndex: 2,
        marginBottom: 0,
    },
    podiumSecond: {
        marginRight: -10,
        zIndex: 1,
    },
    podiumThird: {
        marginLeft: -10,
        zIndex: 1,
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        position: 'relative',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#6B7280',
    },
    badge: {
        position: 'absolute',
        bottom: -5,
        right: -5,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: 'white',
    },
    podiumName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
        textAlign: 'center',
    },
    podiumOrders: {
        fontSize: 10,
        color: '#6B7280',
        marginBottom: 4,
    },
    podiumBar: {
        width: '100%',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 10,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        marginHorizontal: 20,
        marginBottom: 8,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    rankContainer: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    rankText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#6B7280',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    itemEmail: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    itemStats: {
        alignItems: 'flex-end',
    },
    itemOrders: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FF6B00',
    },
    itemTotal: {
        fontSize: 12,
        color: '#6B7280',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#9CA3AF',
    },
});

export default LoyalCustomersScreen;
