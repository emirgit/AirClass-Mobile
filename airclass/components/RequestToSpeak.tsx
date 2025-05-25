import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useWebSocket } from "../hooks/useWebSocket";
import { MarkAttendance } from "./MarkAttendance";

interface RequestToSpeakProps {
    studentId: string;
    onRequestAccepted: () => void;
}

// Mock data for request status
interface RequestStatus {
    status: "pending" | "accepted" | "rejected";
    timestamp: string;
    position?: number;
    estimatedWaitTime?: string;
}

export function RequestToSpeak({
    studentId,
    onRequestAccepted,
}: RequestToSpeakProps) {
    const [isRequestSent, setIsRequestSent] = useState(false);
    const [requestStatus, setRequestStatus] = useState<RequestStatus | null>(
        null
    );
    const { sendMessage } = useWebSocket();

    // Simulate request status updates
    useEffect(() => {
        if (isRequestSent && !requestStatus) {
            setRequestStatus({
                status: "accepted",
                timestamp: new Date().toISOString(),
            });
            onRequestAccepted();
        }
    }, [isRequestSent, requestStatus, onRequestAccepted]);

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
                <>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleRequest}
                    >
                        <Text style={styles.buttonText}>Request to Speak</Text>
                    </TouchableOpacity>
                    <MarkAttendance />
                </>
            ) : (
                <View style={styles.feedbackContainer}>
                    {requestStatus?.status === "pending" ? (
                        <>
                            <Text style={styles.feedbackText}>
                                Request Pending
                            </Text>
                            <Text style={styles.statusText}>
                                Position in queue: {requestStatus.position}
                            </Text>
                            <Text style={styles.statusText}>
                                Estimated wait time:{" "}
                                {requestStatus.estimatedWaitTime}
                            </Text>
                        </>
                    ) : (
                        <Text style={styles.feedbackText}>
                            Request Accepted
                        </Text>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        gap: 12,
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
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
        gap: 8,
    },
    feedbackText: {
        color: "#1E40AF",
        fontSize: 16,
        fontWeight: "500",
    },
    statusText: {
        color: "#3B82F6",
        fontSize: 14,
    },
});
