import React, { useEffect } from "react";
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Platform
} from "react-native";
import {
    OtrixContainer, OtrixHeader, OtrixContent, OtrixDivider, OtrixSocialContainer, OtrixAlert, OtrixLoader
} from '@component';
import { Input, Text, FormControl, Button, InfoOutlineIcon } from "native-base"
import { connect } from 'react-redux';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { GlobalStyles, Colors, isValidEmail, isValidpassword, isValidMobile } from '@helpers'
import Icon from 'react-native-vector-icons/Ionicons';
import { logfunction } from "@helpers/FunctionHelper";
import Fonts from "../helpers/Fonts";
import { bindActionCreators } from 'redux';
import { doLogin } from '@actions';
import getApi from "@apis/getApi";
import Toast from 'react-native-root-toast';
import auth from '@react-native-firebase/auth';
import { firebase } from '@react-native-firebase/app';
import { CountryPicker } from "react-native-country-codes-picker";
import OTPInputView from '@twotalltotems/react-native-otp-input'
import {
    GoogleSignin,
    GoogleSigninButton,
    statusCodes,
} from '@react-native-google-signin/google-signin';
import AsyncStorage from "@react-native-community/async-storage";

// Configure Google Sign-In
GoogleSignin.configure({
    webClientId: '239412184257-0ff65ugeiganp26qu0q7j7b744cdumkt.apps.googleusercontent.com',
      offlineAccess: true,  // if you want to get refresh token
  forceCodeForRefreshToken: true,
    scopes: ['profile', 'email']
});

// Firebase configuration
const firebaseConfig = {
    apiKey: 'AIzaSyCQiyicSTpE3RIrvUMdiac0JcjV-hMjQvI',
    authDomain: 'orion-wholesale-951bf.firebaseapp.com',
    projectId: 'orion-wholesale-951bf',
    storageBucket: 'orion-wholesale-951bf.firebasestorage.app',
    appId: '1:239412184257:android:65870a8ea593952135c040',
    messagingSenderId: '239412184257',
};

// Initialize Firebase
if (!firebase.apps.length) {
    try {
        firebase.initializeApp(firebaseConfig);
    } catch (err) {
        console.log("Firebase initialization error: ", err);
    }
}

function LoginScreen(props) {
    const [formData, setData] = React.useState({ 
        email: null, 
        password: null, 
        submited: false, 
        loading: false, 
        type: null, 
        message: null, 
        verificationView: false, 
        navTo: 'HomeScreen', 
        mobileSubmitted: false 
    });
    const [state, setDatapassword] = React.useState({ secureEntry: true });
    const [errors, setErrors] = React.useState({});
    const [confirm, setConfirm] = React.useState(null);
    const [show, setShow] = React.useState(false);
    const [mobileNumber, setMobile] = React.useState(null);
    const [countryCode, setCountryCode] = React.useState('+91');
    const [otpLoading, setOTPLoading] = React.useState(false);
    const [otpp, setOTP] = React.useState(null);
    const [mode, setMode] = React.useState('light');

    const { email, password, submited, loading, message, type, navTo, verificationView } = formData;

    useEffect(() => {
        // Get theme mode
        const getMode = async () => {
            try {
                const savedMode = await AsyncStorage.getItem('mode');
                setMode(savedMode || 'light');
            } catch (error) {
                console.log('Error getting mode:', error);
            }
        };
        getMode();
    }, []);

    const validate = () => {
        setData({ ...formData, submited: true });
        const newErrors = {};

        if (!email) {
            newErrors.email = 'Email is required';
            return false;
        }
        
        if (!isValidEmail(email).success) {
            newErrors.invalidEmail = isValidEmail(email).message;
            return false;
        }
        
        if (!isValidpassword(password).success) {
            newErrors.password = isValidpassword(password).message;
            return false;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const login = async () => {
        if (validate()) {
            setData({
                ...formData,
                loading: true
            });

            const sendData = new FormData();
            sendData.append('email', email);
            sendData.append('password', password);
            sendData.append('firebase_token', props.FCM_TOKEN);

            try {
                const response = await getApi.postData('user/login', sendData);
                logfunction("RESPONSE ", response);
                
                if (response.status === 1) {
                    setData({
                        ...formData,
                        email: null,
                        password: null,
                        loading: false
                    });
                    props.doLogin(response, navTo);
                } else {
                    setData({
                        ...formData,
                        type: 'error',
                        message: response.message,
                        loading: false
                    });
                    setTimeout(() => {
                        setData({
                            ...formData,
                            message: null,
                            loading: false
                        });
                    }, 3000);
                }
            } catch (error) {
                logfunction("Error", error);
                setData({
                    ...formData,
                    loading: false
                });
            }
        }
    };

    const validateMobile = () => {
        setData({ ...formData, mobileSubmitted: true });
        const newErrors = { ...errors };

        if (!isValidMobile(mobileNumber).success) {
            newErrors.invalidmobileNumber = isValidMobile(mobileNumber).message;
            setErrors(newErrors);
            return false;
        }

        return true;
    };

    const sendOtp = async () => {
        if (validateMobile()) {
            setData({
                ...formData,
                loading: true
            });

            const sendData = new FormData();
            sendData.append('mobileNumber', mobileNumber);
            sendData.append('firebase_token', props.FCM_TOKEN);

            try {
                const response = await getApi.postData('user/checkcustomer', sendData);
                logfunction("RESPONSE ", response);
                
                if (response.status === 1) {
                    const confirmation = await auth().signInWithPhoneNumber(countryCode + mobileNumber);
                    setConfirm(confirmation);
                    setData({
                        ...formData,
                        loading: false,
                        verificationView: true
                    });
                } else {
                    setData({
                        ...formData,
                        type: 'error',
                        message: 'Customer not found',
                        loading: false
                    });
                    setTimeout(() => {
                        setData({
                            ...formData,
                            message: null,
                            loading: false
                        });
                        props.navigation.push("RegisterScreen");
                    }, 1000);
                }
            } catch (error) {
                logfunction("Error", error);
                setData({
                    ...formData,
                    loading: false
                });
            }
        }
    };




const _googleAuth = async () => {
  try {
    console.log("[GoogleAuth] Starting Google Sign-In flow");

    const hasPlayServices = await GoogleSignin.hasPlayServices();
    console.log("[GoogleAuth] Google Play Services available:", hasPlayServices);

    const userInfo = await GoogleSignin.signIn();
    console.log("[GoogleAuth] User info received:", JSON.stringify(userInfo, null, 2));

    if (userInfo.idToken) {
      console.log("[GoogleAuth] idToken found, preparing user data");

      const userData = {
        email: userInfo.user.email,
        id: userInfo.user.id,
        name: userInfo.user.name,
        first_name: userInfo.user.givenName || userInfo.user.name,
        last_name: userInfo.user.familyName || '',
        picture: { data: { url: userInfo.user.photo || '' } }
      };

      console.log("[GoogleAuth] User data constructed:", JSON.stringify(userData, null, 2));
      handleSocialLogin(userData, 'G');
      console.log("[GoogleAuth] handleSocialLogin called");
    } else {
      console.warn("[GoogleAuth] idToken not found in userInfo:", JSON.stringify(userInfo));
    }

  } catch (error) {
    console.error("[GoogleAuth] Error during Google Sign-In:", error);

    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      console.log("[GoogleAuth] Sign-in cancelled by user");
    } else if (error.code === statusCodes.IN_PROGRESS) {
      console.log("[GoogleAuth] Sign-in already in progress");
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      console.log("[GoogleAuth] Google Play Services not available or outdated");
      Toast.show('Google Play Services not available', {
        duration: 3000,
        position: Toast.positions.CENTER,
      });
    } else {
      console.log("[GoogleAuth] Unknown error occurred during Google login");
      Toast.show('Google login failed', {
        duration: 3000,
        position: Toast.positions.CENTER,
      });
    }
  }
};


    // Common function to handle social login
    const handleSocialLogin = async (userData, creation) => {
        const email = userData.email || userData.id;
        const image = userData.picture ? userData.picture.data.url : '';
        
        const sendData = new FormData();
        sendData.append("email", email);
        sendData.append("password", userData.id);
        sendData.append("creation", creation);
        sendData.append('firebase_token', props.FCM_TOKEN);

        setData({
            ...formData,
            loading: true
        });

        try {
            const response = await getApi.postData('user/socialLogin', sendData);
            logfunction("Social RESPONSE ", response);
            
            if (response.status === 1) {
                setData({
                    ...formData,
                    email: null,
                    password: null,
                    loading: false
                });
                props.doLogin(response, navTo);
            } else {
                if (response.new === 1) {
                    props.navigation.navigate("SocialRegisterScreen", {
                        s_email: email,
                        s_socialID: userData.id,
                        s_image: image,
                        s_firstName: userData.first_name || '',
                        s_lastName: userData.last_name || '',
                        s_creation: creation
                    });
                } else {
                    setData({
                        ...formData,
                        type: 'error',
                        message: response.message,
                        loading: false
                    });
                    setTimeout(() => {
                        setData({
                            ...formData,
                            message: null,
                            loading: false
                        });
                    }, 3000);
                }
            }
        } catch (error) {
            logfunction("Error", error);
            setData({
                ...formData,
                loading: false
            });
        }
    };

    const verifyOTP = async (otp) => {
        if (!otp && !otpp) return;
        
        setOTPLoading(true);
        try {
            await confirm.confirm(otp || otpp);
            const sendData = new FormData();
            sendData.append('mobileNumber', mobileNumber);
            
            const response = await getApi.postData('user/loginUsingMobile', sendData);
            setOTPLoading(false);

            if (response.status === 1) {
                props.doLogin(response, navTo);
            } else {
                setData({
                    ...formData,
                    type: 'error',
                    message: response.message,
                    loading: false
                });
                setTimeout(() => {
                    setData({
                        ...formData,
                        message: null,
                        loading: false
                    });
                }, 3000);
            }
        } catch (error) {
            setOTPLoading(false);
            setData({
                ...formData,
                type: 'error',
                message: 'Invalid OTP',
                loading: false
            });
        }
    };

    const { strings } = props;

    return (
        <OtrixContainer>
            {/* Header */}
            <OtrixHeader >
                <TouchableOpacity 
                    style={[GlobalStyles.headerLeft, { flex: 0.10 }]} 
                    onPress={() => props.navigation.push('MainScreen')}
                >
                    <OtirxBackButton />
                </TouchableOpacity>
                <View style={[GlobalStyles.headerCenter, { flex: 0.90, justifyContent: 'center', alignContent: 'flex-start' }]}>
                    <View style={GlobalStyles.authHeader}>
                        <Text style={[GlobalStyles.authtabbarText, { lineHeight: hp('5%') }]}>
                            {strings.login.welcome}
                        </Text>
                    </View>
                </View>
            </OtrixHeader>
            <OtrixDivider size={'md'} />

            {/* Content */}
            {!verificationView ? (
                <OtrixContent>
                    {/* Mobile Login Section */}
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <TouchableOpacity
                            onPress={() => setShow(true)}
                            style={{
                                flex: 0.20,
                                height: wp('11%'),
                                backgroundColor: 'white',
                                padding: 5,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <Text style={{
                                color: Colors.black_text,
                                fontSize: wp('4%')
                            }}>
                                {countryCode}
                            </Text>
                        </TouchableOpacity>
                        <FormControl 
                            style={{ backgroundColor: Colors().white, flex: 0.80 }} 
                            isRequired 
                            isInvalid={submited && ('mobileNumber' in errors || 'invalidmobileNumber' in errors)}
                        >
                            <Input 
                                variant="outline" 
                                keyboardType="number-pad" 
                                placeholder={strings.commoninput.placeholder_phone} 
                                style={GlobalStyles.textInputStyle}
                                onChangeText={(value) => { 
                                    setMobile(value);
                                    const newErrors = { ...errors };
                                    delete newErrors.mobileNumber;
                                    delete newErrors.invalidmobileNumber;
                                    setErrors(newErrors);
                                }}
                            />
                            {'mobileNumber' in errors && (
                                <FormControl.ErrorMessage leftIcon={<InfoOutlineIcon size="xs" />}>
                                    {errors.mobileNumber}
                                </FormControl.ErrorMessage>
                            )}
                            {'invalidmobileNumber' in errors && (
                                <FormControl.ErrorMessage leftIcon={<InfoOutlineIcon size="xs" />}>
                                    {errors.invalidmobileNumber}
                                </FormControl.ErrorMessage>
                            )}
                        </FormControl>
                    </View>

                    <CountryPicker
                        show={show}
                        pickerButtonOnPress={(item) => {
                            setCountryCode(item.dial_code);
                            setShow(false);
                        }}
                    />
                    <OtrixDivider size={'sm'} />
                    <OtrixDivider size={'md'} />
                    <Button
                        size="md"
                        variant="solid"
                        bg={Colors().themeColor}
                        style={GlobalStyles.button}
                        isLoading={loading}
                        onPress={sendOtp}
                    >
                        <Text style={GlobalStyles.buttonText}>{strings.login.button_login}</Text>
                    </Button>
                    <OtrixDivider size={'md'} />

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerTxt}>OR</Text>
                    </View>

                    {/* Email Login Form */}
                    <Text style={styles.authSubText}>{strings.login.title}</Text>

                    <FormControl 
                        isRequired 
                        style={{ backgroundColor: Colors().white }} 
                        isInvalid={submited && ('email' in errors || 'invalidEmail' in errors)}
                    >
                        <Input 
                            variant="outline" 
                            placeholder={strings.commoninput.placeholder_email} 
                            style={[GlobalStyles.textInputStyle]}
                            value={email}
                            onChangeText={(value) => { 
                                setData({ ...formData, email: value });
                                const newErrors = { ...errors };
                                delete newErrors.email;
                                delete newErrors.invalidEmail;
                                setErrors(newErrors);
                            }}
                        />
                        {'email' in errors && (
                            <FormControl.ErrorMessage leftIcon={<InfoOutlineIcon size="xs" />}>
                                {errors.email}
                            </FormControl.ErrorMessage>
                        )}
                        {'invalidEmail' in errors && (
                            <FormControl.ErrorMessage leftIcon={<InfoOutlineIcon size="xs" />}>
                                {errors.invalidEmail}
                            </FormControl.ErrorMessage>
                        )}
                    </FormControl>

                    <OtrixDivider size={'sm'} />

                    <FormControl 
                        isRequired 
                        style={{ backgroundColor: Colors().white }} 
                        isInvalid={submited && 'password' in errors}
                    >
                        <Input 
                            variant="outline" 
                            placeholder={strings.commoninput.placeholder_password} 
                            style={[GlobalStyles.textInputStyle]}
                            onChangeText={(value) => { 
                                setData({ ...formData, submited: false, password: value });
                                const newErrors = { ...errors };
                                delete newErrors.password;
                                setErrors(newErrors);
                            }}
                            secureTextEntry={state.secureEntry}
                            value={password}
                            InputRightElement={
                                <TouchableOpacity 
                                    onPress={() => setDatapassword({ ...state, secureEntry: !state.secureEntry })} 
                                    style={[{ marginRight: wp('3%'), padding: 3 }]}
                                >
                                    <Icon 
                                        name={state.secureEntry ? "eye" : "eye-off"} 
                                        size={18} 
                                        color={Colors().secondry_text_color} 
                                    />
                                </TouchableOpacity>
                            }
                        />
                        <FormControl.ErrorMessage leftIcon={<InfoOutlineIcon size="xs" />}>
                            {errors.password}
                        </FormControl.ErrorMessage>
                    </FormControl>

                    <TouchableOpacity onPress={() => props.navigation.navigate('ForgotPasswordScreen')}>
                        <Text style={[styles.forgotPassword, { color: mode === 'dark' ? '#000' : Colors().link_color }]}>
                            Forgot Password?
                        </Text>
                    </TouchableOpacity>

                    <OtrixDivider size={'md'} />
                    <Button
                        size="md"
                        variant="solid"
                        bg={Colors().themeColor}
                        style={GlobalStyles.button}
                        isLoading={loading}
                        onPress={login}
                    >
                        <Text style={GlobalStyles.buttonText}>{strings.login.button_login}</Text>
                    </Button>
                    <OtrixDivider size={'md'} />

                    <View style={styles.registerView}>
                        <Text style={[styles.registerTxt, { color: mode === 'dark' ? '#000' : Colors().secondry_text_color }]}>
                            {strings.login.label_registration_info}
                        </Text>
                        <TouchableOpacity onPress={() => props.navigation.navigate('RegisterScreen')}>
                            <Text style={styles.signupTxt}> {strings.login.button_registration} </Text>
                        </TouchableOpacity>
                    </View>
                    <OtrixDivider size={'md'} />

                    {/* Social Container Component */}
                    <OtrixSocialContainer  googleLogin={_googleAuth} />

                </OtrixContent>
            ) : (
                <OtrixContent>
                    <Text style={styles.otpTitle}>Enter OTP</Text>
                    <OtrixDivider size="sm" />
                    <OTPInputView
                        style={{ width: '100%', height: 100, backgroundColor: 'white', paddingHorizontal: 20 }}
                        pinCount={6}
                        autoFocusOnLoad={true}
                        codeInputFieldStyle={styles.underlineStyleBase}
                        codeInputHighlightStyle={styles.underlineStyleHighLighted}
                        placeholderTextColor={Colors().black_text}
                        onCodeFilled={(code) => {
                            setOTP(code);
                            verifyOTP(code);
                        }}
                    />
                    <OtrixDivider size={'md'} />
                    <Button
                        size="md"
                        variant="solid"
                        bg={Colors().themeColor}
                        style={GlobalStyles.button}
                        isLoading={otpLoading}
                        onPress={() => verifyOTP(otpp)}
                    >
                        <Text style={GlobalStyles.buttonText}>Verify OTP</Text>
                    </Button>
                </OtrixContent>
            )}

            {message && <OtrixAlert type={type} message={message} />}
        </OtrixContainer>
    );
}

function mapStateToProps(state) {
    return {
        strings: state.mainScreenInit.strings,
        FCM_TOKEN: state.mainScreenInit.firebaseToken
    };
}

const mapDispatchToProps = dispatch => (
    bindActionCreators({
        doLogin
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);

const styles = StyleSheet.create({
    forgotPassword: {
        fontSize: wp('3%'),
        textAlign: 'right',
        fontFamily: Fonts.Font_Reguler,
        padding: 5
    },
    registerView: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    registerTxt: {
        fontSize: wp('3.5%'),
        textAlign: 'center',
        fontFamily: Fonts.Font_Reguler,
    },
    signupTxt: {
        fontSize: wp('3.5%'),
        textAlign: 'right',
        fontFamily: Fonts.Font_Semibold,
        color: Colors().link_color
    },
    divider: {
        justifyContent: 'center',
        flexDirection: 'row',
        marginBottom: wp('2.5%')
    },
    dividerLine: {
        position: 'absolute',
        width: '100%',
        height: wp('0.2%'),
        backgroundColor: Colors().dark_grey,
        alignSelf: 'center',
    },
    dividerTxt: {
        alignSelf: 'center',
        backgroundColor: Colors().light_white,
        paddingHorizontal: wp('3%'),
        fontSize: wp('5.4%'),
        fontFamily: Fonts.Font_Bold,
        color: Colors().black_text,
    },
    authSubText: {
        fontSize: Platform.isPad === true ? wp('3%') : wp('3.5%'),
        fontFamily: Fonts.Font_Reguler,
        color: '#767787',
        marginBottom: wp('2.5%'),
    },
    underlineStyleBase: {
        width: 30,
        height: 45,
        borderWidth: 0,
        borderBottomWidth: 1,
        color: Colors().black_text
    },
    underlineStyleHighLighted: {
        borderColor: Colors().themeColor,
    },
    otpTitle: {
        fontSize: Platform.isPad === true ? wp('3.5%') : wp('4.5%'),
        fontFamily: Fonts.Font_Semibold,
        color: Colors().black_text,
        textAlign: 'center',
        marginBottom: wp('2.5%'),
    }
});