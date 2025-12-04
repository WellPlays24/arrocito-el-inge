import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Easing,
    Alert,
    Dimensions,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import rouletteService from '../services/rouletteService';
import { useAuth } from '../../../context/AuthContext';

const { width } = Dimensions.get('window');
const WHEEL_SIZE = width * 0.8;

// Configuración de premios (debe coincidir con backend para colores/nombres)
const PRIZES = [
    { id: 1, name: 'Nada', color: '#EF4444' },
    { id: 2, name: 'Descuento de 0.50 ctvs', color: '#3B82F6' },
    { id: 3, name: 'Nada', color: '#10B981' },
    { id: 4, name: '50% Descuento', color: '#F59E0B' },
    { id: 5, name: 'Nada', color: '#8B5CF6' },
    { id: 6, name: 'Cola Gratis', color: '#3ccdbfff' },
    { id: 7, name: 'Nada', color: '#e76e4dff' },
];

const SEGMENT_ANGLE = 360 / PRIZES.length;

const RouletteScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [spinning, setSpinning] = useState(false);
    const [status, setStatus] = useState(null);
    const [result, setResult] = useState(null);

    const spinValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        loadStatus();
    }, []);

    const loadStatus = async () => {
        try {
            const data = await rouletteService.getSpinStatus();
            setStatus(data);
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSpin = async () => {
        if (spinning || !status?.canSpin) return;

        setSpinning(true);
        setResult(null);

        try {
            // 1. Llamar al backend para obtener el resultado
            const data = await rouletteService.spin();
            const prizeId = data.prize.id;
            const prizeIndex = PRIZES.findIndex(p => p.id === prizeId);

            // 2. Calcular rotación
            // Queremos que termine en el centro del segmento del premio
            // El ángulo final debe ser tal que el segmento esté arriba (o en el indicador)
            // Asumiendo indicador en 0 grados (arriba)

            // Ajuste: React Native coord system, 0 es derecha, 90 es abajo... 
            // Simplificación: Girar X vueltas completas + ángulo específico

            const randomRotations = 5 + Math.random() * 5; // 5 a 10 vueltas
            const anglePerSegment = 360 / PRIZES.length;

            // El índice 0 está en [0, anglePerSegment]
            // Para que el índice i quede en la flecha (digamos arriba, -90deg o 270deg),
            // necesitamos rotar el contenedor.

            // Vamos a hacerlo visualmente simple:
            // Cada premio ocupa un segmento.
            // Si el premio es el index 0, queremos que el segmento 0 esté en la flecha.

            const targetAngle = 360 * randomRotations - (prizeIndex * anglePerSegment);

            Animated.timing(spinValue, {
                toValue: targetAngle,
                duration: 4000,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }).start(() => {
                setSpinning(false);
                setResult(data.prize);
                setStatus(prev => ({
                    ...prev,
                    canSpin: data.remainingExtraSpins > 0,
                    extraSpins: data.remainingExtraSpins,
                    spunToday: true
                }));

                Alert.alert(
                    data.prize.id === 1 ? '¡Suerte para la próxima!' : '¡Felicidades!',
                    data.prize.id === 1
                        ? 'No ganaste nada esta vez, pero vuelve mañana.'
                        : `¡Ganaste: ${data.prize.name}!`
                );
            });

        } catch (error) {
            setSpinning(false);
            Alert.alert('Error', error.message);
        }
    };

    const spinInterpolate = spinValue.interpolate({
        inputRange: [0, 360],
        outputRange: ['0deg', '360deg'],
    });

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
                <Text style={styles.title}>Ruleta Ganadora 🎰</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.wheelContainer}>
                    {/* Indicador (Flecha) */}
                    <View style={styles.indicator} />

                    <Animated.View
                        style={[
                            styles.wheel,
                            { transform: [{ rotate: spinInterpolate }] }
                        ]}
                    >
                        {PRIZES.map((prize, index) => {
                            const rotate = `${index * SEGMENT_ANGLE}deg`;
                            return (
                                <View
                                    key={prize.id}
                                    style={[
                                        styles.segment,
                                        {
                                            backgroundColor: prize.color,
                                            transform: [
                                                { rotate: rotate },
                                                { translateX: WHEEL_SIZE / 4 } // Ajuste visual aproximado
                                            ]
                                        }
                                    ]}
                                >
                                    <Text style={styles.segmentText}>
                                        {prize.name}
                                    </Text>
                                </View>
                            );
                        })}
                    </Animated.View>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.infoText}>
                        {status?.extraSpins > 0
                            ? `Tienes ${status.extraSpins} giros extra`
                            : status?.spunToday
                                ? 'Ya giraste hoy. ¡Vuelve mañana!'
                                : '¡Tienes un giro gratis disponible!'}
                    </Text>

                    <TouchableOpacity
                        style={[
                            styles.spinButton,
                            (!status?.canSpin || spinning) && styles.spinButtonDisabled
                        ]}
                        onPress={handleSpin}
                        disabled={!status?.canSpin || spinning}
                    >
                        <Text style={styles.spinButtonText}>
                            {spinning ? 'Girando...' : 'GIRAR'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1F2937', // Fondo oscuro para resaltar
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    backButton: {
        marginRight: 16,
    },
    backButtonText: {
        color: 'white',
        fontSize: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    wheelContainer: {
        width: WHEEL_SIZE,
        height: WHEEL_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    wheel: {
        width: WHEEL_SIZE,
        height: WHEEL_SIZE,
        borderRadius: WHEEL_SIZE / 2,
        backgroundColor: 'white',
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 4,
        borderColor: '#FF6B00',
    },
    segment: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: WHEEL_SIZE,
        height: 2, // Usamos líneas o segmentos finos como referencia visual simple
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingRight: 20,
        // Nota: Crear segmentos de pastel perfectos con View es complejo.
        // Usamos una aproximación visual simple: líneas radiales con texto.
        // Para una ruleta real se necesitaría SVG o imágenes.
        // Aquí simplificamos: el fondo del segmento es el color, pero rotado.
        // Mejor enfoque simple: Un círculo con colores de fondo no es fácil sin SVG.
        // Vamos a usar un diseño simplificado: Círculo blanco con textos rotados.
    },
    segmentText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'black', // Contraste
        textAlign: 'right',
        width: WHEEL_SIZE / 2 - 20,
        position: 'absolute',
        left: - (WHEEL_SIZE / 2),
        top: -10,
    },
    indicator: {
        position: 'absolute',
        top: -20,
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 15,
        borderRightWidth: 15,
        borderBottomWidth: 30,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: 'white',
        zIndex: 10,
        transform: [{ rotate: '180deg' }]
    },
    infoContainer: {
        alignItems: 'center',
        padding: 20,
    },
    infoText: {
        color: 'white',
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
    },
    spinButton: {
        backgroundColor: '#FF6B00',
        paddingHorizontal: 40,
        paddingVertical: 16,
        borderRadius: 30,
        elevation: 5,
    },
    spinButtonDisabled: {
        backgroundColor: '#6B7280',
    },
    spinButtonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default RouletteScreen;
