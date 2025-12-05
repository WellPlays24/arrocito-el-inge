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
    ActivityIndicator,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import rouletteService from '../services/rouletteService';
import { useAuth } from '../../../context/AuthContext';

const { width } = Dimensions.get('window');
const WHEEL_SIZE = Math.min(width * 0.75, 300);

const RouletteScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [spinning, setSpinning] = useState(false);
    const [status, setStatus] = useState(null);
    const [result, setResult] = useState(null);
    const [prizes, setPrizes] = useState([]);

    const spinValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statusData, prizesData] = await Promise.all([
                rouletteService.getSpinStatus(),
                rouletteService.getPrizes()
            ]);
            setStatus(statusData);
            const activePrizes = prizesData.filter(p => p.is_active);
            setPrizes(activePrizes);
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSpin = async () => {
        if (spinning || !status?.canSpin || prizes.length === 0) return;

        setSpinning(true);
        setResult(null);

        try {
            const data = await rouletteService.spin();
            const prizeId = data.prize.id;
            const prizeIndex = prizes.findIndex(p => p.id === prizeId);

            if (prizeIndex === -1) {
                throw new Error('Premio no encontrado');
            }

            const randomRotations = 5 + Math.random() * 3;
            const anglePerSegment = 360 / prizes.length;
            const targetAngle = 360 * randomRotations - (prizeIndex * anglePerSegment) - (anglePerSegment / 2);

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

                setTimeout(() => {
                    const spinDate = new Date(data.spinDate);
                    const dateStr = spinDate.toLocaleDateString('es-EC', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                    const timeStr = spinDate.toLocaleTimeString('es-EC', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true
                    });

                    Alert.alert(
                        '🎉 ¡Resultado!',
                        `${data.prize.description || data.prize.name}\n\n📅 ${dateStr}\n🕐 ${timeStr}`,
                        [{ text: 'OK' }]
                    );
                }, 500);
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

    const renderWheelSegments = () => {
        if (prizes.length === 0) return null;

        const anglePerSegment = 360 / prizes.length;

        return prizes.map((prize, index) => {
            const rotation = index * anglePerSegment;

            return (
                <View
                    key={prize.id}
                    style={[
                        styles.segment,
                        {
                            backgroundColor: prize.color,
                            transform: [
                                { rotate: `${rotation}deg` },
                            ]
                        }
                    ]}
                />
            );
        });
    };

    const renderLegend = () => {
        if (prizes.length === 0) return null;

        return (
            <View style={styles.legendContainer}>
                <Text style={styles.legendTitle}>Premios:</Text>
                {prizes.map((prize) => (
                    <View key={prize.id} style={styles.legendItem}>
                        <View style={[styles.legendColor, { backgroundColor: prize.color }]} />
                        <Text style={styles.legendText} numberOfLines={1}>
                            {prize.name}
                        </Text>
                    </View>
                ))}
            </View>
        );
    };

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

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Indicator Arrow */}
                <View style={styles.indicatorContainer}>
                    <View style={styles.indicator} />
                </View>

                {/* Wheel */}
                <View style={styles.wheelContainer}>
                    <Animated.View
                        style={[
                            styles.wheel,
                            { transform: [{ rotate: spinInterpolate }] }
                        ]}
                    >
                        {renderWheelSegments()}
                    </Animated.View>

                    {/* Center Circle */}
                    <View style={styles.centerCircle}>
                        <Text style={styles.centerText}>🎰</Text>
                    </View>
                </View>

                {/* Legend */}
                {renderLegend()}

                {/* Info and Button */}
                <View style={styles.infoContainer}>

                    <View style={styles.statusCard}>
                        <Text style={styles.statusEmoji}>
                            {status?.canSpin ? '✨' : '⏰'}
                        </Text>
                        <Text style={styles.statusText}>
                            {status?.extraSpins > 0
                                ? `Tienes ${status.extraSpins} giro${status.extraSpins > 1 ? 's' : ''} extra`
                                : status?.spunToday
                                    ? 'Ya giraste hoy\n¡Vuelve mañana!'
                                    : '¡Tienes un giro gratis!'}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.spinButton,
                            (!status?.canSpin || spinning) && styles.spinButtonDisabled
                        ]}
                        onPress={handleSpin}
                        disabled={!status?.canSpin || spinning}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.spinButtonText}>
                            {spinning ? '🎲 GIRANDO...' : '🎲 GIRAR AHORA'}
                        </Text>
                    </TouchableOpacity>

                    {result && (
                        <View style={styles.resultCard}>
                            <Text style={styles.resultLabel}>Último premio:</Text>
                            <Text style={styles.resultText}>{result.name}</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingTop: 10,
    },
    backButton: {
        marginRight: 16,
        padding: 8,
    },
    backButtonText: {
        color: 'white',
        fontSize: 28,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
    },
    scrollContent: {
        alignItems: 'center',
        paddingBottom: 40,
    },
    indicatorContainer: {
        marginTop: 20,
        marginBottom: -30,
        zIndex: 10,
    },
    indicator: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 20,
        borderRightWidth: 20,
        borderTopWidth: 40,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#FFD700',
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 10,
    },
    wheelContainer: {
        width: WHEEL_SIZE,
        height: WHEEL_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    wheel: {
        width: WHEEL_SIZE,
        height: WHEEL_SIZE,
        borderRadius: WHEEL_SIZE / 2,
        shadowColor: '#FF6B00',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
        backgroundColor: '#1E293B',
        borderWidth: 8,
        borderColor: '#FFD700',
        overflow: 'hidden',
    },
    segment: {
        position: 'absolute',
        width: WHEEL_SIZE / 2,
        height: WHEEL_SIZE,
        left: WHEEL_SIZE / 2,
        top: 0,
        transformOrigin: 'left center',
        borderLeftWidth: 2,
        borderLeftColor: 'rgba(255, 255, 255, 0.3)',
    },
    legendContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        width: width - 40,
    },
    legendTitle: {
        color: '#FFD700',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    legendColor: {
        width: 20,
        height: 20,
        borderRadius: 4,
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    legendText: {
        color: 'white',
        fontSize: 13,
        flex: 1,
    },
    centerCircle: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFD700',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    centerText: {
        fontSize: 28,
    },
    infoContainer: {
        alignItems: 'center',
        paddingHorizontal: 20,
        width: '100%',
    },
    statusCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        width: '100%',
    },
    statusEmoji: {
        fontSize: 40,
        marginBottom: 10,
    },
    statusText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '600',
    },
    spinButton: {
        backgroundColor: '#FF6B00',
        paddingHorizontal: 50,
        paddingVertical: 18,
        borderRadius: 50,
        shadowColor: '#FF6B00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 8,
        width: '100%',
        alignItems: 'center',
    },
    spinButtonDisabled: {
        backgroundColor: '#475569',
        shadowColor: '#000',
    },
    spinButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    resultCard: {
        marginTop: 20,
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#10B981',
        width: '100%',
    },
    resultLabel: {
        color: '#10B981',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
    },
    resultText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default RouletteScreen;
