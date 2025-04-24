import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useWebSocket } from "../hooks/useWebSocket";

interface RequestToSpeakProps {
    studentId: string;
    onRequestAccepted: () => void;
}

export function RequestToSpeak({
    studentId,
    onRequestAccepted,
}: RequestToSpeakProps) {
    const [isRequestSent, setIsRequestSent] = useState(false);
    const { sendMessage } = useWebSocket();

    const handleRequest = () => {
        sendMessage({
            type: "speakRequest",
            studentId,
        });
        setIsRequestSent(true);
    };

    return (
        <View style={styles.container}>
            {!isRequestSent ? (
                <TouchableOpacity style={styles.button} onPress={handleRequest}>
                    <Text style={styles.buttonText}>Request to Speak</Text>
                </TouchableOpacity>
            ) : (
                <View style={styles.feedbackContainer}>
                    <Text style={styles.feedbackText}>Request Sent</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    button: {
        backgroundColor: "#2563EB",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    feedbackContainer: {
        backgroundColor: "#EFF6FF",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    feedbackText: {
        color: "#1E40AF",
        fontSize: 16,
        fontWeight: "500",
    },
});
