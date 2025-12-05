import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Modal,
    TextInput,
    ActivityIndicator,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import rouletteService from '../services/rouletteService';

const PrizesManagementScreen = ({ navigation }) => {
    const [prizes, setPrizes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingPrize, setEditingPrize] = useState(null);

    // Form state
    const [name, setName] = useState('');
    const [probability, setProbability] = useState('');
    const [color, setColor] = useState('#FF6B00');
    const [description, setDescription] = useState('');

    useEffect(() => {
        loadPrizes();
    }, []);

    const loadPrizes = async () => {
        try {
            const data = await rouletteService.getPrizes();
            setPrizes(data);
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (prize = null) => {
        if (prize) {
            setEditingPrize(prize);
            setName(prize.name);
            setProbability(prize.probability.toString());
            setColor(prize.color);
            setDescription(prize.description || '');
        } else {
            setEditingPrize(null);
            setName('');
            setProbability('');
            setColor('#FF6B00');
            setDescription('');
        }
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!name || !probability || !color) {
            Alert.alert('Error', 'Por favor completa todos los campos requeridos');
            return;
        }

        const prob = parseFloat(probability);
        if (isNaN(prob) || prob < 0 || prob > 1) {
            Alert.alert('Error', 'La probabilidad debe ser un número entre 0 y 1');
            return;
        }

        try {
            const prizeData = {
                name,
                probability: prob,
                color,
                description: description || null
            };

            if (editingPrize) {
                await rouletteService.updatePrize(editingPrize.id, prizeData);
                Alert.alert('Éxito', 'Premio actualizado correctamente');
            } else {
                await rouletteService.createPrize(prizeData);
                Alert.alert('Éxito', 'Premio creado correctamente');
            }

            setModalVisible(false);
            loadPrizes();
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleDelete = (prize) => {
        Alert.alert(
            'Eliminar Premio',
            `¿Estás seguro de eliminar "${prize.name}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await rouletteService.deletePrize(prize.id);
                            Alert.alert('Éxito', 'Premio eliminado');
                            loadPrizes();
                        } catch (error) {
                            Alert.alert('Error', error.message);
                        }
                    }
                }
            ]
        );
    };

    const handleToggleActive = async (prize) => {
        try {
            await rouletteService.updatePrize(prize.id, {
                is_active: !prize.is_active
            });
            loadPrizes();
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const renderPrize = ({ item }) => (
        <View style={styles.prizeCard}>
            <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
            <View style={styles.prizeInfo}>
                <Text style={styles.prizeName}>{item.name}</Text>
                <Text style={styles.prizeDescription}>{item.description || 'Sin descripción'}</Text>
                <Text style={styles.prizeProbability}>
                    Probabilidad: {(parseFloat(item.probability) * 100).toFixed(2)}%
                </Text>
                <Text style={[styles.prizeStatus, !item.is_active && styles.inactiveStatus]}>
                    {item.is_active ? 'Activo' : 'Inactivo'}
                </Text>
            </View>
            <View style={styles.prizeActions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleToggleActive(item)}
                >
                    <Text style={styles.actionButtonText}>
                        {item.is_active ? '🔴' : '🟢'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleOpenModal(item)}
                >
                    <Text style={styles.actionButtonText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDelete(item)}
                >
                    <Text style={styles.actionButtonText}>🗑️</Text>
                </TouchableOpacity>
            </View>
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
                <Text style={styles.title}>Gestión de Premios</Text>
            </View>

            <FlatList
                data={prizes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderPrize}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No hay premios configurados</Text>
                }
            />

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleOpenModal()}
            >
                <Text style={styles.addButtonText}>+ Añadir Premio</Text>
            </TouchableOpacity>

            {/* Modal for Create/Edit */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {editingPrize ? 'Editar Premio' : 'Nuevo Premio'}
                        </Text>

                        <ScrollView style={styles.formScroll}>
                            <Text style={styles.label}>Nombre *</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Ej: Postre Gratis"
                            />

                            <Text style={styles.label}>Probabilidad (0-1) *</Text>
                            <TextInput
                                style={styles.input}
                                value={probability}
                                onChangeText={setProbability}
                                placeholder="Ej: 0.15 (15%)"
                                keyboardType="decimal-pad"
                            />

                            <Text style={styles.label}>Color (Hex) *</Text>
                            <View style={styles.colorRow}>
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    value={color}
                                    onChangeText={setColor}
                                    placeholder="#FF6B00"
                                />
                                <View style={[styles.colorPreview, { backgroundColor: color }]} />
                            </View>

                            <Text style={styles.label}>Descripción</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Descripción del premio"
                                multiline
                                numberOfLines={3}
                            />
                        </ScrollView>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={handleSave}
                            >
                                <Text style={styles.saveButtonText}>Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    listContent: {
        padding: 16,
    },
    prizeCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    colorIndicator: {
        width: 8,
        height: '100%',
        borderRadius: 4,
        marginRight: 12,
    },
    prizeInfo: {
        flex: 1,
    },
    prizeName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    prizeDescription: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    prizeProbability: {
        fontSize: 12,
        color: '#10B981',
        fontWeight: '500',
    },
    prizeStatus: {
        fontSize: 10,
        color: '#10B981',
        marginTop: 4,
    },
    inactiveStatus: {
        color: '#EF4444',
    },
    prizeActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        padding: 8,
    },
    actionButtonText: {
        fontSize: 18,
    },
    addButton: {
        backgroundColor: '#FF6B00',
        margin: 16,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
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
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 20,
    },
    formScroll: {
        maxHeight: 400,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        backgroundColor: '#F3F4F6',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    colorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    colorPreview: {
        width: 40,
        height: 40,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    modalButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#F3F4F6',
    },
    saveButton: {
        backgroundColor: '#10B981',
    },
    cancelButtonText: {
        color: '#4B5563',
        fontWeight: '600',
    },
    saveButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default PrizesManagementScreen;
