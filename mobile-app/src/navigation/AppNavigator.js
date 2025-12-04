import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../features/auth/screens/LoginScreen';
import RegisterScreen from '../features/auth/screens/RegisterScreen';
import OrderConfirmationScreen from '../features/orders/screens/OrderConfirmationScreen';
import OrderHistoryScreen from '../features/orders/screens/OrderHistoryScreen';
import OrderDetailScreen from '../features/orders/screens/OrderDetailScreen';
import AccountsPayableScreen from '../features/orders/screens/AccountsPayableScreen';
import DebtorsScreen from '../features/dashboard/screens/DebtorsScreen';
import AdminOrdersScreen from '../features/dashboard/screens/AdminOrdersScreen';
import AddProductScreen from '../features/products/screens/AddProductScreen';
import EditProductScreen from '../features/products/screens/EditProductScreen';
import CustomersScreen from '../features/customers/screens/CustomersScreen';
import AddCustomerScreen from '../features/customers/screens/AddCustomerScreen';
import EditCustomerScreen from '../features/customers/screens/EditCustomerScreen';
import LoyalCustomersScreen from '../features/customers/screens/LoyalCustomersScreen';
import RouletteScreen from '../features/roulette/screens/RouletteScreen';
import AdminRouletteScreen from '../features/roulette/screens/AdminRouletteScreen';
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

function MainStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#F9FAFB' },
            }}
        >
            <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
            <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
            <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
            <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
            <Stack.Screen name="AccountsPayable" component={AccountsPayableScreen} />
            <Stack.Screen name="Debtors" component={DebtorsScreen} />
            <Stack.Screen name="AdminOrders" component={AdminOrdersScreen} />
            <Stack.Screen name="AddProduct" component={AddProductScreen} />
            <Stack.Screen name="EditProduct" component={EditProductScreen} />
            <Stack.Screen name="Customers" component={CustomersScreen} />
            <Stack.Screen name="AddCustomer" component={AddCustomerScreen} />
            <Stack.Screen name="EditCustomer" component={EditCustomerScreen} />
            <Stack.Screen name="LoyalCustomers" component={LoyalCustomersScreen} />
            <Stack.Screen name="Roulette" component={RouletteScreen} />
            <Stack.Screen name="AdminRoulette" component={AdminRouletteScreen} />
        </Stack.Navigator>
    );
}

export default function AppNavigator() {
    const { isAuthenticated } = useAuth();

    return (
        <NavigationContainer>
            {isAuthenticated() ? <MainStack /> : <AuthStack />}
        </NavigationContainer>
    );
}
