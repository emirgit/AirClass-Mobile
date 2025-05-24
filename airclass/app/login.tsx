import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        setIsLoading(true);
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            setIsLoading(false);
            return;
        }
        const userData = await AsyncStorage.getItem(`user:${email}`);
        if (!userData) {
            Alert.alert('Login Failed', 'User not found');
            setIsLoading(false);
            return;
        }
        const user = JSON.parse(userData);
        if (user.password !== password) {
            Alert.alert('Login Failed', 'Incorrect password');
            setIsLoading(false);
            return;
        }
        // Save session info
        await AsyncStorage.setItem('userEmail', user.email);
        await AsyncStorage.setItem('userName', user.name);
        Alert.alert('Login Successful', `Welcome ${user.name}!`);
        setIsLoading(false);
        router.replace('/classroom');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign In to AirClass</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Sign In</Text>
                )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.replace('/register')}>
                <Text style={styles.link}>Don't have an account? Register</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30 },
    input: { width: '100%', height: 50, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, marginBottom: 20, fontSize: 16 },
    button: { width: '100%', height: 50, backgroundColor: '#007AFF', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    link: { color: '#007AFF', marginTop: 20 }
});
