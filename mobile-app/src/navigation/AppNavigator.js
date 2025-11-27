import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../features/auth/screens/LoginScreen';
import RegisterScreen from '../features/auth/screens/RegisterScreen';
import BottomTabNavigator from './BottomTabNavigator';
import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator();

function AuthStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#F9FAFB' },
            }}
        >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
    );
}

export default function AppNavigator() {
    const { isAuthenticated } = useAuth();

    return (
        <NavigationContainer>
            {isAuthenticated() ? <BottomTabNavigator /> : <AuthStack />}
        </NavigationContainer>
    );
}
