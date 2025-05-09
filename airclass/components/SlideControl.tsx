import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useWebSocket } from "../hooks/useWebSocket";
import { Ionicons } from "@expo/vector-icons";

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
                <Ionicons name="chevron-back" size={32} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button]} onPress={handleNext}>
                <Ionicons name="chevron-forward" size={32} color="#fff" />
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
        backgroundColor: "#F3F4F6",
        borderRadius: 12,
        marginHorizontal: 16,
    },
    button: {
        flex: 1,
        backgroundColor: "#2563EB",
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
});
