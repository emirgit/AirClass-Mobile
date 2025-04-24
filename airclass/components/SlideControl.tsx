import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useWebSocket } from "../hooks/useWebSocket";

export function SlideControl() {
    const { sendMessage } = useWebSocket();

    const handleNext = () => {
        sendMessage({
            type: "slideControl",
            command: "next",
        });
    };

    const handlePrevious = () => {
        sendMessage({
            type: "slideControl",
            command: "previous",
        });
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={[styles.button]} onPress={handlePrevious}>
                <Text style={styles.buttonText}>Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button]} onPress={handleNext}>
                <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 16,
        gap: 16,
    },
    button: {
        flex: 1,
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
});
