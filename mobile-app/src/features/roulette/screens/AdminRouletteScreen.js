import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Alert,
    TextInput,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../../services/api';
import rouletteService from '../services/rouletteService';

const AdminRouletteScreen = ({ navigation }) => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            const lower = searchQuery.toLowerCase();
            setFilteredUsers(
                users.filter(u =>
                    u.name.toLowerCase().includes(lower) ||
                    u.email.toLowerCase().includes(lower)
                )
            );
        } else {
            setFilteredUsers(users);
        }
    }, [searchQuery, users]);

    const loadUsers = async () => {
        try {
            const response = await api.get('/users');
            // Handle array or object response
            const allUsers = Array.isArray(response.data) ? response.data : response.data.users || [];
            const clients = allUsers.filter(u => u.role === 'client');
            setUsers(clients);
            setFilteredUsers(clients);
        } catch (error) {
            Alert.alert('Error', 'No se pudieron cargar los usuarios');
        } finally {
            setLoading(false);
        }
    };

    const handleGrantSpin = async (user) => {
        Alert.alert(
            'Vender Giro',
            `¿Confirmar venta de 1 giro a ${user.name} por $0.25?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    onPress: async () => {
                        try {
                            await rouletteService.grantSpin(user.id, 1);
                            Alert.alert('Éxito', 'Giro añadido correctamente');
                            // Recargar usuarios para ver contador actualizado (si el endpoint devolviera lista actualizada sería mejor, pero recargamos todo)
                            loadUsers();
                        } catch (error) {
                            Alert.alert('Error', error.message);
                        }
                    }
                }
            ]
        );
    };

    const renderUser = ({ item }) => (
        <View style={styles.userCard}>
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
                <Text style={styles.spinInfo}>
                    Giros extra: {item.extra_spins || 0}
                </Text>
            </View>
            <TouchableOpacity
                style={styles.grantButton}
                onPress={() => handleGrantSpin(item)}
            >
                <Text style={styles.grantButtonText}>+1 Giro ($0.25)</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#FF6B00" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Gestión Ruleta</Text>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar cliente..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <TouchableOpacity
                style={styles.prizesButton}
                onPress={() => navigation.navigate('PrizesManagement')}
            >
                <Text style={styles.prizesButtonText}>⚙️ Gestionar Premios</Text>
            </TouchableOpacity>

            <FlatList
                data={filteredUsers}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderUser}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No se encontraron clientes</Text>
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
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        marginRight: 16,
    },
    backButtonText: {
        fontSize: 24,
        color: '#1F2937',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    searchContainer: {
        padding: 16,
        backgroundColor: 'white',
    },
    searchInput: {
        backgroundColor: '#F3F4F6',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    listContent: {
        padding: 16,
    },
    userCard: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    userEmail: {
        fontSize: 14,
        color: '#6B7280',
    },
    spinInfo: {
        fontSize: 12,
        color: '#10B981',
        marginTop: 4,
        fontWeight: '500',
    },
    grantButton: {
        backgroundColor: '#FF6B00',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginLeft: 12,
    },
    grantButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#6B7280',
    },
    prizesButton: {
        backgroundColor: '#8B5CF6',
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    prizesButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default AdminRouletteScreen;
