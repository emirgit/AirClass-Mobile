import React, { useState, useEffect, useRef } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Modal,
    Alert,
} from "react-native";
import { useWebSocket } from "../hooks/useWebSocket";
import { Camera, CameraView } from "expo-camera";

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
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [requestStatus, setRequestStatus] = useState<RequestStatus | null>(
        null
    );
    const lastScannedCode = useRef<string | null>(null);
    const { sendMessage } = useWebSocket();

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === "granted");
        })();
    }, []);

    // !! Simulate request status updates
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;

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

    const handleBarcodeScanned = ({ data }: { data: string }) => {
        // Prevent scanning the same code multiple times
        if (lastScannedCode.current === data) {
            return;
        }

        lastScannedCode.current = data;
        setIsCameraOpen(false);
        // Here you would typically send the QR code data to your API
        console.log("QR Code scanned:", data);
    };

    const handleOpenCamera = async () => {
        if (hasPermission === null) {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === "granted");
        }

        if (hasPermission === false) {
            Alert.alert(
                "Camera Permission Required",
                "Please grant camera permission to scan QR codes",
                [{ text: "OK" }]
            );
            return;
        }

        lastScannedCode.current = null;
        setIsCameraOpen(true);
    };

    if (hasPermission === null) {
        return null;
    }

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
                    <TouchableOpacity
                        style={[styles.button, styles.attendanceButton]}
                        onPress={handleOpenCamera}
                    >
                        <Text style={styles.buttonText}>Mark Attendance</Text>
                    </TouchableOpacity>
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

            <Modal visible={isCameraOpen} animationType="slide">
                <View style={styles.cameraContainer}>
                    {hasPermission && (
                        <CameraView
                            style={styles.camera}
                            onBarcodeScanned={handleBarcodeScanned}
                            barcodeScannerSettings={{
                                barcodeTypes: ["qr"],
                            }}
                        />
                    )}
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => {
                            setIsCameraOpen(false);
                            lastScannedCode.current = null;
                        }}
                    >
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
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
    attendanceButton: {
        backgroundColor: "#059669",
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
    cameraContainer: {
        flex: 1,
        backgroundColor: "black",
    },
    camera: {
        flex: 1,
    },
    closeButton: {
        position: "absolute",
        top: 40,
        right: 20,
        backgroundColor: "rgba(0,0,0,0.6)",
        padding: 12,
        borderRadius: 8,
    },
    closeButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
