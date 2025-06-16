import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    RefreshControl,
    Alert,
    ActivityIndicator,
    Dimensions,
    Platform,
} from "react-native";
import { connect } from 'react-redux';
import {
    OtrixHeader, 
    OtrixContainer, 
    OtrixContent, 
    OtrixDivider, 
    HomeSlider, 
    HomeManufacturerView,
    HomeCategoryView, 
    SearchBar, 
    NewProduct, 
    TrendingProduct, 
    BestDeal, 
    DynamicProducts, 
    HomeBanners
} from '@component';

import { HomeSkeleton, ProductSkeleton } from '@skeleton';
import { addToWishList, storeFCM } from '@actions';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Colors, GlobalStyles } from '@helpers';
import { bindActionCreators } from 'redux';
import { Badge } from "native-base";
import { heart, avatarImg, avatarImg2 } from '@common';
import Fonts from "@helpers/Fonts";
import { _roundDimensions } from '@helpers/util';
import { _addToWishlist, logfunction } from "@helpers/FunctionHelper";
import getApi from "@apis/getApi";
import { ASSETS_DIR } from "@env";
import AsyncStorage from '@react-native-community/async-storage';

// Firebase imports with safe fallbacks
let messaging = null;
let firebase = null;

try {
    messaging = require('@react-native-firebase/messaging').default;
    firebase = require('@react-native-firebase/app').default;
} catch (error) {
    console.warn('Firebase modules not available:', error);
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Constants
const CACHE_KEYS = {
    API_DATA: 'API_DATA',
    LANGUAGE: 'Language',
    FCM_TOKEN: 'FCM_TOKEN',
    DEVICE_ID: 'DEVICEID',
    NOTIFICATIONS: 'NOTIFICATIONS_ARR',
    GET_UPDATED_DATA: 'GET_UPDATED_DATA',
    FIREBASE_INIT_STATUS: 'FIREBASE_INIT_STATUS'
};

const FIREBASE_CONFIG = {
    apiKey: 'AIzaSyBiWkpoLjN5kZY2cxphsM1v2wC12345678',
    authDomain: 'otrixcommerce.firebaseapp.com',
    databaseURL: '',
    projectId: 'otrix-commerce',
    storageBucket: '',
    appId: "1:123456789978:ios:a5e57cfc08ff88df6cb6c4",
    messagingSenderId: '1234567897'
};

// Firebase service availability checker
const FirebaseService = {
    isAvailable: () => Boolean(firebase && messaging),
    
    async checkPermissions() {
        if (!this.isAvailable()) return { granted: false, reason: 'Firebase not available' };
        
        try {
            const authStatus = await messaging().requestPermission();
            const granted = authStatus === messaging().AuthorizationStatus.AUTHORIZED ||
                           authStatus === messaging().AuthorizationStatus.PROVISIONAL;
            
            return { granted, authStatus };
        } catch (error) {
            console.warn('Permission check failed:', error);
            return { granted: false, reason: error.message };
        }
    },

    async initializeApp(config) {
        if (!this.isAvailable()) {
            console.warn('Firebase not available, skipping initialization');
            return { success: false, reason: 'Firebase modules not available' };
        }

        try {
            // Check if already initialized
            if (firebase().apps.length > 0) {
                console.log('Firebase already initialized');
                return { success: true, existing: true };
            }

            await firebase().initializeApp(config);
            
            // Verify initialization
            if (firebase().apps.length === 0) {
                throw new Error('Firebase initialization failed - no apps found');
            }

            console.log('Firebase initialized successfully');
            return { success: true, existing: false };
        } catch (error) {
            console.error('Firebase initialization error:', error);
            return { success: false, reason: error.message };
        }
    },

    async getToken() {
        if (!this.isAvailable()) {
            return { token: null, reason: 'Firebase not available' };
        }

        try {
            const permissionResult = await this.checkPermissions();
            if (!permissionResult.granted) {
                return { token: null, reason: 'Permission not granted' };
            }

            const token = await messaging().getToken();
            return { token, success: true };
        } catch (error) {
            console.error('Token retrieval failed:', error);
            return { token: null, reason: error.message };
        }
    },

    async subscribeToTopic(topic) {
        if (!this.isAvailable()) {
            console.warn('Cannot subscribe to topic - Firebase not available');
            return { success: false, reason: 'Firebase not available' };
        }

        try {
            await messaging().subscribeToTopic(topic);
            console.log(`Successfully subscribed to topic: ${topic}`);
            return { success: true };
        } catch (error) {
            console.error(`Topic subscription failed for ${topic}:`, error);
            return { success: false, reason: error.message };
        }
    }
};

function HomeScreen(props) {
    // State management
    const [state, setState] = useState({
        homePageData: {},
        homePageStoredData: null,
        loading: true,
        refreshing: false,
        error: null,
        imageSimilar: false,
        apiLoading: true,
        cacheLoading: true,
        firebaseStatus: {
            initialized: false,
            fcmEnabled: false,
            error: null
        }
    });

    // Memoized values
    const { USER_AUTH, wishlistData, customerData, wishlistCount, strings, navigation } = props;
    
    const isUserAuthenticated = useMemo(() => Boolean(USER_AUTH), [USER_AUTH]);
    
    const userProfileImage = useMemo(() => {
        if (!isUserAuthenticated || !customerData) return avatarImg2;
        
        if (customerData.creation === 'D') {
            return customerData.image 
                ? { uri: `${ASSETS_DIR}user/${customerData.image}` }
                : avatarImg;
        }
        
        return customerData.image 
            ? { uri: customerData.image }
            : avatarImg;
    }, [isUserAuthenticated, customerData]);

    // Error handler
    const handleError = useCallback((error, context = 'Unknown', isCritical = false) => {
        console.error(`Error in ${context}:`, error);
        
        const errorMessage = error?.message || error?.toString() || 'Something went wrong';
        
        setState(prev => ({ 
            ...prev, 
            error: isCritical ? errorMessage : prev.error,
            loading: false,
            refreshing: false,
            apiLoading: false
        }));

        // Only show alerts for critical errors
        if (isCritical) {
            Alert.alert(
                'Error',
                `${context}: ${errorMessage}`,
                [{ text: 'OK', onPress: () => setState(prev => ({ ...prev, error: null })) }]
            );
        }
    }, []);

    // Cache operations with error handling
    const getCachedData = useCallback(async (key) => {
        try {
            const data = await AsyncStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.warn(`Failed to get cached data for ${key}:`, error);
            return null;
        }
    }, []);

    const setCachedData = useCallback(async (key, data) => {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.warn(`Failed to cache data for ${key}:`, error);
            return false;
        }
    }, []);

    // Safe Firebase initialization
    const initializeFirebase = useCallback(async () => {
        try {
            console.log('Initializing Firebase...');
            
            const initResult = await FirebaseService.initializeApp(FIREBASE_CONFIG);
            
            if (!initResult.success) {
                setState(prev => ({
                    ...prev,
                    firebaseStatus: {
                        initialized: false,
                        fcmEnabled: false,
                        error: initResult.reason
                    }
                }));
                
                console.warn('Firebase initialization failed:', initResult.reason);
                await setCachedData(CACHE_KEYS.FIREBASE_INIT_STATUS, { success: false, reason: initResult.reason });
                return false;
            }

            // Subscribe to topic if initialization successful
            const subscriptionResult = await FirebaseService.subscribeToTopic('orionwholesalepromotion');
            
            setState(prev => ({
                ...prev,
                firebaseStatus: {
                    initialized: true,
                    fcmEnabled: subscriptionResult.success,
                    error: subscriptionResult.success ? null : subscriptionResult.reason
                }
            }));

            await setCachedData(CACHE_KEYS.FIREBASE_INIT_STATUS, { success: true, fcmEnabled: subscriptionResult.success });
            return true;
            
        } catch (error) {
            console.error('Firebase initialization error:', error);
            
            setState(prev => ({
                ...prev,
                firebaseStatus: {
                    initialized: false,
                    fcmEnabled: false,
                    error: error.message
                }
            }));
            
            await setCachedData(CACHE_KEYS.FIREBASE_INIT_STATUS, { success: false, reason: error.message });
            return false;
        }
    }, [setCachedData]);

    // Safe FCM Token management
    const handleFCMToken = useCallback(async () => {
        try {
            // Check if Firebase is available and initialized
            if (!FirebaseService.isAvailable() || !state.firebaseStatus.initialized) {
                console.log('Skipping FCM token - Firebase not available or not initialized');
                return null;
            }

            let existingToken = await AsyncStorage.getItem(CACHE_KEYS.FCM_TOKEN);
            
            if (!existingToken) {
                const tokenResult = await FirebaseService.getToken();
                
                if (tokenResult.success && tokenResult.token) {
                    await AsyncStorage.setItem(CACHE_KEYS.FCM_TOKEN, tokenResult.token);
                    props.storeFCM(tokenResult.token);
                    existingToken = tokenResult.token;
                    console.log('FCM token obtained and stored');
                } else {
                    console.warn('FCM token retrieval failed:', tokenResult.reason);
                    return null;
                }
            } else {
                props.storeFCM(existingToken);
                console.log('Using existing FCM token');
            }
            
            return existingToken;
        } catch (error) {
            console.error('FCM token handling failed:', error);
            return null;
        }
    }, [props, state.firebaseStatus.initialized]);

    // Safe notification storage
    const storeNotification = useCallback(async (data) => {
        try {
            if (!data || typeof data !== 'object') {
                console.warn('Invalid notification data received');
                return false;
            }

            const existingNotifications = await getCachedData(CACHE_KEYS.NOTIFICATIONS) || [];
            
            const newNotification = {
                title: data.bodytitle || data.title || 'Notification',
                body: data.body || 'New notification received',
                image: data.image || null,
                link: data.link || null,
                timestamp: Date.now(),
                id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };
            
            const updatedNotifications = [newNotification, ...existingNotifications].slice(0, 100); // Keep only last 100
            const saved = await setCachedData(CACHE_KEYS.NOTIFICATIONS, updatedNotifications);
            
            if (saved) {
                console.log('Notification stored successfully');
            }
            
            return saved;
        } catch (error) {
            console.error('Failed to store notification:', error);
            return false;
        }
    }, [getCachedData, setCachedData]);

    // Safe navigation handler for notifications
    const handleNotificationNavigation = useCallback((link) => {
        try {
            if (!link || typeof link !== 'string') {
                console.warn('Invalid notification link');
                return false;
            }
            
            const linkParts = link.split('-');
            if (linkParts.length < 2) {
                console.warn('Invalid link format:', link);
                return false;
            }
            
            const type = linkParts[0];
            const id = linkParts[1];
            
            if (!navigation || typeof navigation.navigate !== 'function') {
                console.error('Navigation object not available');
                return false;
            }
            
            switch (type) {
                case 'category':
                    navigation.navigate('ProductListScreen', { 
                        type: 'categorybanner', 
                        id, 
                        childerns: [], 
                        title: null 
                    });
                    return true;
                case 'brand':
                    navigation.navigate('ProductListScreen', { 
                        type: 'brandbanner', 
                        id, 
                        childerns: [], 
                        title: null 
                    });
                    return true;
                case 'product':
                    navigation.navigate('ProductDetailScreen', { id });
                    return true;
                default:
                    console.warn('Unknown notification type:', type);
                    return false;
            }
        } catch (error) {
            console.error('Navigation handling failed:', error);
            return false;
        }
    }, [navigation]);

    // Safe notification listeners setup
    const setupNotificationListeners = useCallback(() => {
        if (!FirebaseService.isAvailable() || !state.firebaseStatus.initialized) {
            console.log('Skipping notification listeners - Firebase not available or not initialized');
            return () => {};
        }

        try {
            let unsubscribeForeground = () => {};
            
            // Foreground messages
            unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
                try {
                    console.log('Received foreground message:', remoteMessage);
                    
                    if (remoteMessage?.data?.type === 'promotional') {
                        await storeNotification(remoteMessage.data);
                    }
                } catch (error) {
                    console.error('Error handling foreground message:', error);
                }
            });

            // Background/quit state messages
            messaging().setBackgroundMessageHandler(async (remoteMessage) => {
                try {
                    console.log('Received background message:', remoteMessage);
                    
                    if (remoteMessage?.data?.type === 'promotional') {
                        await storeNotification(remoteMessage.data);
                    }
                    
                    if (remoteMessage?.data?.link) {
                        // Store for later processing when app becomes active
                        await setCachedData('PENDING_NAVIGATION', {
                            link: remoteMessage.data.link,
                            timestamp: Date.now()
                        });
                    }
                } catch (error) {
                    console.error('Error handling background message:', error);
                }
            });

            // Initial notification (app opened from notification)
            messaging().getInitialNotification().then(async (remoteMessage) => {
                try {
                    if (!remoteMessage) return;
                    
                    console.log('Received initial notification:', remoteMessage);
                    
                    if (remoteMessage?.data?.type === 'promotional') {
                        await storeNotification(remoteMessage.data);
                    }
                    
                    if (remoteMessage?.data?.link) {
                        // Delay navigation to ensure app is fully loaded
                        setTimeout(() => {
                            handleNotificationNavigation(remoteMessage.data.link);
                        }, 2000);
                    }
                } catch (error) {
                    console.error('Error handling initial notification:', error);
                }
            }).catch(error => {
                console.error('Error getting initial notification:', error);
            });

            return unsubscribeForeground;
        } catch (error) {
            console.error('Failed to setup notification listeners:', error);
            return () => {};
        }
    }, [state.firebaseStatus.initialized, storeNotification, handleNotificationNavigation, setCachedData]);

    // Check for pending navigation
    const checkPendingNavigation = useCallback(async () => {
        try {
            const pendingNav = await getCachedData('PENDING_NAVIGATION');
            if (pendingNav && pendingNav.link) {
                // Check if not too old (within 5 minutes)
                if (Date.now() - pendingNav.timestamp < 300000) {
                    handleNotificationNavigation(pendingNav.link);
                }
                // Clear pending navigation
                await AsyncStorage.removeItem('PENDING_NAVIGATION');
            }
        } catch (error) {
            console.error('Error checking pending navigation:', error);
        }
    }, [getCachedData, handleNotificationNavigation]);

    // Check cache validity
    const checkCacheValidity = useCallback(async () => {
        try {
            const deviceId = await AsyncStorage.getItem(CACHE_KEYS.DEVICE_ID);
            if (!deviceId) return;

            const response = await getApi.getData(`checkCache?device_id=${deviceId}`, []);
            
            if (response.status === 1 && response.clearCache) {
                await AsyncStorage.setItem(CACHE_KEYS.GET_UPDATED_DATA, JSON.stringify(true));
                await AsyncStorage.removeItem(CACHE_KEYS.API_DATA);
            }
        } catch (error) {
            console.warn('Cache validity check failed:', error);
        }
    }, []);

    // Load cached data
    const loadCachedData = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, cacheLoading: true }));
            
            const cachedData = await getCachedData(CACHE_KEYS.API_DATA);
            console.log("cachedData",cachedData)
            
            if (cachedData) {
                setState(prev => ({ 
                    ...prev, 
                    homePageStoredData: cachedData,
                    cacheLoading: false
                }));
            } else {
                setState(prev => ({ ...prev, cacheLoading: false }));
            }
        } catch (error) {
            handleError(error, 'loadCachedData');
        }
    }, [getCachedData, handleError]);

    // Fetch fresh data from API
    const fetchFreshData = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, apiLoading: true, error: null }));
            
            const language = await AsyncStorage.getItem(CACHE_KEYS.LANGUAGE) || 'en';
            const apiUrl = `getHomePage?language=${language}&reactnativeapp=1`;
            
            const response = await getApi.getData(apiUrl, []);
            console.log("response.data",response.data)
            if (response.status === 1) {
                setState(prev => ({
                    ...prev,
                    homePageData: response.data,
                    imageSimilar: response.data.enable_image_similarity === '1',
                    apiLoading: false,
                    loading: false
                }));
                
                // Cache the fresh data
                await setCachedData(CACHE_KEYS.API_DATA, response.data);
            } else {
                throw new Error(`API returned status: ${response.status}`);
            }
        } catch (error) {
            handleError(error, 'fetchFreshData', true);
        }
    }, [handleError, setCachedData]);

    // Refresh handler
    const onRefresh = useCallback(async () => {
        setState(prev => ({ ...prev, refreshing: true, error: null }));
        
        try {
            await Promise.all([
                checkCacheValidity(),
                loadCachedData(),
                fetchFreshData()
            ]);
        } catch (error) {
            handleError(error, 'onRefresh');
        } finally {
            setState(prev => ({ ...prev, refreshing: false }));
        }
    }, [checkCacheValidity, loadCachedData, fetchFreshData, handleError]);

    // Wishlist handler
    const addToWish = useCallback(async (id) => {
        try {
            const wishlistData = await _addToWishlist(id);
            props.addToWishList(wishlistData, id);
        } catch (error) {
            console.error('Failed to add to wishlist:', error);
            Alert.alert('Error', 'Failed to add item to wishlist');
        }
    }, [props]);

    // Category wise product renderer
    const renderCategoryWiseProduct = useCallback((categoryName, index) => {
        const { homePageData } = state;
        
        if (!homePageData.categoryWiseProduct?.[categoryName]?.length) {
            return null;
        }

        const categoryProducts = homePageData.categoryWiseProduct[categoryName];
        
        return (
            <DynamicProducts 
                key={`category-${index}-${categoryName}`}
                current={index}
                title={categoryName}
                navigation={navigation}
                strings={strings}
                wishlistArr={wishlistData}
                data={categoryProducts}
                arr={categoryProducts}
                addToWishlist={addToWish}
                userAuth={isUserAuthenticated}
                catID={categoryProducts[0]?.category_id}
            />
        );
    }, [state.homePageData, navigation, strings, wishlistData, addToWish, isUserAuthenticated]);

    // Navigation handlers
    const navigateToProfile = useCallback(() => {
        try {
            navigation.navigate('ProfileScreen');
        } catch (error) {
            console.error('Navigation to profile failed:', error);
        }
    }, [navigation]);

    const navigateToWishlist = useCallback(() => {
        try {
            if (isUserAuthenticated) {
                navigation.navigate('WishlistScreen');
            } else {
                navigation.navigate('LoginScreen');
            }
        } catch (error) {
            console.error('Navigation to wishlist failed:', error);
        }
    }, [navigation, isUserAuthenticated]);

    // Initialize app with comprehensive error handling
    useEffect(() => {
        let unsubscribeNotifications = () => {};
        let isComponentMounted = true;

        const initializeApp = async () => {
            try {
                console.log('Starting app initialization...');
                
                // Initialize Firebase first
                const firebaseInitialized = await initializeFirebase();
                
                if (!isComponentMounted) return;

                // Setup FCM only if Firebase is initialized
                if (firebaseInitialized) {
                    await handleFCMToken();
                    
                    if (!isComponentMounted) return;
                    
                    // Setup notification listeners
                    unsubscribeNotifications = setupNotificationListeners();
                    
                    // Check for pending navigation
                    await checkPendingNavigation();
                } else {
                    console.warn('Firebase not initialized, skipping FCM setup');
                }

                if (!isComponentMounted) return;
                
                // Check cache validity
                await checkCacheValidity();
                
                if (!isComponentMounted) return;
                
                // Load cached data first for better UX
                await loadCachedData();
                
                if (!isComponentMounted) return;
                
                // Then fetch fresh data
                await fetchFreshData();
                
                console.log('App initialization completed successfully');
                
            } catch (error) {
                console.error('App initialization failed:', error);
                if (isComponentMounted) {
                    handleError(error, 'initializeApp', true);
                }
            }
        };

        initializeApp();

        // Cleanup
        return () => {
            isComponentMounted = false;
            try {
                unsubscribeNotifications();
            } catch (error) {
                console.warn('Error during cleanup:', error);
            }
        };
    }, []); // Empty dependency array

    // Render loading state
    const renderLoadingState = () => (
        <View style={styles.loadingContainer}>
            <HomeSkeleton />
            {state.apiLoading && (
                <View style={styles.apiLoadingOverlay}>
                    <ActivityIndicator size="large" color={Colors().themeColor} />
                    <Text style={styles.loadingText}>Loading fresh content...</Text>
                </View>
            )}
        </View>
    );

    // Render error state
    const renderErrorState = () => (
        <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Oops! Something went wrong</Text>
            <Text style={styles.errorSubText}>{state.error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
                <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
            
            {/* Firebase status indicator for debugging */}
            {__DEV__ && (
                <View style={styles.debugInfo}>
                    <Text style={styles.debugText}>
                        Firebase: {state.firebaseStatus.initialized ? '✅' : '❌'}
                    </Text>
                    <Text style={styles.debugText}>
                        FCM: {state.firebaseStatus.fcmEnabled ? '✅' : '❌'}
                    </Text>
                    {state.firebaseStatus.error && (
                        <Text style={styles.debugErrorText}>
                            Error: {state.firebaseStatus.error}
                        </Text>
                    )}
                </View>
            )}
        </View>
    );

    // Render main content
    const renderMainContent = () => {
        const { homePageStoredData, homePageData, imageSimilar, apiLoading } = state;
        console.log("homePageStoredData",homePageStoredData?.categories)

        return (
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={state.refreshing}
                        onRefresh={onRefresh}
                        colors={[Colors().themeColor]}
                        tintColor={Colors().themeColor}
                        title="Pull to refresh"
                        titleColor={Colors().themeColor}
                    />
                }
                scrollEventThrottle={16}
            >
                {/* Cached Content */}
                {homePageStoredData && (
                    <>
                        <SearchBar 
                            navigation={navigation} 
                            strings={strings} 
                            enable={imageSimilar} 
                        />

                        <HomeCategoryView 
                            navigation={navigation} 
                            data={homePageStoredData.categories} 
                            strings={strings} 
                        />

                        <HomeSlider 
                            data={homePageStoredData.homepageSlider} 
                            navigation={navigation} 
                        />
                        
                        <OtrixDivider size="md" />

                        <NewProduct 
                            navigation={navigation}
                            strings={strings}
                            wishlistArr={wishlistData}
                            data={homePageStoredData.newProducts?.slice(0, 4) || []}
                            arr={homePageStoredData.newProducts || []}
                            addToWishlist={addToWish}
                            userAuth={isUserAuthenticated}
                        />

                        {homePageStoredData.banners?.images?.[0] && (
                            <HomeBanners 
                                navigation={navigation}
                                image={homePageStoredData.banners.images[0].image}
                                link={homePageStoredData.banners.images[0]}
                            />
                        )}

                        <BestDeal 
                            navigation={navigation}
                            strings={strings}
                            data={homePageStoredData.dodProducts?.slice(0, 4) || []}
                            arr={homePageStoredData.dodProducts || []}
                            wishlistArr={wishlistData}
                            addToWishlist={addToWish}
                            userAuth={isUserAuthenticated}
                        />
                        
                        <OtrixDivider size="sm" />

                        {homePageStoredData.banners?.images?.[1] && (
                            <HomeBanners 
                                navigation={navigation}
                                image={homePageStoredData.banners.images[1].image}
                                link={homePageStoredData.banners.images[1]}
                            />
                        )}
                    </>
                )}

                <OtrixDivider size="sm" />

                {/* Fresh API Content */}
                {apiLoading ? (
                    <ProductSkeleton />
                ) : homePageData.trendingProducts ? (
                    <>
                        <TrendingProduct 
                            navigation={navigation}
                            strings={strings}
                            data={homePageData.trendingProducts?.slice(0, 4) || []}
                            arr={homePageData.trendingProducts || []}
                            wishlistArr={wishlistData}
                            addToWishlist={addToWish}
                            userAuth={isUserAuthenticated}
                        />

                        {homePageStoredData?.banners?.images?.[2] && (
                            <HomeBanners 
                                navigation={navigation}
                                image={homePageStoredData.banners.images[2].image}
                                link={homePageStoredData.banners.images[2]}
                            />
                        )}

                        {homePageData.categoryWiseProduct && 
                            Object.keys(homePageData.categoryWiseProduct).map((categoryName, index) => 
                                renderCategoryWiseProduct(categoryName, index)
                            )
                        }

                        {homePageStoredData?.banners?.images?.[3] && (
                            <HomeBanners 
                                navigation={navigation}
                                image={homePageStoredData.banners.images[3].image}
                                link={homePageStoredData.banners.images[3]}
                            />
                        )}

                        {homePageStoredData?.manufacturers && (
                            <HomeManufacturerView 
                                strings={strings}
                                navigation={navigation}
                                data={homePageStoredData.manufacturers}
                            />
                        )}
                    </>
                ) : null}
            </ScrollView>
        );
    };

    // Main render
    return (
        <OtrixContainer customStyles={{ backgroundColor: Colors().white }}>
            {/* Header */}
            <OtrixHeader customStyles={{ backgroundColor: Colors().white }}>
                <TouchableOpacity style={styles.headerLeft} onPress={navigateToProfile}>
                    <Image style={styles.avatarImg} source={userProfileImage} />
                </TouchableOpacity>
                
                <View style={styles.headerCenter}>
                    <Text style={styles.headingTxt}>Orion Wholesale</Text>
                </View>

                <TouchableOpacity style={styles.headerRight} onPress={navigateToWishlist}>
                    <Image source={heart} style={styles.heartIcon} />
                    {wishlistCount > 0 && (
                        <Badge style={[
                            GlobalStyles.badge,
                            styles.wishlistBadge,
                            {
                                height: wishlistCount > 9 ? wp('5%') : wp('4%'),
                                width: wishlistCount > 9 ? wp('5%') : wp('4%'),
                            }
                        ]}>
                            <Text style={[
                                GlobalStyles.badgeText,
                                styles.countText,
                                { fontSize: wishlistCount > 9 ? wp('2.2%') : wp('3%') }
                            ]}>
                                {wishlistCount}
                            </Text>
                        </Badge>
                    )}
                </TouchableOpacity>
            </OtrixHeader>

            <OtrixContent>
                {state.error ? renderErrorState() : 
                 (state.cacheLoading && !state.homePageStoredData) ? renderLoadingState() : 
                 renderMainContent()}
            </OtrixContent>
        </OtrixContainer>
    );
}

// Redux connection
function mapStateToProps(state) {
    return {
        USER_AUTH: state.auth.USER_AUTH,
        wishlistData: state.wishlist.wishlistData,
        wishlistCount: state.wishlist.wishlistCount,
        customerData: state.auth.USER_DATA,
        strings: state.mainScreenInit.strings
    };
}

const mapDispatchToProps = dispatch => (
    bindActionCreators({
        addToWishList,
        storeFCM
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);

// Styles
const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        position: 'relative',
    },
    apiLoadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    loadingText: {
        marginTop: 10,
        fontSize: wp('3.5%'),
        color: Colors().themeColor,
        fontFamily: Fonts.Font_Medium,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: wp('5%'),
    },
    errorText: {
        fontSize: wp('4.5%'),
        fontFamily: Fonts.Font_Bold,
        color: Colors().errorColor || '#FF6B6B',
        textAlign: 'center',
        marginBottom: 10,
    },
    errorSubText: {
        fontSize: wp('3.5%'),
        fontFamily: Fonts.Font_Regular,
        color: Colors().textColor || '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: Colors().themeColor,
        paddingHorizontal: wp('6%'),
        paddingVertical: hp('1.5%'),
        borderRadius: wp('2%'),
    },
    retryButtonText: {
        color: Colors().white,
        fontSize: wp('4%'),
        fontFamily: Fonts.Font_Medium,
    },
    debugInfo: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        alignItems: 'center',
    },
    debugText: {
        fontSize: wp('3%'),
        fontFamily: Fonts.Font_Regular,
        color: '#333',
        marginVertical: 2,
    },
    debugErrorText: {
        fontSize: wp('2.5%'),
        fontFamily: Fonts.Font_Regular,
        color: '#FF6B6B',
        textAlign: 'center',
        marginTop: 5,
    },
    headerRight: {
        flex: 0.15,
        marginRight: wp('2%'),
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    heartIcon: {
        width: wp('6.5%'),
        height: wp('6.5%'),
        resizeMode: 'contain',
        tintColor: Colors().custom_pink,
    },
    wishlistBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        borderRadius: wp('2.5%'),
        minWidth: wp('4%'),
        height: wp('4%'),
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: {
        flex: 0.75,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headingTxt: {
        fontFamily: Fonts.Font_Bold,
        fontSize: wp('6.5%'),
        color: Colors().themeColor,
    },
    headerLeft: {
        flex: 0.15,
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingLeft: wp('3%'),
    },
    avatarImg: {
        height: wp('12%'),
        width: wp('12%'),
        borderRadius: wp('6%'),
        resizeMode: 'cover',
    },
    countText: {
        fontSize: wp('2.5%'),
        fontFamily: Fonts.Font_Bold,
    },
});