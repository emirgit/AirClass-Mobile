import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { RequestToSpeak } from "../components/RequestToSpeak";
import { SlideControl } from "../components/SlideControl";

export default function ClassroomScreen() {
    const { code } = useLocalSearchParams<{ code: string }>();
    const [isRequestAccepted, setIsRequestAccepted] = useState(false);
    const [studentId] = useState("STUDENT123"); // This should come from your auth system

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Classroom: {code}</Text>
            <Text style={styles.subtitle}>
                Welcome to your virtual classroom!
            </Text>

            {!isRequestAccepted ? (
                <RequestToSpeak
                    studentId={studentId}
                    onRequestAccepted={() => setIsRequestAccepted(true)}
                />
            ) : (
                <SlideControl />
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
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1E3A8A",
        marginBottom: 8,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: "#64748B",
        textAlign: "center",
        marginBottom: 32,
    },
});
