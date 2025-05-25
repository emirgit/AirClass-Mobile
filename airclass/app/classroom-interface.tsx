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
    AppState,
    SafeAreaView,
    TextInput,
    FlatList,
    KeyboardAvoidingView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { RequestToSpeak } from "../components/RequestToSpeak";
import { Ionicons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';

// Theme type definition
type Theme = {
    primary: string;
    primaryLight: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textLight: string;
    border: string;
    success: string;
    error: string;
    warning: string;
    tabBarBg: string;
    messageSent: string;
    messageReceived: string;
    messageText: string;
    messageTime: string;
    inputBg: string;
    avatarBg: string;
    avatarText: string;
    selectedBg: string;
    white: string;
    slideIndicatorText: string;
};

// Theme colors
const LIGHT_THEME: Theme = {
    primary: '#4F46E5', // Indigo
    primaryLight: '#818CF8',
    secondary: '#7C3AED', // Purple
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#1E293B',
    textLight: '#64748B',
    border: '#E2E8F0',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    tabBarBg: '#FFFFFF',
    messageSent: '#4F46E5',
    messageReceived: '#F1F5F9',
    messageText: '#FFFFFF',
    messageTime: '#94A3B8',
    inputBg: '#F1F5F9',
    avatarBg: '#4F46E5',
    avatarText: '#FFFFFF',
    selectedBg: '#EEF2FF',
    white: '#FFFFFF',
    slideIndicatorText: '#1E293B',
};

const DARK_THEME: Theme = {
    primary: '#818CF8', // Lighter Indigo
    primaryLight: '#A5B4FC',
    secondary: '#A78BFA', // Lighter Purple
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F8FAFC',
    textLight: '#CBD5E1',
    border: '#334155',
    success: '#34D399',
    error: '#F87171',
    warning: '#FBBF24',
    tabBarBg: '#1E293B',
    messageSent: '#818CF8',
    messageReceived: '#334155',
    messageText: '#F8FAFC',
    messageTime: '#94A3B8',
    inputBg: '#334155',
    avatarBg: '#818CF8',
    avatarText: '#F8FAFC',
    selectedBg: '#1E3A8A',
    white: '#FFFFFF',
    slideIndicatorText: '#000000',
};

const slidesData = [
    { title: "Welcome", content: "Welcome to the class!" },
    { title: "Agenda", content: "Today's agenda: ..." },
    { title: "Topic 1", content: "Let's discuss topic 1." },
    { title: "Q&A", content: "Any questions?" },
];

// Add interfaces for our data types
interface Participant {
    id: number;
    student_name: string;
    student_email: string;
    user_id: number;
    attendance_session_id: number;
    classroom_code: string;
    classroom_id: number;
    teacher_id: number;
    teacher_name: string;
    attendance_date: string;
    attendance_code: string;
    created_at: string;
    updated_at: string;
}

interface Message {
    text: string;
    time: string;
    isSender: boolean;
}

interface AttendanceResponse {
    status: boolean;
    message: string;
    data: {
        total_students: number;
        attendance_list: Participant[];
    };
}

const createStyles = (COLORS: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    containerMobile: {
        padding: 16,
    },
    containerExpanded: {
        backgroundColor: COLORS.background,
    },
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerContent: {
        flex: 1,
    },
    classroomCode: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
    welcomeText: {
        fontSize: 14,
        color: COLORS.textLight,
        marginTop: 4,
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    themeButton: {
        backgroundColor: COLORS.inputBg,
        padding: 8,
        borderRadius: 12,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    expandButton: {
        backgroundColor: COLORS.primary,
        padding: 8,
        borderRadius: 12,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    mainContent: {
        flex: 1,
        flexDirection: 'row',
        padding: 24,
        position: 'relative',
    },
    mainContentMobile: {
        padding: 16,
        flexDirection: 'column',
    },
    mainContentExpanded: {
        padding: 0,
    },
    mainContentLandscape: {
        flexDirection: 'row',
        padding: 16,
    },
    slideSection: {
        flex: 4,
        marginRight: 24,
        width: '100%',
    },
    slideSectionMobile: {
        marginRight: 0,
        marginBottom: 24,
    },
    slideSectionExpanded: {
        flex: 1,
        marginRight: 0,
        padding: 16,
    },
    slideSectionLandscape: {
        flex: 3,
        marginRight: 16,
    },
    slideBox: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: 24,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        width: '100%',
        maxWidth: 800,
        alignSelf: 'center',
    },
    slideBoxExpanded: {
        flex: 1,
        justifyContent: 'center',
        padding: 32,
        maxWidth: '100%',
    },
    slideBoxLandscape: {
        minHeight: 250,
        padding: 20,
    },
    expandedHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    slideTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 16,
        textAlign: 'center',
    },
    slideTitleExpanded: {
        fontSize: 32,
        marginBottom: 24,
    },
    slideTitleLandscape: {
        fontSize: 22,
        marginBottom: 12,
    },
    slideContent: {
        fontSize: 16,
        color: COLORS.textLight,
        lineHeight: 24,
        textAlign: 'center',
    },
    slideContentExpanded: {
        fontSize: 20,
        lineHeight: 32,
    },
    slideContentLandscape: {
        fontSize: 16,
        lineHeight: 24,
    },
    slideNavContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 16,
        marginTop: 20,
    },
    slideNavContainerExpanded: {
        paddingHorizontal: 24,
    },
    slideNavContainerLandscape: {
        marginTop: 16,
        paddingHorizontal: 8,
    },
    navButton: {
        backgroundColor: COLORS.primary,
        padding: 10,
        borderRadius: 8,
        opacity: 0.9,
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    navButtonDisabled: {
        backgroundColor: COLORS.border,
        opacity: 0.5,
    },
    slideIndicator: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    slideIndicatorText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.slideIndicatorText,
    },
    sideSection: {
        flex: 1,
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: 400,
        alignSelf: 'center',
    },
    sideSectionMobile: {
        marginTop: 16,
        width: '100%',
    },
    sideSectionLandscape: {
        flex: 1,
        padding: 16,
        maxWidth: '100%',
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: COLORS.tabBarBg,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingBottom: Platform.OS === 'ios' ? 20 : 8,
        paddingTop: 8,
    },
    tabBarMobile: {
        paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    },
    tabBarLandscape: {
        paddingBottom: 8,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    tabLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.primary,
        marginTop: 4,
    },
    tabLabelInactive: {
        color: COLORS.textLight,
    },
    messagesContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: COLORS.background,
    },
    participantsList: {
        width: 280,
        borderRightWidth: 1,
        borderRightColor: COLORS.border,
        backgroundColor: COLORS.surface,
    },
    participantsListCollapsed: {
        width: 0,
        overflow: 'hidden',
    },
    participantsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.surface,
    },
    collapseButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: COLORS.inputBg,
    },
    menuButton: {
        padding: 8,
        marginRight: 12,
        borderRadius: 8,
        backgroundColor: COLORS.inputBg,
    },
    chatContainer: {
        flex: 1,
        backgroundColor: COLORS.surface,
    },
    chatHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.surface,
    },
    chatHeaderInfo: {
        flex: 1,
    },
    chatHeaderText: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
    },
    chatHeaderSubtext: {
        fontSize: 12,
        color: COLORS.textLight,
        marginTop: 2,
    },
    noChatSelected: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.surface,
    },
    noChatText: {
        marginTop: 16,
        fontSize: 16,
        color: COLORS.textLight,
        textAlign: 'center',
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 20,
        marginVertical: 4,
        marginHorizontal: 16,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    sentMessage: {
        backgroundColor: COLORS.messageSent,
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4,
    },
    receivedMessage: {
        backgroundColor: COLORS.messageReceived,
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 14,
    },
    sentMessageText: {
        color: COLORS.messageText,
    },
    receivedMessageText: {
        color: COLORS.text,
    },
    messageTime: {
        fontSize: 10,
        marginTop: 4,
    },
    sentMessageTime: {
        color: COLORS.messageText,
        opacity: 0.7,
    },
    receivedMessageTime: {
        color: COLORS.messageTime,
    },
    messageInputContainer: {
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        backgroundColor: COLORS.surface,
    },
    messageInput: {
        flex: 1,
        backgroundColor: COLORS.inputBg,
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginRight: 8,
        fontSize: 14,
        color: COLORS.text,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    tabLabelActive: {
        color: COLORS.primary,
    },
    filesContainer: {
        flex: 1,
        backgroundColor: COLORS.surface,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
    },
    participantItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    selectedParticipant: {
        backgroundColor: COLORS.selectedBg,
    },
    participantAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.avatarBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    avatarText: {
        color: COLORS.avatarText,
        fontSize: 18,
        fontWeight: '600',
    },
    participantInfo: {
        flex: 1,
    },
    participantName: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.text,
        marginBottom: 2,
    },
    participantEmail: {
        fontSize: 12,
        color: COLORS.textLight,
    },
});

export default function ClassroomInterfaceScreen() {
    const { code } = useLocalSearchParams<{ code: string }>();
    const [isRequestAccepted, setIsRequestAccepted] = useState(false);
    const [studentId] = useState("STUDENT123"); // This should come from your auth system
    const [userInfo, setUserInfo] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [slideIndex, setSlideIndex] = useState(0);
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);
    const [dimensions, setDimensions] = useState(Dimensions.get('window'));
    const [activeTab, setActiveTab] = useState('class');
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [classParticipants, setClassParticipants] = useState<Participant[]>([]);
    const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
    const [isParticipantsOpen, setIsParticipantsOpen] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const COLORS = isDarkMode ? DARK_THEME : LIGHT_THEME;
    const styles = createStyles(COLORS);

    // Handle orientation changes
    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            setDimensions(window);
        });

        return () => subscription?.remove();
    }, []);

    const isLandscape = dimensions.width > dimensions.height;
    const isMobile = dimensions.width < 700;

    // Handle orientation changes
    const handleExpand = async () => {
        if (!isExpanded) {
            // Lock to landscape when expanding
            await ScreenOrientation.lockAsync(
                ScreenOrientation.OrientationLock.LANDSCAPE
            );
        } else {
            // Unlock orientation when collapsing
            await ScreenOrientation.unlockAsync();
        }
        setIsExpanded(!isExpanded);
    };

    // Reset orientation when component unmounts
    useEffect(() => {
        return () => {
            ScreenOrientation.unlockAsync();
        };
    }, []);

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

    // Fetch class participants
    useEffect(() => {
        const fetchParticipants = async () => {
            try {
                const token = await AsyncStorage.getItem("jwtToken");
                if (!token) return;

                const response = await fetch(
                    `http://159.89.19.111/airclass-api/attendance?code=${code}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data: AttendanceResponse = await response.json();
                if (data.status && data.data?.attendance_list) {
                    setClassParticipants(data.data.attendance_list);
                    console.log(`Fetched ${data.data.total_students} students`);
                } else {
                    console.error("Failed to fetch participants:", data.message);
                }
            } catch (error) {
                console.error("Error fetching participants:", error);
            }
        };

        if (code) {
            fetchParticipants();
        }
    }, [code]);

    const goToPrevSlide = () => {
        setSlideIndex((prev) => Math.max(prev - 1, 0));
    };
    const goToNextSlide = () => {
        setSlideIndex((prev) => Math.min(prev + 1, slidesData.length - 1));
    };
    const handleAttendance = () => {
        router.push("/attendance");
    };

    const renderMessagesSection = () => (
        <View style={styles.messagesContainer}>
            {/* Participants Side Menu */}
            <View style={[
                styles.participantsList,
                !isParticipantsOpen && styles.participantsListCollapsed
            ]}>
                <View style={styles.participantsHeader}>
                    <Text style={styles.sectionTitle}>Class Participants</Text>
                    <TouchableOpacity 
                        style={styles.collapseButton}
                        onPress={() => setIsParticipantsOpen(!isParticipantsOpen)}
                    >
                        <Ionicons 
                            name={isParticipantsOpen ? "chevron-back" : "chevron-forward"} 
                            size={24} 
                            color={COLORS.textLight} 
                        />
                    </TouchableOpacity>
                </View>
                {isParticipantsOpen && (
                    <FlatList
                        data={classParticipants}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.participantItem,
                                    selectedParticipant?.id === item.id && styles.selectedParticipant
                                ]}
                                onPress={() => setSelectedParticipant(item)}
                            >
                                <View style={styles.participantAvatar}>
                                    <Text style={styles.avatarText}>
                                        {item.student_name.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <View style={styles.participantInfo}>
                                    <Text style={styles.participantName}>{item.student_name}</Text>
                                    <Text style={styles.participantEmail}>{item.student_email}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                )}
            </View>

            {/* Main Chat Area */}
            <View style={styles.chatContainer}>
                {selectedParticipant ? (
                    <>
                        <View style={styles.chatHeader}>
                            <TouchableOpacity 
                                style={styles.menuButton}
                                onPress={() => setIsParticipantsOpen(!isParticipantsOpen)}
                            >
                                <Ionicons 
                                    name="menu" 
                                    size={24} 
                                    color={COLORS.text} 
                                />
                            </TouchableOpacity>
                            <View style={styles.chatHeaderInfo}>
                                <Text style={styles.chatHeaderText}>
                                    {selectedParticipant.student_name}
                                </Text>
                                <Text style={styles.chatHeaderSubtext}>
                                    {selectedParticipant.student_email}
                                </Text>
                            </View>
                        </View>
                        <FlatList
                            data={messages}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <View style={[
                                    styles.messageBubble,
                                    item.isSender ? styles.sentMessage : styles.receivedMessage
                                ]}>
                                    <Text style={[
                                        styles.messageText,
                                        item.isSender ? styles.sentMessageText : styles.receivedMessageText
                                    ]}>{item.text}</Text>
                                    <Text style={[
                                        styles.messageTime,
                                        item.isSender ? styles.sentMessageTime : styles.receivedMessageTime
                                    ]}>{item.time}</Text>
                                </View>
                            )}
                        />
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={styles.messageInputContainer}
                        >
                            <TextInput
                                style={styles.messageInput}
                                value={newMessage}
                                onChangeText={setNewMessage}
                                placeholder="Type a message..."
                                placeholderTextColor={COLORS.textLight}
                            />
                            <TouchableOpacity
                                style={styles.sendButton}
                                onPress={() => {
                                    if (newMessage.trim()) {
                                        setMessages([...messages, {
                                            text: newMessage,
                                            time: new Date().toLocaleTimeString(),
                                            isSender: true
                                        }]);
                                        setNewMessage('');
                                    }
                                }}
                            >
                                <Ionicons name="send" size={24} color={COLORS.primary} />
                            </TouchableOpacity>
                        </KeyboardAvoidingView>
                    </>
                ) : (
                    <View style={styles.noChatSelected}>
                        <Ionicons name="chatbubble-outline" size={48} color={COLORS.textLight} />
                        <Text style={styles.noChatText}>Select a participant to start chatting</Text>
                    </View>
                )}
            </View>
        </View>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.headerContent}>
                <Text style={styles.classroomCode}>Classroom: {code}</Text>
                <Text style={styles.welcomeText}>Welcome, {userInfo?.name}!</Text>
            </View>
            <View style={styles.headerButtons}>
                <TouchableOpacity
                    style={styles.themeButton}
                    onPress={() => setIsDarkMode(!isDarkMode)}
                    activeOpacity={0.7}
                >
                    <Ionicons 
                        name={isDarkMode ? "sunny" : "moon"} 
                        size={24} 
                        color={COLORS.text} 
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.expandButton}
                    onPress={handleExpand}
                    activeOpacity={0.7}
                >
                    <Ionicons 
                        name={isExpanded ? "contract" : "expand"} 
                        size={24} 
                        color={COLORS.white} 
                    />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={[
                styles.container,
                isMobile && styles.containerMobile,
                isExpanded && styles.containerExpanded
            ]}>
                {renderHeader()}

                {/* Main Content Section */}
                <View style={[
                    styles.mainContent,
                    isMobile && styles.mainContentMobile,
                    isExpanded && styles.mainContentExpanded,
                    isLandscape && !isExpanded && styles.mainContentLandscape
                ]}>
                    {activeTab === 'class' && (
                        <>
                            {/* Slide Section */}
                            <View style={[
                                styles.slideSection,
                                isMobile && styles.slideSectionMobile,
                                isExpanded && styles.slideSectionExpanded,
                                isLandscape && !isExpanded && styles.slideSectionLandscape
                            ]}>
                                <View style={[
                                    styles.slideBox,
                                    isExpanded && styles.slideBoxExpanded,
                                    isLandscape && !isExpanded && styles.slideBoxLandscape
                                ]}>
                                    {isExpanded && (
                                        <View style={styles.expandedHeader}>
                                            <TouchableOpacity
                                                style={styles.expandButton}
                                                onPress={handleExpand}
                                                activeOpacity={0.7}
                                            >
                                                <Ionicons 
                                                    name="contract" 
                                                    size={24} 
                                                    color={COLORS.white} 
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                    <Text style={[
                                        styles.slideTitle,
                                        isExpanded && styles.slideTitleExpanded,
                                        isLandscape && !isExpanded && styles.slideTitleLandscape
                                    ]}>
                                        {slidesData[slideIndex].title}
                                    </Text>
                                    <Text style={[
                                        styles.slideContent,
                                        isExpanded && styles.slideContentExpanded,
                                        isLandscape && !isExpanded && styles.slideContentLandscape
                                    ]}>
                                        {slidesData[slideIndex].content}
                                    </Text>

                                    {/* Slide Navigation */}
                                    <View style={[
                                        styles.slideNavContainer,
                                        isExpanded && styles.slideNavContainerExpanded,
                                        isLandscape && !isExpanded && styles.slideNavContainerLandscape
                                    ]}>
                                        <TouchableOpacity
                                            style={[
                                                styles.navButton,
                                                slideIndex === 0 && styles.navButtonDisabled
                                            ]}
                                            onPress={goToPrevSlide}
                                            disabled={slideIndex === 0}
                                        >
                                            <Ionicons name="chevron-back" size={20} color={COLORS.white} />
                                        </TouchableOpacity>

                                        <View style={styles.slideIndicator}>
                                            <Text style={styles.slideIndicatorText}>
                                                {slideIndex + 1} / {slidesData.length}
                                            </Text>
                                        </View>

                                        <TouchableOpacity
                                            style={[
                                                styles.navButton,
                                                slideIndex === slidesData.length - 1 && styles.navButtonDisabled
                                            ]}
                                            onPress={goToNextSlide}
                                            disabled={slideIndex === slidesData.length - 1}
                                        >
                                            <Ionicons name="chevron-forward" size={20} color={COLORS.white} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            {/* Side Section */}
                            {!isExpanded && (
                                <View style={[
                                    styles.sideSection,
                                    isMobile && styles.sideSectionMobile,
                                    isLandscape && styles.sideSectionLandscape
                                ]}>
                                    <RequestToSpeak
                                        studentId={studentId}
                                        onRequestAccepted={() => setIsRequestAccepted(true)}
                                    />
                                </View>
                            )}
                        </>
                    )}
                    {activeTab === 'messages' && renderMessagesSection()}
                    {activeTab === 'files' && (
                        <View style={styles.filesContainer}>
                            <Text style={styles.sectionTitle}>Files</Text>
                            {/* Files content will go here */}
                        </View>
                    )}
                </View>

                {/* Bottom Navigation Bar */}
                {!isExpanded && (
                    <View style={[
                        styles.tabBar,
                        isMobile && styles.tabBarMobile,
                        isLandscape && styles.tabBarLandscape
                    ]}>
                        <TouchableOpacity 
                            style={styles.tabItem}
                            activeOpacity={0.7}
                            onPress={() => setActiveTab('class')}
                        >
                            <Ionicons 
                                name="people" 
                                size={24} 
                                color={activeTab === 'class' ? COLORS.primary : COLORS.textLight} 
                            />
                            <Text style={[
                                styles.tabLabel,
                                activeTab === 'class' ? styles.tabLabelActive : styles.tabLabelInactive
                            ]}>Class</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.tabItem}
                            activeOpacity={0.7}
                            onPress={() => setActiveTab('messages')}
                        >
                            <Ionicons 
                                name="chatbubble" 
                                size={24} 
                                color={activeTab === 'messages' ? COLORS.primary : COLORS.textLight} 
                            />
                            <Text style={[
                                styles.tabLabel,
                                activeTab === 'messages' ? styles.tabLabelActive : styles.tabLabelInactive
                            ]}>Messages</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.tabItem}
                            activeOpacity={0.7}
                            onPress={() => setActiveTab('files')}
                        >
                            <Ionicons 
                                name="document-text" 
                                size={24} 
                                color={activeTab === 'files' ? COLORS.primary : COLORS.textLight} 
                            />
                            <Text style={[
                                styles.tabLabel,
                                activeTab === 'files' ? styles.tabLabelActive : styles.tabLabelInactive
                            ]}>Files</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}
