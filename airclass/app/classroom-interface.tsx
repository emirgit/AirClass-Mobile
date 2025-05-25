import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Platform,
    Dimensions,
    Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { RequestToSpeak } from "../components/RequestToSpeak";

const slidesData = [
    { title: "Welcome", content: "Welcome to the class!" },
    { title: "Agenda", content: "Today's agenda: ..." },
    { title: "Topic 1", content: "Let's discuss topic 1." },
    { title: "Q&A", content: "Any questions?" },
];

export default function ClassroomInterfaceScreen() {
    const { code } = useLocalSearchParams<{ code: string }>();
    const [isRequestAccepted, setIsRequestAccepted] = useState(false);
    const [studentId] = useState("STUDENT123"); // This should come from your auth system
    const [userInfo, setUserInfo] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [slideIndex, setSlideIndex] = useState(0);
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);

    // Responsive logic
    const window = Dimensions.get("window");
    const isMobile = window.width < 700;

    useEffect(() => {
        const getUserInfoFromStorage = async () => {
            try {
                const userEmail = await AsyncStorage.getItem("userEmail");
                const userName = await AsyncStorage.getItem("userName");
                if (userEmail && userName) {
                    setUserInfo({ email: userEmail, name: userName });
                }
            } catch (error) {
                // ignore
            } finally {
                setIsLoading(false);
            }
        };
        getUserInfoFromStorage();
    }, []);

    const goToPrevSlide = () => {
        setSlideIndex((prev) => Math.max(prev - 1, 0));
    };
    const goToNextSlide = () => {
        setSlideIndex((prev) => Math.min(prev + 1, slidesData.length - 1));
    };
    const handleAttendance = () => {
        router.push("/attendance");
    };

    if (isLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={[styles.containerRow, isMobile && styles.containerCol]}>
            {/* Main Content Section */}
            <View style={styles.mainContent}>
                {/* Slide Section */}
                <View
                    style={[
                        styles.slideSection,
                        isMobile && styles.slideSectionMobile,
                        isExpanded && styles.slideSectionExpanded,
                    ]}
                >
                    <View style={styles.expandButtonContainer}>
                        <TouchableOpacity
                            style={styles.expandButton}
                            onPress={() => setIsExpanded(!isExpanded)}
                            activeOpacity={0.7}
                            hitSlop={{
                                top: 10,
                                bottom: 10,
                                left: 10,
                                right: 10,
                            }}
                        >
                            <Text style={styles.expandButtonText}>
                                {isExpanded
                                    ? "Exit Fullscreen"
                                    : "Expand Slide"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <Text
                        style={[styles.title, isMobile && styles.titleMobile]}
                    >
                        Classroom: {code}
                    </Text>
                    <Text
                        style={[
                            styles.subtitle,
                            isMobile && styles.subtitleMobile,
                        ]}
                    >
                        Welcome, {userInfo?.name}!
                    </Text>
                    <View
                        style={[
                            styles.slideBox,
                            isMobile && styles.slideBoxMobile,
                            isExpanded && styles.slideBoxExpanded,
                        ]}
                    >
                        <Text
                            style={[
                                styles.slideTitle,
                                isMobile && styles.slideTitleMobile,
                            ]}
                        >
                            {slidesData[slideIndex].title}
                        </Text>
                        <Text
                            style={[
                                styles.slideContent,
                                isMobile && styles.slideContentMobile,
                            ]}
                        >
                            {slidesData[slideIndex].content}
                        </Text>
                    </View>
                    <View style={styles.slideNavRow}>
                        <TouchableOpacity
                            style={[
                                styles.navButton,
                                slideIndex === 0 && styles.navButtonDisabled,
                            ]}
                            onPress={goToPrevSlide}
                            disabled={slideIndex === 0}
                        >
                            <Text style={styles.navButtonText}>{"<"}</Text>
                        </TouchableOpacity>
                        <Text style={styles.slideIndicator}>
                            {slideIndex + 1} / {slidesData.length}
                        </Text>
                        <TouchableOpacity
                            style={[
                                styles.navButton,
                                slideIndex === slidesData.length - 1 &&
                                    styles.navButtonDisabled,
                            ]}
                            onPress={goToNextSlide}
                            disabled={slideIndex === slidesData.length - 1}
                        >
                            <Text style={styles.navButtonText}>{">"}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Side Section - Only render when not expanded */}
                {!isExpanded && (
                    <View
                        style={[
                            styles.sideSection,
                            isMobile && styles.sideSectionMobile,
                        ]}
                    >
                        <RequestToSpeak
                            studentId={studentId}
                            onRequestAccepted={() => setIsRequestAccepted(true)}
                        />
                    </View>
                )}
            </View>
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
    containerRow: {
        flex: 1,
        flexDirection: "row",
        backgroundColor: "#fff",
        padding: 20,
        alignItems: "flex-start",
        justifyContent: "center",
    },
    containerCol: {
        flexDirection: "column",
        alignItems: "stretch",
        padding: 10,
    },
    mainContent: {
        flex: 1,
        flexDirection: "row",
        position: "relative",
    },
    slideSection: {
        flex: 4,
        marginRight: 24,
        alignItems: "center",
        position: "relative",
    },
    slideSectionMobile: {
        marginRight: 0,
        marginBottom: 24,
    },
    slideSectionExpanded: {
        flex: 1,
        marginRight: 0,
        width: "100%",
        zIndex: 1,
    },
    sideSection: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        zIndex: 2,
    },
    sideSectionMobile: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 0,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1E3A8A",
        marginBottom: 8,
        textAlign: "center",
    },
    titleMobile: {
        fontSize: 20,
    },
    subtitle: {
        fontSize: 16,
        color: "#64748B",
        textAlign: "center",
        marginBottom: 24,
    },
    subtitleMobile: {
        fontSize: 14,
        marginBottom: 16,
    },
    slideBox: {
        width: 500,
        minHeight: 260,
        backgroundColor: "#f8fafc",
        borderRadius: 16,
        padding: 36,
        marginBottom: 28,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    slideBoxMobile: {
        width: "100%",
        minHeight: 180,
        padding: 18,
    },
    slideBoxExpanded: {
        width: "100%",
        minHeight: Dimensions.get("window").height * 0.6,
        padding: 24,
    },
    slideTitle: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#1E293B",
    },
    slideTitleMobile: {
        fontSize: 18,
    },
    slideContent: {
        fontSize: 18,
        color: "#334155",
        textAlign: "center",
    },
    slideContentMobile: {
        fontSize: 15,
    },
    slideNavRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
    },
    navButton: {
        backgroundColor: "#1E3A8A",
        padding: 10,
        borderRadius: 8,
        marginHorizontal: 16,
    },
    navButtonDisabled: {
        backgroundColor: "#CBD5E1",
    },
    navButtonText: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
    },
    slideIndicator: {
        fontSize: 16,
        color: "#64748B",
        fontWeight: "600",
    },
    expandButtonContainer: {
        width: "100%",
        alignItems: "flex-end",
        marginBottom: 10,
        position: "relative",
        zIndex: 3,
    },
    expandButton: {
        backgroundColor: "#1E3A8A",
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    expandButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
});
