import React from 'react';
import { Platform, StyleSheet, Image, Text, View, Alert,TouchableOpacity } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from "@react-navigation/native";
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { connect } from 'react-redux';
import {
    SplashScreen, HomeScreen, SettingScreen, LoginScreen, RegisterScreen, RegisterSuccessScreen, ForgotPasswordScreen, CategoryScreen,
    CartScreen, ProfileScreen, ProductListScreen, ProductDetailScreen, CheckoutScreen, EditProfileScreen, ChangePasswordScreen,
    ManageAddressScreen, WishlistScreen, OrderScreen, OrderDetailScreen, LanguageScreen, TermsandconditionScreen, PrivacyPolicyScreen,
    NotificationScreen, SearchScreen, UnauthorizeScreen, MenufecturerScreen, SocialRegisterScreen, RefundScreen, ShippingDeliveryScreen,
    VerifyOTPScreen, ResetPasswordScreen, CameraScreen
} from './screens/index';
import { bottomHome, bottomHomeFill, bottomCategory, bottomCategoryFill, bottomCart, bottomProfile, bottomProfileFill, bottomSetting, bottomSettingFill } from '@common';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Colors, GlobalStyles } from '@helpers';
import { Badge } from "native-base"
import Fonts from './helpers/Fonts';
import { _roundDimensions } from './helpers/util';
import VerifyMobileOTPScreen from './screens/VerifyMobileOTPScreen';

// Error Boundary Component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        
        // Log error to your crash reporting service
        console.error('Navigation Error:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    }

    render() {
        if (this.state.hasError) {
            return (
                <ErrorComponent 
                    error={this.state.error} 
                    onRetry={this.handleRetry}
                    message="Something went wrong with navigation"
                />
            );
        }

        return this.props.children;
    }
}

// Error Component
const ErrorComponent = ({ error, onRetry, message = "An error occurred" }) => {
    return (
        <View style={styles.errorContainer}>
            <View style={styles.errorContent}>
                <Text style={styles.errorTitle}>Oops!</Text>
                <Text style={styles.errorMessage}>{message}</Text>
                {error && (
                    <Text style={styles.errorDetails}>
                        {error.toString()}
                    </Text>
                )}
                <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                    <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

// Screen Wrapper with Error Handling
const withErrorHandling = (WrappedComponent, screenName) => {
    return class extends React.Component {
        constructor(props) {
            super(props);
            this.state = { hasError: false, error: null };
        }

        static getDerivedStateFromError(error) {
            return { hasError: true, error };
        }

        componentDidCatch(error, errorInfo) {
            console.error(`Error in ${screenName}:`, error, errorInfo);
            
            // Show alert for critical errors
            Alert.alert(
                'Error',
                `An error occurred in ${screenName}. Please try again.`,
                [
                    { text: 'OK', onPress: () => this.handleRetry() },
                    { text: 'Go Home', onPress: () => this.goToHome() }
                ]
            );
        }

        handleRetry = () => {
            this.setState({ hasError: false, error: null });
        }

        goToHome = () => {
            try {
                navigate('MainScreen');
            } catch (navError) {
                console.error('Navigation error:', navError);
            }
        }

        render() {
            if (this.state.hasError) {
                return (
                    <ErrorComponent 
                        error={this.state.error}
                        onRetry={this.handleRetry}
                        message={`Error in ${screenName}`}
                    />
                );
            }

            try {
                return <WrappedComponent {...this.props} />;
            } catch (error) {
                console.error(`Render error in ${screenName}:`, error);
                return (
                    <ErrorComponent 
                        error={error}
                        onRetry={this.handleRetry}
                        message={`Failed to render ${screenName}`}
                    />
                );
            }
        }
    };
};

const SettingStack = createStackNavigator();
export const navigationRef = createNavigationContainerRef()
let cartCount = 0;

export function navigate(name, params) {
    try {
        if (navigationRef.isReady()) {
            navigationRef.navigate(name, params);
        } else {
            console.warn('Navigation not ready');
            setTimeout(() => navigate(name, params), 100);
        }
    } catch (error) {
        console.error('Navigation error:', error);
        Alert.alert(
            'Navigation Error',
            'Unable to navigate to the requested screen. Please try again.',
            [{ text: 'OK' }]
        );
    }
}

function SettingStackNavigation() {
    return (
        <ErrorBoundary>
            <SettingStack.Navigator initialRouteName="SettingScreen">
                <SettingStack.Screen 
                    name="SettingScreen" 
                    component={withErrorHandling(SettingScreen, 'Settings')} 
                    options={{ headerShown: false }} 
                />
            </SettingStack.Navigator>
        </ErrorBoundary>
    );
}

//Auth Stack
const AuthStack = createStackNavigator();
function AuthNavigator() {
    return (
        <ErrorBoundary>
            <AuthStack.Navigator initialRouteName="LoginScreen">
                <AuthStack.Screen 
                    name="LoginScreen" 
                    component={withErrorHandling(LoginScreen, 'Login')} 
                    options={{ headerShown: false, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }} 
                />
                <AuthStack.Screen 
                    name="RegisterScreen" 
                    component={withErrorHandling(RegisterScreen, 'Register')} 
                    options={{ headerShown: false, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }} 
                />
                <AuthStack.Screen 
                    name="ForgotPasswordScreen" 
                    component={withErrorHandling(ForgotPasswordScreen, 'Forgot Password')} 
                    options={{ headerShown: false, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }} 
                />
            </AuthStack.Navigator>
        </ErrorBoundary>
    );
}

const BottomTab = createMaterialBottomTabNavigator();
function MyTabs(props) {
    try {
        let cartCount = props.cartCounts || 0;
        let authStatus = props.auth;
        
        return (
            <ErrorBoundary>
                <BottomTab.Navigator
                    initialRouteName="HomeScreen"
                    backBehavior={'order'}
                    labeled={false}
                    barStyle={styles.tabbarStyle}
                    screenOptions={{
                        unmountOnBlur: true,
                        tabBarShowLabel: false,
                        lazy: false,
                    }}>
                    <BottomTab.Screen 
                        name="HomeScreen" 
                        component={withErrorHandling(HomeScreen, 'Home')} 
                        options={{
                            headerShown: false,
                            cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid,
                            tabBarIcon: ({ focused, tintColor }) => (
                                <Image
                                    square
                                    source={focused ? bottomHomeFill : bottomHome}
                                    style={[styles.bottomTabIcon]}
                                />
                            ),
                        }} 
                    />
                    <BottomTab.Screen 
                        name="CategoryScreen" 
                        component={withErrorHandling(CategoryScreen, 'Category')} 
                        options={{
                            headerShown: false,
                            tabBarIcon: ({ focused, tintColor }) => (
                                <Image
                                    square
                                    source={focused ? bottomCategoryFill : bottomCategory}
                                    style={[styles.bottomTabIcon]}
                                />
                            ),
                        }} 
                    />
                    <BottomTab.Screen 
                        name="CartScreen" 
                        component={authStatus == true ? withErrorHandling(CartScreen, 'Cart') : AuthNavigator} 
                        options={{
                            headerShown: false,
                            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                            tabBarIcon: ({ focused, tintColor }) => (
                                <View style={styles.cartIconView}>
                                    <Image
                                        square
                                        source={focused ? bottomCart : bottomCart}
                                        style={[styles.bottomTabIcon, {
                                            top: cartCount > 9 ? hp('0.8%') : hp('0.2%'),
                                            right: wp('1%'),
                                            height: wp('7%'),
                                            width: wp('7%'),
                                        }]}
                                    />
                                    {
                                        cartCount > 0 && <Badge style={[GlobalStyles.badge, styles.count, {
                                            height: cartCount > 9 ? _roundDimensions()._height * 0.039 : _roundDimensions()._height * 0.032,
                                            width: cartCount > 9 ? _roundDimensions()._height * 0.039 : _roundDimensions()._height * 0.032,
                                            borderRadius: _roundDimensions()._borderRadius,
                                            right: cartCount > 9 ? wp('0.3') : wp('1.2%'),
                                            top: cartCount > 9 ? hp('0.1%') : hp('0.6%')
                                        }]}>
                                            <Text style={[GlobalStyles.badgeText, styles.countText, { fontSize: cartCount > 9 ? wp('2.4%') : wp('3%') }]}>{cartCount}</Text>
                                        </Badge>
                                    }
                                </View>
                            ),
                        }} 
                    />
                    <BottomTab.Screen 
                        name="ProfileScreen" 
                        component={authStatus == true ? withErrorHandling(ProfileScreen, 'Profile') : AuthNavigator} 
                        options={{
                            headerShown: false,
                            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                            tabBarIcon: ({ focused, tintColor }) => (
                                <Image
                                    square
                                    source={focused ? bottomProfileFill : bottomProfile}
                                    style={[styles.bottomTabIcon]}
                                />
                            ),
                        }} 
                    />
                    <BottomTab.Screen 
                        name="SettingScreen" 
                        component={SettingStackNavigation} 
                        options={{
                            headerShown: false,
                            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                            tabBarIcon: ({ focused, tintColor }) => (
                                <Image
                                    square
                                    source={focused ? bottomSettingFill : bottomSetting}
                                    style={[styles.bottomTabIcon]}
                                />
                            ),
                        }} 
                    />
                </BottomTab.Navigator>
            </ErrorBoundary>
        );
    } catch (error) {
        console.error('MyTabs error:', error);
        return (
            <ErrorComponent 
                error={error}
                onRetry={() => {}}
                message="Error loading navigation tabs"
            />
        );
    }
}

// throw new Error('I am Error From Navihator')
const Stack = createStackNavigator();
function AppNavigator(props) {
    try {
        const { cartCount = 0, authStatus } = props;
        
        return (
            <ErrorBoundary>
                <NavigationContainer 
                    ref={navigationRef}
                    onStateChange={(state) => {
                        try {
                            // Handle state changes safely
                            console.log('Navigation state changed:', state);
                        } catch (error) {
                            console.error('Navigation state change error:', error);
                        }
                    }}
                    fallback={<Text>Loading...</Text>}
                >
                    <Stack.Navigator initialRouteName="SplashScreen">
                        <Stack.Screen 
                            name='SplashScreen' 
                            component={withErrorHandling(SplashScreen, 'Splash')}
                            options={{ headerShown: false }}
                        />
                        
                        <Stack.Screen 
                            name="MainScreen" 
                            options={{ headerShown: false }}>
                            {props => <MyTabs cartCounts={cartCount} auth={authStatus} />}
                        </Stack.Screen>

                        <Stack.Screen 
                            name="LoginScreen" 
                            component={AuthNavigator} 
                            options={{ headerShown: false }} 
                        />
                        <Stack.Screen 
                            name="ProductListScreen" 
                            component={withErrorHandling(ProductListScreen, 'Product List')} 
                            options={{ headerShown: false, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }} 
                        />
                        <Stack.Screen 
                            name="ProductDetailScreen" 
                            component={withErrorHandling(ProductDetailScreen, 'Product Detail')} 
                            options={{ headerShown: false, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }} 
                        />
                        <Stack.Screen 
                            name="CheckoutScreen" 
                            component={withErrorHandling(CheckoutScreen, 'Checkout')} 
                            options={{ headerShown: false, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }} 
                        />
                        <Stack.Screen 
                            name="EditProfileScreen" 
                            component={withErrorHandling(EditProfileScreen, 'Edit Profile')} 
                            options={{ headerShown: false, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }} 
                        />
                        <Stack.Screen 
                            name="ChangePasswordScreen" 
                            component={withErrorHandling(ChangePasswordScreen, 'Change Password')} 
                            options={{ headerShown: false, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }} 
                        />
                        <Stack.Screen 
                            name="RegisterSuccessScreen" 
                            component={withErrorHandling(RegisterSuccessScreen, 'Register Success')} 
                            options={{ headerShown: false, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }} 
                        />
                        <Stack.Screen 
                            name="SocialRegisterScreen" 
                            component={withErrorHandling(SocialRegisterScreen, 'Social Register')} 
                            options={{ headerShown: false, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }} 
                        />
                        <Stack.Screen 
                            name="ManageAddressScreen" 
                            component={withErrorHandling(ManageAddressScreen, 'Manage Address')} 
                            options={{ headerShown: false, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }} 
                        />
                        <Stack.Screen 
                            name="WishlistScreen" 
                            component={withErrorHandling(WishlistScreen, 'Wishlist')} 
                            options={{ headerShown: false, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }} 
                        />
                        <Stack.Screen 
                            name="OrderScreen" 
                            component={withErrorHandling(OrderScreen, 'Orders')} 
                            options={{ headerShown: false, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }} 
                        />
                        <Stack.Screen 
                            name="OrderDetailScreen" 
                            component={withErrorHandling(OrderDetailScreen, 'Order Detail')} 
                            options={{ headerShown: false, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }} 
                        />
                        <Stack.Screen 
                            name="LanguageScreen" 
                            component={withErrorHandling(LanguageScreen, 'Language')} 
                            options={{ headerShown: false, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }} 
                        />
                        <Stack.Screen 
                            name="TermsandconditionScreen" 
                            component={withErrorHandling(TermsandconditionScreen, 'Terms & Conditions')} 
                            options={{ headerShown: false, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }} 
                        />
                        <Stack.Screen 
                            name="PrivacyPolicyScreen" 
                            component={withErrorHandling(PrivacyPolicyScreen, 'Privacy Policy')} 
                            options={{ headerShown: false, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }} 
                        />
                        <Stack.Screen 
                            name="NotificationScreen" 
                            component={withErrorHandling(NotificationScreen, 'Notifications')} 
                            options={{ headerShown: false, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }} 
                        />
                        <Stack.Screen 
                            name="SearchScreen" 
                            component={withErrorHandling(SearchScreen, 'Search')} 
                            options={{ headerShown: false, cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS }} 
                        />
                        <Stack.Screen 
                            name="UnauthorizeScreen" 
                            component={withErrorHandling(UnauthorizeScreen, 'Unauthorized')} 
                            options={{ headerShown: false, cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS }} 
                        />
                        <Stack.Screen 
                            name="MenufecturerScreen" 
                            component={withErrorHandling(MenufecturerScreen, 'Manufacturer')} 
                            options={{ headerShown: false, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }} 
                        />
                        <Stack.Screen 
                            name="RefundScreen" 
                            component={withErrorHandling(RefundScreen, 'Refund')} 
                            options={{ headerShown: false, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }} 
                        />
                        <Stack.Screen 
                            name="ShippingDeliveryScreen" 
                            component={withErrorHandling(ShippingDeliveryScreen, 'Shipping & Delivery')} 
                            options={{ headerShown: false, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }} 
                        />
                        <Stack.Screen 
                            name="VerifyOTPScreen" 
                            component={withErrorHandling(VerifyOTPScreen, 'Verify OTP')} 
                            options={{ headerShown: false, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }} 
                        />
                        <Stack.Screen 
                            name="VerifyMobileOTPScreen" 
                            component={withErrorHandling(VerifyMobileOTPScreen, 'Verify Mobile OTP')} 
                            options={{ headerShown: false, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }} 
                        />
                        <Stack.Screen 
                            name="ResetPasswordScreen" 
                            component={withErrorHandling(ResetPasswordScreen, 'Reset Password')} 
                            options={{ headerShown: false, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }} 
                        />
                        <Stack.Screen 
                            name="CameraScreen" 
                            component={withErrorHandling(CameraScreen, 'Camera')} 
                            options={{ headerShown: false, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }} 
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </ErrorBoundary>
        );
    } catch (error) {
        console.error('AppNavigator error:', error);
        return (
            <ErrorComponent 
                error={error}
                onRetry={() => {}}
                message="Failed to load application"
            />
        );
    }
}

function mapStateToProps(state) {
    try {
        return {
            cartCount: state?.cart?.cartCount || 0,
            authStatus: state?.auth?.USER_AUTH || false
        }
    } catch (error) {
        console.error('mapStateToProps error:', error);
        return {
            cartCount: 0,
            authStatus: false
        }
    }
}

export default connect(mapStateToProps, {})(AppNavigator);

const styles = StyleSheet.create({
    bottomTabIcon: {
        height: wp('6%'),
        width: wp('6%'),
    },
    tabbarStyle: {
        backgroundColor: Colors().white,
    },
    cartIconView: {
        backgroundColor: Colors().light_white,
        height: _roundDimensions()._height * 0.068,
        width: _roundDimensions()._height * 0.068,
        borderRadius: _roundDimensions()._borderRadius,
        justifyContent: 'center',
        alignItems: 'center',
        bottom: hp('2%'),
        position: 'relative',
        zIndex: 9999999999
    },
    count: {
        backgroundColor: Colors().white,
    },
    countText: {
        color: Colors().link_color,
        fontFamily: Fonts.Font_Bold
    },
    // Error Component Styles
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors().light_white,
        padding: wp('5%'),
    },
    errorContent: {
        backgroundColor: Colors().white,
        padding: wp('5%'),
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    errorTitle: {
        fontSize: wp('6%'),
        fontFamily: Fonts.Font_Bold,
        color: Colors().link_color,
        marginBottom: hp('2%'),
    },
    errorMessage: {
        fontSize: wp('4%'),
        fontFamily: Fonts.Font_Regular,
        color: Colors().text_color,
        textAlign: 'center',
        marginBottom: hp('2%'),
    },
    errorDetails: {
        fontSize: wp('3%'),
        fontFamily: Fonts.Font_Regular,
        color: Colors().gray,
        textAlign: 'center',
        marginBottom: hp('3%'),
    },
    retryButton: {
        backgroundColor: Colors().link_color,
        paddingHorizontal: wp('8%'),
        paddingVertical: hp('1.5%'),
        borderRadius: 5,
    },
    retryButtonText: {
        color: Colors().white,
        fontSize: wp('4%'),
        fontFamily: Fonts.Font_Bold,
    },
});