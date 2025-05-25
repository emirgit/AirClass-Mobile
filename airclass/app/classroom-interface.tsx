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
<<<<<<< Updated upstream
    AppState,
=======
    ScrollView,
>>>>>>> Stashed changes
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { RequestToSpeak } from "../components/RequestToSpeak";
import * as ScreenOrientation from 'expo-screen-orientation';
import { SlideControl } from "../components/SlideControl";

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
    const scrollViewRef = React.useRef<ScrollView>(null);

    // Responsive logic
    const window = Dimensions.get("window");
    const isMobile = window.width < 700;
    const isLandscape = window.width > window.height;

    // Add leave classroom function
    const leaveClassroom = async () => {
        try {
            const token = await AsyncStorage.getItem("jwtToken");
            if (!token) return;

            // Call the leave endpoint
            const response = await fetch(
                "http://159.89.19.111/airclass-api/classroom/leave",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();
            console.log("Leave classroom response:", data);

            // Clear classroom data from storage regardless of API response
            await AsyncStorage.removeItem("code");
            await AsyncStorage.removeItem("classroomId");
        } catch (error) {
            console.error("Error leaving classroom:", error);
            // Still try to clear storage even if API call fails
            try {
                await AsyncStorage.removeItem("code");
                await AsyncStorage.removeItem("classroomId");
            } catch (storageError) {
                console.error("Error clearing classroom data:", storageError);
            }
        }
    };

    // Handle app state changes - only when app is closed
    useEffect(() => {
        const subscription = AppState.addEventListener(
            "change",
            (nextAppState) => {
                if (nextAppState === "background") {
                    // Only leave when app goes to background (closed)
                    leaveClassroom();
                }
            }
        );

        return () => {
            subscription.remove();
        };
    }, []);

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

    useEffect(() => {
        if (isMobile) {
            if (isExpanded) {
                // Lock to landscape orientation when expanded
                ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
            } else {
                // Allow all orientations when not expanded
                ScreenOrientation.unlockAsync();
            }
        }
    }, [isExpanded, isMobile]);

    const goToPrevSlide = () => {
        setSlideIndex((prev) => Math.max(prev - 1, 0));
        if (isMobile && scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ x: (slideIndex - 1) * window.width, animated: true });
        }
    };

    const goToNextSlide = () => {
        setSlideIndex((prev) => Math.min(prev + 1, slidesData.length - 1));
        if (isMobile && scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ x: (slideIndex + 1) * window.width, animated: true });
        }
    };

    const handleScroll = (event: any) => {
        const contentOffset = event.nativeEvent.contentOffset.x;
        const newIndex = Math.round(contentOffset / window.width);
        if (newIndex !== slideIndex) {
            setSlideIndex(newIndex);
        }
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
            <View style={[styles.mainContent, isMobile && styles.mainContentMobile]}>
                {/* Slide Section */}
                <View
                    style={[
                        styles.slideSection,
                        isMobile && styles.slideSectionMobile,
                        isExpanded && styles.slideSectionExpanded,
                        isMobile && isExpanded && { 
                            position: 'absolute', 
                            top: 0, 
                            left: 0, 
                            width: '100%', 
                            height: '100%', 
                            zIndex: 1000, 
                            backgroundColor: '#f8fafc'
                        },
                    ]}
                >
                    <View style={styles.expandButtonContainer}>
                        {!isExpanded && (
                            <TouchableOpacity
                                style={styles.expandButton}
                                onPress={() => setIsExpanded(true)}
                                activeOpacity={0.7}
                                hitSlop={{
                                    top: 10,
                                    bottom: 10,
                                    left: 10,
                                    right: 10,
                                }}
                            >
                                <Text style={styles.expandButtonText}>Expand Slide</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    {/* Slides Section */}
                    {isMobile && isExpanded ? (
                        <View
                            style={{
                                flex: 1,
                                width: '100%',
                                height: '100%',
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: '#f8fafc',
                            }}
                        >
                            {/* Slide Content Container */}
                            <View
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    position: 'relative',
                                }}
                            >
                                {/* Exit Fullscreen Button */}
                                <TouchableOpacity
                                    style={[styles.expandedExitButton]}
                                    onPress={() => setIsExpanded(false)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.expandButtonText]}>Exit Fullscreen</Text>
                                </TouchableOpacity>
                                
                                {/* Left Navigation Button */}
                                <TouchableOpacity
                                    style={[
                                        styles.expandedNavButton,
                                        styles.expandedLeftNavButton,
                                        slideIndex === 0 && styles.navButtonDisabled
                                    ]}
                                    onPress={goToPrevSlide}
                                    disabled={slideIndex === 0}
                                >
                                    <Text style={styles.expandedNavButtonText}>{'<'}</Text>
                                </TouchableOpacity>
                                
                                <View style={{
                                    width: '90%',
                                    height: '85%',
                                    backgroundColor: '#fff',
                                    borderRadius: 24,
                                    padding: 32,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.08,
                                    shadowRadius: 4,
                                    elevation: 2,
                                }}>
                                    <Text style={{ 
                                        fontSize: 32,
                                        fontWeight: 'bold', 
                                        color: '#1E293B', 
                                        textAlign: 'center', 
                                        marginBottom: 20
                                    }}>
                                        {slidesData[slideIndex].title}
                                    </Text>
                                    <Text style={{ 
                                        fontSize: 24,
                                        color: '#334155', 
                                        textAlign: 'center' 
                                    }}>
                                        {slidesData[slideIndex].content}
                                    </Text>
                                </View>
                                
                                {/* Right Navigation Button */}
                                <TouchableOpacity
                                    style={[
                                        styles.expandedNavButton,
                                        styles.expandedRightNavButton,
                                        slideIndex === slidesData.length - 1 && styles.navButtonDisabled
                                    ]}
                                    onPress={goToNextSlide}
                                    disabled={slideIndex === slidesData.length - 1}
                                >
                                    <Text style={styles.expandedNavButtonText}>{'>'}</Text>
                                </TouchableOpacity>
                                
                                {/* Slide indicator for expanded mode */}
                                <View style={styles.expandedSlideIndicatorContainer}>
                                    <Text style={styles.expandedSlideIndicator}>
                                        {slideIndex + 1} / {slidesData.length}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ) : (
                        // Normal mode content
                        <View style={styles.slideContainer}>
                            {/* Left Navigation Button */}
                            <TouchableOpacity
                                style={[
                                    styles.horizontalNavButton,
                                    styles.leftNavButton,
                                    slideIndex === 0 && styles.navButtonDisabled
                                ]}
                                onPress={goToPrevSlide}
                                disabled={slideIndex === 0}
                            >
                                <Text style={styles.horizontalNavButtonText}>{'<'}</Text>
                            </TouchableOpacity>
                            
                            {/* Slide Content */}
                            <View
                                style={[
                                    styles.slideBox,
                                    isMobile && styles.slideBoxMobile,
                                    isExpanded && !isMobile && styles.slideBoxExpanded,
                                    { alignSelf: 'center' },
                                ]}
                            >
                                <Text style={isMobile ? styles.slideTitleMobile : styles.slideTitle}>
                                    {slidesData[slideIndex].title}
                                </Text>
                                <Text style={isMobile ? styles.slideContentMobile : styles.slideContent}>
                                    {slidesData[slideIndex].content}
                                </Text>
                            </View>
                            
                            {/* Right Navigation Button */}
                            <TouchableOpacity
                                style={[
                                    styles.horizontalNavButton,
                                    styles.rightNavButton,
                                    slideIndex === slidesData.length - 1 && styles.navButtonDisabled
                                ]}
                                onPress={goToNextSlide}
                                disabled={slideIndex === slidesData.length - 1}
                            >
                                <Text style={styles.horizontalNavButtonText}>{'>'}</Text>
                            </TouchableOpacity>
                            
                            {/* Slide indicator below */}
                            <View style={styles.slideIndicatorContainer}>
                                <Text style={styles.slideIndicator}>
                                    {slideIndex + 1} / {slidesData.length}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Side Section - Only render on desktop/tablet and not expanded */}
                {!isMobile && !isExpanded && (
                    <View style={styles.sideSection}>
                        <RequestToSpeak
                            studentId={studentId}
                            onRequestAccepted={() => setIsRequestAccepted(true)}
                        />
                    </View>
                )}
            </View>

            {/* Bottom Buttons - Only show in portrait mode when not expanded */}
            {isMobile && !isExpanded && (
                <View style={styles.bottomButtonsContainer}>
                    <RequestToSpeak
                        studentId={studentId}
                        onRequestAccepted={() => setIsRequestAccepted(true)}
                    />
                </View>
            )}

            {/* Classroom code and welcome text - only show in normal mode */}
            {!isExpanded && (
                <>
                    <Text style={[styles.title, isMobile && styles.titleMobile]}>
                        Classroom: {code}
                    </Text>
                    <Text style={[styles.subtitle, isMobile && styles.subtitleMobile]}>
                        Welcome, {userInfo?.name}!
                    </Text>
                </>
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
        padding: 16,
    },
    mainContent: {
        flex: 1,
        flexDirection: "row",
        position: "relative",
    },
    mainContentMobile: {
        flex: 1,
        flexDirection: 'column',
        paddingBottom: 100, // Space for bottom buttons
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
        paddingTop: 8,
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
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1E3A8A",
        marginBottom: 8,
        textAlign: "center",
    },
    titleMobile: {
        fontSize: 22,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: "#64748B",
        textAlign: "center",
        marginBottom: 24,
    },
    subtitleMobile: {
        fontSize: 15,
        marginBottom: 20,
        color: "#475569",
    },
    slidesScrollView: {
        flex: 1,
        width: "100%",
        marginTop: 8,
    },
    slidesScrollViewExpanded: {
        marginTop: 0,
        height: "100%",
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
        minHeight: 200,
        padding: 24,
        marginHorizontal: 16,
        backgroundColor: "#ffffff",
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    slideBoxExpanded: {
        width: "100%",
        minHeight: Dimensions.get("window").height * 0.6,
        padding: 24,
    },
    slideBoxExpandedMobile: {
        minHeight: Dimensions.get("window").height * 0.8,
        marginHorizontal: 16,
        padding: 32,
        backgroundColor: "#ffffff",
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    slideTitle: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#1E293B",
    },
    slideTitleMobile: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 12,
        color: "#1E293B",
        textAlign: "center",
    },
    slideTitleExpandedMobile: {
        fontSize: 28,
        marginBottom: 20,
    },
    slideContent: {
        fontSize: 18,
        color: "#334155",
        textAlign: "center",
    },
    slideContentMobile: {
        fontSize: 16,
        color: "#475569",
        textAlign: "center",
        lineHeight: 24,
    },
    slideContentExpandedMobile: {
        fontSize: 20,
        lineHeight: 32,
        color: "#334155",
    },
    slideNavRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 16,
        paddingHorizontal: 16,
    },
    navButton: {
        backgroundColor: "#1E3A8A",
        padding: 12,
        borderRadius: 12,
        marginHorizontal: 16,
        minWidth: 48,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
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
        fontSize: 15,
        color: "#64748B",
        fontWeight: "600",
        backgroundColor: "#F1F5F9",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    expandButtonContainer: {
        width: "100%",
        alignItems: "flex-end",
        marginBottom: 12,
        position: "relative",
        zIndex: 3,
        paddingHorizontal: 16,
    },
    expandButton: {
        backgroundColor: "#1E3A8A",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    expandButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    bottomButtonsContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    bottomButton: {
        backgroundColor: '#1E3A8A',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        minWidth: 140,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    // New styles for landscape navigation
    landscapeNavButton: {
        backgroundColor: 'rgba(30, 58, 138, 0.9)',
        padding: 10,
        borderRadius: 20,
        minWidth: 40,
        minHeight: 40,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    landscapeNavLeft: {
        left: 20,
    },
    landscapeNavRight: {
        right: 20,
    },
    landscapeSlideIndicator: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Add these new styles for horizontal navigation
    slideContainer: {
        position: 'relative',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 25,
    },
    horizontalNavButton: {
        position: 'absolute',
        backgroundColor: "#1E3A8A",
        height: 40,
        width: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
        zIndex: 10,
    },
    leftNavButton: {
        left: 0,
    },
    rightNavButton: {
        right: 0,
    },
    horizontalNavButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    slideIndicatorContainer: {
        position: 'absolute',
        bottom: -20,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    expandedExitButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(30, 58, 138, 0.9)',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        zIndex: 101,
        elevation: 5,
    },
    expandedNavButton: {
        position: 'absolute',
        backgroundColor: 'rgba(30, 58, 138, 0.85)',
        height: 60,
        width: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 4,
        zIndex: 10,
        top: '50%',
        transform: [{ translateY: -30 }],
    },
    expandedLeftNavButton: {
        left: 20,
    },
    expandedRightNavButton: {
        right: 20,
    },
    expandedNavButtonText: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
    },
    expandedSlideIndicatorContainer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    expandedSlideIndicator: {
        fontSize: 16,
        color: '#64748B',
        fontWeight: '600',
        backgroundColor: 'rgba(241, 245, 249, 0.9)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
});