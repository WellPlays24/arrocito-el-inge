import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const DateRangePicker = ({ startDate, endDate, onStartDateChange, onEndDateChange }) => {
    const formatDateForDisplay = (dateString) => {
        if (!dateString) return 'Seleccionar';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-EC', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const getTodayString = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const getYesterdayString = () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toISOString().split('T')[0];
    };

    const getWeekAgoString = () => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return weekAgo.toISOString().split('T')[0];
    };

    const setToday = () => {
        const today = getTodayString();
        onStartDateChange(today);
        onEndDateChange(today);
    };

    const setYesterday = () => {
        const yesterday = getYesterdayString();
        onStartDateChange(yesterday);
        onEndDateChange(yesterday);
    };

    const setLast7Days = () => {
        const weekAgo = getWeekAgoString();
        const today = getTodayString();
        onStartDateChange(weekAgo);
        onEndDateChange(today);
    };

    const clearDates = () => {
        onStartDateChange('');
        onEndDateChange('');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Filtrar por fecha:</Text>

            <View style={styles.quickFilters}>
                <TouchableOpacity style={styles.quickButton} onPress={setToday}>
                    <Text style={styles.quickButtonText}>Hoy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickButton} onPress={setYesterday}>
                    <Text style={styles.quickButtonText}>Ayer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickButton} onPress={setLast7Days}>
                    <Text style={styles.quickButtonText}>Últimos 7 días</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.clearButton} onPress={clearDates}>
                    <Text style={styles.clearButtonText}>Limpiar</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.dateInfo}>
                <Text style={styles.dateInfoText}>
                    {startDate && endDate
                        ? `${formatDateForDisplay(startDate)} - ${formatDateForDisplay(endDate)}`
                        : 'Todas las fechas'}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 12,
    },
    quickFilters: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    quickButton: {
        backgroundColor: '#FF6B00',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    quickButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    clearButton: {
        backgroundColor: '#6B7280',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    clearButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    dateInfo: {
        marginTop: 12,
        padding: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
    },
    dateInfoText: {
        fontSize: 13,
        color: '#1F2937',
        textAlign: 'center',
    },
});

export default DateRangePicker;
