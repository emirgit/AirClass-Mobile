import React from "react";
import { View, TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { useWebSocket } from "../hooks/useWebSocket";
import { Ionicons } from "@expo/vector-icons";

export function SlideControl({ rotate = false, small = false, style }: { rotate?: boolean, small?: boolean, style?: ViewStyle }) {
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
        <View style={[styles.container, rotate && { transform: [{ rotate: '90deg' }] }, style]}> 
            <TouchableOpacity style={[styles.button, small && styles.buttonSmall]} onPress={handlePrevious}>
                <Ionicons name="chevron-back" size={small ? 20 : 32} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, small && styles.buttonSmall]} onPress={handleNext}>
                <Ionicons name="chevron-forward" size={small ? 20 : 32} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
        backgroundColor: "#F3F4F6",
        borderRadius: 12,
        marginHorizontal: 16,
        marginVertical: 8,
        padding: 8,
    },
    button: {
        backgroundColor: "#2563EB",
        paddingVertical: 12,
        paddingHorizontal: 18,
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
    buttonSmall: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 6,
    },
});
