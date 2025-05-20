import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Microsoft OAuth configuration
const MICROSOFT_CLIENT_ID = 'b22ce890-eb6e-470c-8e1c-3943ba81726b';
const TENANT_ID = '066690f2-a8a6-4889-852e-124371dcbd6f';
const REDIRECT_URI = 'http://localhost:8081/classroom';
const SCOPES = 'user.read mail.read';
const MICROSOFT_AUTH_URL = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize?client_id=${MICROSOFT_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}&prompt=select_account`;

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const validateGTUEmail = (email: string) => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return false;
        }
        
        if (!email.includes('@')) {
            Alert.alert('Invalid Email', 'Please enter a valid email address');
            return false;
        }

        if (!email.toLowerCase().endsWith('@gtu.edu.tr')) {
            Alert.alert('Invalid Email', 'Please use your GTU email address (@gtu.edu.tr)');
            return false;
        }

        return true;
    };

    const getUserInfo = async (accessToken: string) => {
        try {
            console.log('Fetching user info with token:', accessToken.substring(0, 20) + '...');
            
            if (!accessToken) {
                throw new Error('No access token provided');
            }

            const response = await fetch('https://graph.microsoft.com/v1.0/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`Failed to fetch user info: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            console.log('User data received:', JSON.stringify(data, null, 2));
            
            if (!data || !data.userPrincipalName) {
                throw new Error('Invalid user data received from Microsoft Graph API');
            }

            return data;
        } catch (error) {
            console.error('Error in getUserInfo:', error);
            throw error;
        }
    };

    const handleLogin = async () => {
        if (!validateGTUEmail(email)) {
            return;
        }

        setIsLoading(true);
        try {
            console.log('Starting authentication process with email:', email);
            
            await WebBrowser.maybeCompleteAuthSession();
            
            const result = await WebBrowser.openAuthSessionAsync(
                MICROSOFT_AUTH_URL,
                'http://localhost:8081/classroom',
                {
                    showInRecents: true,
                    preferEphemeralSession: false
                }
            );

            console.log('Auth session result:', JSON.stringify(result, null, 2));

            if (result.type === 'success') {
                const url = result.url;
                console.log('Success URL:', url);
                const code = url.split('code=')[1]?.split('&')[0];
                
                if (code) {
                    console.log('Authorization code received:', code.substring(0, 20) + '...');
                    
                    const tokenResponse = await fetch(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: new URLSearchParams({
                            client_id: MICROSOFT_CLIENT_ID,
                            scope: SCOPES,
                            code: code,
                            redirect_uri: REDIRECT_URI,
                            grant_type: 'authorization_code'
                        })
                    });

                    console.log('Token response status:', tokenResponse.status);
                    
                    if (!tokenResponse.ok) {
                        const errorText = await tokenResponse.text();
                        console.error('Token error response:', errorText);
                        Alert.alert('Error', 'Failed to get access token. Please try again.');
                        return;
                    }

                    const tokenData = await tokenResponse.json();
                    console.log('Token response data:', JSON.stringify(tokenData, null, 2));

                    if (!tokenData.access_token) {
                        console.error('No access token in response');
                        Alert.alert('Error', 'No access token received from Microsoft');
                        return;
                    }

                    console.log('Access token received:', tokenData.access_token.substring(0, 20) + '...');

                    try {
                        const userInfo = await getUserInfo(tokenData.access_token);
                        
                        if (!userInfo) {
                            throw new Error('No user info received');
                        }

                        await AsyncStorage.setItem('accessToken', tokenData.access_token);
                        await AsyncStorage.setItem('userEmail', userInfo.mail || userInfo.userPrincipalName);
                        await AsyncStorage.setItem('userName', userInfo.displayName);
                        
                        Alert.alert(
                            'Login Successful',
                            `Welcome ${userInfo.displayName}!\nEmail: ${userInfo.mail || userInfo.userPrincipalName}`
                        );
                        
                        router.replace('/(tabs)');
                    } catch (userInfoError) {
                        console.error('Error getting user info:', userInfoError);
                        Alert.alert('Error', 'Failed to get user information. Please try again.');
                    }
                } else {
                    console.error('No authorization code found in URL');
                    Alert.alert('Error', 'Failed to get authorization code');
                }
            } else {
                console.log('Auth failed:', result.type);
                Alert.alert('Error', 'Authentication failed. Please try again.');
            }
        } catch (error) {
            console.error('Auth error:', error);
            Alert.alert('Error', 'Authentication failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="auto" />
            <View style={styles.content}>
                <Text style={styles.title}>Welcome to AirClass</Text>
                <Text style={styles.subtitle}>Please login with your GTU email</Text>
                
                <TextInput
                    style={styles.input}
                    placeholder="Enter your GTU email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    editable={!isLoading}
                />

                <TouchableOpacity 
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Login with GTU</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 30,
    },
    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 20,
        fontSize: 16,
    },
    button: {
        width: '100%',
        height: 50,
        backgroundColor: '#007AFF',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
}); 