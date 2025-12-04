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
import authService from '../services/authService';
import { validarNombre } from '../../../../../shared/validators/validateName';
import { validarCedula } from '../../../../../shared/validators/validateCedula';

const RegisterScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        name: '',
        cedula: '',
        phone: '',
        dateOfBirth: '',
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const updateField = (field, value) => {
        setFormData({ ...formData, [field]: value });
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors({ ...errors, [field]: null });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Validar nombre usando la función compartida
        if (!formData.name) {
            newErrors.name = 'El nombre es obligatorio';
        } else if (!validarNombre(formData.name)) {
            newErrors.name = 'Ingresa nombre y apellido válidos (ej: Juan Pérez)';
        }

        // Validar cédula usando la función compartida
        if (formData.cedula && !validarCedula(formData.cedula)) {
            newErrors.cedula = 'Cédula ecuatoriana inválida';
        }

        // Validar email
        if (!formData.email) {
            newErrors.email = 'El email es obligatorio';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        // Validar password
        if (!formData.password) {
            newErrors.password = 'La contraseña es obligatoria';
        } else if (formData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const data = await authService.register(formData);
            Alert.alert('Éxito', 'Cuenta creada correctamente', [
                {
                    text: 'OK',
                    onPress: () => navigation.navigate('Login'),
                },
            ]);
        } catch (error) {
            Alert.alert('Error', error.message || 'No se pudo crear la cuenta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>Crear Cuenta 🦎</Text>
                        <Text style={styles.subtitle}>Completa tus datos para registrarte</Text>
                    </View>

                    <View style={styles.form}>
                        {/* Nombre */}
                        <Text style={styles.label}>Nombre Completo *</Text>
                        <TextInput
                            style={[styles.input, errors.name && styles.inputError]}
                            placeholder="Ej: Juan Pérez"
                            placeholderTextColor="#999"
                            value={formData.name}
                            onChangeText={(value) => updateField('name', value)}
                        />
                        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

                        {/* Cédula */}
                        <Text style={styles.label}>Cédula *</Text>
                        <TextInput
                            style={[styles.input, errors.cedula && styles.inputError]}
                            placeholder="0123456789"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                            maxLength={10}
                            value={formData.cedula}
                            onChangeText={(value) => updateField('cedula', value)}
                        />
                        {errors.cedula && <Text style={styles.errorText}>{errors.cedula}</Text>}

                        {/* Teléfono */}
                        <Text style={styles.label}>Teléfono *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0987654321"
                            placeholderTextColor="#999"
                            keyboardType="phone-pad"
                            value={formData.phone}
                            onChangeText={(value) => updateField('phone', value)}
                        />

                        {/* Email */}
                        <Text style={styles.label}>Correo Electrónico *</Text>
                        <TextInput
                            style={[styles.input, errors.email && styles.inputError]}
                            placeholder="ejemplo@correo.com"
                            placeholderTextColor="#999"
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
                                placeholderTextColor="#999"
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

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>
                                {loading ? 'Creando cuenta...' : 'Registrarse'}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.link}>Inicia sesión</Text>
                            </TouchableOpacity>
                        </View>
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
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FF6B00',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
    },
    form: {
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
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
        shadowColor: '#FF6B00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        backgroundColor: '#FFB078',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    footerText: {
        color: '#6B7280',
        fontSize: 14,
    },
    link: {
        color: '#FF6B00',
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default RegisterScreen;
