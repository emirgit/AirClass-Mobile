import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Platform, Dimensions, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    const window = Dimensions.get('window');
    const isMobile = window.width < 700;

    useEffect(() => {
        const getUserInfoFromStorage = async () => {
            try {
                const userEmail = await AsyncStorage.getItem('userEmail');
                const userName = await AsyncStorage.getItem('userName');
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
        router.push('/attendance');
    };
    const handleLogin = async () => {
        setIsLoading(true);
        if (!userInfo?.email) {
            Alert.alert('Error', 'Please enter your email');
            setIsLoading(false);
            return;
        }
        try {
            const response = await fetch('http://159.89.19.111/airclass-api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: userInfo.email,
                    password: '000' // Placeholder password
                })
            });
            const data = await response.json();
            if (!response.ok) {
                Alert.alert('Login Failed', data.message || 'Unknown error');
                setIsLoading(false);
                return;
            }
            // Save JWT and user info if returned
            if (data.data && data.data.token) {
                await AsyncStorage.setItem('jwtToken', data.data.token);
                await AsyncStorage.setItem('userEmail', data.data.user.email);
                await AsyncStorage.setItem('userName', data.data.user.name);
            }
            Alert.alert('Login Successful', `Welcome ${data.data.user.name}!`);
            setIsLoading(false);
            router.replace('/classroom');
        } catch (err) {
            Alert.alert('Error', 'Network or server error');
            setIsLoading(false);
        }
    };
    const handleRegister = async () => {
        if (!userInfo?.email || !userInfo?.name) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        if (!userInfo.email.toLowerCase().endsWith('@gtu.edu.tr')) {
            Alert.alert('Invalid Email', 'Please use your GTU email address (@gtu.edu.tr)');
            return;
        }
        try {
            const response = await fetch('http://159.89.19.111/airclass-api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: userInfo.name,
                    email: userInfo.email,
                    password: '000', // Placeholder password
                    role: 'student'
                })
            });
            const data = await response.json();
            if (!response.ok) {
                Alert.alert('Registration Failed', data.message || 'Unknown error');
                return;
            }
            // Save JWT and user info if returned
            if (data.data && data.data.token) {
                await AsyncStorage.setItem('jwtToken', data.data.token);
                await AsyncStorage.setItem('userEmail', data.data.user.email);
                await AsyncStorage.setItem('userName', data.data.user.name);
            }
            Alert.alert('Registration Successful', 'You can now log in!');
            router.replace('/login');
        } catch (err) {
            Alert.alert('Error', 'Network or server error');
        }
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
            {/* Slide Section */}
            <View style={[
                styles.slideSection,
                isMobile && styles.slideSectionMobile,
                isExpanded && styles.slideSectionExpanded
            ]}>
                <TouchableOpacity style={styles.expandButton} onPress={() => setIsExpanded(!isExpanded)}>
                    <Text style={styles.expandButtonText}>{isExpanded ? 'Exit Fullscreen' : 'Expand Slide'}</Text>
                </TouchableOpacity>
                <Text style={[styles.title, isMobile && styles.titleMobile]}>Classroom: {code}</Text>
                <Text style={[styles.subtitle, isMobile && styles.subtitleMobile]}>Welcome, {userInfo?.name}!</Text>
                <View style={[
                    styles.slideBox,
                    isMobile && styles.slideBoxMobile,
                    isExpanded && styles.slideBoxExpanded
                ]}>
                    <Text style={[styles.slideTitle, isMobile && styles.slideTitleMobile]}>{slidesData[slideIndex].title}</Text>
                    <Text style={[styles.slideContent, isMobile && styles.slideContentMobile]}>{slidesData[slideIndex].content}</Text>
                </View>
                <View style={styles.slideNavRow}>
                    <TouchableOpacity style={[styles.navButton, slideIndex === 0 && styles.navButtonDisabled]} onPress={goToPrevSlide} disabled={slideIndex === 0}>
                        <Text style={styles.navButtonText}>{'<'}</Text>
                    </TouchableOpacity>
                    <Text style={styles.slideIndicator}>{slideIndex + 1} / {slidesData.length}</Text>
                    <TouchableOpacity style={[styles.navButton, slideIndex === slidesData.length - 1 && styles.navButtonDisabled]} onPress={goToNextSlide} disabled={slideIndex === slidesData.length - 1}>
                        <Text style={styles.navButtonText}>{'>'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {/* Side Section */}
            {!isExpanded && (
                <View style={[styles.sideSection, isMobile && styles.sideSectionMobile]}>
                    <TouchableOpacity style={[styles.sideButton, isMobile && styles.sideButtonMobile]} onPress={handleAttendance}>
                        <Text style={styles.sideButtonText}>Mark Attendance</Text>
                    </TouchableOpacity>
                    <RequestToSpeak
                        studentId={studentId}
                        onRequestAccepted={() => setIsRequestAccepted(true)}
                    />
                </View>
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
        flexDirection: 'row',
        backgroundColor: "#fff",
        padding: 20,
        alignItems: "flex-start",
        justifyContent: "center",
    },
    containerCol: {
        flexDirection: 'column',
        alignItems: 'stretch',
        padding: 10,
    },
    slideSection: {
        flex: 4,
        marginRight: 24,
        alignItems: 'center',
    },
    slideSectionMobile: {
        marginRight: 0,
        marginBottom: 24,
    },
    slideSectionExpanded: {
        flex: 1,
        marginRight: 0,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    sideSection: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    sideSectionMobile: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
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
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        padding: 36,
        marginBottom: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    slideBoxMobile: {
        width: '100%',
        minHeight: 180,
        padding: 18,
    },
    slideBoxExpanded: {
        width: '100%',
        minHeight: Dimensions.get('window').height * 0.6,
        padding: 24,
    },
    slideTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#1E293B',
    },
    slideTitleMobile: {
        fontSize: 18,
    },
    slideContent: {
        fontSize: 18,
        color: '#334155',
        textAlign: 'center',
    },
    slideContentMobile: {
        fontSize: 15,
    },
    slideNavRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    navButton: {
        backgroundColor: '#1E3A8A',
        padding: 10,
        borderRadius: 8,
        marginHorizontal: 16,
    },
    navButtonDisabled: {
        backgroundColor: '#CBD5E1',
    },
    navButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    slideIndicator: {
        fontSize: 16,
        color: '#64748B',
        fontWeight: '600',
    },
    sideButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginBottom: 24,
        alignItems: 'center',
    },
    sideButtonMobile: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        marginBottom: 0,
        marginRight: 12,
    },
    sideButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    expandButton: {
        alignSelf: 'flex-end',
        backgroundColor: '#1E3A8A',
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 10,
    },
    expandButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
}); 