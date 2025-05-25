import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function ClassroomEntryScreen() {
    const router = useRouter();
    const [userInfo, setUserInfo] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [classCode, setClassCode] = useState("");

    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem("jwtToken");
            if (!token) {
                router.replace("/login");
                return;
            }
            try {
                const response = await fetch(
                    "http://localhost:5000/api/auth/me",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                if (!response.ok) {
                    router.replace("/login");
                    return;
                }
                const data = await response.json();
                setUserInfo(data.user);
            } catch (err) {
                router.replace("/login");
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, []);

    const handleEnterClass = () => {
        if (classCode.trim()) {
            router.push({
                pathname: "/classroom-interface",
                params: { code: classCode.trim() },
            });
        }
    };

    if (isLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {userInfo && (
                <Text style={styles.welcomeText}>
                    Welcome, {userInfo.name}!
                </Text>
            )}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Enter Class Code:</Text>
                <TextInput
                    style={styles.input}
                    value={classCode}
                    onChangeText={setClassCode}
                    placeholder="Enter your class code"
                    placeholderTextColor="#999"
                />
                <TouchableOpacity
                    style={[
                        styles.button,
                        !classCode.trim() && styles.buttonDisabled,
                    ]}
                    onPress={handleEnterClass}
                    disabled={!classCode.trim()}
                >
                    <Text style={styles.buttonText}>Enter Class</Text>
                </TouchableOpacity>
            </View>
            {/* Debug Info Section */}
            {userInfo && (
                <View style={styles.debugBox}>
                    <Text style={styles.debugTitle}>
                        [DEBUG] User Info from JWT:
                    </Text>
                    <Text selectable style={styles.debugText}>
                        Name: {userInfo.name}
                    </Text>
                    <Text selectable style={styles.debugText}>
                        Email: {userInfo.email}
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#1E3A8A",
        marginBottom: 30,
        textAlign: "center",
    },
    inputContainer: {
        width: "100%",
        maxWidth: 400,
        padding: 20,
    },
    label: {
        fontSize: 18,
        color: "#1E3A8A",
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: "#1E3A8A",
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        marginBottom: 20,
        backgroundColor: "#fff",
    },
    button: {
        backgroundColor: "#1E3A8A",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonDisabled: {
        backgroundColor: "#CBD5E1",
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    debugBox: {
        marginTop: 40,
        padding: 12,
        backgroundColor: "#f5f5f5",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ddd",
        width: "100%",
        maxWidth: 400,
    },
    debugTitle: {
        fontWeight: "bold",
        color: "#d97706",
        marginBottom: 4,
    },
    debugText: {
        fontSize: 14,
        color: "#334155",
    },
});
