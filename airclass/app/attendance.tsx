import React, { useState, useEffect } from "react";
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
    StyleSheet,
    Alert,
} from "react-native";
import { useWebSocket } from "../hooks/useWebSocket";

export default function AttendanceScreen() {
    const [studentId, setStudentId] = useState("");
    const { sendMessage, isConnected } = useWebSocket();

    const handleSubmit = () => {
        if (!studentId.trim()) {
            Alert.alert("Error", "Please enter a student ID");
            return;
        }

        if (!isConnected) {
            Alert.alert("Error", "Not connected to server");
            return;
        }

        sendMessage({
            type: "attendance",
            studentId: studentId.trim(),
        });

        Alert.alert("Success", "Attendance marked successfully");
        setStudentId("");
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Enter Student ID"
                value={studentId}
                onChangeText={setStudentId}
                keyboardType="numeric"
            />
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Submit Attendance</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: "center",
        backgroundColor: "#fff",
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 20,
        fontSize: 16,
    },
    button: {
        backgroundColor: "#007AFF",
        height: 50,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
