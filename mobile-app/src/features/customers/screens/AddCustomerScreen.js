import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import customersService from '../services/customersService';
import { validarNombre } from '../../../../../shared/validators/validateName';
import { validarCedula } from '../../../../../shared/validators/validateCedula';

const AddCustomerScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        name: '',
        cedula: '',
        phone: '',
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const updateField = (field, value) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: null });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name) {
            newErrors.name = 'El nombre es obligatorio';
        } else if (!validarNombre(formData.name)) {
            newErrors.name = 'Ingresa nombre y apellido válidos';
        }

        if (!formData.cedula) {
            newErrors.cedula = 'La cédula es obligatoria';
        } else if (!validarCedula(formData.cedula)) {
            newErrors.cedula = 'Cédula ecuatoriana inválida';
        }

        if (!formData.phone) {
            newErrors.phone = 'El teléfono es obligatorio';
        }

        if (!formData.email) {
            newErrors.email = 'El email es obligatorio';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        if (!formData.password) {
            newErrors.password = 'La contraseña es obligatoria';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mínimo 6 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            await customersService.createCustomer(formData);
            Alert.alert('Éxito', 'Cliente creado correctamente', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Nuevo Cliente</Text>
                    <View style={styles.placeholder} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.form}>
                        {/* Name */}
                        <Text style={styles.label}>Nombre Completo *</Text>
                        <TextInput
                            style={[styles.input, errors.name && styles.inputError]}
                            placeholder="Ej: Juan Pérez"
                            placeholderTextColor="#9CA3AF"
                            value={formData.name}
                            onChangeText={(value) => updateField('name', value)}
                        />
                        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

                        {/* Cedula */}
                        <Text style={styles.label}>Cédula *</Text>
                        <TextInput
                            style={[styles.input, errors.cedula && styles.inputError]}
                            placeholder="0123456789"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                            maxLength={10}
                            value={formData.cedula}
                            onChangeText={(value) => updateField('cedula', value)}
                        />
                        {errors.cedula && <Text style={styles.errorText}>{errors.cedula}</Text>}

                        {/* Phone */}
                        <Text style={styles.label}>Teléfono *</Text>
                        <TextInput
                            style={[styles.input, errors.phone && styles.inputError]}
                            placeholder="0987654321"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="phone-pad"
                            value={formData.phone}
                            onChangeText={(value) => updateField('phone', value)}
                        />
                        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

                        {/* Email */}
                        <Text style={styles.label}>Correo Electrónico *</Text>
                        <TextInput
                            style={[styles.input, errors.email && styles.inputError]}
                            placeholder="ejemplo@correo.com"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={formData.email}
                            onChangeText={(value) => updateField('email', value)}
                        />
                        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                        {/* Password */}
                        <Text style={styles.label}>Contraseña *</Text>
                        <View style={[styles.passwordContainer, errors.password && styles.inputError]}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Mínimo 6 caracteres"
                                placeholderTextColor="#9CA3AF"
                                secureTextEntry={!showPassword}
                                value={formData.password}
                                onChangeText={(value) => updateField('password', value)}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeIcon}
                            >
                                <Text style={styles.eyeText}>
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>
                                {loading ? 'Creando...' : 'Crear Cliente'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    flex: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    placeholder: {
        width: 40,
    },
    scrollContent: {
        padding: 16,
    },
    form: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1F2937',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1F2937',
    },
    eyeIcon: {
        paddingRight: 12,
        paddingLeft: 8,
    },
    eyeText: {
        fontSize: 20,
    },
    inputError: {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    button: {
        backgroundColor: '#FF6B00',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 32,
    },
    buttonDisabled: {
        backgroundColor: '#FFB078',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default AddCustomerScreen;
